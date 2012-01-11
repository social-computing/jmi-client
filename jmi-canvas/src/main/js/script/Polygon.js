JMI.namespace("script.Polygon"); 

JMI.script.Polygon = (function() {

    var Polygon = function() {
        this._xpoints = []; //:Vector.<int>;
        this._ypoints = []; //:Vector.<int>;
        this._npoints = 0;  //:int;
        //bounds = com.socialcomputing.jmi.script.Rectangle, 
        this._bounds = null;
    };
	
	Polygon.prototype = {
		constructor: JMI.script.Polygon,
		
		/*
         * Resets this <code>Polygon</code> object to an empty polygon.
         * The coordinate arrays and the data in them are left untouched
         * but the number of points is reset to zero to mark the old
         * vertex data as invalid and to start accumulating new vertex
         * data at the beginning.
         * All internally-cached data relating to the old vertices
         * are discarded.
         * Note that since the coordinate arrays from before the reset
         * are reused, creating a new empty <code>Polygon</code> might
         * be more memory efficient than resetting the current one if
         * the number of vertices in the new polygon data is significantly
         * smaller than the number of vertices in the data from before the
         * reset.
         * @see java.awt.Polygon#invalidate
         * @since 1.4
         */
        reset: function() {
            this._npoints = 0;
            this._bounds = null;
            return this;
        },
        
        /*
         * Invalidates or flushes any internally-cached data that depends
         * on the vertex coordinates of this <code>Polygon</code>.
         * This method should be called after any direct manipulation
         * of the coordinates in the <code>xpoints</code> or
         * <code>ypoints</code> arrays to avoid inconsistent results
         * from methods such as <code>getBounds</code> or <code>contains</code>
         * that might cache data from earlier computations relating to
         * the vertex coordinates.
         * @see java.awt.Polygon#getBounds
         * @since 1.4
         */
        invalidate: function() {
            this._bounds = null;
            return this;
        },
        
        /*
         * Resizes the bounding box to accomodate the specified coordinates.
         * @param x,&nbsp;y the specified coordinates
         */
        updateBounds: function(x, y) {
            if (x < this._bounds.x) {
                this._bounds.width = this._bounds.width + (this._bounds.x - x);
                this._bounds.x = x;
            }
            else {
                this._bounds.width = Math.max(this._bounds.width, x - this._bounds.x);
                // bounds.x = bounds.x;
            }
        
            if (y < this._bounds.y) {
                this._bounds.height = this._bounds.height + (this._bounds.y - y);
                this._bounds.y = y;
            }
            else {
                this._bounds.height = Math.max(this._bounds.height, y - this._bounds.y);
                // bounds.y = bounds.y;
            }
            
            return this;
        },
        
        /*
         * Appends the specified coordinates to this <code>Polygon</code>.
         * <p>
         * If an operation that calculates the bounding box of this
         * <code>Polygon</code> has already been performed, such as
         * <code>getBounds</code> or <code>contains</code>, then this
         * method updates the bounding box.
         * @param x the specified x coordinate
         * @param y the specified y coordinate
         * @see java.awt.Polygon#getBounds
         * @see java.awt.Polygon#contains
         */
        addPoint: function(x, y) {
            this._xpoints[this._npoints] = x;
            this._ypoints[this._npoints] = y;
            this._npoints++;
            if (this._bounds != null) {
                this.updateBounds(x, y);
            }
            
            return this;
        },
        
        /*
         * Gets the bounding box of this <code>Polygon</code>.
         * The bounding box is the smallest {@link Rectangle} whose
         * sides are parallel to the x and y axes of the coordinate space, 
         * and can completely contain the <code>Polygon</code>.
         * 
         * @return a <code>Rectangle</code> that defines the bounds of this <code>Polygon</code>.
         */
        getBounds: function() {
            if (this._npoints == 0) {
                return new JMI.script.Rectangle(0, 0, 0, 0);
            }
            if (this_bounds == null) {
                this.calculateBounds(this._xpoints, this._ypoints, this._npoints);
            }
            return this._bounds;
        },
        
        
        /*
         * Determines whether the specified {@link Point} is inside this <code>Polygon</code>.
         * 
         * @param p the specified <code>Point</code> to be tested
         * 
         * @return <code>true</code> if the <code>Polygon</code> contains the
         * <code>Point</code>; <code>false</code> otherwise.
         */
        contains: function(p) {
            return this.containsCrossing(p);
        },

        /**
         * Determines if the specified coordinates are inside this <code>Polygon</code>. 
         * It uses the crossing number test for a point in a polygon
         * 
         * @param p the specified <code>Point</code> to be tested
         * 
         * @return <code>true</code> if the <code>Polygon</code> contains the
         * specified point; <code>false</code> otherwise.
         */
        containsCrossing: function(p) {
        
            // The crossing number counter
            var cn = 0;
            
            // Loop through all edges of the polygon
            for (var i = 0 ; i < this._npoints ; i++) {
                
                var i2 = ((i + 1) == this._npoints) ? 0 : i + 1;
                
                // Edge from p[i] to p[i+1]
                if (((this._ypoints[i] <= p._y) && (this._ypoints[i2] > p._y))    // An upward crossing
                    || ((this._ypoints[i] > p._y) && (this._ypoints[i2] <= p._y))) {      // Or a downward crossing
                    
                    // Compute the actual edge-ray intersect x-coordinate
                    var vt = (p._y - this._ypoints[i]) / (this._ypoints[i2] - this._ypoints[i]);
                    if (p._x < this._xpoints[i] + vt * (this._xpoints[i2] - this._xpoints[i])) // p.x < intersect
                        ++cn;   // a valid crossing of y = p.y right of p.x
                }
            }
            // TODO : portage : à changer
            return new Boolean(cn & 1);    // 0 if even (out), and 1 if odd (in)
        },
        
        /**
         * Calculates the bounding box of the points passed to the constructor.
         * Sets <code>bounds</code> to the result.
         * 
         * @param xpoints[] array of <i>x</i> coordinates
         * @param ypoints[] array of <i>y</i> coordinates
         * @param npoints the total number of points
         */
        calculateBounds: function(xpoints, ypoints, npoints) {
            var minPoint = new JMI.script.Point(xpoints[0], ypoints[0]);
            var maxPoint = new JMI.script.Point(xpoints[0], ypoints[0]);
            
            for (var i = 1 ; i < npoints ; i++) {
                minPoint.x = Math.min(minPoint._x, xpoints[i]);
                minPoint.y = Math.min(minPoint._y, ypoints[i]);
                maxPoint.x = Math.max(maxPoint._x, xpoints[i]);
                maxPoint.y = Math.max(maxPoint._y, ypoints[i]);
            }
            
            this._bounds = new Rectangle(minPoint._x, minPoint._y,
                                        maxPoint._x - minPoint._x,
                                        maxPoint._y - minPoint._y);
            return this;
        }
	};
	
	return Polygon;
}());














