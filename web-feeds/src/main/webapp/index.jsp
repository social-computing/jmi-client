<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:fb="http://ogp.me/ns/fb#" lang="en" xml:lang="en">	
<%String feed = request.getParameter("feed");
if( feed == null) feed = "";%>
<head>
<title>Map your feeds!</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="content-language" content="en" />
<meta name="description" content="View and navigate your feeds thru an interactive map! by Social Computing" />
<meta name="keywords" content="rss, feeds, feed, map, cartography, visualization, social, blog, gadget, widget, social computing, category, representation, information" />
<meta name="author" content="Social Computing" /> 
<meta name="robots" content="all" /> 
<meta property="og:title" content="Map your feeds!" />
<meta property="og:description" content="View and navigate your feeds thru an interactive map! by Social Computing" />
<meta property="og:image" content="http://www.mapyourfeeds.com/images/thumbnail.png" />
<link rel="shortcut icon" href="./favicon.ico" />
<link rel=StyleSheet href="./mapyourfeeds.css" type="text/css" media="screen" />
<%if( feed.length() > 0) {%>
<script type="text/javascript">
  function ready() {
	  var map = document.getElementById("wps-feeds");
	  var titles = map.getArrayProperty( "$FEEDS_TITLES");
	  if( titles)
	  	document.title = 'Map your feeds! - ' + titles.join( ', ');
  }
  function empty() {
	document.getElementById("message").innerHTML = "Sorry, the map is empty. Does the feed contains categories ?";
  }
  function error( error) {
	document.getElementById("message").innerHTML = "Sorry, an error occured. Is this URL correct? <span class='hidden-message'>" + error + "</span>";
  }
  function Navigate( url) {
 	 window.open( url, "_blank");
  }
  function NewWin( args)
  {
	var parameters = {};
	parameters["entityId"] = args[0];
	parameters["feed"] = args[2];
	document.getElementById("wps-feeds").compute( parameters);
	document.getElementById("message").innerHTML = "<i>Focus on category:</i> " + args[1];
  }
  function Discover( args)
  {
	var parameters = {};
	parameters["attributeId"] = args[0];
	parameters["analysisProfile"] = "DiscoveryProfile";
	parameters["feed"] = args[2];
	document.getElementById("wps-feeds").compute( parameters);
	document.getElementById("message").innerHTML = "<i>Centered on item:</i> " + args[1];
  }
</script>
<!-- Enable Browser History by replacing useBrowserHistory tokens with two hyphens -->
<!-- BEGIN Browser History required section -->
<link rel="stylesheet" type="text/css" href="./client/history/history.css" />
<script type="text/javascript" src="./client/history/history.js"></script>
<!-- END Browser History required section -->  
		
<script type="text/javascript" src="./client/swfobject.js"></script>
<script type="text/javascript">
    <!-- For version detection, set to min. required Flash Player version, or 0 (or 0.0.0), for no version detection. --> 
    var swfVersionStr = "10.0.0";
    <!-- To use express install, set to playerProductInstall.swf, otherwise the empty string. -->
    var xiSwfUrlStr = "./client/playerProductInstall.swf";
    var flashvars = {};
    flashvars.allowDomain = "*";
    //flashvars.wpsserverurl = "http://localhost:8080/wps-server";
    //flashvars.track = "http://localhost:8080/web-feeds/services/feeds/record.json";
    flashvars.wpsserverurl = "http://map.social-computing.com/";
    flashvars.track = "http://www.mapyourfeeds.com/services/feeds/record.json";
    flashvars.wpsplanname = "Feeds";
    flashvars.analysisProfile = "GlobalProfile";
    flashvars.feed = "<%=java.net.URLEncoder.encode(feed)%>";
    var params = {};
    params.quality = "high";
    params.bgcolor = "#FFFFFF";
    params.allowscriptaccess = "always";
    params.allowfullscreen = "true";
    var attributes = {};
    attributes.id = "wps-feeds";
    attributes.name = "wps-feeds";
    attributes.align = "middle";
    swfobject.embedSWF(
        "./client/wps-flex-1.0-SNAPSHOT.swf", "flashContent", 
        "100%", "100%", 
        swfVersionStr, xiSwfUrlStr, 
        flashvars, params, attributes);
<!-- JavaScript enabled so display the flashContent div in case it is not replaced with a swf object. -->
swfobject.createCSS("#flashContent", "display:block;text-align:left;");
</script>
<%}%>
<jsp:include page="./js/ga.js" /> 
</head>

<body>
<div id="fb-root"></div>
<script>(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/fr_FR/all.js#xfbml=1&appId=205005596217672";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));</script>
<div id="header">
<table id="bandeau" border="0">
<tr>
<td id="logo" rowspan="3">
	<a href="./" title="Map your feeds!"><img border="0" width="144" height="70" title="Map your feeds!" src="./images/logo-sc-white.jpg" /></a>
</td>
<td class="label" ><b>Enter one or more URLs (comma separated):</b>
</td>
<td class="share" colspan="2">Share your map</td>
</tr>
<tr>
<td nowrap >
	<form method="get">
		<input type="text" name="feed" title="URLs" size="80" value="<%=feed != null ? feed : "" %>" />
		<input type="submit" value="Just Map It!" />
		<span id="doc"><a href="./documentation.html">How to use the service</a></span>
	</form>
</td>
<td rowspan="2">
<table border="0"><tr>
	<td class="social"><g:plusone size="medium" href="http://www.mapyourfeeds.com/"></g:plusone></td>
	<!--td class="social"><a title="Post to Google Buzz" class="google-buzz-button" href="http://www.google.com/buzz/post" data-button-style="small-count" data-url="http://www.mapyourfeeds.com"></a><script type="text/javascript" src="http://www.google.com/buzz/api/button.js"></script></td-->
	<td class="social"><fb:like href="<%=request.getRequestURL().toString()+(request.getQueryString() != null? "?"+request.getQueryString() : "")%>" send="true" layout="button_count" width="450" show_faces="false" font="arial"></fb:like></td>
</tr><tr>
	<td class="social"><a href="https://twitter.com/share" class="twitter-share-button" data-count="horizontal">Tweet</a><script type="text/javascript" src="//platform.twitter.com/widgets.js"></script></td>
	<td class="social"><script src="http://platform.linkedin.com/in.js" type="text/javascript"></script><script type="IN/Share" data-counter="right"></script></td>
</tr></table>
</td>
</tr>
<tr>
	<td nowrap colspan="1">
		<p id="message">&nbsp;</p>
	</td>
</tr>
</table>
</div>

<div id="map" >
<%if (feed.length() == 0) {%>
<p class="slogan">View and navigate your feeds thru an interactive map!<p>
<%} else {%>
     <div id="flashContent">
     	<p>
      	To view this page ensure that Adobe Flash Player version 
		10.0.0 or greater is installed. 
		</p>
		<script type="text/javascript"> 
		var pageHost = ((document.location.protocol == "https:") ? "https://" :	"http://"); 
		document.write("<a href='http://www.adobe.com/go/getflashplayer'><img src='" 
						+ pageHost + "www.adobe.com/images/shared/download_buttons/get_flash_player.gif' alt='Get Adobe Flash player' /></a>" ); 
		</script> 
	 </div>
	
	 <noscript>
         <object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%" id="wps-feeds">
             <param name="movie" value="./client/wps-flex-1.0-SNAPSHOT.swf" />
             <param name="quality" value="high" />
             <param name="bgcolor" value="#FFFFFF" />
             <param name="allowScriptAccess" value="always" />
             <param name="allowFullScreen" value="true" />
             <!--[if !IE]>-->
             <object type="application/x-shockwave-flash" data="./client/wps-flex-1.0-SNAPSHOT.swf" width="100%" height="100%">
                 <param name="quality" value="high" />
                 <param name="bgcolor" value="#FFFFFF" />
                 <param name="allowScriptAccess" value="sameDomain" />
                 <param name="allowFullScreen" value="true" />
             <!--<![endif]-->
             <!--[if gte IE 6]>-->
             	<p> 
             		Either scripts and active content are not permitted to run or Adobe Flash Player version
             		10.0.0 or greater is not installed.
             	</p>
             <!--<![endif]-->
                 <a href="http://www.adobe.com/go/getflashplayer">
                     <img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Get Adobe Flash Player" />
                 </a>
             <!--[if !IE]>-->
             </object>
             <!--<![endif]-->
         </object>
	  </noscript>		
<%} %>
</div>
<script type="text/javascript" src="https://apis.google.com/js/plusone.js"></script>
</body>
</html>
