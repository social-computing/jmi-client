/*global define, JMI */
JMI.namespace("components.MapRequester");

JMI.components.MapRequester = (function() {
	
	var MapRequester = function( map, jmiServerUrl, method, clientId) {
		if( !map || !(map instanceof JMI.components.CanvasMap)) {
			throw('map component is not set');
		}
		this.map = map;
		this.jmiServerUrl = jmiServerUrl || 'http://server.just-map-it.com/';
		this.method = method;
		this.clientId = clientId;
	};
	
	MapRequester.prototype = {
		constructor: JMI.components.MapRequester,
		
		getMap: function(name, parameters) {

			// http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
			// var client = window.XDomainRequest ? new XDomainRequest() : new XMLHttpRequest(),
			// Trop de limitations: abandonné (pas de header, pas de cookie, etc...)
			var client = new XMLHttpRequest(),
				requester = this,
				p, url, urlparams;
			document.body.style.cursor = 'wait';
/*			if( window.XDomainRequest) {
				client.onload = function() {
					document.body.style.cursor = 'default';
					requester.map.setData( client.responseText);
				};
				client.onerror = function() {
					document.body.style.cursor = 'default';
					setTimeout( function() {
						requester.map.dispatchEvent({map: requester.map, type: JMI.Map.event.ERROR, origin: JMI.Map.event.CLIENT_ORIGIN, message: 'Error ' + requester.jmiServerUrl + '...'});
					},100);
				};
				client.ontimeout = function() {
					document.body.style.cursor = 'default';
					setTimeout( function() {
						requester.map.dispatchEvent({map: requester.map, type: JMI.Map.event.ERROR, origin: JMI.Map.event.CLIENT_ORIGIN, message: 'Timeout ' + requester.jmiServerUrl + '...'});
					},100);
				};
			}
			else {*/
				client.onreadystatechange = function() {
					if( this.readyState === 4) {
						document.body.style.cursor = 'default';
						if( this.status === 200) {
							requester.map.setData( client.responseText);
						}
						else { 
							setTimeout( function() {
								requester.map.dispatchEvent({map: requester.map, type: JMI.Map.event.ERROR, origin: JMI.Map.event.CLIENT_ORIGIN, message: 'Error ' + client.status + ': ' + client.statusText + '<br/>' + requester.jmiServerUrl + '...'});
							},100);
						}
					}
				}; 
//			}
			url = this.jmiServerUrl;
			if( url.charAt(url.length - 1) !== '/') {
				url += '/';
			}
			url += 'services/engine/' + this.clientId + '/' + name + '.json';
			urlparams = this.addParameter( '', 'width', this.map.size.width);
			urlparams = this.addParameter( urlparams, 'height', this.map.size.height);
			for( p in parameters) {
				urlparams = this.addParameter( urlparams, p, parameters[p]);
			}
			try {
				if( this.method === 'GET') {
					//client.open( "GET", "/jmi-canvas/src/test/resources/Adisseo.json", true); 
					client.open( 'GET', url + '?' + urlparams, true); 
					client.send();
				}
				else { // POST
					client.open( 'POST', url, true); 
					client.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
					client.send(urlparams);
				}
			}
			catch(err) {
				document.body.style.cursor = 'default';
				setTimeout( function() {
					if( navigator.userAgent.indexOf('MSIE') > 0) {
						requester.map.dispatchEvent({map: requester.map, type: JMI.Map.event.ERROR, origin: JMI.Map.event.CLIENT_ORIGIN, message: err + '<a href="http://www.just-map-it.com/p/ie-security.html" target="_blank" title="allow access data sources across domains">Check Internet Explorer security parameters</a>.'});
					}
					else {
						requester.map.dispatchEvent({map: requester.map, type: JMI.Map.event.ERROR, origin: JMI.Map.event.CLIENT_ORIGIN, message: err});
					}
				},100);
			}
  		},
	
		addParameter: function( url, param, value, first) {
			if(url.length > 0) {
				url = url + '&';
			}
			url = url + param + '=' + encodeURIComponent( value);
			return url;
		}
	};
	
	return MapRequester;
}());
