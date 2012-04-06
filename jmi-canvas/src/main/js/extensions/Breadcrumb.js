/*global define, JMI */
JMI.namespace("extensions.Breadcrumb");

JMI.extensions.Breadcrumb = ( function() {

	var Breadcrumb = function(parent,map,parameters) {
		// IE 6, 7 & 8 not yest supported (event problems) attachEvent, etc... => simplified breadcrumb 
		this.badIe = navigator.userAgent.indexOf('MSIE 6') > 0 || navigator.userAgent.indexOf('MSIE 7') > 0 || navigator.userAgent.indexOf('MSIE 8') > 0;
		this.crumbs = [];
		this.counter = 0;
		this.namingFunc = parameters && parameters.namingFunc ? parameters.namingFunc : this.defaultNaming;
		this.thumbnail = parameters && parameters.thumbnail;
		if( this.thumbnail) {
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
		if( map && !(map instanceof JMI.components.CanvasMap) && !(map instanceof JMI.components.SwfMap)) {
			throw 'JMI breadcrumb: invalid map ' + map;
		}
		this.map = map;
		if( this.map) {
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
		}
	};

	Breadcrumb.prototype = {
		constructor : JMI.extensions.Breadcrumb,

		display: function() {
			var i, lu = document.createElement('lu');
			lu.className = 'jmi-breadcrumb';
			if( !this.badIe) {
				for( i = 0; i < this.crumbs.length; ++i) {
					lu.appendChild( this.getCrumb(this.crumbs[i], i === this.crumbs.length-1));
				}
			}
			else {
				if( this.crumbs.length > 0) {
					var c = document.createElement('li'), crumb = this.crumbs[this.crumbs.length-1];
					c.innerHTML = !crumb.error && !crumb.empty ? crumb.longTitle : crumb.shortTitle;
					lu.appendChild(c);
				}				
			}
			if(this.parent.firstChild) {
				this.parent.removeChild(this.parent.firstChild);
			}
			this.parent.appendChild(lu);
		},
		flush: function() {
			this.crumbs.length = 0;
		},
		current: function() {
			return this.crumbs.length === 0 ? null : this.crumbs[this.crumbs.length-1];
		},
		getCrumb: function(crumb,last) {
			var c = document.createElement('li'),
				a = document.createElement('a'),
				breadcrumb = this, cur;
			crumb.li = c;
			a.href = '';
			a.innerHTML = last && !crumb.error && !crumb.empty ? crumb.longTitle : crumb.shortTitle;
			a.title = crumb.longTitle;
			a.crumb = crumb;
			if( a.addEventListener) {
				a.addEventListener('click', function(event) {
					event.preventDefault();
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
				}, false);
				//a.addEventListener('dblclick', applet.menuHandler, false);
				a.addEventListener('mouseover', function(event) {
					event.preventDefault();
					var crumb = event.target.crumb;
					if( crumb.thumbnail && !crumb.error && !crumb.empty) {
						var p = JMI.util.ImageUtil.AbsPosition(crumb.li);
						crumb.thumbnail.style.top = (p.y + crumb.li.offsetHeight) + 'px';
						crumb.thumbnail.style.left = p.x + 'px';
						crumb.thumbnail.style.visibility = '';
					}
				}, false);
				a.addEventListener('mouseout', function(event) {
					event.preventDefault();
					var crumb = event.target.crumb;
					if( crumb.thumbnail) {
						crumb.thumbnail.style.visibility = 'hidden';
					}
				}, false);
			}
			c.appendChild(a);
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
		}
	};

	return Breadcrumb;
}());
