<%@ page import="java.util.*, java.sql.*, javax.sql.*, javax.naming.*, java.rmi.*, java.io.*" %>
<%!
// return current time to proxy server request
public long getLastModified(HttpServletRequest request) {
	return System.currentTimeMillis();
}%>
<%@ include file="applet/AppletVersion.jsp" %>
<HTML>
<HEAD>
<link rel="stylesheet" href="./wps.css">
<SCRIPT LANGUAGE="JavaScript" >
	function onAppletReady()
	{
		var	doc = parent._appletFrame.document;
		if( doc.applets == null) return null;
		
		var applet = doc.applets["WPSApplet"];
		if( applet == null) return null;
		if( !applet.isReady()) return;
		
		var sep = "$$;.,:$$";
		doc = parent._toolsFrame.document;
		var n = applet.getAttCount();
		var nameLst = new Array( n);
		for (var i = 0; i < n; i++)
		{ 
			nameLst[i] = applet.getAttProp( i, "NAME") + sep + i;//applet.getAttProp( i, "ID");
		}
		nameLst.sort();
		for (var i = 0; i < n; i++)
		{ 
			var pos = nameLst[i].lastIndexOf( sep);
			doc.Tools.group.options[i+1] = new Option( nameLst[i].substring( 0, pos), nameLst[i].substring( pos + sep.length), false, false);
		}
		
		n = applet.getAttCount();
		var max = 0;
		nameLst = new Array( 30);
		idLst = new Array( 30);
		for (var i = 0; i < n; i++)
		{ 
			var props = applet.getAttProp( i, "POSS_NAME");
			if( props != null)
			{
				props = props + ''; // String transformation
				var names = props.split( '\n');
				for( var j = 0; j < names.length; ++j)
				{			
					var found = false;
					for (var k = 0; k < max && !found; k++)
					{
						if( nameLst[k] == names[j])
						{
							found = true;
							idLst[k] += ',' + i;
						}
					}
					if( !found)
					{
						//alert( props + '\n ' + j + '/' + props.length + ' ' + names[j]);
						nameLst[max] = names[j];
						idLst[max++] = names[j] + sep + i;
					}
				}
			}
		}
		idLst.sort();
		for (var i = 0; i < max; i++)
		{ 
			var pos = idLst[i].lastIndexOf( sep);
			doc.Tools.accord.options[i+1] = new Option( idLst[i].substring( 0, pos), idLst[i].substring( pos + sep.length), false, false);
		}
	}
	function NewWin( newgroup, name)
	{
		parent.location = "./sample.jsp?group=" + escape( newgroup) + "&name=" + escape( name);
	}
	function Discover( id, name)
	{
		parent.location = "./sample.jsp?discover=" + id + "&name=" + escape( name);
	}
</SCRIPT>
</HEAD>
<BODY bgcolor=7f9fdf topmargin=0 leftmargin=0 marginheight=0 marginwidth=0>
<%
boolean error = request.getParameter( "error") != null;
if( !error)
{
	StringBuffer appletParams = new StringBuffer();
	appletParams.append( "planName=sample");
	String group = request.getParameter( "group");
	if( group != null)
	{
		appletParams.append( "&entityId=");
		appletParams.append(java.net.URLEncoder.encode(group, "UTF-8"));
	}
	else
	{
		String discover = request.getParameter( "discover");
		if( discover != null)
		{
			appletParams.append( "&analysisProfile=DiscoveryProfile&attributeId=");
			appletParams.append( discover);
		}
		else
		{		
			appletParams.append( "&analysisProfile=GlobalProfile");
		}
	}
	%>	
	<APPLET name="WPSApplet" archive="WPSApplet<%=APPLET_VERSION%>.jar" code="com.socialcomputing.wps.client.applet.WPSApplet.class" codebase="./applet/" MAYSCRIPT="mayscript" align="middle" hspace="0" vspace="0" width="100%" height="100%">
		<PARAM NAME="WPSParameters"		VALUE="<%=appletParams.toString()%>" />
		<PARAM NAME="ServletUrl"		VALUE="../maker" />
		<PARAM NAME="VoidPlanUrl"    	VALUE="../sample-applet.jsp?error=nodata&<%=appletParams.toString()%>" />
		<PARAM NAME="NoScriptUrl"     	VALUE="../noscript.jsp" />
		<PARAM NAME="ErrorPlanUrl"    	VALUE="../sample-applet.jsp?error=internal&<%=appletParams.toString()%>" />
		<PARAM NAME="ComputeMsg"      	VALUE="Sample computing..." />
		<PARAM NAME="DownloadMsg"    	VALUE="Sample loading..." />
		<PARAM NAME="InitColor"			VALUE="336699" />
		<PARAM NAME="OnAppletReadyFunc" VALUE="javascript:_toolsFrame:onAppletReady()" />
		<PARAM NAME="HTTPHeaderName0" 	VALUE="COOKIE" />
		<PARAM NAME="HTTPHeaderSetValue0" VALUE="JSESSIONID=<%=session.getId()%>" />			
		<p align="center"><span class="texblanc"><br><br>
			Votre navigateur ne permet pas l'affichage d'applets java.<br><br>
			Si vous n'avez pas de JVM vous pouvez t�l�charger 'Java Software' ici : <a href="http://www.java.com"  target="_blank">http://www.java.com</a>.<br><br>
			Si vous avez une JVM changez les param�tres de s�curit� en autorisant l'ex�cution de programmes Java.<br><br>
			Pour Internet Explorer sous Windows allez dans le menu 'Outils' -> 'Options Internet', <br>
			cliquez l'onglet 'S�curit�' puis le bouton 'Personnaliser'.<br>
			Changez le param�tre de 'Microsoft VM' / 'Java'<br><br>
			Pour les autres navigateurs, consultez la documentation pour effectuer cette autorisation.
		</span></p>
	</APPLET>
<%}
else {	%>
	<table width="500" border="0" cellpadding="0" cellspacing="0" align="center">
		<%if( request.getParameter( "error").equalsIgnoreCase( "nodata"))
		{%>
			<tr>
				<td align="center" valign="middle" height="100">					
					<span class="texblanc">Le plan est vide</span>
				</td>
			</tr>
		<%}
		else
		{%>
			<tr>
				<td align="center" valign="middle" height="100">					
					<span class="texblanc">
						<b>MapStan ne peut pas afficher votre plan en raison d'un probl�me technique.<br></b>
					</span>
				</td>
			</tr>
			<tr>
				<td>
					<p align="justify">		
					<span class="texblanc">
					<%
					String	version	= request.getParameter( "version" ),
							header	= request.getParameter( "header" ),
							stack	= request.getParameter( "stack" ),
							javaCls	= request.getParameter( "java" ),
							agent	= request.getHeader( "User-Agent"),
							subject	= "plan creation failure warning";
							
					if( version == null) version = "";
					if( header == null) header = "";
					if( stack == null) stack = "";
					if( javaCls == null) javaCls = "";
					if( agent == null) agent = "";
					
					if ( !version.equals( APPLET_VERSION ))
					{
						subject	= "wrong version";
						%>
							Le cache de votre navigateur contient une ancienne version de l'applet.<br>
							<ul>
							<li>Si vous avez Internet Explorer, appuyez sur CTRL + F5 ou CTRL + bouton 'rafra�chir' ou relancez IE.<br>
								V�rifiez �galement que la mise � jour de votre cache n'est pas r�gl�e sur 'jamais'.</li>
							<li>Sinon videz le cache de votre navigateur.</li>
							</ul>
					<%}
					else if ( request.getParameter( "pb" ) != null && request.getParameter( "pb" ).startsWith( "offscreenInit" ))
					{
						subject	= "bitmap alloc";
						%>
							Votre navigateur ne peut plus allouer de m�moire graphique.<br>
							Pour en lib�rer vous fermez toutes les fen�tres de votre navigateur puis relancez le.<br>
					<%}
					else if ( agent.indexOf( "AOL" )!= -1 && stack.indexOf( "java.io.IOException" )!= -1 )
					{
						subject	= "io AOL";
						%>
							Les transferts de donn�es ne fonctionnent pas en Java lorsque le navigateur AOL compresse les images.<br>
							Pour y rem�dier, veuillez d�cocher l'option 'graphiques compress�s' en allant dans :<br> 
							MyAOL -> WWW -> Graphiques web. Refermez la boite de pr�f�rences puis rafra�chissez la page
							� l'aide du boutton 'rafra�chir'. D�loguez vous et quittez le navigateur AOL.
							Enfin red�marrez votre navigateur et retournez � cette page.<br>
					<%}
					else if ( header.indexOf( "403" )!= -1 || header.indexOf( "404" )!= -1 ||( header.indexOf( "null" )!= -1 && stack.indexOf( "java.io.IOException" )!= -1 ))
					{
						subject	= "io generic";
						%>
							La communication avec notre serveur a �t� rompue, veuillez r�essayer ult�rieurement.<br>
					<%}
					else if ( stack.indexOf( "Unable to check hostname" )!= -1 )
					{
						subject	= "proxy IE";
						%>
							L'applet ne peut charger le plan car vous utilisez un proxy.<br>
							Nous n'avons pour l'instant pas de solution pour palier � ce probl�me.
							Renseignez vous aupr�s de votre administrateur r�seau pour savoir s'il peut authoriser l'acc�s � "societe.mapstan.com".<br>
					<%}
					else if (( javaCls.indexOf( "46" )!= -1 || javaCls.indexOf( "47" )!= -1 || javaCls.indexOf( "48" )!= -1 )&&( header.indexOf( "407" )!= -1  || stack.indexOf( "access denied" )!= -1 ))
					{
						subject	= "proxy Sun";
						%>
							Pour utiliser un proxy avec authentification et le Java Plugin de Sun vous devez le param�trer.<br>
							Ouvrez le Java Plugin (il se trouve dans le panneau de configuration) et cliquez l'onglet 'proxy'.
							Demandez � votre administrateur r�seau l'adresse IP et le num�ro de port du proxy.
							Lorsque vous utiliserez cette Applet, une boite de dialogue vous demandera alors d'entrer 
							votre nom d'utilisateur et votre mot de passe.<br>
					<%}
					else if ( stack.indexOf( "algorithm SHA not available" )!= -1 )
					{
						subject	= "class SHA";
						%>
							Il manque � votre machine virtuelle Java (JVM) certaines classes n�cessaires au bon fonctionnement de notre Applet.<br>
							Pour y rem�dier r�installez la JVM d'Internet Explorer ou installez le Java Plugin de Sun.
							Pour plus d'informations visitez <a href="http://java-virtual-machine.net/download.html">java-virtual-machine.net</a>.<br>
					<%}%>
					</span>
					</p>
				</td>
			</tr>
			<%}%>
		</table>
		<%}%>
	</BODY>
</HTML>
