package com.socialcomputing.wps.script
{
	import com.socialcomputing.wps.components.Map;
	import com.socialcomputing.wps.util.controls.ImageUtil;
	import com.socialcomputing.wps.util.shapes.RectangleUtil;
	
	import flash.display.Sprite;
	import flash.geom.ColorTransform;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	import flash.text.AntiAliasType;
	import flash.text.TextField;
	import flash.text.TextFieldAutoSize;
	import flash.text.TextFormat;
	
	import mx.managers.CursorManager;

	public class Watermark
	{
		public static const LABEL:String = 'powered by Just Map It!';
		public static const SIZE:int = 14;
		
		private var bounds:Rectangle;
		private var isHover:Boolean;
		private var restColor:uint, curColor:uint;
		
		public function Watermark( options:Object)
		{
			this.bounds = new Rectangle();
			this.restColor = options && options.restColor ? options.restColor : 0x999999;
			this.curColor = options && options.curColor ? options.curColor : 0x2288BB;
		}
		
		public function render(component:Map,s:Sprite):void {
			var textField:TextField = getTextField(s,false);
			RectangleUtil.copy( this.bounds, textField.getBounds(component));
			this.bounds.x = component.size.width - this.bounds.width - HTMLText.BORDER_WIDTH;
			this.bounds.y = component.size.height - this.bounds.height - HTMLText.BORDER_WIDTH;
			this.drawText(s, textField);
			this.isHover = false;
		}
		
		public function getTextField(s:Sprite,hover:Boolean):TextField {
			var font:TextFormat = new TextFormat();
			font.font = "Arial";
			font.size = Watermark.SIZE;
			font.color = hover ? this.curColor : this.restColor;
			var textField:TextField = new TextField();
			textField.defaultTextFormat = font;
			textField.multiline = false;
			textField.htmlText = Watermark.LABEL;
			textField.x = this.bounds.x;
			textField.y = this.bounds.y; 
			textField.autoSize = TextFieldAutoSize.LEFT;
			textField.antiAliasType = AntiAliasType.ADVANCED;
			textField.border = false;
			return textField;
		}
		
		public function drawText(s:Sprite, textField:TextField):void {
			ImageUtil.drawTextField(textField, s.graphics);
		}
		
		public function contains(position:Point):Boolean {
			return this.bounds && this.bounds.contains( position.x, position.y);
		}
		
		public function hover(component:Map, position:Point):void {
			if( this.contains(position)) {
				if( !this.isHover) {
					var textField:TextField = getTextField(component,true);
					//document.body.style.cursor = 'pointer';
					component.buttonMode = true;
					component.useHandCursor = true;
					ImageUtil.clear( component.curDrawingSurface);
					this.drawText(component.curDrawingSurface, textField);
					component.renderShape(component.curDrawingSurface, this.bounds.width, this.bounds.height, new Point( this.bounds.x,this.bounds.y));
					this.isHover = true;
				}
			}
			else {
				if( this.isHover) {
					//document.body.style.cursor = '';
					component.useHandCursor = false;
					component.buttonMode = false;
					component.renderShape(component.restDrawingSurface, this.bounds.width, this.bounds.height, new Point( this.bounds.x,this.bounds.y));
					this.isHover = false;
				}
			}
		}
		
		public function click(component:Map, position:Point):void {
			if( this.contains( position)) {
				component.openSoCom(null);
			}
		}
	}
}