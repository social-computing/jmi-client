package com.socialcomputing.wps.script  {
    import flash.text.TextFormat;
    
    import mx.collections.ArrayCollection;
    
    /**
     * <p>Title: MenuX</p>
     * <p>Description: A wrapper for the java.awt.Menu class.<br>
     * Because Serializtion is not compatible between client and server for the original class.</p>
     * <p>Copyright: Copyright (c) 2001-2003</p>
     * <p>Company: MapStan (Voyez Vous)</p>
     * @author flugue@mapstan.com
     * @version 1.0
     */
    public class MenuX extends Base
    {
        /**
         * Index of the bit flag prop in VContainer table
         */
        //	public  static final int    FLAGS_VAL           = 0;
        
        /**
         * Index of the font prop in VContainer table
         */
        public const FONT_VAL:int= 1;
        
        /**
         * Index of the text prop in VContainer table
         */
        public const TEXT_VAL:int= 2;
        
        /**
         * True if this menu is just an item.
         */
        public const ITEM_BIT:int= 0x01;
        
        /**
         * Items or subMenus
         */
        public  var m_items:Vector.<MenuX> = null;
        
        /**
         * Creates a new Menu filled with items.
         * @param items	A MenuX table that holds items or submenus.
         */
        public function MenuX( items:Vector.<MenuX>)
        {
            m_items = items;
        }
        
        /**
         * Returns an AWT PopupMenu matching this abstract representation.
         * Each item of the menu adds zone as an ActionListener.
         */
        /**
         * Parse this MenuX to return an awt PopupMenu.
         * The Menu to be initialized must be created before and passed as en argument.
         * When an item is selected, the listener actionPerformed() methode is called.
         * A MenuX can contains list properties so the parsing can generate more than one Menu!
         * @param dst		A new java.awt.PopupMenu to fill according to this MenuX.
         * @param listener	An Object to call when an item is selected.
         * @param zone		The zone from which this menu belongs. So the props can be decoded.
         * @return			True if this menu is not empty. This is used in the recursive process and is useless for the main call.
         * @throws UnsupportedEncodingException 
         */
        public function parseMenu( dst:ArrayCollection, zone:ActiveZone):Boolean {
            var i:int;
            var j:int;
            var k:int	= -1;
            var n:int		= 1;
            var iCnt:int	= m_items.length;
            var isEmpty:Boolean= true;
            var subMenu:ArrayCollection;
            var menuItm:Object;
            var font:TextFormat= this.getTextFormat( zone.m_props);
            var labels:Vector.<String> = null;
            
            if ( isDefined( TEXT_VAL ))
            {
                labels	= parseString( TEXT_VAL, zone.m_props);
                n		= labels.length;
            }
            
            for ( j = 0; j < n; j ++ )
            {
                if ( n > 1|| (n == 1 && labels != null))
                {
					subMenu	= new ArrayCollection();
					menuItm = new Object();
					menuItm.label = labels[j];
					menuItm.children = subMenu;
                    dst.addItem( menuItm );
                    if( n > 1)
                        k = j;
                }
                else
                {
                    subMenu	= dst;
                }
                
                for ( i = 0; i < iCnt; i ++ )
                {
                    var menu:MenuX = m_items[i];
                    var flags:int = menu.getFlags( zone.m_props);
                    
                    if ( isEnabled( flags, ITEM_BIT ))
                    {
                        if ( menu.parseItem( subMenu, zone, k ))
                        {
                            isEmpty = false;
                        }
                    }
                    else
                    {
                        if ( menu.parseMenu( subMenu, zone ))
                            isEmpty = false;
                        else
                        {
                            subMenu.removeItemAt( subMenu.length - 1);
                            var subitems:Vector.<String> = menu.parseString( TEXT_VAL, zone.m_props);
                            if( subitems != null && subitems.length > 0)
                            {
                                menuItm = new Object;
								menuItm.label = subitems[0];
                                var fontMenu:TextFormat = menu.getFont( FONT_VAL, zone.m_props).getTextFormat(zone.m_props);
                                if ( fontMenu != null) {
                                    menuItm.bold = fontMenu.bold;
									menuItm.italic = fontMenu.italic;
                                    menuItm.font = fontMenu.font;
									menuItm.size = fontMenu.size;
                                }
                                menuItm.enabled = false;
                                subMenu.addItem( menuItm );
                            }
                        }
                    }
                }
            }
            return !isEmpty;
        }
        
        /**
         * Parses this MenuX when it's an item (ITEM_BIT).
         * An item can contain list properties so when it's parsed it can generate more than one MenuItem!
         * @param dst		The parent menu of this item. It will hold the item or items depending of the type of this.
         * @param listener	An Object to call when this item is selected.
         * @param zone		The zone from which this parent menu belongs. So the props can be decoded.
         * @param j			The parent menu index if the parent is a multi menu (list prop inside).
         * @return			True if this item is not empty. This is used in the recursive process and is useless for the main call.
         * @throws UnsupportedEncodingException 
         */
        private function parseItem( dst:ArrayCollection, zone:ActiveZone, k:int):Boolean {
            var parts:Array 	= getString( TEXT_VAL, zone.m_props ).split( SEP);
            var titlePart:String	= parts[0], i:int;
            var urlPart:String      = parts.length > 1? parts[1] : null;
            var checkedPart:String    = parts.length > 2? parts[2] : null;
            var font:TextFormat= this.getTextFormat( zone.m_props);
            var titles:Vector.<String>	= parseString3( titlePart, zone.m_props);
            var urls:Vector.<String>   	= urlPart != null && urlPart.length > 0 ? parseString3( urlPart, zone.m_props) : null;
            var checkeds:Vector.<String>  = checkedPart != null && checkedPart.length > 0? parseString3( checkedPart, zone.m_props) : null;
			var title:String, url:String, checked:String;

            if ( k == -1) {
                for ( i = 0; i < titles.length; i ++ ) {
					title = titles[i];
					url = urls == null ? null : i > urls.length -1 ? urls[0] : urls[i];
					checked = checkeds == null ? null : i> checkeds.length -1 ? checkeds[0] : checkeds[i];
                    addItem( dst, titles[i], urls != null ? urls[i] : null, checkeds != null ? checkeds[i] : null, font );
                }
            }
            else {
				title = k > titles.length -1 ? titles[0] : titles[k];
				url = urls == null ? null : k > urls.length -1 ? urls[0] : urls[k];
				checked = checkeds == null ? null : k > checkeds.length -1 ? checkeds[0] : checkeds[k];
                addItem( dst, title, url, checked, font );
            }
            
            return titles.length > 0;
        }
        
        /**
         * Creates a new MenuItem, add it to a Menu and store the URL to call inside.
         * @param menu		The parent Menu of this item.
         * @param listener	An Object to call when this item is selected.
         * @param title		Label of this item that will be displayed in the Menu.
         * @param url		Adress to go (including Javascript) when this is selected.
         * @param font		TypeFace of the label.
         */
        private function addItem( menu:ArrayCollection, title:String, url:String, checked:String, font:TextFormat):void {
            var item:Object = new Object();
            if( url == null && title == "-") {
				item.type = "separator";	
			} else {
				item.label = title;
				if ( url != null )
					item.action = url;
				else
					item.enabled = false;
				if ( checked != null ) {
					item.type = "check";
					item.toggled = checked == "true";
					//var params:Array = [];
					//dispatchEvent( new ActionEvent( "_", params));
				}
                if ( font != null) {
					item.bold = font.bold;
					item.italic = font.italic;
                    item.font = font.font;
					item.size = font.size;
                }
			}
			menu.addItem( item );
        }
        
        /**
         * Retrieve a java.awt.Font from this FontX propertie (FONT_VAL container).
         * @param props		A props table holding this FontX prop if it has one.
         * @return			the matching Font or null if the container is empty or the prop is null.
         */
        public function getTextFormat(props:Array):TextFormat {
            var font:FontX= getFont( FONT_VAL, props);
            
            return font != null ? font.getTextFormat( props ): null;
        }
    }
}