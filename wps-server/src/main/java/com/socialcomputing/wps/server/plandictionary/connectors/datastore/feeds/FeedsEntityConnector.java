package com.socialcomputing.wps.server.plandictionary.connectors.datastore.feeds;

import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;

import org.jdom.Element;
import org.jdom.Text;

import au.id.jericho.lib.html.Segment;
import au.id.jericho.lib.html.Source;
import au.id.jericho.lib.html.StartTag;

import com.socialcomputing.wps.server.plandictionary.connectors.WPSConnectorException;
import com.socialcomputing.wps.server.plandictionary.connectors.datastore.Attribute;
import com.socialcomputing.wps.server.plandictionary.connectors.datastore.DatastoreEntityConnector;
import com.socialcomputing.wps.server.plandictionary.connectors.datastore.Entity;
import com.socialcomputing.wps.server.plandictionary.connectors.datastore.PropertyDefinition;
import com.socialcomputing.wps.server.plandictionary.connectors.utils.UrlHelper;

public class FeedsEntityConnector extends DatastoreEntityConnector {
    protected   String m_InvertedDef = null;
    protected   List<UrlHelper> m_feeds = null;

	static FeedsEntityConnector readObject(org.jdom.Element element) {
		FeedsEntityConnector connector = new FeedsEntityConnector( element.getAttributeValue("name"));
		connector._readObject( element);
        connector.m_InvertedDef = element.getAttributeValue( "invert");

        List<Element> defs = (List<Element>)element.getChildren( UrlHelper.DTD_DEFINITION);
        connector.m_feeds = new ArrayList<UrlHelper>( defs.size());
        for( Element def : defs) {
            UrlHelper feed = new UrlHelper();
            feed.readObject( def);
            connector.m_feeds.add( feed);
        }
        connector.entityProperties.add( new PropertyDefinition( "poss_id", "id"));
        connector.entityProperties.add( new PropertyDefinition( "poss_name", "name"));
        connector.attributeProperties.add( new PropertyDefinition( "poss_id", "id"));
        connector.attributeProperties.add( new PropertyDefinition( "poss_name", "name"));

        return connector;
	}

	public FeedsEntityConnector(String name) {
		super(name);
	}

	@Override
	public void openConnections(int planType, Hashtable<String, Object> wpsparams) throws WPSConnectorException {
		super.openConnections( planType, wpsparams);

		List<String> titles = new ArrayList<String>();
		m_inverted =  UrlHelper.ReplaceParameter( m_InvertedDef, wpsparams).equalsIgnoreCase( "true");
		for( UrlHelper feed : m_feeds) {
            for( String url : UrlHelper.ReplaceParameter( feed.getUrl(), wpsparams).split( ",")) {
                feed.setUrl( url);
    		    feed.openConnections( planType, wpsparams);
    	        read( feed, planType, wpsparams, titles);
                feed.closeConnections();
            }
		}
		StringBuilder sb = new StringBuilder();
		boolean first = true;
		for( String title : titles) {
		    if( first) 
		        first = false;
		    else
		        sb.append( ", ");
            sb.append( title);
		}
		wpsparams.put( "FEEDS_TITLE", sb.toString());
	}

    private void read(UrlHelper feed, int planType, Hashtable<String, Object> wpsparams, List<String> titles) throws WPSConnectorException {
        String content = feed.getContentType();
        if( content.contains( "text/html")) {
            // HTML ?
            Source source;
            try {
                source = new Source( feed.getStream());
            } catch (Exception e) {
                throw new WPSConnectorException( "openConnections", e);
            }
            List<StartTag> tags = ((Segment)source.findAllElements( "head").get( 0)).findAllStartTags( "link");
            for( StartTag tag : tags) {
                String type = tag.getAttributeValue( "type");
                if( type != null && type.equalsIgnoreCase( "application/rss+xml")) {
                    UrlHelper curFeed = new UrlHelper();
                    String url = tag.getAttributeValue( "href");
                    curFeed.setUrl( url.startsWith( "/") ? feed.getUrl() + url : url);
                    curFeed.openConnections( planType, wpsparams);
                    readXml( curFeed, planType, wpsparams, titles);
                    curFeed.closeConnections();
                }
            }
        }
        else {
            readXml( feed, planType, wpsparams, titles);
        }
    }
    
	private void readXml(UrlHelper feed, int planType, Hashtable<String, Object> wpsparams, List<String> titles) throws WPSConnectorException {
	    try {
			org.jdom.input.SAXBuilder builder = new org.jdom.input.SAXBuilder(false);
			org.jdom.Document doc = builder.build( feed.getStream());
			Element root = doc.getRootElement();
			
	        Element top = root.getChild( "channel");
	        if( top != null) {
	            titles.add( parseRss2( top));
	        }
	        else {
	            titles.add( parseAtom( root));
	        }
		} catch (Exception e) {
            throw new WPSConnectorException( "openConnections", e);
		}
        for( Attribute attribute : m_Attributes.values()) {
            if( !isInverted())
                addEntityProperties( attribute);
        }
        if( isInverted()) {
            for( Entity entity : m_Entities.values()) { 
                addAttributeProperties( entity);
            }
        }
	}
	
	private String parseAtom( Element feed) {
	    String title = "";
        for( Element item : (List<Element>)feed.getContent()) {
            if( item.getName().equalsIgnoreCase( "title")) {
                title = getAtomContent( item);;
                
            }
            if( item.getName().equalsIgnoreCase( "entry")) {
                List<Element> content = item.getContent();
                Attribute attribute = addAttribute( getAtomId( content));
                for( Element contentItem : content) {
                    if( contentItem.getName().equalsIgnoreCase( "title"))
                        attribute.addProperty( "name", getAtomContent( contentItem));
                    
                    if( contentItem.getName().equalsIgnoreCase( "category")) {
                        Entity entity = addEntity( contentItem.getAttributeValue( "term"));
                        String label = contentItem.getAttributeValue( "label");
                        entity.addProperty( "name", label != null ? label : entity.getId());
                        entity.addAttribute( attribute, 1);
                    }
                }
            }
        }
        return title;
	}

	private String getAtomId( List<Element> content) {
        for( Element item : content) {
            if( item.getName().equalsIgnoreCase( "link") && item.getAttributeValue( "rel").equalsIgnoreCase( "alternate"))
                return item.getAttributeValue( "href");
        }
        return null;
	}
	
    private String getAtomContent( Element item) {
        return ((Text)item.getContent().get( 0)).getText();
    }
    
    private String parseRss2( Element channel) {
        String title = channel.getChildText( "title");
        for( Element item : (List<Element>)channel.getChildren( "item")) {
            Attribute attribute = addAttribute( item.getChildText( "link"));
            attribute.addProperty( "name", item.getChildText( "title"));
            
            for( Element category : (List<Element>)item.getChildren( "category")) {
                Entity entity = addEntity( category.getText());
                entity.addProperty( "name", entity.getId());
                entity.addAttribute( attribute, 1);
            }
        }
        return title;
    }
	
	@Override
	public void closeConnections() throws WPSConnectorException {
		super.closeConnections();
        for( UrlHelper feed : m_feeds) {
            feed.closeConnections();
        }
	}

}