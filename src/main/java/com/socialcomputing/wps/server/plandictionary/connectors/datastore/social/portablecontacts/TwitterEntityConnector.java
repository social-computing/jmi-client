package com.socialcomputing.wps.server.plandictionary.connectors.datastore.social.portablecontacts;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;

import org.jdom.Element;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

import com.socialcomputing.wps.server.plandictionary.connectors.WPSConnectorException;
import com.socialcomputing.wps.server.plandictionary.connectors.datastore.AttributePropertyDefinition;
import com.socialcomputing.wps.server.plandictionary.connectors.datastore.social.SocialEntityConnector;
import com.socialcomputing.wps.server.plandictionary.connectors.utils.UrlHelper;
import com.socialcomputing.wps.server.plandictionary.connectors.utils.UrlHelper.Type;

public class TwitterEntityConnector extends SocialEntityConnector {

    protected UrlHelper oAuth2Helper;

    static TwitterEntityConnector readObject(org.jdom.Element element) {
        TwitterEntityConnector connector = new TwitterEntityConnector( element.getAttributeValue("name"));
        connector._readObject( element);
        return connector;
    }
    
    public TwitterEntityConnector(String name) {
        super(name);
        oAuth2Helper = new UrlHelper();
    }

    @Override
    public void _readObject(Element element) {
        super._readObject(element);
        oAuth2Helper.readObject( element);
        for( Element property: (List<Element>)element.getChildren( "Twitter-property")) {
            attributeProperties.add( new AttributePropertyDefinition( property.getAttributeValue( "id"), property.getAttributeValue( "entity")));
        }
    }


    @Override
    public void openConnections(int planType, Hashtable<String, Object> wpsparams) throws WPSConnectorException {
        super.openConnections( planType, wpsparams);
        oAuth2Helper.openConnections( planType, wpsparams);
        String token = oAuth2Helper.getResult();
        token = token.substring( token.indexOf( '=') + 1);
        
        // Liste amis
        UrlHelper urlHelper = new UrlHelper();
        urlHelper.setUrl( "https://graph.facebook.com/me/friends");
        urlHelper.addParameter( "access_token", token);
        urlHelper.openConnections( planType, wpsparams);
        JSONObject jobj = ( JSONObject)JSONValue.parse( new InputStreamReader(urlHelper.getStream()));
        List<String> friendslist = new ArrayList<String>();
        JSONArray array=(JSONArray)jobj.get( "data");
        for (int i = 0 ; i < array.size() ; i++) {
        //for (int i = 0 ; i < 112 ; i++) {
            JSONObject user = (JSONObject) array.get(i);
            //System.out.println(user.get("id") + "=>" + user.get("name"));
            addPerson((String)user.get("id")).addProperty("name", user.get("name"));
            friendslist.add((String)user.get("id"));
        }
        
        // Mes infos
//        String url = "https://graph.facebook.com/me";
//        UrlHelper uh = new UrlHelper();
//        uh.setUrl(url);
//        uh.addParameter("access_token", oAuth2Helper.getToken());
//        uh.openConnections( planType, wpsparams);
//        JSONObject me =  (JSONObject)JSONValue.parse(new InputStreamReader(uh.getStream()));
//        addPerson((String)me.get("id")).addProperty("name", me.get("name"));
        
        // Amis d'amis
        
        for (int i = 0 ; i < friendslist.size() -1 ; i++) {
            StringBuilder sb1 = new StringBuilder();
            StringBuilder sb2 = new StringBuilder();
            for (int j = i + 1 ; j < friendslist.size() ; j++) {
                sb1.append(friendslist.get(i)).append(",");
                sb2.append(friendslist.get(j)).append(",");
            }
            String areFriends = "https://api.facebook.com/method/friends.areFriends";
            UrlHelper uh1 = new UrlHelper();
            uh1.setUrl(areFriends);
            uh1.setType( Type.POST);
            uh1.addParameter("uids1", sb1.toString());
            uh1.addParameter("uids2", sb2.toString());
            uh1.addParameter("access_token", token);
            uh1.addParameter("format", "json");
            uh1.openConnections( planType, wpsparams);
            JSONArray r =  (JSONArray)JSONValue.parse(new InputStreamReader(uh1.getStream()));
            for (int k = 0 ; k < r.size() ; k++) {
                JSONObject rs = (JSONObject) r.get(k);
                //System.out.println(rs.get("uid1") + "=>" + rs.get("uid2") + "=>" + rs.get("are_friends"));
                if ( (Boolean)rs.get("are_friends"))
                    setFriendShip(((Long)rs.get("uid1")).toString(), ((Long)rs.get("uid2")).toString());
            }
        }
        
        
        // Je suis amis avec tous mes amis
        //setFriendShip((String)me.get("id"), friendslist);
        
        // AJout des propriétés d'entités sur les attributs
        setEntityProperities();
    }


    @Override
    public void closeConnections() throws WPSConnectorException {
        super.closeConnections();
        oAuth2Helper.closeConnections();
    }
    
}
