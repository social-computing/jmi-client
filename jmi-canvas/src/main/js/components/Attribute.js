/*global define, JMI */
JMI.namespace("components.Attribute");

JMI.components.Attribute = ( function() {

	var Attribute = function(map,index) {
		this._map = map;
		this._index = index;
	};

	Attribute.prototype = {
		constructor : JMI.components.Attribute,
		
		setProperty: function(name,value) {
			this[name] = value;
			this._map._setAttributeProperty(this._index, name, value);
		}
	};

	return Attribute;
}());
