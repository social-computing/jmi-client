package com.socialcomputing.wps.components
{
	import com.socialcomputing.wps.plan.PlanContainer;
	import com.socialcomputing.wps.script.BagZone;
	import com.socialcomputing.wps.script.Dimension;
	import com.socialcomputing.wps.script.Env;
	import com.socialcomputing.wps.script.Plan;
	import com.socialcomputing.wps.script.Satellite;
	import com.socialcomputing.wps.script.ShapeX;
	import com.socialcomputing.wps.script.Slice;
	import com.socialcomputing.wps.script.VContainer;
	
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display.Graphics;
	import flash.display.InteractiveObject;
	import flash.display.Shape;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.geom.Matrix;
	import flash.geom.Point;
	
	import mx.controls.Alert;
	import mx.controls.Image;
	import mx.managers.CursorManager;
	
	import spark.components.Group;
	import spark.core.SpriteVisualElement;
	
	[DefaultBindingProperty(destination="dataProvider")]
	
	[IconFile("Plan.png")]
	
	[Event(name="onReady", type="flash.events.Event")]
	[Event(name="onError", type="flash.events.Event")]
	[Event(name="onAction", type="flash.events.Event")]
	
	public class PlanComponent extends Group
	{
		include "../script/Version.as"
		
		public static var s_hasGfxInc:Boolean;
		
		private var _dataProvider:PlanContainer = null;
		private var _nodes:Array = null;
		private var _curPos:Point= new Point();
		private var _ready:Boolean = false;

		private var _backImgUrl:String;
		//private var _backImg:Image;
		//private var _restImg:Image;

		/*
		 *  Specific display elements
		 */
		private var _onScreen:BitmapData;
		private var _drawingSurface:SpriteVisualElement;
		private var _backDrawingSurface:Shape;
		private var _restDrawingSurface:Shape;
		
		public function PlanComponent()
		{
			super();
			// Drawing surface of the component
			_drawingSurface = new SpriteVisualElement();
			this.addElement(_drawingSurface);
			
			addEventListener(MouseEvent.MOUSE_OVER, mouseOverHandler);
			//addEventListener(MouseEvent.MOUSE_MOVE, mouseMoveHandler);
			addEventListener(MouseEvent.MOUSE_OUT, mouseOutHandler);
			/*			
				addEventListener(MouseEvent.MOUSE_CLICK, mouseClickHandler);
				addEventListener(MouseEvent.MOUSE_DOUBLE_CLICK, mouseDoubleClickHandler);
			*/	
		}
		
		public function get ready():Boolean {
			return plan != null && _ready;
		}			
		
		public function get plan():Plan
		{
			if(this._dataProvider == null) {
				return null
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
		
		public function get backDrawingSurface():Shape
		{
			return _backDrawingSurface;
		}
		public function get restDrawingSurface():Shape
		{
			return _restDrawingSurface;
		}
		
/*		public function get backImg():Image
		{
			return _backImg;
		}
*/		
/*		public function get restImg():Image
		{
			return _restImg;
		}
*/		
		public function get backImgUrl():String
		{
			return _backImgUrl;
		}
		
/*		public function set backImg(value:Image):void
		{
			_backImg = value;
		}
*/		
/*		public function set restImg(value:Image):void
		{
			_restImg = value;
		}
*/		
		public function set dataProvider(value:Object):void
		{
			// If the given value is null return for now
			// TODO : If the local plancontainer is set, reset objects 
			if(value == null) {
				return;
			}
			
			// CursorManager.setBusyCursor();
			if(value is PlanContainer) {
				this._dataProvider = value as PlanContainer;
			}
			else {
				this._dataProvider = PlanContainer.fromJSON(value);
			}

			// var needPrint:Boolean = false; // Later
			//_dataProvider.env.init( this, needPrint);
/*			m_backImg	= createImage( m_size.width, m_size.height );
			m_restImg	= createImage( m_size.width, m_size.height );
*/
			try {
				// TODO : Handle this properly
			    // Should manage the onScreen object each time the service is called
				this._onScreen = new BitmapData(this.width, this.height);
				this._drawingSurface.addChild(new Bitmap(this._onScreen));
				this._backDrawingSurface = new Shape();
				this._restDrawingSurface = new Shape();
				
				
				// Creating a fake BagZone as a parent zone for the following slice
				var bagZone:BagZone = new BagZone(null);
				bagZone.m_props = new Array();
				bagZone.m_props[2] = 1;
					
					
				// Creating a fake Shape to render in the following slice
				var points:Array = new Array();
				
				// Test with 1 point
				//points[0] = new Point(15, 15);
				
				// Test with 2 points
				points[0] = new Point(15, 15);
				points[1] = new Point(30, 30);
				
				var shape:ShapeX = new ShapeX();
				shape.m_containers = new Array();
				shape.m_containers[ShapeX.SCALE_VAL] = new VContainer(1, false);
				shape.m_containers[ShapeX.POLYGON_VAL] = new VContainer(points, false);

				// Creating the slice to display
				var slice:Slice = new Slice();
				slice.m_containers = new Array();
				slice.m_containers[Slice.IN_COL_VAL] = new VContainer(0x000000, false);
				/*
				slice.paint(this,                               // Le plan component courant
						    this._backDrawingSurface.graphics,  // La zone graphique dans laquelle dessiner
							bagZone, 							// Zone parente du slice
							bagZone,                            // Zone ?????
							shape,                              // Shape à dessiner : pq, elle ne fait pas directement partie du SLICE ???
							new Point(10, 10),                  // Centre d'un satellite .... ????
							new Point(10, 10));                  // Centre de la sone parente ?????????
				*/

				
				var slices:Vector.<Slice> = new Vector.<Slice>();
				slices.push(slice);
				var satellite:Satellite = new Satellite(shape, slices); 
				satellite.paint(this, this._backDrawingSurface.graphics, bagZone, new Point(10, 10), new Point(10, 10), false, null, Satellite.BASE_TYP);
				
				this._ready = true;
				/*
				plan.m_applet = this;
				plan.m_curSel = -1;
				plan.initZones(this.graphics, plan.m_links, true);
				plan.initZones(this.graphics, plan.m_nodes, true);
				plan.resize(size);
				plan.init();
				plan.resize(size);
				_ready = true;
				*/
				
			}
			catch(error:Error) {
				trace( error.getStackTrace());	
			}
				
			// showStatus( "" );
			//CursorManager.removeBusyCursor();
			
			/*
			 * Don't redraw immediately, because maybe the code that's calling us is
			 * going to change several settings, and we don't want to redraw for each 
			 * setting change. Instead, tell the flex framework that
			 * we need to be redrawn; the framework will ensure that updateDisplayList
			 * is invoked after all scripts have finished executing.
			 */
			this.invalidateProperties();
			this.invalidateDisplayList();		
			if( ready)
				dispatchEvent(new Event( "onReady"));
			else
				dispatchEvent(new Event( "onError"));
		}
		
		
		public function showStatus(message:String):void {
			trace(message);
		}
		
		public function get curPos():Point {
			return _curPos;
		}
		
		public function set curPos(pos:Point):void {
			_curPos = pos;
		}
		
		public function mouseOverHandler(event:MouseEvent):void {
			trace("mouseOverHandler");
		}
		
		public function mouseMoveHandler(event:MouseEvent):void {
			/*
			curPos.x    = event.stageX;
			curPos.y    = event.stageY;
			if( ready) {
				_dataProvider.plan.updateZoneAt( curPos ); // The Zone, SubZone or Satellite can have changed
			}
			*/
		}
		
		public function mouseOutHandler(event:MouseEvent):void {
			trace("mouseOutHandler");
		}
		
		public function mouseClickHandler(event:MouseEvent):void {
			trace("mouseClickHandler");
		}
		
		public function mouseDoucleClickHandler(event:MouseEvent):void {
			trace("mouseDoucleClickHandler");
		}
		
		
		/**
		 * @inheritDoc
		 */
		override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
			super.updateDisplayList(unscaledWidth, unscaledHeight);
			trace("Update graphic display");
			if(ready) {
				//graphics.drawImage( _restImg, 0, 0, null );
				// _restDrawingSurface
				// plan.paintCurZone(this._backDrawingSurface.graphics);  // A new Zone is hovered, let's paint it!
				this.render();
			}
		}
		
		/**
		 * Wrapper for a menu item that call performAction with the ActionCommand String as argument.
		 **/
		public function actionPerformed( aactionStr:String ):void {
			performAction( aactionStr);
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
						
						// TODO FireEvent
						//m_planWindow.call( func, params );
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
		}
		
		public function renderShape(shape:Shape, width:int, height:int):void {
			trace("renderShape method called");
			
			// Transforming the offscreen back display to a BitmapData
			var backBuffer:BitmapData = new BitmapData(width, height);
			backBuffer.draw( shape, new Matrix());
			
			// Copying the content of the back buffer on screen
			_onScreen.copyPixels(backBuffer, backBuffer.rect, new Point(0,0));
			
			// Clear the offscreen back display
			shape.graphics.clear();
		}
		
		private function render():void {
			trace("Render method called");
			
			renderShape( this._backDrawingSurface, this.width, this.height);
		}
	}
}