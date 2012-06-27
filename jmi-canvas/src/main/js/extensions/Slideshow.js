/*global define, JMI */
JMI.namespace("extensions.Slideshow");

JMI.extensions.Slideshow = ( function() {

	var Slideshow = function(map,slideshow,width,height,interval) {
		var i;
		if(!JMI.Map.isMap( map)) {
			throw 'JMI slideshow: invalid map ' + map;
		}
		this.map = map;
		this.width = width;
		this.height = height;
		if( slideshow && typeof slideshow === "string") {
			this.slideshow = document.getElementById(slideshow);
			if(this.slideshow === null) {
				throw 'JMI breadcrumb: unknown slideshow element ' + slideshow;
			}
		} else if( slideshow && typeof slideshow === "object") {
			this.slideshow = slideshow;
		} else {
			// Built-in slideshow
			this.slideshow = document.createElement("div");
			this.slideshow.style.visibility = 'hidden';
			this.slideshow.style.position = 'absolute';
			var html= '<ul>';
			for( i = 1; i <= 5; ++i) {
				html += '<li><img src="' + map.clientUrl + 'images/bulle' + i + '.png"/></li>';
			}
			html += '</ul>';
			this.slideshow.innerHTML = html;
			this.width = 200;
			this.height = 200;
			document.body.appendChild(this.slideshow);
		}
		this.interval = interval || 300;
		if(!this.width) {
			throw 'JMI slideshow: width not set';
		}
		if(!this.height) {
			throw 'JMI slideshow: height not set';
		}
		this.slides = this.slideshow.getElementsByTagName('ul').length > 0 ? this.slideshow.getElementsByTagName('ul')[0].getElementsByTagName('li') : null;
		if(!this.slides) {
			throw 'JMI slideshow: slides not set';
		}
		this.slideshow.style.visibility = 'hidden';
		this.slideshow.style.position = 'absolute';
		this.slideshow.style.width = this.width;
		this.slideshow.style.height = this.height;
		
		var slideShow = this;
		this.map.addEventListener(JMI.Map.event.START, function(event) {
			var top = 0, left = 0, e = slideShow.map.parent;
			// set position
			while( e) {
				top += e.offsetTop;
				left += e.offsetLeft;
				e = e.offsetParent;
			}
			slideShow.slideshow.style.left = Math.round((left + (slideShow.map.parent.offsetWidth - slideShow.width) / 2)) + 'px';
			slideShow.slideshow.style.top = Math.round((top + (slideShow.map.parent.offsetHeight - slideShow.height) / 2)) + 'px';
			for( i = 0; i < slideShow.slides.length; ++i) {
				slideShow.slides[i].style.visibility = 'hidden';
				slideShow.slides[i].style.position = 'absolute';
				slideShow.slides[i].style.left = 0;
				slideShow.slides[i].style.top = 0;
				slideShow.slides[i].style.listStyle = 'none';
				slideShow.slides[i].style.zIndex = 100;
			}
		    // show first slide
			slideShow.curSlide = 0;
		    slideShow.slideshow.style.visibility = '';
		    slideShow.slides[slideShow.curSlide].style.visibility = '';
		    if( slideShow.slides.length > 1) {
			    slideShow.timer = setInterval(function() {
			    	var hide = slideShow.curSlide;
				    slideShow.curSlide++;
				    if (slideShow.curSlide === slideShow.slides.length) {
				        slideShow.curSlide = 0;
				    }
			    	slideShow.slides[slideShow.curSlide].style.visibility = '';
			    	slideShow.slides[hide].style.visibility = 'hidden';
			    }, slideShow.interval);
			}
		});
		this.map.addEventListener(JMI.Map.event.READY, function(event) {
			slideShow.stop();
		});
		this.map.addEventListener(JMI.Map.event.EMPTY, function(event) {
			slideShow.stop();
		});
		this.map.addEventListener(JMI.Map.event.ERROR, function(event) {
			slideShow.stop();
		});
	};

	Slideshow.prototype = {
		constructor : JMI.extensions.Slideshow,

		stop: function() {
			if( this.timer) {
				clearInterval(this.timer);
				delete this.timer;
			    this.slides[this.curSlide].style.visibility = 'hidden';
		    	this.slideshow.style.visibility = 'hidden';
			}
		}
	};
	
	return Slideshow;
}());
