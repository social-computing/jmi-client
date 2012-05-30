/*global define, JMI, swfobject */
JMI.namespace("components.SwfMap");

JMI.components.SwfMap = (function() {

	var SwfMap = function(parent, server, method, clientId, clientUrl, backgroundColor) {
		this.type = JMI.Map.SWF;
		this.server = server;
		this.method = method;
		this.clientId = clientId;
		this.clientUrl = clientUrl;
		this.swf = clientUrl + 'swf/jmi-flex-1.0-SNAPSHOT.swf';
		this.backgroundColor = backgroundColor;
		this.parent = parent;
		this.parent.JMI = this;
		this.size = new JMI.script.Dimension();
		this.size.width = this.parent.clientWidth;
		this.size.height = this.parent.clientHeight;
		this.eventManager = new JMI.util.EventManager();
		JMI.Map.InitApiObjects(this);
	};
	
    SwfMap.prototype = {
        constructor: JMI.components.SwfMap,

		checkParams: function(jmiparams,esc) {
			var params = {};
        	for (var n in jmiparams) {
        		params[n] = esc ? escape(jmiparams[n]) : jmiparams[n];
        	}
			if (!params.hasOwnProperty('allowDomain')) {
				params.allowDomain = '*';
			}
			params.mainCallback = 'JMI.components.SwfMap.mainCallback';
			params.wpsplanname = params.map;
			params.wpsserverurl = this.server;
			params.method = this.method;
			return params;
		},	
		compute: function(jmiparams) {
			this.dispatchEvent({map: this, type: JMI.Map.event.START, params: jmiparams});
			if( !this.swfmap) {
				var params = {
				  quality: 'high',
				  wmode: 'opaque',
				  bgcolor: this.backgroundColor,
				  allowscriptaccess: 'always',
				  allowfullscreen: 'true',
				  fullScreenOnSelection: 'true'
				},
				attributes = {
				  id: 'JMI_' + this.parent.id,
				  name: 'JMI_' + this.parent.id
				};
				this.parent.innerHTML = '<div id="' + attributes.id + '"><p>Either scripts and active content are not permitted to run or Adobe Flash Player version 10.0 or greater is not installed.</p><a href="http://www.adobe.com/go/getflashplayer"><img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Get Adobe Flash Player" /></a></div>';
				var comp = this;
				swfobject.embedSWF(this.swf, attributes.id, "100%", "100%", "10.0.0", this.clientUrl + "swf/expressInstall.swf", 
							this.checkParams(jmiparams,true), params, attributes,
							function(res) {
								if( !res.success) {
									setTimeout( function() {
										comp.dispatchEvent({map: comp, type: JMI.Map.event.ERROR, origin: JMI.Map.event.CLIENT_ORIGIN, code: 0, message: 'Error creating JMI flash client'});
									},100);
								}
								else {
									comp.swfmap = res.ref; //swfobject.getObjectById(e.id);
									comp.swfmap.JMI = comp;
								}
							}
				);
			}
			else {
				this.swfmap.compute(this.checkParams(jmiparams,false));
			}
		},
		isReady: function() {
			if( this.swfmap) {
				return this.swfmap.isReady();
			}
			return false;			
		},
		getProperty: function(name) {
			if( this.swfmap) {
				return this.swfmap.getProperty(name);
			}
		},
		getImage: function(mime, width, height, keepProportions) {
			if( this.swfmap) {
				width = width || this.size.width;
				height = height || this.size.height;
				if( keepProportions === undefined) {
					keepProportions = true;
				}
				if ( width === this.size.width && height === this.size.width) {
					keepProportions = false; // same => direct copy
				}
				return this.swfmap.getImage(mime, width, height, keepProportions);
			}
		},
		resize: function(width, height) {
			if( this.swfmap) {
				this.swfmap.style.width = width + 'px';
				this.swfmap.style.height = height + 'px';
			}
		},
		showSelection: function(selection) {
			if( this.swfmap) {
				this.swfmap.showSelection(selection);
			}
		},
		clearSelection: function(selection) {
			if( this.swfmap) {
				this.swfmap.clearSelection(selection);
			}
		},
		addSelection: function(selection,attributes,links) {
			if( this.swfmap) {
				this.swfmap.addSelection(selection,attributes,links);
			}
		},
		setSelection: function(selection,attributes,links) {
			if( this.swfmap) {
				this.swfmap.setSelection(selection,attributes,links);
			}
		},
		initApiObjects: function() {
			// Manque les nodes, les entités
			var i, count, o, swfO, p;
			if( this.swfmap) {
				this.attributes.length = 0;
				this.links.length = 0;
				count = this.swfmap.getAttributesCount();
				var swf = this.swfmap;
				for( i = 0; i < count; ++i) {
					o = new JMI.components.Attribute(i);
					swfO = this.swfmap.getJmiAttribute(i);
					for(p in swfO) {
						if(p && (p.charAt(0) !== '_')) {
							o[p] = swfO[p]; 
							if( o.watch) { 
								o.watch(p, function(prop, oldValue, newValue) {
									// Change in API object => change in internal object
									swf.setJmiAttributeProperty(this._index, prop, newValue);
								    return newValue;
								});
							}
						}
					}
					this.attributes.push( o);
				}
				count = this.swfmap.getLinksCount();
				for( i = 0; i < count; ++i) {
					o = new JMI.components.Link(i);
					swfO = this.swfmap.getLink(i);
					for(p in swfO) {
						if(p && (p.charAt(0) !== '_')) {
							o[p] = swfO[p];
							if( o.watch) { 
								o.watch(p, function(prop, oldValue, newValue) {
									// Change in API object => change in internal object
									swf.setJmiLinkProperty(this._index, prop, newValue);
								    return newValue;
								});
							}
						}
					}
					this.links.push( o);
				}
				// Selections
				o = this.swfmap.getSelections();
				for (p in o) {
					this.selections[p] = new JMI.components.Selection(this,p,o[p]);
				}
			}
		},
		addEventListener: function(event, listener) {
			this.eventManager.addListener(event, listener);
		},
		dispatchEvent: function(event) {
			this.eventManager.fire(event);
		},
		removeEventListener: function(event, listener) {
			this.eventManager.removeListener(event, listener);
		}
	};
	
	return SwfMap;
}());

JMI.components.SwfMap.Version = "1.0-SNAPSHOT";

/*
 * Callback du swf
 * Mise à jour des évènements
 */
JMI.components.SwfMap.mainCallback = function(id, event) {
	var map = swfobject.getObjectById(id);
	if( map) {
		event.map = map.JMI;
		if(event.type === JMI.Map.event.READY) {
			map.JMI.initApiObjects();
		}
		if(event.type === JMI.Map.event.ATTRIBUTE_CLICK || event.type === JMI.Map.event.ATTRIBUTE_DBLECLICK || event.type === JMI.Map.event.ATTRIBUTE_HOVER || event.type === JMI.Map.event.ATTRIBUTE_LEAVE) {
			event.attribute = map.JMI.attributes[event.attribute];
		}
		if(event.type === JMI.Map.event.LINK_CLICK || event.type === JMI.Map.event.LINK_DBLECLICK || event.type === JMI.Map.event.LINK_HOVER || event.type === JMI.Map.event.LINK_LEAVE) {
			event.link = map.JMI.links[event.link];
		}
		map.JMI.dispatchEvent( event);
	}
};
