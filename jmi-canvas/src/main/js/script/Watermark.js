/*global define, JMI */
JMI.namespace("script.Watermark");

JMI.script.Watermark = (function() {
    
    var Watermark = function(options) {
		this.fontSize = options && options.fontSize ? options.fontSize : JMI.script.Watermark.SIZE;
		this.restColor = options && options.restColor ? options.restColor : '#999999';
		this.curColor = options && options.curColor ? options.curColor : '#2288BB';
	};
	
	Watermark.prototype = {
		constructor: JMI.script.Watermark,
		
		render: function(component,gDrawingContext) {
			var x, y, meetrics;
			this.setFont(gDrawingContext,false);
			metrics = gDrawingContext.measureText(JMI.script.Watermark.LABEL);
			x = component.size.width - metrics.width - JMI.script.HTMLText.MARGIN;
			y = component.size.height - this.fontSize - JMI.script.HTMLText.MARGIN;
			this.bounds = new JMI.script.Rectangle(x, y, component.size.width, component.size.height);
			this.drawText(gDrawingContext);
			this.isHover = false;
		},
		setFont: function(gDrawingContext,hover) {
			gDrawingContext.textBaseline = 'top';
			gDrawingContext.textAlign = 'left';
			gDrawingContext.font = this.fontSize + 'px Arial';
			gDrawingContext.fillStyle = hover ? this.curColor : this.restColor;
		},
		drawText: function(gDrawingContext) {
			gDrawingContext.fillText(JMI.script.Watermark.LABEL, this.bounds.x, this.bounds.y);
		},
		contains: function(position) {
			return this.bounds && this.bounds.contains( position.x, position.y);
		},
		hover: function(component, position) {
			if( this.contains(position)) {
				if( !this.isHover) {
					document.body.style.cursor = 'pointer';
            		JMI.util.ImageUtil.clear( component.curDrawingCanvas, component.curDrawingContext);
					this.setFont(component.curDrawingContext,true);
					this.drawText(component.curDrawingContext);
					component.renderShape(component.curDrawingCanvas, this.bounds.width, this.bounds.height, new JMI.script.Point( this.bounds.x,this.bounds.y));
					this.isHover = true;
				}
			}
			else {
				if( this.isHover) {
					document.body.style.cursor = '';
					component.renderShape(component.restDrawingCanvas, this.bounds.width, this.bounds.height, new JMI.script.Point( this.bounds.x,this.bounds.y));
					this.isHover = false;
				}
			}
		},
		click: function(component, position) {
			if( this.contains( position)) {
				component.openJMI();
			}
		}
	};
	
	return Watermark;
}());

JMI.script.Watermark.LABEL = 'powered by Just Map It!';
JMI.script.Watermark.SIZE = 14;
