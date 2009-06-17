/** 
 * @description		prototype.js based hover menu
 * @author        	Peter Slagter; peter [at] procurios [dot] nl; http://twitter.com/pesla or http://techblog.procurios.nl/k/618/news/view/34556/14863/ProtoFish-advanced-hover-menu-based-on-Prototype.html
 * @date          	17/06/09
 * @requires      	prototype.js 1.6
*/

var ProtoFish = Class.create({

	'initialize': function(id, timeout, cssClass, remActive) {
		
		// Store function parameters
		this.id = id;
		this.timeout = (timeout == undefined) ? '400' : timeout;
		this.cssClass = (cssClass == undefined) ? 'hover' : cssClass;
		this.remActive = (remActive == undefined) ? false : remActive;
		
		// Initialize timeout queue & activeTimeout variable
		this.queue = [];
		this.activeTimeout = '';

		// Get relevant DOM elements and store them
		if ($(id) && $(id).down()) {
			this.listItems = $(id).select('li');
			this.activeItems = $(id).select('li.active');
			
			// Start observing my menu!
			this.initObservers();
		}
	},
	
	'initObservers': function() {
		this.listItems.each( function(elem) {
	
			// Mouseover and mouseout handlers for regular mouse based navigation
			elem.observe('mouseover', function(event, element){
				this.enterMenu(element);
				element.addClassName(this.cssClass);
			}.bindAsEventListener(this, elem));
			elem.observe('mouseleave', function(event, element) {
				this.queue.push([this.leaveMenu.delay(this.timeout/1000, this), element]);
			}.bindAsEventListener(this, elem));

			// Focus and blur handlers for keyboard navigation
			elem.down().observe('focus', function(event, element) {
				// Add the classname set in this.cssClass
				element.addClassName(this.cssClass);
			}.bindAsEventListener(this, elem));
			elem.down().observe('blur', function(event, element) {
				// Only remove the classname if there is no nested list item
				// Check for parent elements and remove the classname if necessary
				if (!element.down('li')) {
					element.removeClassName(this.cssClass);
					
					while (element.up('li') && !element.next('li')) {
						element.up('li').removeClassName(this.cssClass);
						element = element.up('li');
					}
				}
			}.bindAsEventListener(this, elem));
		}.bind(this));
		
	},
	
	'enterMenu': function() {
		while (this.queue.length) {
			clearTimeout(this.queue[0][0]);
			this.leaveMenu(this);
		}
		
		// If removal of .active class is set to true, do it
		if (this.remActive == true) {
			if (typeof this.activeTimeout == "number") {
				clearTimeout(this.activeTimeout);
				delete this.activeTimeout;
			}
			
			this.activeItems.invoke('removeClassName', 'active');
		}
	},

	'leaveMenu': function(parent) {
		if (parent.queue.length) {
			var el = parent.queue.shift()[1];
			el.removeClassName(parent.cssClass);
		}
		
		// If removal of .active class is set to true, restore the active class
		if (parent.remActive == true) {
			parent.activeItems.invoke('addClassName', 'active');
		}
	}
});