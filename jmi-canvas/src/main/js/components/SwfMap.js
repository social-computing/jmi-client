/*global define, JMI, swfobject */
JMI.namespace("components.SwfMap");

JMI.components.SwfMap = (function() {

	var SwfMap = function(parent, server, swf, backgroundColor) {
		this.type = JMI.Map.SWF;
		this.server = server;
		this.swf = swf;
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

		checkParams: function(jmiparams) {
			if (!jmiparams.hasOwnProperty('allowDomain')) {
				jmiparams.allowDomain = '*';
			}
			jmiparams.mainCallback = 'JMI.components.SwfMap.mainCallback';
			jmiparams.wpsplanname = jmiparams.map;
			jmiparams.wpsserverurl = this.server;
			return jmiparams;
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
				swfobject.embedSWF(this.swf, attributes.id, "100%", "100%", "10.0.0", "expressInstall.swf", 
							this.checkParams(jmiparams), params, attributes,
							function(res) {
								if( !res.success) {
									setTimeout( function() {
										comp.dispatchEvent({map: comp, type: JMI.Map.event.ERROR, message: 'Error creating JMI flash client'});
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
				this.swfmap.compute(this.checkParams(jmiparams));
			}
		},
		getProperty: function(name) {
			if( this.swfmap) {
				return this.swfmap.getProperty(name);
			}
		},
		getImage: function(mime, width, height, keepProportions) {
			if( this.swfmap) {
				return this.swfmap.getImage(mime, width, height, keepProportions);
			}
		},
		resize: function(width, height) {
			// Not implemented
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
				for( i = 0; i < count; ++i) {
					o = new JMI.components.Attribute(i);
					swfO = this.swfmap.getJmiAttribute(i);
					for(p in swfO) {
						if(p && (p.charAt(0) !== '_')) {
							o[p] = swfO[p]; 
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
