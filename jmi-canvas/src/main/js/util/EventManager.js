/*global define, JMI */
JMI.namespace("util.EventManager");

JMI.util.EventManager = ( function() {

	var EventManager = function() {
		this.listeners = {};
	};

	EventManager.prototype = {
		constructor : JMI.util.EventManager,

		addListener : function(type, listener) {
			if( typeof this.listeners[type] === "undefined") {
				this.listeners[type] = [];
			}
			this.listeners[type].push(listener);
		},
		fire : function(event) {
			var listeners, i, len;
			if( typeof event === "string") {
				event = {
					type : event
				};
			}
			if(!event.target) {
				event.target = this;
			}

			if(!event.type) {//falsy
				throw new Error("Event object missing 'type' property.");
			}

			if(this.listeners[event.type] instanceof Array) {
				listeners = this.listeners[event.type];
				for(i = 0, len = listeners.length; i < len; i++) {
					listeners[i].call(this, event);
				}
			}
		},
		removeListener : function(type, listener) {
			var listeners, i, len;
			if(this.listeners[type] instanceof Array) {
				listeners = this.listeners[type];
				for(i = 0, len = listeners.length; i < len; i++) {
					if(listeners[i] === listener) {
						listeners.splice(i, 1);
						break;
					}
				}
			}
		}
	};

	return EventManager;
}());

// IE 6, 7, 8 compatibility
JMI.util.EventManager.addEvent = function(object, type, listener, param) {
	if(object.addEventListener) {
		object.addEventListener(type, function(e) {
			listener(e, param);
		}, false);
	} else {
		if(object.attachEvent) {
			object.attachEvent('on' + type, function(e) {
				e = JMI.util.EventManager.getEvent(e);
				listener(e, param);
			});
		}
	}
};

JMI.util.EventManager.getEvent = function(e) {
	if(!e) {
		e = window.event;
	}
	// || event
	if(e.srcElement) {
		e.target = e.srcElement;
	}
	return e;
};

JMI.util.EventManager.removeEvent = function(object, type, listener) {
	if(object.removeEventListener) {
		object.removeEventListener(type, listener, false);
	} else {
		object.detachEvent('on' + type, listener);
	}
};

JMI.util.EventManager.preventDefault = function(event) {
	if( event.preventDefault) {
		event.preventDefault();
	}
	else {
		event.returnValue = false;
	}
};
