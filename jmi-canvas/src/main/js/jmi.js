/**
 * JMI application global context
 */
var JMI = JMI || {};

/**
 * namespace creation function
 * create a JMI object to manipulate a java like namespace
 * dot is used as a object separator
 *
 * @param  ns_string the namespace identifier (ie : com.socialcomputing.AClass)
 */
JMI.namespace = function(ns_string) {

	// if no argument or an empty string is given, return the JMI root namespace
	if( typeof ns_string === "undefined" || ns_string === "") {
		return JMI;
	}

	var parts = ns_string.split('.');
	var parent = JMI;
	var i;

	// Iterating throw all namespace components and creating
	// objects when necessary
	for( i = 0; i < parts.length; i += 1) {
		if( typeof parent[parts[i]] === "undefined") {
			parent[parts[i]] = {};
		}
		parent = parent[parts[i]];
	}

	// returns the deepest lvl component (object) of the given namespace
	return parent;
};

JMI.canvas = function() {
	return window.HTMLCanvasElement;
};

JMI.Map = function(params) {
	var divParent, backgroundColor, server, method, touchMenuDelay, clientUrl, clientId;
	if(!params.parent) {
		throw 'JMI client: parent id not set';
	}
	if( typeof params.parent === "string") {
		divParent = document.getElementById(params.parent);
		if(divParent === null) {
			throw 'JMI client: unknown parent element ' + params.parent;
		}
	} else if( typeof params.parent === "object") {
		divParent = params.parent;
	} else {
		throw 'JMI client: invalid parent ' + params.parent;
	}

	backgroundColor = params.backgroundColor || divParent.style.backgroundColor;
	server = params.server || location.protocol + '//server.just-map-it.com/';
	//server = params.server || 'http://server.just-map-it.com/';
	touchMenuDelay = params.touchMenuDelay || 1000;
	clientUrl = params.clientUrl || '/jmi-client';
	if( clientUrl.charAt(clientUrl.length-1) !== '/') {
		clientUrl += '/';
	}
	method = params.method || 'GET';
	clientId = params.client || 0;

	// Opera doesn't fully support canvas
	if((!params.client || params.client === JMI.Map.CANVAS) && JMI.canvas() && !window.opera) {
		return new JMI.components.CanvasMap(divParent, server, method, clientId, clientUrl, touchMenuDelay, backgroundColor, params.watermark);
	}
	if(!params.client || params.client === JMI.Map.SWF) {
		return new JMI.components.SwfMap(divParent, server, method, clientId, clientUrl, backgroundColor);
	}
	throw 'No JMI client supported';
};

JMI.Map.CANVAS = "canvas";
JMI.Map.SWF = "swf";

JMI.Map.isMap = function(map) {
	return map && (map instanceof JMI.components.CanvasMap || map instanceof JMI.components.SwfMap);
}

JMI.Map.InitApiObjects = function(map) {
	map.attributes = [];
	map.entities = [];
	map.nodes = [];
	map.links = [];
	map.selections = [];
	map.attributes.JMI = map;
	
	map.attributes.match = function(str,fields) {
		var i, result = [];
		for(i = 0; i < map.attributes.length; ++i) {
			if( JMI.Map.MatchFields(map.attributes[i],str,fields)) {
				result.push(map.attributes[i]);
			}
		}
		return result;
	};

	map.links.match = function(str,fields) {
		var i, result = [];
		for(i = 0; i < map.links.length; ++i) {
			if( JMI.Map.MatchFields(map.links[i],str,fields)) {
				result.push(map.links[i]);
			}
		}
		return result;
	};
};

JMI.Map.MatchFields = function(o,str,fields) {
	var i,p,pp;
	if( str.length === 0) {
		return false;
	}
	for(i = 0; i < fields.length; ++i) {
		if( o[fields[i]]) {
			if( typeof o[fields[i]] === 'string' && o[fields[i]].match(str)) {
				return true;
			}
			else if( typeof o[fields[i]] === 'object') {
				p = o[fields[i]];
				for(pp in p) {
					if( typeof p[pp] === 'string' && p[pp].match(str)) {
						return true;
					}
				}
			}
		}
		return false;
	}
};

JMI.Map.BuildApiObjects = function(map, parameters) {
	// [[[ID, REC_ID], [NAME, REC_NAME]], [[ID, POSS_ID], [NAME, POSS_NAME]]]
	// parameters[0] : attributes fields, parameters[0][0] is id
	// parameters[1] : links fields, parameters[1][0] is id
	var objects = {}, i, j;
	for(i = 0; i < map.attributes.length; ++i) {
		var att = map.attributes[i];
		for(j = 0; j < parameters[0].length; ++j) {
			for(k = 0; k < att[parameters[0][j][1]].length; ++k) {
				var obj = objects[att[parameters[0][0][1]][k]];
				if( !obj) {
					obj = {};
					objects[att[parameters[0][0][1]][k]] = obj;
				}
				if( !obj[parameters[0][j][0]]) {
					obj[parameters[0][j][0]] = att[parameters[0][j][1]][k];
				}
			}
		}
	}
	map.objects = [];
	for(i in objects) {
		map.objects.push( i);
	}
};

JMI.namespace("Map.event");

JMI.Map.event.START = "start";
JMI.Map.event.EMPTY = "empty";
JMI.Map.event.READY = "ready";
JMI.Map.event.STATUS = "status";
JMI.Map.event.ERROR = "error";
JMI.Map.event.ACTION = "action";
JMI.Map.event.NAVIGATE = "navigate";
JMI.Map.event.ATTRIBUTE_CLICK = "attribute_click";
JMI.Map.event.ATTRIBUTE_DBLECLICK = "attribute_dblclick";
JMI.Map.event.ATTRIBUTE_HOVER = "attribute_hover";
JMI.Map.event.ATTRIBUTE_LEAVE = "attribute_leave";
JMI.Map.event.LINK_CLICK = "link_click";
JMI.Map.event.LINK_DBLECLICK = "link_dblclick";
JMI.Map.event.LINK_HOVER = "link_hover";
JMI.Map.event.LINK_LEAVE = "link_leave";

JMI.Map.event.CLIENT_ORIGIN = "CLIENT";
