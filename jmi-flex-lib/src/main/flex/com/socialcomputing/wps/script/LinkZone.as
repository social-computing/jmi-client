package com.socialcomputing.wps.script  {
	import com.socialcomputing.wps.components.Map;
	import com.socialcomputing.wps.util.controls.ImageUtil;
	
	import flash.display.Sprite;
	import flash.geom.Point;
    
/**
     * <p>Title: LinkZone</p>
     * <p>Description: A graphical Link holding properties.<br>
     * The link is tied to 2 Nodes (BagZones) or just one if it's a fake one.</p>
     * <p>Copyright: Copyright (c) 2001-2003</p>
     * <p>Company: MapStan (Voyez Vous)</p>
     * @author flugue@mapstan.com
     * @version 1.0
     */
    public class LinkZone extends ActiveZone implements Activable
    {
        /**
         * Bit indicating that this is a Link whose 'From' node is a fake one (out of the window).
         */
        public static const FAKEFROM_BIT:int= 0x01;
        
        /**
         * Bit indicating that this is a Link whose 'To' node is a fake one (out of the window).
         */
        public static const FAKETO_BIT:int= 0x02;
        
        /**
         * The Place from which the link start.
         */
        public  var m_from:BagZone;
        
        /**
         * The Place to which the link end.
         */
        public  var m_to:BagZone;
        
		
		/**
		 * Index of Bagzone (temporary during JSON desrialization).
		 */
		public var m_fromIndex:int, m_toIndex:int;
		
        /**
         * Creates a Link between two Places.
         * @param from	The Place to start from.
         * @param to	The Place to end to.
         */
        public function LinkZone( from:int, to:int)
        {
			m_fromIndex  = from;
			m_toIndex    = to;
        }
        
        /**
         * Perform precalc and basic initialisation.
         * Initialize the BBox of this zone, the max BBox of all zones and the BBox of the plan.
         * It also perform basic initialisation through inheritance.
         * @param applet    WPSApplet owning this.
         * @param g         A graphics compatible with the one that will be used for painting.
         * @param isFirst   True if init called for the first time.
         */
        public override function init(applet:Map, s:Sprite, isFirst:Boolean):void {
            super.init( applet, s, isFirst );
            
            this.m_parent = null;
            if (!Base.isEnabled(m_flags, FAKEFROM_BIT | FAKETO_BIT)) {
                m_bounds = m_restSwh.getBounds( applet, s.graphics, this, false );
				// DEBUG
				// Drawing sensitive zone
				/*
				s.graphics.lineStyle(1, 0xFF0000);
				s.graphics.drawRect(this.m_bounds.x, this.m_bounds.y,
					       this.m_bounds.width, this.m_bounds.height);
				*/
				// END DEBUG				
                if ( m_curSwh != null )
                    m_bounds = m_bounds.union( m_curSwh.getBounds( applet, s.graphics, this, true ));
                m_bounds.inflate( 2, 2);
                
                var w:int= m_bounds.width,
                	h:int= m_bounds.height;
                var maxBox:Dimension= applet.plan.m_maxBox;
				
                if ( w > maxBox.width )     maxBox.width    = w;
                if ( h > maxBox.height )    maxBox.height   = h;
				
				m_bounds = m_bounds.intersection(applet.size.toRectangle());
            }
        }
        
        /**
         * Paint this Link when the cursor hover it.
         * This is achieved by blitting the basic background, drawing the cur swatch base satellites and the two places over it.
         * Then the Tip and Sel satellites are drawn over the places.
         * These operations are made in another buffer that is finaly blitted on the Applet's Graphics.
         * This reduce CPU overhead and avoid screen flickering.
		 * 
         * @param applet    WPSApplet owning this zone.
         * @param g         A Graphics on which this must be painted.
         */
        public function paintCur(applet:Map):void {
            if( (m_flags & INVISIBLE_BIT) != 0) return;
			
			/*
			Graphics    bufGfx  = applet.m_plan.m_blitBuf.getGraphics();
			bufGfx.drawImage( applet.m_restImg, 0, 0, m_bounds.width, m_bounds.height, m_bounds.x, m_bounds.y, m_bounds.x + m_bounds.width, m_bounds.y + m_bounds.height, null );
			bufGfx.translate( -m_bounds.x, -m_bounds.y );*/
			ImageUtil.clear( applet.curDrawingSurface);
			m_curSwh.paint( applet, applet.curDrawingSurface, this, true, true, Satellite.BASE_TYP, true );
			
			m_from.paint( applet, applet.curDrawingSurface, false, true, Satellite.ALL_TYP, true );
			m_to.paint( applet, applet.curDrawingSurface, false, true, Satellite.ALL_TYP, true );
			m_curSwh.paint( applet, applet.curDrawingSurface, this, true, true, Satellite.TIP_TYP, true );
			m_curSwh.paint( applet, applet.curDrawingSurface, this, true, true, Satellite.SEL_TYP, true );

			/*bufGfx.translate( m_bounds.x, m_bounds.y );
			g.setClip( m_bounds.x, m_bounds.y, m_bounds.width, m_bounds.height );
			g.drawImage( applet.m_plan.m_blitBuf, m_bounds.x, m_bounds.y, null );*/
			applet.renderShape( applet.curDrawingSurface, m_bounds.width, m_bounds.height, new Point(m_bounds.x, m_bounds.y));
			
		
			// Get the image buffer used as blit buffer 
			// Do not draw directly on the component graphic area ....
			// A double buffering technic but should not do this in a flash image component !! 
			// TODO : See how to do this efficiently in flash / flex
			// See : http://jessewarden.com/2005/11/blitting-double-buffering-for-tile-based-games-in-flash-flex-part-1-of-3.html
			// And : http://www.adobe.com/devnet/flex/articles/actionscript_blitting.html
        }
    }
}