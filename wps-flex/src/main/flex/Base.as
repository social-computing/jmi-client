package {
    import java.awt.Color;
    import java.awt.Graphics;
    import java.io.Serializable;
    import java.io.UnsupportedEncodingException;
    import java.util.Hashtable;
    import java.util.NoSuchElementException;
    import java.util.StringTokenizer;
    import java.util.Vector;
    
    /**
     * <p>Title: Base</p>
     * <p>Description: Base class of all the Swatch types. It holds field of those class in a VContainer array.
     * This generic storage allow Swatch to be easily processed on the server.
     * To retreive fields in the client, use the matching ID (XXXX_VAL).<br>
     * ex : FLAGS_VAL = 0 -> A flag of bits is always stored as an int in the first cell of the array.<br>
     * WARNING! As there's no constructor, m_containers should be allocated with the necessary size before filling it.</p>
     * <p>Copyright: Copyright (c) 2001-2003</p>
     * <p>Company: MapStan (Voyez Vous)</p>
     * @author flugue@mapstan.com
     * @version 1.0
     */
    public class Base implements Serializable
    {
        /**
         * String representation of a new-line.
         * Separator used by Swatchs to separate URL/Track in "menu, event, item"
         */
        public  const SEP:String= "" + '\n';
        
        /**
         * String representation of a tab.
         * Separator used by Swatchs to separate URL/Track in "open page"
         */
        public  const SUBSEP:String= "" + '\t';
        
        /**
         * 2 Pi
         */
        public  const Pi2:Number= 6.2831853;
        
        /**
         * Index of the bit flag prop in VContainer table.
         */
        public  const FLAGS_VAL:int= 0;
        
        /**
         * Containers table holding the values of all inheriting class fields.
         */
        public var m_containers:Array;
        
        /**
         * Returns wether a property exists.
         * Use this when the prop is a type (not an object) and then can't be null.
         * For example, getFloat(prop) will raise an exception if prop doesn't exists!
         * @param prop  Index of the property
         * @return True if prop exists.
         */
        protected function isDefined( prop:int):Boolean {
            return m_containers[prop] != null;
        }
        
        /**
         * Convenient methode to check if a bit is enabled in a flag.
         * @param flags	The int holding the bits.
         * @param bit	Index of the bit in [0,31]
         * @return		true if the bit is 1, false otherwise.
         */
        protected static function isEnabled( flags:int, bit:int):Boolean {
            return ( flags & bit )!= 0;
        }
        
        /**
         * Gets the flags always stored whith each Base.
         * @param	props	Props table
         * @return	an int containing the bits of the flag.
         */
        protected function getFlags( props:Hashtable):int {
            return getInt( FLAGS_VAL, props );
        }
        
        /**
         * Gets the object embedded in a Container. It can be the Container itself or a referenced property.
         * @param	prop	Index of the container in the table (XXX_VAL).
         * @param	props	If this contains a referenced property, props is the table that hold the property.
         * @return	the Object corresponding to the field whose index is prop or null if the property doesn't exists or is void.
         */
        protected function getValue( prop:int, props:Hashtable):Object {
            var container:VContainer= m_containers[prop];
            
            return container != null ?( container.m_isBound ? props.get( container.m_value ) : container.m_value ): null;
        }
        
        /**
         * Gets the boolean value embedded in a Container. It can be the Container itself or a referenced property.
         * @param	prop	Index of the container in the table (XXX_VAL).
         * @param	props	If this contains a referenced property, props is the table that hold the property.
         * @return	the boolean corresponding to the field whose index is prop or null if the property doesn't exists or is void.
         */
        /*	protected final boolean getBool( int prop, Hashtable props )
        {
        return ((Boolean)getValue( prop, props )).booleanValue();
        }*/
        
        /**
         * Gets the int value embedded in a Container.
         * It can be the Container itself or a referenced property.
         * @param	prop	Index of the container in the table (SIZE_VAL).
         * @param	props	If this contains a referenced property, props is the table that hold the property.
         * @return	the int corresponding to the field whose index is prop or null if the property doesn't exists or is void.
         */
        protected function getInt( prop:int, props:Hashtable):int {
            return (Integer(getValue( prop, props ))).intValue();
        }
        
        /**
         * Gets the float value embedded in a Container.
         * It can be the Container itself or a referenced property.
         * @param	prop	Index of the container in the table (SCALE_VAL).
         * @param	props	If this contains a referenced property, props is the table that hold the property.
         * @return	the float corresponding to the field whose index is prop or null if the property doesn't exists or is void.
         */
        protected function getFloat( prop:int, props:Hashtable):Number {
            return (Float(getValue( prop, props ))).floatValue();
        }
        
        /**
         * Gets the String value embedded in a Container.
         * It can be the Container itself or a referenced property.
         * @param	prop	Index of the container in the table (NAME_VAL).
         * @param	props	If this contains a referenced property, props is the table that hold the property.
         * @return	the String corresponding to the field whose index is prop or null if the property doesn't exists or is void.
         */
        protected function getString( prop:int, props:Hashtable):String {
            return String(getValue( prop, props ));
        }
        
        /**
         * Gets the HTMLText value embedded in a Container.
         * It can be the Container itself or a referenced property.
         * @param	prop	Index of the container in the table (ex:TEXT_VAL).
         * @param	props	If this contains a referenced property, props is the table that hold the property.
         * @return	the HTMLText corresponding to the field whose index is prop or null if the property doesn't exists or is void.
         */
        protected function getText( prop:int, props:Hashtable):HTMLText {
            return HTMLText(getValue( prop, props ));
        }
        
        /**
         * Gets the FontX value embedded in a Container.
         * It can be the Container itself or a referenced property.
         * @param	prop	Index of the container in the table (ex:FONT_VAL).
         * @param	props	If this contains a referenced property, props is the table that hold the property.
         * @return	the FontX corresponding to the field whose index is prop or null if the property doesn't exists or is void.
         */
        protected function getFont( prop:int, props:Hashtable):FontX {
            return FontX(getValue( prop, props ));
        }
        
        /**
         * Gets the Color value embedded in a Container.
         * It can be the Container itself or a referenced property.
         * The real Object embedded or referenced is a ColorX because of serialization problem with Color class.
         * So this method also translate the ColorX in java.awt.Color.
         * @param	prop	Index of the container in the table (ex:IN_COL_VAL).
         * @param	props	If this contains a referenced property, props is the table that hold the property.
         * @return	the Color corresponding to the ColorX field whose index is prop or null if the property doesn't exists or is void.
         * @throws UnsupportedEncodingException 
         */
        protected function getColor( prop:int, props:Hashtable):Color {
            var color:ColorX= ColorX(getValue( prop, props ));
            var ContainerColor:Color= null;
            
            if (color==null)
                return null;
            
            try {
                ContainerColor = color.getColor( props);
            } catch (e:UnsupportedEncodingException) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
            
            return ContainerColor;
        }
        
        /**
         * Gets the Transfo value embedded in a Container.
         * It can be the Container itself or a referenced property.
         * @param	prop	Index of the container in the table (ex:TRANSFO_VAL).
         * @param	props	If this contains a referenced property, props is the table that hold the property.
         * @return	the Transfo corresponding to the field whose index is prop or null if the property doesn't exists or is void.
         */
        protected function getTransfo( prop:int, props:Hashtable):Transfo {// What's that strange test?????
            if ( getValue( prop, props ) is String )
            {
                return null;
            }
            return Transfo(getValue( prop, props ));
        }
        
        /**
         * Sets the Graphics pen color using a Color Container.
         * @param g			A Graphical context whose pen color must be updated.
         * @param	prop	Index of the container in the table (ex:OUT_COL_VAL).
         * @param	props	If this contains a referenced property, props is the table that hold the property.
         * @return			True if the property exist and has a value. False Otherwise.
         * @throws UnsupportedEncodingException 
         */
        protected function setColor( g:Graphics, prop:int, props:Hashtable):Boolean // throws UnsupportedEncodingException
        {
            var color:Color= getColor( prop, props );
            
            if ( color != null )
            {
                g.setColor( color );
                
                return true;
            }
            
            return false;
        }
        
        /**
         * Gets the texts parts s�parated by a delimitor.
         * The resulting parts are put in a table.
         * @param text		the original text including the parts.
         * @param delim		A String delimitor.
         * @return			An array containing the text parts without the delimitors or null if text is null.
         */
        static function getTextParts(text:String, delim:String):Array
        {
            var parts:Array= null;
            
            if ( text != null )
            {
                var tokenizer:StringTokenizer= new StringTokenizer( text, delim );
                var i:int, pCnt     = tokenizer.countTokens();
                
                parts = new String[pCnt];
                
                try
                {
                    for ( i = 0; i < pCnt; i ++ )
                    {
                        parts[i] = tokenizer.nextToken();
                    }
                }
                catch ( e:NoSuchElementException){}
            }
            
            return parts;
        }
        
        /**
         * Parses a String containing bound properties and replace them by their String representation.
         * If some properties are lists, returns a String for each member of the smalest list.
         * This is used in menu, tips...
         * @param	prop	Index of the container in the table (ex:TEXT_VAL).
         * @param	props	If this contains referenced properties, props is the table that hold the property.
         * @return			An array of String or null if the property doesn't exists or is void.
         * @throws UnsupportedEncodingException 
         */
        protected function parseString(prop:int, props:Hashtable):Array
        {
            var text:String= getString( prop, props );
            
            return text != null ? parseString( text, props ) : null;
        }
        
        /**
         * Parses a String containing bound properties and replace them by their String representation.
         * If some properties are lists, returns a line of text for each member of the smalest list finished by an HTML <br>.
         * Warning! The isHtm parameter is not read because this method consider it's always true!
         * This is used in tips...
         * @param	prop	Index of the container in the table (ex:TEXT_VAL).
         * @param	props	If this contains referenced properties, props is the table that hold the property.
         * @param	isHtm	Not used in this HTML-only implementation!
         * @return			A String containing <br> between each lines or null if the property doesn't exists or is void.
         * @throws UnsupportedEncodingException 
         */
        protected function parseString(prop:int, props:Hashtable, isHtm:Boolean):String // throws UnsupportedEncodingException
        {
            var text:String= getString( prop, props );
            var returnstring:String= null;
            
            try {
                returnstring = parseString( text, props, isHtm );
            } catch (e:UnsupportedEncodingException) {
                e.printStackTrace();
            }
            
            return text != null ? returnstring : null;
        }
        
        /**
         * Parses a String containing bound properties and replace them by their String representation.
         * If some properties are lists, returns a String for each member of the smalest list.
         * This is used in menu, tips...
         * @param	text	A String containing or not bound properties.
         * @param	props	If this contains referenced properties, props is the table that hold the property.
         * @return			An array of String.
         * @throws UnsupportedEncodingException 
         */
        protected function parseString(text:String, props:Hashtable):Array
        {
            var tokens:Vector = parseTokens( text );
            var token:Token;
            var i:int, j, n, max = 0, len = tokens.size();
            
            for ( i = 0; i < len; i ++ )
            {
                token   = Token(tokens.elementAt( i ));
                n       = token.getListSize( props );
                if ( n == 0)
                {
                    max = 0;
                    break;
                }
                max     = Math.max( n, max );
            }
            var dst:Array= new String[max];
            var prop:String;
            
            for ( j = 0; j < max; j ++ )
            {
                dst[j] = "";
                
                for ( i = 0; i < len; i ++ )
                {
                    prop    = (Token(tokens.elementAt( i ))).toString( j, props );
                    
                    if ( prop == null )
                    {
                        dst[j] = null;
                        break;
                    }
                    
                    dst[j] += prop;
                }
            }
            
            return dst;
        }
        
        /**
         * Parses a String containing bound properties and replace them by their String representation.
         * If some properties are lists, returns a line of text for each member of the smalest list finished by an HTML.<br>
         * Warning! The isHtm parameter is not read because this method consider it's always true!
         * This is used in tips...
         * @param	text	A String containing or not bound properties.
         * @param	props	If this contains referenced properties, props is the table that hold the property.
         * @param	isHtm	Not used in this HTML-only implementation!
         * @return			A String containing <br> between each lines.
         * @throws UnsupportedEncodingException 
         */
        static protected function parseString( text:String, props:Hashtable, isHtm:Boolean):String {
            var tokens:Vector= parseTokens( text );
            var token:Token;
            var i:int, j, n, max = 0, len = tokens.size();
            
            for ( i = 0; i < len; i ++ )
            {
                token   = Token(tokens.elementAt( i ));
                n       = token.getListSize( props );
                if ( n == 0)
                {
                    max = 0;
                    break;
                }
                max     = Math.max( n, max );
            }
            var dst:String= "";
            var prop:String;
            
            for ( j = 0; j < max; j ++ )
            {
                for ( i = 0; i < len; i ++ )
                {
                    prop    = (Token(tokens.elementAt( i ))).toString( j, props );
                    
                    dst += prop == null ? " ? " : prop;
                }
                if ( j < max - 1)  dst += "<br>";
            }
            
            return dst;
        }
        
        /**
         * getNextTokenProp( tokens )       => getNextTokenProp( tokens, token.PROP_BIT, token.SUB_BIT )
         * getNextSubTokenProp( tokens )    => getNextTokenProp( tokens, token.SUB_BIT, 0 )
         */
        /**
         * Gets the next token String representation matching some flags.
         * This is used only by PlanGenerator to sort "database" and "analysis" properties.
         * The tokens remaining are the ones that include some bits and exclude others.
         * Each call iterate to the next Token in the tokens list.<br>
         * Warning! This method remove Tokens from tokens while iterating.
         * ex:
         * <ul>
         * <li><code>getNextTokenProp( tokens, token.PROP_BIT, token.SUB_BIT )</code> retrieve only "database" properties.</li>
         * <li><code>getNextTokenProp( tokens, token.SUB_BIT, 0 )</code> retrieve only "analysis" properties.</li>
         * </ul>
         * @param tokens		A list of Token.
         * @param includeBit	The Token to retreive must include those bits (Token.XXX_BIT).
         * @param excludeBit	The Token to retreive must exclude those bits (Token.XXX_BIT).
         * @return				A String representation of the next matching Token.
         */
        public static function getNextTokenProp( tokens:Vector, includeBit:int, excludeBit:int):String {
            var i:int, len = tokens.size();
            //String  prop;
            var token:Token;
            
            for ( i = 0; i < len; i ++ )
            {
                token = Token(tokens.elementAt( i ));
                tokens.removeElementAt( i );
                len --;
                i --;
                
                if (( token.m_flags & includeBit )!= 0&& ( token.m_flags & excludeBit )== 0)
                {
                    return token.m_buffer.toString();
                }
            }
            return null;
        }
        
        /**
         * Parse a text String to extract the Tokens inside.
         * A token can be of 3 kinds:
         * <ul>
         * <li>textual		a simple text</li>
         * <li>prop			a bound property that should be replaced by it's value</li>
         * <li>list			a bound array property that should be replaced by it's values</li>
         * </ul>
         * @param text	a text String containing or not properties.
         * @return		a Vector of Tokens matching text.
         */
        public static function parseTokens( text:String):Vector {
            var i:int, j = 0, len = text.length();
            var c:String= 0;
            var isAfterBS:Boolean= false;
            var token:Token= null;
            var tokens:Vector= new Vector();
            
            for ( i = 0; i < len; i ++ )
            {
                c = text.charAt( i );
                if ( c == '\\' )
                {
                    //				System.out.println( c );
                    isAfterBS = true;
                }
                else
                {
                    if ( isAfterBS )
                    {
                        //					System.out.println( "afterBS" );
                        if ( token == null )
                        {
                            //						System.out.println( "new Token[" +(len - i)+ ']' );
                            token = new Token( len - i, 0);
                            j = 0;
                        }
                        token.m_buffer.setCharAt( j ++, c );
                        isAfterBS = false;
                    }
                    else
                    {
                        if ( c == '{' || c == '[' )      // a new prop or list Token begins
                        {
                            //						System.out.println( c );
                            if ( token != null )        // there was a text Token previously,
                            {
                                //							System.out.println( "add Token: " + token.m_buffer );
                                token.m_buffer.setLength( j );
                                tokens.addElement( token );    // store it
                            }
                            // and create a new prop or list Token
                            //						System.out.println( "new Token[" +(len - i)+ ']' );
                            token = new Token( len - i, c == '{' ? Token.PROP_BIT : Token.PROP_BIT | Token.LIST_BIT );
                            i = token.findFlags( text, i + 1);
                            j = 0;
                        }
                        else if ( c == '}' || c == ']' ) // a new prop or list Token ends
                        {
                            //						System.out.println( c );
                            //						System.out.println( "add Token: " + token.m_buffer );
                            token.m_buffer.setLength( j );
                            tokens.addElement( token );        // store the previous token
                            token = null;               // a new one must be created
                        }
                        else
                        {
                            //						System.out.println( c );
                            if ( token == null )        // a new text Token begins
                            {                           // create it
                                //							System.out.println( "new Token[" +(len - i)+ ']' );
                                token = new Token( len - i, 0);
                                j = 0;
                            }
                            token.m_buffer.setCharAt( j ++, c ); // copy this char in the current Token
                        }
                    }
                }
            }
            if ( c != '}' && c != ']' ) // don't forget the last one!
            {
                //			System.out.println( "add Token: " + token.m_buffer );
                token.m_buffer.setLength( j );
                tokens.addElement( token );        // store the previous token
            }
            
            return tokens;
        }
    }
}