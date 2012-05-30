/*global define, JMI */
JMI.namespace("components.Link");

JMI.components.Link = ( function() {

	var Link = function(map,index) {
		this._map = map;
		this._index = index;
	};
	
	Link.prototype = {
		constructor : JMI.components.Link,

		setPropertty: function(name,value) {
			this[name] = value;
			map._setLinkProperty(this._index, name, value);
		}
	};

	return Link;
}());
