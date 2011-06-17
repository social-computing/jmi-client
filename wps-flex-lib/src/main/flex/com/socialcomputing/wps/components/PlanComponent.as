package com.socialcomputing.wps.components
{
	import com.socialcomputing.wps.plan.PlanContainer;
	import com.socialcomputing.wps.script.ActiveZone;
	import com.socialcomputing.wps.script.Dimension;
	import com.socialcomputing.wps.script.Env;
	import com.socialcomputing.wps.script.LinkZone;
	import com.socialcomputing.wps.script.Plan;
	import com.socialcomputing.wps.script.Satellite;
	import com.socialcomputing.wps.util.controls.ImageUtil;
	
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.geom.Matrix;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	
	import mx.collections.ArrayCollection;
	import mx.events.MenuEvent;
	import mx.events.ResizeEvent;
	import mx.managers.CursorManager;
	
	import spark.components.Group;
	import spark.core.SpriteVisualElement;
	
	[DefaultBindingProperty(destination="dataProvider")]
	
	[IconFile("Plan.png")]
	
	[Event(name="ready", type="flash.events.Event")]
	[Event(name="error", type="flash.events.Event")]
	[Event(name="action", type="com.socialcomputing.wps.components.ActionEvent")]
	[Event(name="status", type="com.socialcomputing.wps.components.StatusEvent")]
	
	public class PlanComponent extends Group {
		public static var version:String = "1.0-SNAPSHOT";
		
		private var _dataProvider:PlanContainer = null;
		private var _curPos:Point = new Point();
		private var _ready:Boolean = false;

		/*
		 *  Specific display elements
		 */
		private var _backgroundColor:int = 0xFFFFFF;
		private var _onScreen:BitmapData;
		private var _offScreen:BitmapData;
		private var _drawingSurface:SpriteVisualElement;
		
		/*
		 * Image used to quickly restore the aspect of a zone that is no longer current.
		 * It includes the background + links + Satellites of each place at rest.
		 */
		private var _restDrawingSurface:Sprite;  
		/*
		 * Image used as a background on which the current zone is drawn.
		 * It includes the background, and the zones rendered with their 'ghosted' satellites form the rest swatch.
		 * The resulting image is then filtered with a transparency color.
		 */
		private var _backDrawingSurface:Sprite; 
		private var _curDrawingSurface:Sprite;
		
		/*
		 * API
		 */
		[ArrayElementType("Attribute")]
		public var attributes:ArrayCollection;

		[ArrayElementType("Attribute")]
		public var entities:ArrayCollection;
		
		public function PlanComponent() {
			super();
			attributes = new ArrayCollection();
			entities = new ArrayCollection();
			
			// Drawing surface of the component
			this._drawingSurface = new SpriteVisualElement();
			this.addElement(this._drawingSurface);

			// Graphic zones
			this._curDrawingSurface = new Sprite();
			this._restDrawingSurface = new Sprite();
			this._backDrawingSurface = new Sprite();
			
			// Debug helpers
			this._restDrawingSurface.name = "REST drawing surface";
			this._curDrawingSurface.name = "CUR drawing surface";
			this._backDrawingSurface.name = "BACK drawing surface";
			
			// Event listeners
			this.doubleClickEnabled = true;
			this.addEventListener(MouseEvent.MOUSE_OVER, mouseOverHandler);
			this.addEventListener(MouseEvent.MOUSE_MOVE, mouseMoveHandler);
			this.addEventListener(MouseEvent.MOUSE_OUT, mouseOutHandler);
			this.addEventListener(MouseEvent.CLICK, mouseClickHandler);
			this.addEventListener(MouseEvent.DOUBLE_CLICK, mouseDoubleClickHandler);
			this.addEventListener(ResizeEvent.RESIZE, resizeHandler);
		}
		
		public function get backDrawingSurface():Sprite
		{
			return _backDrawingSurface;
		}

		public function get backgroundColor():int
		{
			return _backgroundColor;
		}

		public function set backgroundColor(value:int):void
		{
			_backgroundColor = value;
		}

		public function get ready():Boolean {
			return plan != null && _ready;
		}			
		
		public function get plan():Plan
		{
			if(this._dataProvider == null) {
				return null;
			}
			return _dataProvider.plan;
		}
		
		public function get env():Env
		{
			if(this._dataProvider == null) {
				return null
			}
			return _dataProvider.env;
		}
		
		public function get size():Dimension {
			return new Dimension(this.width, this.height);
		}
		
		public function get curDrawingSurface():Sprite
		{
			return _curDrawingSurface;
		}
		public function get restDrawingSurface():Sprite
		{
			return _restDrawingSurface;
		}
		
		public function get curPos():Point {
			return _curPos;
		}
		
		public function set curPos(pos:Point):void {
			_curPos = pos;
		}
		
		public function set dataProvider(value:Object):void
		{
			// Set component status to "not ready"
			this._ready = false;
			
			// Clear all drawing surfaces
			this.clear();
			
			this.attributes = new ArrayCollection();
			this.entities = new ArrayCollection();
			
			// If the given value is null 
			// Reset all objects of this component
			if(value == null) {
				this._dataProvider = null;
				//this._plan = null;
				//this.
				// TODO : If the local plancontainer is set, reset objects
				this.invalidateProperties();
				this.invalidateDisplayList();
				return;
			}
			
			this.showStatus("");
			CursorManager.setBusyCursor();
			if(value is PlanContainer) {
				this._dataProvider = value as PlanContainer;
			}
			else {
				this._dataProvider = PlanContainer.fromJSON(value);
			}

			var needPrint:Boolean = false; // Later
			this._dataProvider.env.init(this, needPrint);

			try {
				plan.m_applet = this;
				plan.m_curSel = -1;
				plan.initZones(this.restDrawingSurface, plan.m_links, true);
                plan.initZones(this.restDrawingSurface, plan.m_nodes, true);
				plan.resize(size);
				plan.init();
				plan.resize(size);
				plan.init();
                plan.m_applet.env.loader.start();
			    for each( var zone:ActiveZone in plan.m_nodes) {
					this.attributes.addItem( new Attribute( env, zone));
				}
				this._ready = true;
			}
			catch(error:Error) {
				trace(error.getStackTrace());	
			}
			CursorManager.removeBusyCursor();
			
			/*
			 * Don't redraw immediately, because maybe the code that's calling us is
			 * going to change several settings, and we don't want to redraw for each 
			 * setting change. Instead, tell the flex framework that
			 * we need to be redrawn; the framework will ensure that updateDisplayList
			 * is invoked after all scripts have finished executing.
			 */
			this.invalidateProperties();
			this.invalidateDisplayList();
			if(this._ready)
				dispatchEvent(new Event("ready"));
			else
				dispatchEvent(new Event("error"));
		}

		private function clear():void {
			ImageUtil.clear(this._backDrawingSurface);
			ImageUtil.clear(this._restDrawingSurface);
			ImageUtil.clear(this._curDrawingSurface);
			ImageUtil.clear(this._drawingSurface);
			
			if(this.width != 0 && this.height !=  0) {
				this._onScreen = new BitmapData(this.width, this.height);
				this._offScreen = new BitmapData(this.width, this.height);
				this._drawingSurface.addChild(new Bitmap(this._onScreen));
			}
		}
		
		public function showStatus(message:String):void {
			dispatchEvent(new StatusEvent( message));
		}
		
		public function mouseOverHandler(event:MouseEvent):void {
			mouseMoveHandler( event);
		}
		
		public function mouseOutHandler(event:MouseEvent):void {
			mouseMoveHandler( event);
		}
		
		public function mouseMoveHandler(event:MouseEvent):void {
			this.curPos.x = event.localX;
			this.curPos.y = event.localY;
			if(ready) {
				_dataProvider.plan.updateZoneAt(this.curPos);
			}
		}
		
		public function mouseClickHandler(event:MouseEvent):void {
			if ( ready && plan.m_curSat != null )
			{
				var point:Point = new Point();
				point.x = event.localX;
				point.y = event.localY;
				plan.updateZoneAt( point);
				plan.m_curSat.execute( this, plan.m_curZone, point, Satellite.CLICK_VAL);
			}
		}
		
		public function mouseDoubleClickHandler(event:MouseEvent):void {
			if ( ready && plan.m_curSat != null )
			{
				var point:Point = new Point();
				point.x = event.localX;
				point.y = event.localY;
				plan.updateZoneAt( point);
				plan.m_curSat.execute( this, plan.m_curZone, point, Satellite.DBLCLICK_VAL);
			}
		}
		
		public function resizeHandler(event:ResizeEvent):void {
			trace("resize, new size = (" + this.width + ", " + this.height + ")");
			this.clear();
			
			this._restDrawingSurface.graphics.beginFill(this._ready ? this.env.m_inCol.m_color : this._backgroundColor);
			this._restDrawingSurface.graphics.drawRect(0, 0, this.width, this.height);
			this._restDrawingSurface.graphics.endFill();
				
			if(this._ready) {
				this.plan.resize(new Dimension(this.width, this.height));
				this.plan.init();
				this.invalidateSize();  
			}
		}
		
		/**
		 * @inheritDoc
		 */
		override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
			super.updateDisplayList(unscaledWidth, unscaledHeight);
			trace("Update graphic display");
			this.renderShape(this._restDrawingSurface, this.width, this.height);
		}
		
		/**
		 * Wrapper for a menu item
		 **/
		public function menuHandler( evt:MenuEvent):void {
			performAction( evt.item.action);
		}
		
		/**
		 * Wrapper for a menu item that call performAction with the ActionCommand String as argument.
		 **/
		public function actionPerformed( actionStr:String ):void {
			performAction( actionStr);
		}
		
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
		public function performAction( actionStr:String):void {
			var jsStr:String  = "javascript";
			var target:String = "_blank";
			var sep:int       = actionStr.indexOf( ':' ),
				pos:int;
			
			if ( sep != -1 )
			{
				target  = actionStr.substring( 0, sep );
				if( target.toLowerCase() == jsStr )   // Call javascript function
				{
					actionStr   = actionStr.substring( jsStr.length+ 1 );
					if( actionStr.charAt( 0 )== '_' )
					{	// javascript:_target:function()
						pos = actionStr.indexOf( ':' );
						if( pos <= 0) return;
						target      = actionStr.substring( 1, pos );
						actionStr   = actionStr.substring( pos + 1 );
					}
			
					pos     = actionStr.indexOf( '(' );
					if( pos > 0)
					{
						var func:String     = actionStr.substring( 0, pos ),
							paramStr:String = actionStr.substring( pos + 1, actionStr.length- 1 );
						var params:Array    = paramStr.split( ",");
						dispatchEvent( new ActionEvent( func, params));
					}
					return;
				}
				else if( target.charAt( 0 )== '_' )   // open a frame window
				{
					target      = actionStr.substring( 1, sep );
					actionStr   = actionStr.substring( sep + 1 );
				}
				else
				{
					target  = "_blank";
				}
			}
			// TODO FireEvent
/*			getAppletContext().showDocument( convertURL( actionStr ), target );
			*/
			dispatchEvent(new ActionEvent( actionStr));
		}
		
		public function defineEntities( nodeFields:Array, nodeId:String="POSS_ID", linkId:String="REC_ID"):void {
			
			// Extraction des entités
			var ents:Object = new Object();
			for each( var zone:ActiveZone in plan.m_nodes) {
				var ids:Array = zone.m_props[nodeId] as Array;
				for( var i:int = 0; i < ids.length; ++i) {
					if( !ents.hasOwnProperty( ids[i])) {
						var entity:Entity = new Entity( env);
						entity[nodeId] = ids[i];
						for each( var name:Object in nodeFields) {
							entity[name] = zone.m_props[name][i];
						}
						ents[ids[i]] = entity;
						this.entities.addItem( entity);
					}
				}
			}
			for each( var link:LinkZone in plan.m_links) {
				ids = link.m_props[linkId] as Array;
				for each( var id:String in ids) {
					ents[id].addLink( link);
				}
			}
			for each( var attribute:Attribute in this.attributes) {
				ids = attribute.zone.m_props[nodeId] as Array;
				for( i = 0; i < ids.length; ++i) {
					ents[ids[i]].addAttribute( attribute);
				}
			}
		}
		
		/**
		 * Sets the currently displayed selection.
		 * Called by JavaScript.
		 * @param selNam	A selection name as defined in the Dictionary.
		 */
		public function setSelection( selection:String):void
		{
			var selId:int   = getSelId( selection );
			plan.m_curSel = selId;
			plan.init();
			this.invalidateDisplayList();
		}
		
		public function clearSelection( selection:String):void {
			clearZoneSelection( selection, plan.m_nodes, plan.m_nodes.length );
			clearZoneSelection( selection, plan.m_links, plan.m_linksCnt );
		}
		
		/**
		 * Remove zones from a selection.
		 * The display must be refresh to reflect the new selection.
		 * @param selNam	A selection name as defined in the Dictionary.
		 * @param zones		An array of Zones (Nodes or Links).
		 * @param n			Number of zone to remove from selection in the array, starting from index 0.
		 */
		private function clearZoneSelection( selection:String, zones:Array, n:int):void
		{
			var selId:int   = getSelId( selection );
			if ( selId != -1 )
			{
				var unselBit:int = ~( 1 << selId );
				for( var i:int = 0; i < n; i ++ )
				{
					zones[i].m_selection &= unselBit;
				}
			}
		}
		
		/**
		 * Gets the id of a selection, knowing its name.
		 * @param selNam	A selection name as defined in the Dictionary.
		 * @return			An ID in [0,31] or -1 if the selection name is unknown.
		 */
		private function getSelId( selection:String):int
		{
			if( env.m_selections[selection] == null)
				return -1;
			return  env.m_selections[selection];
		}
		
		public function renderShape(sprite:Sprite, width:uint, height:uint, position:Point = null):void {
			// If no position is specified, take (0,0)
			if(position == null) {
				position = new Point(0, 0);
			}
			
			// Transforming the offscreen back display to a BitmapData
			this._offScreen.draw(sprite, new Matrix());
			
			// Copying the content of the back buffer on screen
			var sourceZone:Rectangle = new Rectangle(position.x, position.y, width, height);
			_onScreen.copyPixels(this._offScreen, sourceZone, position);
		}
	}
}
