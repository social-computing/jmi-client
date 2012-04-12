/*global define, window JMI HTMLCanvasElement aptana console*/
JMI.namespace("components.CanvasMap");

JMI.components.CanvasMap = (function() {

	var CanvasMap = function(parent, server, touchMenuDelay, backgroundColor, watermarkParams) {
		this.isTouchInterface = JMI.components.CanvasMap.IsTouchInterface();
		this.type = JMI.Map.CANVAS;
		this.requester = new JMI.components.MapRequester(this, server);
		this.backgroundColor = backgroundColor;
		this.touchMenuDelay = touchMenuDelay;
		this.curPos = new JMI.script.Point();
		this.ready = false;
		this.planContainer = null;
		this.eventManager = new JMI.util.EventManager();
		this.size = new JMI.script.Dimension();

		this.parent = parent;
		this.parent.JMI = this;
		this.size.width = this.parent.clientWidth;
		this.size.height = this.parent.clientHeight;
				
		// Drawing surface of the component
		this.drawingCanvas = document.createElement("canvas");
		this.drawingCanvas.width = this.size.width;
		this.drawingCanvas.height = this.size.height;
		this.parent.appendChild(this.drawingCanvas);
		this.drawingContext = this.drawingCanvas.getContext("2d");
		this.drawingCanvas.JMI = this;

		// Menu
		this.divMenu = document.createElement("div");
		this.divMenu.style.visibility = 'hidden';
		this.divMenu.style.position = 'absolute';
		document.body.appendChild(this.divMenu);
	
		// Graphic zones
		this.curDrawingCanvas = document.createElement("canvas");
		this.curDrawingCanvas.width = this.size.width;
		this.curDrawingCanvas.height = this.size.height;
		this.curDrawingCanvas.style.visibility = 'hidden';
		this.curDrawingContext = this.curDrawingCanvas.getContext("2d");

		this.restDrawingCanvas = document.createElement("canvas");
		this.restDrawingCanvas.width = this.size.width;
		this.restDrawingCanvas.height = this.size.height;
		this.restDrawingCanvas.style.visibility='hidden';
		this.restDrawingContext = this.restDrawingCanvas.getContext("2d");

		this.backDrawingCanvas = document.createElement("canvas");
		this.backDrawingCanvas.width = this.size.width;
		this.backDrawingCanvas.height = this.size.height;
		this.backDrawingCanvas.style.visibility = 'hidden';
		this.backDrawingContext = this.backDrawingCanvas.getContext("2d");
		
		// Watermark
		this.watermark = new JMI.script.Watermark(watermarkParams);
		
		// Event listeners
		if( !this.isTouchInterface) {
			this.drawingCanvas.addEventListener('mousemove', this.mouseMoveHandler, false);
		}
		this.drawingCanvas.addEventListener('mouseover', this.mouseOverHandler, false);
		this.drawingCanvas.addEventListener('mouseout', this.mouseOutHandler, false);
		this.drawingCanvas.addEventListener('click', this.mouseClickHandler, false);
		this.drawingCanvas.addEventListener('dblclick', this.mouseDoubleClickHandler, false);

	    this.drawingCanvas.addEventListener("touchstart", this.touchHandler, true);
	    this.drawingCanvas.addEventListener("touchmove", this.touchHandler, true);
	    this.drawingCanvas.addEventListener("touchend", this.touchHandler, true);
	    //this.drawingCanvas.addEventListener("touchcancel", this.touchHandler, true); 

		JMI.Map.InitApiObjects(this);
		
		//'<menu type="context" id="imagemenu"><menuitem label="powered by Just Map It!" onclick="alert('rotate');"/></menu>'
/*		var wpsMenu:ContextMenu = new ContextMenu();
		wpsMenu.hideBuiltInItems();
		var menuItem:ContextMenuItem = new ContextMenuItem("powered by Just Map It! - Social Computing");
		menuItem.addEventListener( ContextMenuEvent.MENU_ITEM_SELECT, openSoCom);
		wpsMenu.customItems.push( menuItem);
		this.contextMenu = wpsMenu;*/
		
	};
	
    CanvasMap.prototype = {
        constructor: JMI.components.CanvasMap,
		
		compute: function(jmiparams) {
			this.hideMenu();
				
			var filterColor = this.ready && this.planContainer.map.env.filterColor ? this.planContainer.map.env.filterColor : '#ffffff';
			this.backDrawingContext.drawImage(this.restDrawingCanvas, 0, 0);
			JMI.util.ImageUtil.filterImage(this.backDrawingContext, this.size, filterColor);
			if( this.watermark) {
				this.watermark.render(this, this.backDrawingContext);
			}
			this.renderShape(this.backDrawingCanvas, this.size.width, this.size.height);
			
			this.ready = false;
			this.dispatchEvent({map: this, type: JMI.Map.event.START, params: jmiparams});
			this.requester.getMap(jmiparams.map, jmiparams);
		},
		
		setData: function(value) {
			// Set component status to "not ready"
			this.ready = false;
		
			// Stop loaders
			if( this.planContainer && this.planContainer.map && this.planContainer.map.env) {
				this.planContainer.map.env.close();
			}
			
			// Clear current
			if( this.planContainer && this.planContainer.map && this.planContainer.map.plan) {
				this.planContainer.map.plan.curSat = null;
				this.planContainer.map.plan.curZone = null;
				this.planContainer.map.plan.curSel = -1;
			}

			this.attributes.length = 0;
			this.links.length = 0;
			this.nodes.length = 0;
			this.selections.length = 0;
			
			// Clear all drawing surfaces
			this.clear();

			// If the given value is null 
			// Reset all objects of this component
			if(value === null) {
				if( this.planContainer) {
					delete( this.planContainer);
				}
				return;
			}
			
			this.showStatus('');
			document.body.style.cursor = 'wait';
			if(value instanceof JMI.script.PlanContainer) {
				this.planContainer = value;
			}
			else {
				this.planContainer = JMI.script.PlanContainer.fromJSON( value);
			}
			if( true && this.planContainer.hasOwnProperty( "error")) {
				// Server error
				document.body.style.cursor = 'default';
				this.renderWatermark();
				this.invalidate();
				this.dispatchEvent({map: this, type: JMI.Map.event.ERROR, message: this.planContainer.error});
			}
			else if( !this.planContainer.hasOwnProperty( 'map') || !this.planContainer.map.hasOwnProperty( 'plan')) {
				// Empty map
				document.body.style.cursor = 'default';
				this.renderWatermark();
				this.invalidate();
				this.dispatchEvent({ map: this, type: JMI.Map.event.EMPTY});
			}
			else {
				var needPrint = false; // Later
		
				this.planContainer.map.env.init(this, needPrint);
				this.planContainer.map.plan.applet = this;
				this.planContainer.map.plan.curSel = -1;
				this.planContainer.map.plan.initZones(this.restDrawingContext, this.planContainer.map.plan.links, true);
	            this.planContainer.map.plan.initZones(this.restDrawingContext, this.planContainer.map.plan.nodes, true);
				this.planContainer.map.plan.resize(this.size);
				this.planContainer.map.plan.init();
				this.planContainer.map.plan.resize(this.size);
				this.planContainer.map.plan.init();
				this.ready = true;
				document.body.style.cursor = 'default';

				this.initApiObjects();
				this.invalidate();
				this.dispatchEvent({map: this, type:JMI.Map.event.READY});
			}
		},
		getData: function() {
			return this.planContainer;
		},
		getProperty: function( name) {
			if( this.planContainer && this.planContainer.map && this.planContainer.map.env.props[name]) {
				return this.planContainer.map.env.props[name];
			}
			return null;
		},
		invalidate: function() {
			this.renderShape(this.restDrawingCanvas, this.size.width, this.size.height);
		},		
        renderShape: function(canvas, width, height, position) {
            // If no position is specified, take (0,0)
            position = position || new JMI.script.Point();
            if(width > 0 && height > 0) {
                // Copying the content of the context on to visible canvas context
                this.drawingContext.drawImage(canvas, position.x, position.y, width, height, position.x, position.y, width, height);
            }
        },
		clear: function() {
			if( this.touchPressedTimer) {
				clearTimeout( this.touchPressedTimer);
				delete this.touchPressedTimer;
			}
			JMI.util.ImageUtil.clear(this.backDrawingCanvas, this.backDrawingContext);
			JMI.util.ImageUtil.clear(this.restDrawingCanvas, this.restDrawingContext);
			JMI.util.ImageUtil.clear(this.curDrawingCanvas, this.curDrawingContext);
			JMI.util.ImageUtil.clear(this.drawingCanvas, this.drawingContext);
		},
		renderWatermark: function() {
			if( this.watermark) {
				this.watermark.render(this, this.restDrawingContext);
			}
		},
		mouseMoveHandler: function(event) {
			if (this instanceof HTMLCanvasElement) {
				event.preventDefault();
			    var mousePosition = JMI.components.CanvasMap.getPosition(this, event.pageX, event.pageY);
				this.JMI.curPos.x = mousePosition.x;
				this.JMI.curPos.y = mousePosition.y;
				if (this.JMI.ready) {
					this.JMI.planContainer.map.plan.updateZoneAt(this.JMI.curPos);
				}
				if ( !this.JMI.ready || !this.JMI.planContainer.map.plan.curSat) {
					if( this.JMI.watermark) {
						this.JMI.watermark.hover(this.JMI,this.JMI.curPos);
					}
				}
			}
		},
		mouseOverHandler: function(event) {
			this.JMI.mouseMoveHandler( event);
		},
		mouseOutHandler: function(event) {
			this.JMI.mouseMoveHandler( event);
		},
		mouseClickHandler: function(event) {
			if (this instanceof HTMLCanvasElement) {
				this.JMI.hideMenu();
			    var mousePosition = JMI.components.CanvasMap.getPosition(this, event.pageX, event.pageY);
				if ( this.JMI.ready && this.JMI.planContainer.map.plan.curSat !== null )
				{
					this.JMI.planContainer.map.plan.updateZoneAt( mousePosition);
					this.JMI.planContainer.map.plan.curSat.execute( this.JMI, this.JMI.planContainer.map.plan.curZone, mousePosition, JMI.script.Satellite.CLICK_VAL, new JMI.script.Point( event.pageX, event.pageY));
				}
				if ( !this.JMI.ready || !this.JMI.planContainer.map.plan.curSat) {
					if( this.JMI.watermark) {
						this.JMI.watermark.click(this.JMI,mousePosition);
					}
				}
			}
		},
		mouseDoubleClickHandler: function(event) {
			if (this instanceof HTMLCanvasElement) {
				this.JMI.hideMenu();
			    var mousePosition = JMI.components.CanvasMap.getPosition(this, event.pageX, event.pageY);
				if ( this.JMI.ready && this.JMI.planContainer.map.plan.curSat !== null )
				{
					this.JMI.planContainer.map.plan.updateZoneAt( mousePosition);
					this.JMI.planContainer.map.plan.curSat.execute( this.JMI, this.JMI.planContainer.map.plan.curZone, mousePosition, JMI.script.Satellite.DBLCLICK_VAL, new JMI.script.Point( event.clientX, event.clientY));
				}
			}
		},
		touchHandler: function(event) {
			var simulatedEvent, mousePosition;
			if (this instanceof HTMLCanvasElement) {
				var touches = event.changedTouches, first = touches[0], type = null;
				switch(event.type) {
					case "touchstart":
						//type = "mousemove";
						event.preventDefault();
						this.JMI.hideMenu();
						if( this.JMI.touchPressedTimer) {
							clearTimeout( this.JMI.touchPressedTimer);
						}
						this.JMI.touchPressedTimer = setTimeout( function() {
							simulatedEvent = document.createEvent("MouseEvent");
							simulatedEvent.initMouseEvent('click', true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0, null);
							first.target.dispatchEvent(simulatedEvent);
						},this.JMI.touchMenuDelay);

					    mousePosition = JMI.components.CanvasMap.getPosition(this, first.pageX, first.pageY);
						this.JMI.curPos.x = mousePosition.x;
						this.JMI.curPos.y = mousePosition.y;
						if (this.JMI.ready) {
							this.JMI.planContainer.map.plan.updateZoneAt(this.JMI.curPos);
						}
						break;
					case "touchmove":
						//type = "mousemove";
						event.preventDefault();
						if( this.JMI.touchPressedTimer) {
							clearTimeout( this.JMI.touchPressedTimer);
						}
						this.JMI.touchPressedTimer = setTimeout( function() {
							simulatedEvent = document.createEvent("MouseEvent");
							simulatedEvent.initMouseEvent('click', true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0, null);
							first.target.dispatchEvent(simulatedEvent);
						},this.JMI.touchMenuDelay);

					    mousePosition = JMI.components.CanvasMap.getPosition(this, first.pageX, first.pageY);
						this.JMI.curPos.x = mousePosition.x;
						this.JMI.curPos.y = mousePosition.y;
						if (this.JMI.ready) {
							this.JMI.planContainer.map.plan.updateZoneAt(this.JMI.curPos);
						}
						break;
					case "touchend":
						//type = "mouseup";
						if( this.JMI.touchPressedTimer) {
							clearTimeout( this.JMI.touchPressedTimer);
							delete this.JMI.touchPressedTimer;
						}
						break;
					default:
						return;
				}
				if( type !== null) {
					simulatedEvent = document.createEvent("MouseEvent");
					simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0/*left*/, null);
					first.target.dispatchEvent(simulatedEvent);
				}
			}
		},
		menuHandler: function( event){
			event.target.JMI.hideMenu();
			event.target.JMI.performAction( event.target.href);
			event.preventDefault();
		},
		hideMenu: function() {
			if( this.divMenu.style.visibility === '') {
				JMI.script.MenuX.hideSubMenu(this.divMenu.firstChild);
				this.divMenu.style.visibility = 'hidden';
				if(this.divMenu.firstChild) {
					this.divMenu.removeChild(this.divMenu.firstChild);
				}
			}
		},
		resize: function(width, height){
			this.clear();

			this.size.width = width; 
			this.size.height = height;
			 
			this.drawingCanvas.width = width;
			this.drawingCanvas.height = height;
			this.curDrawingCanvas.width = width;
			this.curDrawingCanvas.height = height;
			this.restDrawingCanvas.width = width;
			this.restDrawingCanvas.height = height;
			this.backDrawingCanvas.width = width;
			this.backDrawingCanvas.height = height;
				
			if(this.ready) {
				this.planContainer.map.plan.resize( this.size);
				this.planContainer.map.plan.init();
			}
			this.invalidate();
		},
		showStatus: function(message) {
			this.dispatchEvent( {map: this, type: JMI.Map.event.STATUS, message: message});
		},
		log: function(message) {
			if( console && console.log) {
				console.log( message);
			}
			/*if( aptana && aptana.log) {
				aptana.log( message);
			}*/
		},
		addEventListener: function(event, listener) {
			this.eventManager.addListener(event, listener);
		},
		dispatchEvent: function(event) {
			this.eventManager.fire(event);
		},
		removeEventListener: function(event, listener) {
			this.eventManager.removeListener(event, listener);
		},
		showSelection: function(selection) {
			this.planContainer.map.plan.curSel = this.getSelId(selection);
			this.planContainer.map.plan.init();
			this.invalidate();
		},
		clearSelection: function(selection) {
			var i, unselBit = ~( 1 << this.getSelId(selection));
			for( i = 0; i < this.planContainer.map.plan.nodes.length; i ++ ) {
				this.planContainer.map.plan.nodes[i].selection &= unselBit;
			}
			for( i = 0; i < this.planContainer.map.plan.links.length; i ++ ) {
				this.planContainer.map.plan.links[i].selection &= unselBit;
			}
		},
		addSelection: function(selection,attributes,links) {
			var i, selId = this.getSelId(selection);
			if ( selId !== -1 ) {
				selId = 1 << selId;
				if( attributes) {
					for( i = 0; i < attributes.length; ++i) {
						this.planContainer.map.plan.nodes[attributes[i]].selection |= selId;
					}
				}
				if( links) {
					for( i = 0; i < links.length; ++i) {
						this.planContainer.map.plan.links[links[i]].selection |= selId;
					}
				}
			}
		},
		setSelection: function(selection,attributes,links) {
			this.clearSelection(selection);
			this.addSelection(selection,attributes,links);
		},
		getSelId: function( selection) {
			if( this.planContainer.map.env.selections[selection] === null) {
				return -1;
			}
			return this.planContainer.map.env.selections[selection];
		},
		/**
		 * Perform an URL action.
		 * The action depends on the string passed:
		 * <ul>
		 * <li>URL : Opens the URL in a new window.</li>
		 * <li>_target:URL : Opens the URL in the frame called target if it exists or else in a new window whose name is set to target.</li>
		 * <li>javascript:function(args) : If LiveConnect is enabled, call the Javascript function with args (arg1,..,argn).
		 * Else, if an alternate page is defined (NoScriptUrl Applet parameter), this page is opened with the function(args) passed using the CGI syntax.</li>
		 * <li>javascript:_target:function(args) : See javascript:function(args) and _target cases.</li>
		 * </ul>
		 * @param actionStr		An URL like string describing what action to do.
		 * @throws UnsupportedEncodingException 
		 */
		performAction: function( actionStr) {
			var jsStr = "javascript",
				target = "_blank",
				sep       = actionStr.indexOf( ':' ),
				pos, i;

			if ( sep !== -1 )
			{
				target  = actionStr.substring( 0, sep );
				if( target.toLowerCase() === jsStr )   // Call javascript function
				{
					actionStr   = actionStr.substring( jsStr.length+ 1 );
					if( actionStr.charAt( 0 )=== '_' )
					{	// javascript:_target:function()
						pos = actionStr.indexOf( ':' );
						if( pos <= 0) {
							return;
						}
						target      = actionStr.substring( 1, pos );
						actionStr   = actionStr.substring( pos + 1 );
					}
			
					pos     = actionStr.indexOf( '(' );
					if( pos > 0)
					{
						var func     = actionStr.substring( 0, pos ),
							paramStr = actionStr.substring( pos + 1, actionStr.length- 1 ),
							params;
							if( paramStr.indexOf('%EF%BF%BC') !== -1) {
								// Chrome, FF
								params   = paramStr.split( '%EF%BF%BC');
							}
							else { // IE
								params   = paramStr.split( String.fromCharCode( 0xFFFC));
							}
						for( i = 0; i < params.length; ++i) {
							params[i] = decodeURI( params[i]);
						}
						this.dispatchEvent( {map: this, type: JMI.Map.event.ACTION, fn: func, args: params});
					}
					return;
				}
				else if( target.charAt( 0 )=== '_' )   // open a frame window
				{
					target      = actionStr.substring( 0, sep );
					actionStr   = actionStr.substring( sep + 1 );
				}
				else
				{
					target  = "_blank";
				}
			}
			this.dispatchEvent( {map: this, type: JMI.Map.event.NAVIGATE, url: actionStr, target: target});
			window.open( actionStr, target);
		},
		openJMI: function ( e) {
			window.open( "http://www.just-map-it.com", "_blank");
		},
		getImage: function(mime, width, height, keepProportions) {
			var copy = document.createElement("canvas"),
				copyCtx = copy.getContext("2d"),
				dx, dy;
			width = width || this.drawingCanvas.width;
			height = height || this.drawingCanvas.height;
			if( keepProportions === undefined) {
				keepProportions = true;
			}
			if ( width === this.drawingCanvas.width && height === this.drawingCanvas.width) {
				keepProportions = false; // same => direct copy
			}
			copy.width = width;
			copy.height = height;
			if( keepProportions) {
				copyCtx.fillStyle = this.ready ? this.planContainer.map.env.inColor.getColor() : this.backgroundColor;
				copyCtx.fillRect(0, 0, width, height);
				
				dx = width / this.drawingCanvas.width;
				dy = height / this.drawingCanvas.height;
				if( dx < dy) {
					height = Math.round(dx * this.drawingCanvas.height);
				}
				else {
					width = Math.round(dy * this.drawingCanvas.width);
				}
				dx = (copy.width - width) / 2;
				dy = (copy.height - height) / 2;
				copyCtx.drawImage(this.drawingCanvas, 0, 0, this.drawingCanvas.width, this.drawingCanvas.height, dx, dy, width, height);
			}
			else {
				copyCtx.drawImage(this.drawingCanvas, 0, 0, this.drawingCanvas.width, this.drawingCanvas.height, 0, 0, width, height);
			}
			return copy.toDataURL("image/png");
		},
		initApiObjects: function(nodeFields, entityAttProps, entityLinkProps) {
			// Manque les entités
			var i, j, o1, o2, o3, p, z;
			this.attributes.length = 0;
			this.links.length = 0;
			this.nodes.length = 0;
			for (i = 0; i < this.planContainer.map.plan.nodesCnt; ++i) {
				z = this.planContainer.map.plan.nodes[i];
				o1 = new JMI.components.Node(i);
				o2 = new JMI.components.Attribute(i);
				this.nodes.push( o1);
				o1.attributes.push( o2);
				this.attributes.push( o2);
				o2.node = o1;
				for(p in z.props) {
					if(p && (p.charAt(0) !== '_')) {
						o2[p] = z.props[p]; 
					}
				}
				var sz = z.subZones;
				for( j = 0; sz && j < sz.length; ++j) {
					z = sz[j];
					o3 = new JMI.components.Attribute(i);
					this.attributes.push( o3);
					o1.attributes.push( o3);
					o3.node = o1;
					for(p in z.props) {
						if(p && (p.charAt(0) !== '_')) {
							o3[p] = z.props[p]; 
						}
					}
				}
			}
			for (i = 0; i < this.planContainer.map.plan.links.length; ++i) {
				z = this.planContainer.map.plan.links[i];
				o1 = new JMI.components.Link(i);
				this.links.push(o1);
				for(p in z.props) {
					if(p && (p.charAt(0) !== '_')) {
						o1[p] = z.props[p]; 
					}
				}
			}
			// Selections
			for (p in this.planContainer.map.env.selections) {
				this.selections[p] = new JMI.components.Selection(this,p,this.planContainer.map.env.selections[p]);
			}
			
			// Extraction des entités
/*			if( !entityAttProps) {
				entityAttProps = ['POSS_ID', 'POSS_NAME'];
			}
			if( !entityLinkProps) {
				entityLinkProps = ['REC_ID', 'REC_NAME'];
			}
			for (i = 0; i < this.planContainer.map.plan.nodes.length; ++i) {
				o1 = this.planContainer.map.plan.nodes[i];
				for( j = 0; j < entityAttProps.length; ++j) {
					p = o1.props[entityAttProps[j]];
					if( p) {
						
					}
				}
				for( j = 0; p && i < p.length; ++i) {
					if( !ents.hasOwnProperty( ids[i])) {
						var entity = new JMI.components.Entity( env);
						entity[nodeId] = ids[i];
						for each( var name:Object in nodeFields) {
							entity[name] = zone.m_props[name][i];
						}
						ents[ids[i]] = entity;
						this.entities.push( entity);
					}
				}
			}
			for( i = 0; i < this.planContainer.map.plan.links.length; ++i) {
				p = this.planContainer.map.plan.li,nks[i].props[linkId];
				for( j = 0; p && i < p.length; ++i) {
					//ents[id].addLink( link);
				}
			}
			for each( var attribute:Attribute in this.attributes) {
				ids = attribute.zone.m_props[nodeId] as Array;
				for( i = 0; i < ids.length; ++i) {
					ents[ids[i]].push( attribute);
				}
			}*/
		}
	};
	
	return CanvasMap;
}());

JMI.components.CanvasMap.Version = "1.0-SNAPSHOT";

// Adapted from: http://www.quirksmode.org/js/findpos.html and 
// http://stackoverflow.com/questions/5085689/tracking-mouse-position-in-canvas
JMI.components.CanvasMap.getPosition= function(canvas, px, py) {
    var left = 0, top = 0;

    if(canvas.offsetParent) {
        while(canvas) {
            left += canvas.offsetLeft;
            top += canvas.offsetTop;
            canvas = canvas.offsetParent;
        }
    }
    return {
        x : px - left,
        y : py - top
    };
};

JMI.components.CanvasMap.getAbsPosition= function(canvas) {
    var left = 0, top = 0;

    if(canvas.offsetParent) {
        while(canvas) {
            left += canvas.offsetLeft;
            top += canvas.offsetTop;
            canvas = canvas.offsetParent;
        }
    }
    return {
        x : left,
        y : top
    };
};

JMI.components.CanvasMap.IsTouchInterface= function() {
	return navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i);
};


