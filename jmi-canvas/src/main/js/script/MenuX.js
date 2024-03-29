/*global define, JMI */
JMI.namespace("script.MenuX");

/*
 * <p>Title: MenuX</p>
 * <p>Description: A wrapper for the java.awt.Menu class.<br>
 * Because Serializtion is not compatible between client and server for the original class.</p>
 * <p>Copyright: Copyright (c) 2001-2003</p>
 * <p>Company: MapStan (Voyez Vous)</p>
 * @author flugue@mapstan.com
 * @version 1.0
 */
JMI.script.MenuX = ( function() {

	var element, MenuX = function() {
		JMI.script.Base.call(this);
	};

	MenuX.prototype = {
		constructor : JMI.script.MenuX,

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
		parseMenu : function(applet,dst,zone) {
			var i;
			var j;
			var k = -1;
			var n = 1;
			var iCnt = this.menu.length;
			var isEmpty = true;
			var subMenu, el1, a;
			var menuItm;
			var font = this.getTextFormat(zone.props);
			var labels = null;

			if(this.isDefined(JMI.script.MenuX.TEXT_VAL)) {
				labels = this.parseString(JMI.script.MenuX.TEXT_VAL, zone.props);
				n = labels.length;
			}

			for( j = 0; j < n; j++) {
				if(n > 1 || (n === 1 && labels !== null)) {
					el1 = document.createElement("div");
					el1.style.position = 'absolute';
					el1.style.visibility = 'hidden';
					el1.style.display = 'none';
					subMenu = document.createElement("ul");
					subMenu.className = 'jmi-menu';
					el1.appendChild(subMenu);
					document.body.appendChild(el1);

					menuItm = document.createElement("li");
					a = document.createElement("a");
					a.className = 'jmi-menu-arrow';
					a.href = '';
					a.innerHTML = labels[j] + '&nbsp;&nbsp;&nbsp;&nbsp;';
					a.JMI = applet;
					a.submenu = el1;
					
					a.addEventListener('mouseover', function(event) {
						JMI.script.MenuX.hideSubMenu(event.target.parentNode.parentNode);
						var top = event.target.parentNode.offsetTop, left = event.target.parentNode.offsetWidth;
						var e = event.target.parentNode.offsetParent;
						while( e) {
							top += e.offsetTop;
							left += e.offsetLeft;
							e = e.offsetParent;
						}
						event.target.submenu.style.top = top + 'px';
						event.target.submenu.style.left = left + 'px';
						event.target.submenu.style.visibility = '';
						event.target.submenu.style.display = 'block';
						event.target.parentNode.parentNode.currentSubMenu = event.target.submenu;
					}, false);
					a.addEventListener('mouseout', function(event) {
						//event.target.submenu.style.visibility = 'hidden';	
					}, false);
					a.addEventListener('click', function(event) {
						event.preventDefault();
					}, false);
					a.addEventListener('dblclick',  function(event) {
						event.preventDefault();
					}, false);
					menuItm.appendChild(a);
					dst.appendChild(menuItm);

					if(n > 1) {
						k = j;
					}
				} else {
					subMenu = dst;
				}

				for( i = 0; i < iCnt; i++) {
					var menu = this.menu[i];
					var flags = menu.getFlags(zone.props);

					if(JMI.script.Base.isEnabled(flags, JMI.script.MenuX.ITEM_BIT)) {
						if(menu.parseItem(applet,subMenu, zone, k)) {
							isEmpty = false;
						}
					} else {
						if(menu.parseMenu(applet,subMenu,zone)) {
							isEmpty = false;
						} else {
							subMenu.removeChild(subMenu.lastChild());
							var subitems = menu.parseString(JMI.script.MenuX.TEXT_VAL, zone.props);
							if(subitems !== null && subitems.length > 0) {
								var fontMenu = menu.getFont(JMI.script.MenuX.FONT_VAL, zone.props).getTextFormat(zone.props);
								this.addItem(applet,subMenu,subitems[0],null,fontMenu);
							}
						}
					}
				}
			}
			return !isEmpty;
		},
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
		parseItem : function(applet, dst, zone, k) {
			var parts = this.getString(JMI.script.MenuX.TEXT_VAL, zone.props).split(JMI.script.Base.SEP);
			var titlePart = parts[0], i;
			var urlPart = parts.length > 1 ? (parts[1]===''? null :parts[1]): null;
			var checkedPart = parts.length > 2 ? parts[2] : null;
			var font = this.getTextFormat(zone.props);
			var titles = this.parseString3(titlePart, zone.props);
			var urls = urlPart !== null ? this.parseString3(urlPart, zone.props) : null;
			var checkeds = checkedPart !== null ? this.parseString3(checkedPart, zone.props) : null;
			var title, url, checked;

			if(k === -1) {
				for( i = 0; i < titles.length; i++) {
					title = titles[i];
					url = urls === null ? null : i > urls.length -1 ? urls[0] : urls[i];
					checked = checkeds === null ? null : i> checkeds.length -1 ? checkeds[0] : checkeds[i];
					this.addItem(applet, dst, title, url, checked, font);
				}
			} else {
				title = k > titles.length -1 ? titles[0] : titles[k];
				url = urls === null ? null : k > urls.length -1 ? urls[0] : urls[k];
				checked = checkeds === null ? null : k > checkeds.length -1 ? checkeds[0] : checkeds[k];
				this.addItem(applet, dst, title, url, checked, font);
			}

			return titles.length > 0;
		},
		/**
		 * Creates a new MenuItem, add it to a Menu and store the URL to call inside.
		 * @param menu		The parent Menu of this item.
		 * @param listener	An Object to call when this item is selected.
		 * @param title		Label of this item that will be displayed in the Menu.
		 * @param url		Adress to go (including Javascript) when this is selected.
		 * @param font		TypeFace of the label.
		 */
		addItem : function(applet,menu, title, url, checked, font) {
			var a, item = document.createElement("li");
			if(url === null && title === "-") {
				//item.type = "separator";
				a = document.createElement("hr");
				item.className = 'jmi-menu-item-disabled';
				item.appendChild(a);
				a.addEventListener('mouseover', function(event) {
					JMI.script.MenuX.hideSubMenu(event.target.parentNode.parentNode);
				});
			} else {
				if(url !== null) {
					a = document.createElement("a");
					a.href = url;
					a.innerHTML = title;
					a.addEventListener('click', applet.menuHandler, false);
					a.addEventListener('dblclick', applet.menuHandler, false);
					a.addEventListener('mouseover', function(event) {
						JMI.script.MenuX.hideSubMenu(event.target.parentNode.parentNode);
					});
					a.JMI = applet;
					if( checked === 'true') {
						item.className = 'jmi-menu-item-checked';
					}
					item.appendChild(a);
				}
				else {
					a = document.createElement("a");
					a.innerHTML = title;
					item.className = 'jmi-menu-item-disabled';
					item.appendChild(a);
					//item.innerHTML = title;
					item.addEventListener('mouseover', function(event) {
						JMI.script.MenuX.hideSubMenu(event.target.parentNode);
					});
				}
				if(font !== null) {
					if(font.bold === true) {
						item.style.fontWeight = 'bold';
					}
					if(font.italic === true) {
						item.style.fontStyle = 'italic';
					}
					item.style.fontFamily = font.font;
					item.style.fontSize = font.size + 'px';
				}
			}
			menu.appendChild(item);
		},
		/**
		 * Retrieve a java.awt.Font from this FontX propertie (FONT_VAL container).
		 * @param props		A props table holding this FontX prop if it has one.
		 * @return			the matching Font or null if the container is empty or the prop is null.
		 */
		getTextFormat : function(props) {
			var font = this.getFont(JMI.script.MenuX.FONT_VAL, props);
			if( font !== null) { font.init(props); }
			return font;
		}
	};

	// Héritage
	for(element in JMI.script.Base.prototype ) {
		if(!MenuX.prototype[element]) {
			MenuX.prototype[element] = JMI.script.Base.prototype[element];
		}
	}
	return MenuX;
}());

/**
 * Index of the bit flag prop in VContainer table
 */
//	public  static final int    FLAGS_VAL           = 0;

/**
 * Index of the font prop in VContainer table
 */
JMI.script.MenuX.FONT_VAL = 1;

/**
 * Index of the text prop in VContainer table
 */
JMI.script.MenuX.TEXT_VAL = 2;

/**
 * True if this menu is just an item.
 */
JMI.script.MenuX.ITEM_BIT = 0x01;

JMI.script.MenuX.hideSubMenu=function(menu) {
	if(menu && menu.currentSubMenu) {
		JMI.script.MenuX.hideSubMenu( menu.currentSubMenu.firstChild);
		menu.currentSubMenu.style.visibility = 'hidden';
		menu.currentSubMenu.style.display = 'none';
		delete menu.currentSubMenu;
	}
};
