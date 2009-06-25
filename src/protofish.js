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
		this.menuFocus = false;
		this.menuCount = 0;
		this.shiftDown = false;

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
			elem.observe('mouseout', function(event, element) {
				this.queue.push([this.leaveMenu.delay(this.timeout/1000, this), element]);
			}.bindAsEventListener(this, elem));
			
		}.bind(this));
		
		Event.observe(document, 'keydown', function(event) {
			this.keyBoardNav(event);
			
			if (event.keyCode == 16) {
				this.shiftDown = true;
			}
		}.bind(this));

		Event.observe(document, 'keyup', function(event) {
			if (event.keyCode == 16) {
				this.shiftDown = false;
			}
		}.bind(this));
		
		Event.observe(document, 'click', function(event) {
			var element = Event.element(event);
			
			if (element != $(this.id) && !element.descendantOf(this.id) && this.menuFocus == true) {
				this.listItems.invoke('removeClassName', this.cssClass);
				this.menuFocus = false;
			}
		}.bind(this));
				
		$$('body')[0].observe('focusin', this.handleMenuFocus.bind(this));
		
		if (window.addEventListener) {
			$$('body')[0].addEventListener('focus', this.handleMenuFocus.bind(this), true);
		}
	},
	
	'handleMenuFocus': function(event) {	
		var element = Event.element(event);

		if (element.up('#'+this.id)) {
			this.menuFocus = true;
			this.menuCount = this.listItems.indexOf(element.up('li'));
			element.up('li').addClassName(this.cssClass);
		} else {
			this.listItems.invoke('removeClassName', this.cssClass);
			this.menuFocus = false;
		}
	},
	
	'keyBoardNav': function(event) {
		var code = event.keyCode;
		
		if (this.menuFocus == true && code == Event.KEY_TAB) {
			if (this.shiftDown == false) {
				this.menuCount++;
	
				var prevElement = this.listItems[this.menuCount-1];
				
				if (!prevElement.down('li')) {
					prevElement.removeClassName(this.cssClass);
					
					while (prevElement.up('li') && !prevElement.next('li')) {
						prevElement.up('li').removeClassName(this.cssClass);
						prevElement = prevElement.up('li');
					}
				}
			} else if (this.shiftDown == true) {
				this.menuCount--;
			
				var element = this.listItems[this.menuCount];
				var nextElement = this.listItems[this.menuCount+1];
				nextElement.removeClassName(this.cssClass);
				
				if (element) {
					while (element.up('li') && element.up('li').hasClassName(this.cssClass) == false) {
						element.up('li').addClassName(this.cssClass);
						element = element.up('li');
					}
				}
			}
		}
		
		if (this.menuFocus == true && code == Event.KEY_DOWN) {
			event.preventDefault();
			
			var element = this.listItems[this.menuCount];
			if (!element.up('li')) {
				var nextElement = element.down('li');
			} else {
				var nextElement = (element.next('li')) ? element.next('li') : false;
				if (nextElement) {
					element.removeClassName(this.cssClass);
				}
			}
			
			if (nextElement) {
				this.menuCount = this.listItems.indexOf(nextElement);
				nextElement.addClassName(this.cssClass);
				nextElement.down('a').focus();
			}
		}
		
		if (this.menuFocus == true && code == Event.KEY_UP) {
			event.preventDefault();
			
			var element = this.listItems[this.menuCount];
			if (!element.up('li')) {
				var prevElement = false;
			} else {
				var prevElement = (element.previous('li')) ? element.previous('li') : element.up('li');
				element.removeClassName(this.cssClass);
			}

			if (prevElement) {
				this.menuCount = this.listItems.indexOf(prevElement);
				prevElement.addClassName(this.cssClass);
				prevElement.down('a').focus();
			}
		}
		
		if (this.menuFocus == true && code == Event.KEY_RIGHT) {
			event.preventDefault();
			
			var element = this.listItems[this.menuCount];
			if (!element.up('li')) {
				var rightElement = element.next('li');
				if (rightElement) {
					element.removeClassName(this.cssClass);
				}
			} else {
				var rightElement = (element.down('li')) ? element.down('li') : false;
			}

			if (rightElement) {
				this.menuCount = this.listItems.indexOf(rightElement);
				rightElement.addClassName(this.cssClass);
				rightElement.down('a').focus();
			}
		}
		
		if (this.menuFocus == true && code == Event.KEY_LEFT) {
			event.preventDefault();
			
			var element = this.listItems[this.menuCount];
			if (!element.up('li')) {
				var leftElement = element.previous('li');
				if (leftElement) {
					element.removeClassName(this.cssClass);
				}
			} else {
				var leftElement = (element.up('li')) ? element.up('li') : false;
				if (leftElement) {
					element.removeClassName(this.cssClass);
				}
			}

			if (leftElement) {
				this.menuCount = this.listItems.indexOf(leftElement);
				leftElement.addClassName(this.cssClass);
				leftElement.down('a').focus();
			}
		}
		
		if (this.menuFocus == true && code == Event.KEY_ESC) {
			this.listItems.invoke('removeClassName', this.cssClass);
			this.menuFocus = false;
		}
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