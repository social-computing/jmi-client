/*global define, JMI */
JMI.namespace("extensions.Breadcrumb");

JMI.extensions.Breadcrumb = ( function() {

	var Breadcrumb = function(parent,map,parameters) {
		// IE 6, 7 no thumbnail 
		this.badIe = navigator.userAgent.indexOf('MSIE 6') > 0 || navigator.userAgent.indexOf('MSIE 7') > 0;
		this.crumbs = [];
		this.counter = 0;
		this.namingFunc = parameters && parameters.namingFunc ? parameters.namingFunc : this.defaultNaming;
		this.thumbnail = parameters && parameters.thumbnail && !this.badIe;
		if( this.thumbnail) {
			this.thumbnail = parameters.thumbnail;
			this.thumbnail.width = this.thumbnail.width || 200;
			this.thumbnail.height = this.thumbnail.height || 120;
		}
		if(!parent) {
			throw 'JMI breadcrumb: parent id not set';
		}
		if( typeof parent === "string") {
			this.parent = document.getElementById(parent);
			if(this.parent === null) {
				throw 'JMI breadcrumb: unknown parent element ' + parent;
			}
		} else if( typeof parent === "object") {
			this.parent = parent;
		} else {
			throw 'JMI breadcrumb: invalid parent ' + parent;
		}
		if(!JMI.Map.isMap( map)) {
			throw 'JMI breadcrumb: invalid map ' + map;
		}
		this.map = map;
		this.snapshot = parameters && parameters.snapshot;
		if( this.snapshot) {
			this.snapshot = parameters.snapshot;
		}
		else {
			this.snapshot = {};
		}
		if( !this.snapshot.img) {
			this.snapshot.img = this.map.clientUrl + '/images/snapshot_icon.png';
		}
		if( !this.snapshot.title) {
			this.snapshot.title = 'Snapshot';
		}
		this.fullscreen = parameters && parameters.fullscreen;
		if( this.fullscreen) {
			this.fullscreen = parameters.fullscreen;
		}
		else {
			this.fullscreen = {};
		}
		if( !this.fullscreen.img) {
			this.fullscreen.img = this.map.clientUrl + '/images/fullscreen_icon.png';
		}
		if( !this.fullscreen.title) {
			this.fullscreen.title = 'Full screen mode';
		}
		var p, breadcrumb = this;
		this.map.addEventListener(JMI.Map.event.START, function(event) {
			var crumb = breadcrumb.crumbs.length > 0 ? breadcrumb.crumbs[breadcrumb.crumbs.length-1] : null;
			if( crumb && crumb.self) {
				// Celui qui a été cliqué
				delete crumb.self;
			}
			else {
				crumb = {};
				crumb.params = {};
				for (p in event.params) {
					crumb.params[p] = event.params[p];
				}
				breadcrumb.crumbs.push( crumb);
				breadcrumb.counter++;
			}
		} );
		this.map.addEventListener(JMI.Map.event.EMPTY, function(event) {
			var crumb = breadcrumb.crumbs[breadcrumb.crumbs.length-1];
			breadcrumb.getTitles(crumb,event);
			crumb.empty = true;
			breadcrumb.display();
		});
		this.map.addEventListener(JMI.Map.event.ERROR, function(event) {
			var crumb = breadcrumb.crumbs[breadcrumb.crumbs.length-1];
			breadcrumb.getTitles(crumb,event);
			crumb.error = true;
			breadcrumb.display();
		});
		this.map.addEventListener(JMI.Map.event.READY, function(event) {
			var crumb = breadcrumb.crumbs[breadcrumb.crumbs.length-1];
			breadcrumb.getTitles(crumb,event);
			setTimeout( function() {
				breadcrumb.checkThumbnail(crumb);
			}, 10);
			breadcrumb.display();
		} );
	};

	Breadcrumb.prototype = {
		constructor : JMI.extensions.Breadcrumb,

		display: function() {
			var i, lu = document.createElement('lu');
			lu.className = 'jmi-breadcrumb';
			for( i = 0; i < this.crumbs.length; ++i) {
				lu.appendChild( this.getCrumb(this.crumbs[i], i === this.crumbs.length-1));
			}
			while(this.parent.firstChild) {
				this.parent.removeChild(this.parent.firstChild);
			}
			this.parent.appendChild(lu);
			if( !this.badIe && !this.crumbs[this.crumbs.length-1].error && !this.crumbs[this.crumbs.length-1].empty) {
				this.parent.appendChild(this.getSnapshotButton());
			}
			if( this.map.type === JMI.Map.CANVAS && !this.crumbs[this.crumbs.length-1].error && !this.crumbs[this.crumbs.length-1].empty) {
				this.parent.appendChild(this.getFullscreenButton());
			}
		},
		flush: function() {
			this.crumbs.length = 0;
		},
		current: function() {
			return this.crumbs.length === 0 ? null : this.crumbs[this.crumbs.length-1];
		},
		getCrumb: function(crumb,last) {
			var c = document.createElement('li'),
				breadcrumb = this, cur, t;
			crumb.li = c;
			c.href = '';
			if( last && !crumb.error && !crumb.empty) {
				c.innerHTML = crumb.longTitle;
				c.title = c.innerText || c.textContent;
			}
			else {
				c.innerHTML = crumb.shortTitle;
				t = document.createElement('li'); // Temporary, needed for text extraction
				t.innerHTML = crumb.longTitle;
				c.title = t.innerText || t.textContent;
			}
			//c.innerHTML = last && !crumb.error && !crumb.empty ? crumb.longTitle : crumb.shortTitle;
			//c.title = last && !crumb.error && !crumb.empty ? crumb.longTitle : crumb.shortTitle;
			c.crumb = crumb;
			if( !crumb.error && !crumb.empty) {
				JMI.util.EventManager.addEvent(c, 'click', function(event) {
					JMI.util.EventManager.preventDefault(event);
					if( !event.target.crumb.error && !event.target.crumb.empty) {
						do {
							cur = breadcrumb.crumbs.pop();
							if( cur.thumbnail) {
								document.body.removeChild(cur.thumbnail);
								delete cur.thumbnail;
							}
						} while( cur !== event.target.crumb);
						event.target.crumb.self = true;
						breadcrumb.crumbs.push(event.target.crumb);
						breadcrumb.map.compute(event.target.crumb.params);
					}
				}, crumb);
				//c.addEventListener('dblclick', applet.menuHandler, false);
				JMI.util.EventManager.addEvent(c, 'mouseover', function(event) {
					JMI.util.EventManager.preventDefault(event);
					var crumb = event.target.crumb;
					if( crumb && crumb.thumbnail && !crumb.error && !crumb.empty) {
						var p = JMI.util.ImageUtil.AbsPosition(crumb.li);
						crumb.thumbnail.style.top = (p.y + crumb.li.offsetHeight) + 'px';
						crumb.thumbnail.style.left = p.x + 'px';
						crumb.thumbnail.style.visibility = '';
					}
				}, crumb);
				JMI.util.EventManager.addEvent(c, 'mouseout', function(event) {
					JMI.util.EventManager.preventDefault(event);
					var crumb = event.target.crumb;
					if( crumb && crumb.thumbnail) {
						crumb.thumbnail.style.visibility = 'hidden';
					}
				}, crumb);
			}
			return c;
		},
		defaultNaming: function(event) {
			if( event.type === JMI.Map.event.READY) {
				return {shortTitle: 'Map ' + this.counter, longTitle: 'Map ' + this.counter};
			}
			if( event.type === JMI.Map.event.EMPTY) {
				return {shortTitle: 'Map is empty', longTitle: 'Sorry map is empty'};
			}
			if( event.type === JMI.Map.event.ERROR) {
				return {shortTitle: 'An error occured', longTitle: event.message};
			}
		},
		getTitles: function(crumb,event) {
			var res;
			if( !crumb.self && !crumb.shortTitle) {
				res = this.namingFunc(event);
				if( res.shortTitle) {
					crumb.shortTitle = res.shortTitle;
					crumb.longTitle = crumb.shortTitle;
				}
				if( res.longTitle) {
					crumb.longTitle = res.longTitle;
				}
			}
		},
		checkThumbnail: function(crumb) {
			if( this.thumbnail && !crumb.thumbnail) {
				var div = document.createElement('div'),
					image = document.createElement('img');
				image.src = this.map.getImage('image/png', this.thumbnail.width, this.thumbnail.height, true);
				image.alt = crumb.longTitle;
				image.title = crumb.longTitle;
				div.appendChild(image);
				div.className = 'jmi-breadcrumb-thumbnail';
				div.style.position = 'absolute';
				div.style.visibility = 'hidden';
				document.body.appendChild( div);
				crumb.thumbnail = div;
			}
		},
		getSnapshotButton: function() {
			var s = document.createElement('div'),
				a = document.createElement('a'),
				img = document.createElement('img');
			img.src = this.snapshot.img;
			a.title = this.snapshot.title;
			a.href = '';
			JMI.util.EventManager.addEvent(a, 'click', function(event, crumb) {
				JMI.util.EventManager.preventDefault(event);
				if( !crumb.error && !crumb.empty) {
					//document.location.href = this.map.getImage('image/png');
					var w = window.open();
					w.document.write('<img src="'+crumb.map.getImage('image/png')+'"/>');
				}
			}, this);
			s.className = 'jmi-snapshot';
			a.appendChild(img);
			return a;
		},
		getFullscreenButton: function() {
			var s = document.createElement('div'),
				a = document.createElement('a'),
				img = document.createElement('img');
			img.src = this.fullscreen.img;
			a.title = this.fullscreen.title;
			a.href = '';
			JMI.util.EventManager.addEvent(a, 'click', function(event, crumb) {
				JMI.util.EventManager.preventDefault(event);
				if( !crumb.error && !crumb.empty) {
					crumb.fullscreen.savedStyle = {};
					var cssProp, cssProps = {position:'absolute', border:'0', 
								top:'0', left:'0', 
								width:document.body.clientWidth-1+'px', height:document.body.clientHeight-1+'px'
								//width:window.innerWidth-10+'px', height:window.innerHeight-2+'px'
								};
					for( cssProp in cssProps) {
						crumb.fullscreen.savedStyle[cssProp] = crumb.map.parent.style[cssProp];
						crumb.map.parent.style[cssProp] = cssProps[cssProp];
					}
					crumb.map.resize(crumb.map.parent.clientWidth, crumb.map.parent.clientHeight);
					crumb.fullscreen.savedStyle.onkeydown = document.onkeydown;
					JMI.util.EventManager.addEvent(crumb.map.parent, 'dblclick', JMI.extensions.Breadcrumb.restoreNormalScreen, crumb);
					document.onkeydown = function(evt) {
					    evt = evt || window.event;
					    if (evt.keyCode == 27) {
					    	JMI.extensions.Breadcrumb.restoreNormalScreen( null, crumb);
					    }
					};					
				}
			}, this);
			s.className = 'jmi-fullscreen';
			a.appendChild(img);
			return a;
		}
	};

	return Breadcrumb;
}());

JMI.extensions.Breadcrumb.restoreNormalScreen = function(event, crumb) {
	var cssProp;
	for( cssProp in crumb.fullscreen.savedStyle) {
		crumb.map.parent.style[cssProp] = crumb.fullscreen.savedStyle[cssProp];
	}
	crumb.map.resize(crumb.map.parent.clientWidth, crumb.map.parent.clientHeight);
	document.onkeydown = crumb.fullscreen.savedStyle.onkeydown;
	JMI.util.EventManager.removeEvent(crumb.map.parent, 'dblclick', JMI.extensions.Breadcrumb.restoreNormalScreen);
}
