<%!
// return current time to proxy server request
public long getLastModified(HttpServletRequest request) {
	return System.currentTimeMillis();
}
%>
<html>
<head>
<title>Administration Societe.com</title>
<link rel="stylesheet" href="wps.css">
<link rel="stylesheet" href="menu.css">
<base target="main">
</head>
<body bgcolor="cfdfff">
<table>
<tr><td height=20 >&nbsp;</td></tr>
<tr><td align="left" nowrap><a href="info.jsp" >Information</a></td></tr>
<tr><td height=20 >&nbsp;</td></tr>
<tr><td align="left" nowrap><a href="dictionaries.jsp" >Dictionaries</a></td></tr>
<tr><td height=20 >&nbsp;</td></tr>
<tr><td align="left" nowrap><a href="swatches.jsp" >Swatches</a></td></tr>
<tr><td height=20 >&nbsp;</td></tr>
<tr><td align="left" nowrap><a href="upload.jsp" >Upload</a></td></tr>
<tr><td height=20 >&nbsp;</td></tr>
<tr><td height=20 ><hr noshade align="center" width="50%" size="1"></td></tr>
<tr><td height=20 >&nbsp;</td></tr>
<tr><td align="left" nowrap><span class="blueText"><b>Documentation</b></span></td></tr>
<!--   <tr><td align="left" nowrap><a href="doc/WPS.PDF" target="_blank"><font size="-2" >&nbsp;&nbsp;&nbsp;&nbsp;Technical guide</font></a></td></tr> --> 
<tr><td align="left" nowrap><a href="docDTD.jsp" target="_wpsdtd"><font size="-2" >&nbsp;&nbsp;&nbsp;&nbsp;DTD definition</font></a></td></tr>
<tr><td align="left" nowrap><a href="docApplet.jsp" ><font size="-2" >&nbsp;&nbsp;&nbsp;&nbsp;Applet</font></a></td></tr>
<tr><td height=20 >&nbsp;</td></tr>
<tr><td height=20 ><hr noshade align="center" width="50%" size="1"></td></tr>
<tr><td height=20 >&nbsp;</td></tr>
   <tr><td align="left" nowrap><a href="sample.jsp" >Sample</a></td></tr>
</table>
</body>
</html>
