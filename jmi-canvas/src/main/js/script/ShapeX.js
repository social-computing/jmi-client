/*global define, JMI */
JMI.namespace("script.ShapeX");

/*
 * <p>Title: ShapeX</p>
 * <p>Description: A graphical shape that can be transformed and filled.<br>
 * This shape is defined by the number of Points it holds in POLYGON_VAL:
 * <ul>
 * <li>0 : A ghost shape that is not visible.</li>
 * <li>1 : A disk shape whose radius is defined by the SCALE_VAL.</li>
 * <li>2 : A link shape between two points. Its width is defined by the SCALE_VAL.</li>
 * <li>N : A polygon shape defined by its points. The polygon is scaled by the SCALE_VAL.</li>
 * </ul>
 * </p>
 * <p>Copyright: Copyright (c) 2001-2003</p>
 * <p>Company: MapStan (Voyez Vous)</p>
 * @author flugue@mapstan.com
 * @version 1.0
 */

JMI.script.ShapeX = (function() {
	
	var element, ShapeX = function() {
		JMI.script.Base.call( this);
	};
	
	ShapeX.prototype = {
		constructor: JMI.script.ShapeX,
		
		/*
         * Eval the position resulting of the transformation of this by transfo.
         * In fact only the case of a disk (1 point) is handled.
         * 
         * @param zone      BagZone holding the Points table.
         * @param transfo   A polar transformation.
         * 
         * @return          The Point translation produced by the transfo on this.
         */
        transformOut: function(zone, transfo) {
            // else it is just a void frame
            if (this.isDefined(JMI.script.ShapeX.SCALE_VAL)) {
                var scale = this.getFloat(JMI.script.ShapeX.SCALE_VAL, zone.props);
                var p     = this.getCenter(zone);
                scale *= transfo.position;
                
                var x = p.x + Math.round(scale * Math.cos(transfo.direction));
                var y = p.y + Math.round(scale * Math.sin(transfo.direction));
                
                return new JMI.script.Point(x, y);
            }
            return null;
        },

        /*
         * Returns the center of this shape.
         * 
         * @param zone  BagZone holding the Points table.
         * @return      The barycentric center of all points.
         */
        getCenter: function(zone) {
            var points = this.getValue(JMI.script.ShapeX.POLYGON_VAL, zone.props);
            var p;
            var c = new JMI.script.Point(points[0]);
            var i;
            var n = points.length;
            
            if (n > 1) {
                for (i = 1 ; i < n ; i++) {
                    p    = points[i];
                    c.x += p.x;
                    c.y += p.y;
                }
                c.x /= n;
                c.y /= n;
            }
            return c;
        },
        
        /*
         * Return wether a point is inside this shape after it has been transformed
         * 
         * @param zone      BagZone holding the Points table. ???? 
         * @param transfo   A transformation to scale or translate this shape.
         * @param center    The center of the shape before the transformation.
         * @param pos       A point position to test.
         * @return          True if this contains pos, false otherwise
         */
        contains: function(zone, transfo, center, pos) {
            // it is just a void frame
            if(!this.isDefined(JMI.script.ShapeX.SCALE_VAL)) {return false;}
            
            var points = this.getValue(JMI.script.ShapeX.POLYGON_VAL, zone.props);
            var shapeCenter = this.getCenter(zone);
            var shapePosition = new JMI.script.Point();
            var size = Math.round(this.getShapePos(zone, transfo, center, shapeCenter, shapePosition));
            
            switch(points.length) {
                // 1 point = circle => Place
                case 1: 
                    var distance = shapeCenter.add(shapePosition).substract(pos);
                    
                    // We check if the position is located inside the circle
                    // Another way to express it : is the distance between the circle center and the position < circle radius
                    return (distance.x * distance.x) + (distance.y * distance.y) < (size * size);
                    
                // 2 points = segment => Street
                case 2:     
                    var fromPoint = points[0].add(shapePosition);
                    var toPoint = points[1].add(shapePosition);
                    var poly = this.getLinkPoly(zone, fromPoint, toPoint, size);
                    return poly.contains(pos);
                default:
                    throw new Error("Should never happen, a shape can only have 1 or 2 points");
            }
        },
        
        
        /*
         * Sets this bounds by updating an already created Rectangle.
         * 
         * @param zone      BagZone holding the Points table.
         * @param transfo   A transformation to scale or translate this shape.
         * @param center    The center of the shape before the transformation.
         * @param bounds    A Rectangle to merge with this bounds.
         */
        setBounds: function(gDrawingContext, zone, transfo, center, bounds) {
            // else it is just a void frame
            if (this.isDefined(JMI.script.ShapeX.SCALE_VAL)) {
                var points = this.getValue(JMI.script.ShapeX.POLYGON_VAL, zone.props);
                var shapeCenter = this.getCenter(zone);
                var shapePos = new JMI.script.Point();
                var rect; // :JMI.script.Rectangle
                var size = Math.round(this.getShapePos(zone, transfo, center, shapeCenter, shapePos));
                
                switch (points.length) {
                    // 1 point = circle => Place
                    case 1:     
                        // Jonathan Dray : 2011.01.23, the size is the radius
                        rect = new JMI.script.Rectangle(shapeCenter.x + shapePos.x - size,
                            shapeCenter.y + shapePos.y - size,
                            size * 2,
                            size * 2);
                        break;
                    
                    // 2 points = segment => Street
                    case 2:     
                        var A = new JMI.script.Point(points[0].x, points[0].y).add(shapePos);
                        var B = new JMI.script.Point(points[1].x, points[1].y).add(shapePos);
                        rect = this.getLinkPoly(zone, A, B, size).getBounds();
                        break;
                }
                bounds.merge(rect);
            }
        },

        /*
         * Draws this shape on a canevas
         * It's position and size is evaluated using a transfo and a center point.
         * The polygon case is not handled. Only disks (1 point) and links (2 points) are drawn.
         * 
         * @param gDrawingContext  A 2d graphic context to draw the shape in.
         * @param zone             The zone that holds the properties used by this shape.
         * @param slice            The slice that use this shape.
         * @param transfo          A transformation to apply to this shape.
         * @param center           The center of the shape before the transformation. 
         */
        paint: function(gDrawingContext, supZone, zone, slice, transfo, center) {
            // else it is just a void frame
            if(this.isDefined(JMI.script.ShapeX.SCALE_VAL)) {
                var points = this.getValue(JMI.script.ShapeX.POLYGON_VAL, supZone.props);
                var p = points[0];
                var shapePos = new JMI.script.Point();
                var size = Math.round(this.getShapePos(supZone, transfo, center, p, shapePos));
                var outColor, inColor;
                var x, y, i, fromPoint, toPoint, poly;
                
                // Manage each case of number of points to draw for this shape
                switch(points.length) {
                    // dot => Place 
                    case 1:     
                        //composite = AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 1.0);
                        //g.setComposite(composite);
                        // Jonathan Dray : I removed the size offset, as drawing a circle on canevas starts from the shape center 
                        x = p.x + shapePos.x;
                        y = p.y + shapePos.y;
                        
                        // Doubling size value : needed because we are using the  
                        // drawEllipse method that needs a height and width from the top,left starting point
                        // which means we have to double the radius value.
                        // Jonathan Dray 2011.01.08 : do not double the size anymore, the arc drawing method takes the radius
                        // size = size * 2;
                        outColor = slice.getColor(JMI.script.Slice.OUT_COL_VAL, zone.props);
                        inColor = slice.getColor(JMI.script.Slice.IN_COL_VAL, zone.props);
                        gDrawingContext.beginPath();
                        gDrawingContext.arc(x, y, size, 0, Math.PI * 2, false);
                        gDrawingContext.closePath();
                        if(outColor !== null) {
                            gDrawingContext.strokeStyle = outColor;
                            gDrawingContext.stroke();
                        }
                        if(inColor !== null) {
                            gDrawingContext.fillStyle = inColor;
                            gDrawingContext.fill();
                        }
                        break;
                        
                    // segment  => Street
                    case 2:     
                        fromPoint = points[0].add(shapePos);
                        toPoint = points[1].add(shapePos);
                        
                        poly = this.getLinkPoly(supZone, fromPoint, toPoint, (((size + 3) / 2)));
                        
                        outColor = slice.getColor(JMI.script.Slice.OUT_COL_VAL, supZone.props);
                        inColor = slice.getColor(JMI.script.Slice.IN_COL_VAL, supZone.props);
                        
                        // Drawing the polygon
                        gDrawingContext.beginPath();
                        //s.graphics.moveTo(poly.xpoints[poly.npoints-1], poly.ypoints[poly.npoints-1]);
                        gDrawingContext.moveTo(poly.xpoints[poly.npoints-1], poly.ypoints[poly.npoints-1]);
                        for(i = 0 ; i < poly.npoints; ++i) {
                            //s.graphics.lineTo( poly.xpoints[i], poly.ypoints[i]);
                            gDrawingContext.lineTo(poly.xpoints[i], poly.ypoints[i]);
                        }
                        gDrawingContext.closePath();
                        
                        if(outColor !== null) {
                            // s.graphics.lineStyle(1, color.color)
                            gDrawingContext.strokeStyle = outColor;
                            gDrawingContext.stroke();
                        }
                        if(inColor !== null) {
                            // if (color != null) s.graphics.beginFill(color.color);
                            // if (color != null) s.graphics.endFill();
                            gDrawingContext.fillStyle = inColor;
                            gDrawingContext.fill();
                        }
                        break;
                }
            }
        },
        
        /*
         * Creates a Polygon corresponding to a Link.
         * The Link is defined by 2 points and a width.
         * This methode still handle the cases where the links stops before their ends (SEC_LNK_BIT & TAN_LNK_BIT).
         * But it's no more usefull as the links are drawn under the places.
         * 
         * @param zone      BagZone holding the Points table.
         * @param A         A Point of the link.
         * @param B         The other Point of the link.
         * @param width     The width in pixels of this link.
         * 
         * @return          A new 4 Points Polygon.
         */
        getLinkPoly: function(zone, A, B, width) {
            var flags = this.getFlags(zone.props);
            var link = zone;
            var from = link.from;
            var to = link.to;
            var fromOff = 0;
            var toOff = 0;
            
            if (from !== null && to !== null) {
                if (JMI.script.Base.isEnabled(flags, JMI.script.ShapeX.TAN_LNK_BIT | JMI.script.ShapeX.SEC_LNK_BIT)) {
                    fromOff = from.props._SCALE;
                    toOff   = to.props._SCALE;
                }
                if (JMI.script.Base.isEnabled(flags, JMI.script.ShapeX.SEC_LNK_BIT)) {
                    var w2  = width * width;
                    fromOff = Math.round((0.9 * Math.sqrt(fromOff * fromOff - w2)));
                    toOff   = Math.round((0.9 * Math.sqrt(toOff * toOff - w2)));
                }
            }
            
            var poly = new JMI.script.Polygon();
            
            var N = new JMI.script.Point(B.x - A.x, B.y - A.y);
            var len = Math.round(Math.sqrt(N.x * N.x + N.y * N.y));
            
            if (len !== 0) {
                N.x = (N.x << 16) / len;
                N.y = (N.y << 16) / len;
                len  = (len - fromOff - toOff) >> 1;
                
                var C = JMI.script.Point.Scale(N, fromOff + len);
                var U = JMI.script.Point.Scale(N, len);
                var V = JMI.script.Point.Scale(N, width).pivot();
                
                C = C.add(A);
                this.addLinkPoint(poly, -1, -1, C, U, V);
                this.addLinkPoint(poly, -1, 1, C, U, V);
                this.addLinkPoint(poly, 1, 1, C, U, V);
                this.addLinkPoint(poly, 1, -1, C, U, V);
            }
            else{
                poly.addPoint(A.x, A.y);
            }
            
            return poly;
        },
        
        /*
         * Adds a new Point to a polygon using UV bilinear coordinates.
         * The origin and base vectors are given.
         * This is usefull to draw funny links that can be rotated.
         * 
         * @param poly      The polygon to add a Point to.
         * @param u         Units in the U vector direction.
         * @param v         Units in the V vector direction.
         * @param center    Location of the origin of coordinates.
         * @param U         Vector U.
         * @param V         Vector V.
         */
        addLinkPoint: function(poly, u, v, center, U, V) {
            poly.addPoint(center.x + u * U.x + v * V.x, center.y + u * U.y + v * V.y);
        },

        /*
         * Draws an Image in a shape using a transformation to locate and scale it inside.
         * Only the disk case (1 point) is handled.
         * The image is kept in the image bulk loader if not already.
         * The next call to draw the same image will simply retrieve it from the loader, not the net.
         * 
         * @param applet          The global applet
         * @param gDrawingContext A graphical context to draw in
         * @param zone            The zone that holds the properties used by this shape.
         * @param imageName       The path of the image to retrieve.
         * @param transfo         A transformation of this shape to put the image inside.
         * @param center          This shape center before the transformation.
         */
        drawImage: function(applet, gDrawingContext, zone, imageName, transfo, center) {
            // Else it is just a void frame
            if (this.isDefined(JMI.script.ShapeX.SCALE_VAL)) {
                /*
                var imageUrl;//:String;
        
                // Check if it is an absolute url starting with http(s) or file scheme
                // Else get ressources from a path relative to the flash application hosting URL
                if(URLUtil.isHttpURL(imageNam) || URLHelper.isFileURL(imageNam)) {
                    imageUrl = imageNam;
                }
                else {
                    imageUrl = URLHelper.getFullURL(ApplicationUtil.getSwfRoot(), imageNam);
                }
                */
                
                var image = null;
                //var image = applet.env.getMedia(imageName); // as Bitmap;
                
                // Check if the image has already been loaded
                if (!applet.planContainer.map.env.hasMedia(imageName)) {
                	if( !applet.planContainer.map.env.badMedias[imageName]) {
                		if (!applet.planContainer.map.env.loaders[imageName]) {
		                    applet.planContainer.map.env.loaders[imageName] = true;
		                    applet.planContainer.map.env.loaders.length++;
		                    image = new Image();
		                    //var sh = this;
		                    image.onload = function() {
		                        applet.planContainer.map.env.medias[imageName] = image;
		                    	delete applet.planContainer.map.env.loaders[imageName];
		                    	applet.planContainer.map.env.loaders.length--;
			                    if( applet.planContainer.map.env.loaders.length === 0) {
		                    		//setTimeout( function() {
					                    //sh.drawLoadedImage(applet, image, gDrawingContext, zone, imageName, transfo, center, true);
										applet.planContainer.map.plan.init();
										applet.renderShape(applet.restDrawingCanvas, applet.size.width, applet.size.height);
									//}, 1000);
		                    	}
		                    };
		                    image.onerror = function() {
		                    	applet.planContainer.map.env.badMedias[imageName] = true; 
		                    	delete applet.planContainer.map.env.loaders[imageName];
		                    	applet.planContainer.map.env.loaders.length--;
		                    	applet.log('Load image ' + imageName + ' failed');
			                    if( applet.planContainer.map.env.loaders.length === 0) {
		                    		//setTimeout( function() {
					                    //sh.drawLoadedImage(applet, image, gDrawingContext, zone, imageName, transfo, center, true);
										applet.planContainer.map.plan.init();
										applet.renderShape(applet.restDrawingCanvas, applet.size.width, applet.size.height);
									//}, 1000);
		                    	}
		                    };
		                    image.src = imageName;   
		                }
	                }
                }
                else {
                	// Draw the image if it has already been loaded
                    image = applet.planContainer.map.env.medias[imageName];
                    this.drawLoadedImage(applet, image, gDrawingContext, zone, imageName, transfo, center, false);
                }
            }
        },
        
        drawLoadedImage: function(applet , image, gDrawingContext, zone, imageNam, transfo, center, render) {
            // Shape information             
            var shapeCenter   = this.getCenter(zone);
            var shapePosition = new JMI.script.Point();
            var shapeScale    = this.getShapePos(zone, transfo, center, shapeCenter, shapePosition); //:Number
            
            // Image information
            // Position the image at the shape center absolute position on the canevas
            var imagePosition = shapeCenter.add(shapePosition);
            var imageWidth;
            var imageHeight;

            
            // If the shape scale is > 0 then scale the image  
            if (shapeScale > 0.0) {
                // Disk                
                var imageScale = 1.414 * shapeScale;
                imageWidth = imageScale;
                imageHeight = imageScale;
                imageScale >>= 1;
                imagePosition.x -= imageScale;
                imagePosition.y -= imageScale;
            }
            else {
                imageWidth = image.width;
                imageHeight = image.height;
                imagePosition.x -= imageWidth / 2;
                imagePosition.y -= imageHeight / 2;
            }
            
            // takes an image, scales it to a width of dw and a height of dh, and draws it on the canvas at coordinates (dx, dy)
            gDrawingContext.drawImage(image, imagePosition.x, imagePosition.y, imageWidth, imageHeight); 
            
            if(render) {
                applet.renderShape(gDrawingContext, imageWidth, imageHeight, imagePosition);
            }
        },


        /*
         * Evaluate the transformation of a point using a transformation on this shape and return its scale.
         * 
         * @param zone      BagZone holding this props.
         * @param transfo   A transformation to scale or translate this shape.
         * @param center    The center of this shape(satellite) before the tranformation.
         * @param p0        The center of this parent satellite.
         * @param pos       The location to transform.
         * 
         * @return          The scale of this shape after transformation.
         */
        getShapePos: function(zone, transfo, center, p0, pos) {
            var scale = this.getFloat(JMI.script.ShapeX.SCALE_VAL, zone.props);
            var p; // :JMI.script.Point
            
            // We are drawing a real Sat!
            if (center !== null) {
                p = center.substract(p0); 
                pos.x = p.x;
                pos.y = p.y;
            }
            
            if (transfo !== null) {
                p = pos.add(transfo.getCart());
                pos.x = p.x;
                pos.y = p.y;
                scale *= transfo.scale;
            }
            return scale;
        }
        
	};
	
	// Héritage
	for (element in JMI.script.Base.prototype ) {
		if(!ShapeX.prototype[element]) {
			ShapeX.prototype[element] = JMI.script.Base.prototype[element];
		}
	}
	
	return ShapeX;
}());


// Constants
/*
 * Index of the Points table prop in VContainer table.
 * It can hold 0,1,2 or more points depending on the shape to display.
 */
JMI.script.ShapeX.POLYGON_VAL = 1;

/*
 * Index of the scale prop in VContainer table.
 * This is the radius, width or scale of the shape, depending on the number of Points in POLYGON_VAL.
 */
JMI.script.ShapeX.SCALE_VAL = 2;

/*
 * True if this Shape is a link between exactly its 2 points.
 * This is now useless because it's always true.
 */
JMI.script.ShapeX.CTR_LNK_BIT = 0x001;

/*
 * True if this Shape is a link whose bounds starts at the intersection with the places.
 * This is useless because the links are drawn under the place now.
 */
JMI.script.ShapeX.SEC_LNK_BIT = 0x002;

/*
 * True if this Shape is a link AND its anchor points are tangent to the places.
 * This is useless because the links are drawn under the place now.
 */
JMI.script.ShapeX.TAN_LNK_BIT = 0x004;