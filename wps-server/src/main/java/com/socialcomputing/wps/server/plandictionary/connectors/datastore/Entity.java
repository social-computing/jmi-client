package com.socialcomputing.wps.server.plandictionary.connectors.datastore;

import java.util.ArrayList;
import java.util.List;

import com.socialcomputing.wps.server.plandictionary.connectors.AttributeEnumeratorItem;

public class Entity extends Data {

	protected List<AttributeEnumeratorItem> m_Attributes = new ArrayList<AttributeEnumeratorItem>();
	
	public Entity(String id) {
		super(id);
	}
	
    public List<AttributeEnumeratorItem> getAttributes() {
        return m_Attributes;
    }
    
	public void addAttribute( Attribute attribute, float ponderation) {
	    AttributeEnumeratorItem item = new AttributeEnumeratorItem( attribute.getId(), ponderation);
	    if( !m_Attributes.contains( item)) {
    		m_Attributes.add( item);
    		attribute.addEntity( this); // reverse pour le groupe d'affinités
	    }
	}
	
	public boolean containsAttribute( Attribute attribute) {
		return containsAttribute( attribute.getId());
	}
	
	public boolean containsAttribute( String attribute) {
		for( AttributeEnumeratorItem item :  m_Attributes) {
			if( item.m_Id.equalsIgnoreCase( attribute))
				return true;
		}
		return false;
	}
	
   @Override
    public String toString() {
        return "Entity: " + super.toString();
    }
}
