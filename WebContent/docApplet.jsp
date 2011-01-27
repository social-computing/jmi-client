<%!
// return current time to proxy server request
public long getLastModified(HttpServletRequest request) {
	return System.currentTimeMillis();
}
%>

<html>
<head>
<link rel="stylesheet" href="./wps.css">
<base target="main">
<script>
	function Auth()
	{
		var win = window.open( 'Base64Credential.jsp', 'base64', 'width=700,height=200,scrollbars=yes,resizable=yes,dependent=yes');
		win.focus();
		return false;
	}
</script>
</head>
<body bgcolor=7f9fdf>
<span class="subTitleBlue" >WPS Applet template</span>
<table width="100%" border=0>
<tr><td>ServletURL and WPSParameters are mandatory, others are optional</td></tr>
<tr><td>&lt;APPLET name="WPSApplet" archive="WPSApplet.jar" code="com.socialcomputing.wps.client.WPSApplet.class" codebase="/applet/" MAYSCRIPT align="absmiddle" hspace="0" vspace="0" width="100%" height="100%"&gt;</td></tr>
<tr><td>
	<table width="90%" align="center" border=1>
	<tr><td nowrap>&lt;PARAM NAME="ServletURL"</td><td>VALUE="WPS server computation URL" /&gt;</td></tr>
	<tr><td nowrap>&lt;PARAM NAME="WPSParameters"</td><td>VALUE="<a href="#wpsparameters" >WPS plan parameters</a>" /&gt;</td></tr>
	<tr><td nowrap>&lt;PARAM NAME="InitColor"</td><td>VALUE="Background color displayed at startup (RRGGBB)" /&gt;</td></tr>
	<tr><td nowrap>&lt;PARAM NAME="ComputeMsg"</td><td>VALUE="Message displayed while computing" /&gt;</td></tr>
	<tr><td nowrap>&lt;PARAM NAME="DownloadMsg"</td><td>VALUE="Message displayed while downloading" /&gt;</td></tr>
	<tr><td nowrap>&lt;PARAM NAME="MsgColor"</td><td>VALUE="Message color (RRGGBB)" /&gt;</td></tr>
	<tr><td nowrap>&lt;PARAM NAME="OnAppletReadyFunc"</td><td>VALUE="<a href="#appletready" >URL or Javascript function</a> called when applet is initialized" /&gt;</td></tr>
	<tr><td nowrap>&lt;PARAM NAME="VoidPlanUrl"</td><td>VALUE="Redirection url when plan is empty" /&gt;</td></tr>
	<tr><td nowrap>&lt;PARAM NAME="<a name="noscript"></a>NoScriptUrl"</td><td>VALUE="Redirection url when Liveconnect doesn't work ; adds cgi parameter 'func' with the string value of javascript call" /&gt;</td></tr>
	<tr><td nowrap>&lt;PARAM NAME="<a href="#appleterror" >ErrorPlanUrl</a>"</td><td>VALUE="Redirection url when an error occurs" /&gt;</td></tr>
	<tr><td nowrap>&lt;PARAM NAME="WakeUpURL"</td><td>VALUE="URL called for maintaining the HTTP session" /&gt;</td></tr>
	<tr><td nowrap>&lt;PARAM NAME="WakeUpDelay"</td><td>VALUE="Delay (in ms) between 2 calls of WakeUpURL" /&gt;</td></tr>
	<tr><td nowrap>&lt;PARAM NAME="NeedPrint"</td><td>VALUE="(true | false) If true, background color is white" /&gt;</td></tr>
	<tr><td nowrap>&lt;PARAM NAME="<a href="#appletheader" >HTTPHeaderName0-9</a>"</td><td>VALUE="HTTP header name to add" /&gt;</td></tr>
	<tr><td nowrap>&lt;PARAM NAME="<a href="#appletheader" >HTTPHeaderSetValue0-9</a>"</td><td>VALUE="HTTP header value to set" /&gt;</td></tr>
	<tr><td nowrap>&lt;PARAM NAME="<a href="#appletheader" >HTTPHeaderSetIfEmptyValue0-9</a>"</td><td>VALUE="HTTP header value to set if value was empty" /&gt;</td></tr>
	<tr><td nowrap>&lt;PARAM NAME="<a href="#appletheader" >HTTPHeaderAddValue0-9</a>"</td><td>VALUE="HTTP header value to add to existing" /&gt;</td></tr>
	</table>
</td></tr>
<tr><td>&lt;/APPLET&gt;</tr>
</table>
<br>
<a name="wpsparameters" ></a><span class="subTitleBlue" >WPS plan parameters (refer to WPS-dictionary.dtd)</span>
<table width="100%" border=1>
<tr>
	<td width="30%" >planName</td>
	<td>dictionary name</td>
</tr>
<tr>
	<td>entityId (*)</td>
	<td>id of an entity; mandatory for a personal plan</td>
</tr>
<tr>
	<td>attributeId (*)</td>
	<td>id of an attribute; mandatory for a discovery plan</td>
</tr>
<tr>
	<td>analysisProfile (*)</td>
	<td>Name of an analysis profile</td>
</tr>
<tr>
	<td>affinityReaderProfile (*)</td>
	<td>Name of an affinity reader profile</td>
</tr>
<tr>
	<td>displayProfile (*)</td>
	<td>Name of a display profile</td>
</tr>
<tr>
	<td>language (*)</td>
	<td>Set language for language segmentation</td>
</tr>
<tr><td colspan=2>Any other parameters are forwarded to WPS. Parameter names starting with '$' are global parameters and may be used in swatches or in OnAppletReadyFunc.</td></tr>
<tr><td colspan=2>(*) optional</td></tr>
</table>
<br>
<a name="appletready" ></a><span class="subTitleBlue" >OnAppletReadyFunc</span>
<table width=100% border=1>
	<tr><td colspan=2>the url or function arguments may contain global plan parameters (starting with '$')</td></tr>
	<tr><td>url</td><td>url opened in a '_blank' window</td></tr>
	<tr><td>_target:url</td><td>url opened in 'target' window</td></tr>
	<tr><td>javascript:function(args)</td><td>function(args) is called in current window(*)</td></tr>
	<tr><td>javascript:_target:function(args)</td><td>function(args) is called in 'target' window(*)</td></tr>
	<tr><td colspan=2>(*) if Liveconnect (java-javascript bridge) doesn't work : if target is '_null' nothing is done, else see <a href="#noscript" >NoScriptUrl</a></td></tr>
</table>
<br>
<a name="appletheader" ></a><span class="subTitleBlue" >HTTP headers parameters</span>
<table width=100% border=1>
<tr><td colspan=2>Add HTTP header values to WPS server request. Samples :</td></tr>
<tr><td><a href="." onclick="return Auth();">Basic authentication</a></td><td>For basic authentication</td></tr>
<tr><td>Relay session cookie<br>(workaround bug Mozilla 0.9.1)</td><td>For Orion Application Server<br>
	  &lt;PARAM NAME="HTTPHeaderName0" VALUE="COOKIE" /&gt;<br>
	  &lt;PARAM NAME="HTTPHeaderSetValue0" VALUE="JSESSIONID=<i>sessionid</i>" /&gt;
</td></tr>
</table>
<br>
<a name="appleterror" ></a><span class="subTitleBlue" >Error url</span>
<table width=100% border=1>
	<tr><td colspan=2>url called when an error occured. Additional parameters are provided :</td></tr>
	<tr><td>source</td><td>"client" or "server"</td></tr>
	<tr><td>stack</td><td>applet or server java stack trace</td></tr>
	<tr><td>header</td><td>HTTP header of ServletURL response</td></tr>
	<tr><td>stage</td><td>stage when error occured</td></tr>
	<tr><td>pb</td><td>precises the error for debug purpose</td></tr>
	<tr><td>wpssize</td><td>if the ServletURL connection succeeded this is the error code returned in the stream (negative integer), else 0</td></tr>
	<tr><td>version</td><td>WPS Applet internal version</td></tr>
	<tr><td>jsObj</td><td>"OK" if Liveconnect is alive, else "null"</td></tr>
	<tr><td>size</td><td>Java Dimension of the applet</td></tr>
	<tr><td>os</td><td>OS name</td></tr>
	<tr><td>osVers</td><td>OS version</td></tr>
	<tr><td>arch</td><td>OS architecture</td></tr>
	<tr><td>java</td><td>Java version number : "45.3" for JDK 1.1, "46.0" for JDK 1.2, "47.0" for JDK 1.3, "48.0" for JDK 1.4</td></tr>
</table>
<br>
<span class="subTitleBlue" >WPS Applet javascript API (if Liveconnect is alive)</span>
<table width="100%" border=1>
<tr>
	<td width="30%" >boolean isReady()</td>
	<td>true if a plan is initialized</td>
</tr>
<tr>
	<td>Object getEnvProp( prop)</td>
	<td>Global property 'prop'</td>
</tr>
<tr>
	<td>int getAttCount()</td>
	<td>Attributes count</td>
</tr>
<tr>
	<td>Object getAttProp( i, prop)</td>
	<td>Property 'prop' of attribute i (i starts at 0)</td>
</tr>
<tr>
	<td>int getLinkCount()</td>
	<td>Links count</td>
</tr>
<tr>
	<td>Object getLinkProp( i, prop)</td>
	<td>Property 'prop' of link i (i starts at 0)</td>
</tr>
<tr>
	<td>void setAttSelection( attIds, selName)</td>
	<td>Set attributes in attIds (attributes id separated with ',') within selection 'selName'</td>
</tr>
<tr>
	<td>void clearAttSelection( selName)</td>
	<td>Unset attributes in selection 'selName'</td>
</tr>
<tr>
	<td>void setLinkSelection( linkIds, selName)</td>
	<td>Set links in linkIds (links id separated with ',') within selection 'selName'</td>
</tr>
<tr>
	<td>void clearLinkSelection( selName)</td>
	<td>Unset links in selection 'selName'</td>
</tr>
<tr>
	<td>void setSelection( String selNam)</td>
	<td>Display selection 'selName'</td>
</tr>
</table>
</body>
</html>
 
 
