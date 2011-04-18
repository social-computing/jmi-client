<%@page import="com.socialcomputing.wps.server.persistence.hibernate.SwatchManagerImpl"%>
<%@page import="com.socialcomputing.wps.server.persistence.SwatchManager"%>
<%@page import="com.socialcomputing.wps.server.persistence.Swatch"%>
<%@page import="java.util.List"%>
<%@page import="com.socialcomputing.wps.server.persistence.hibernate.DictionaryManagerImpl"%>
<%@page import="com.socialcomputing.wps.server.persistence.Dictionary"%>
<%@page import="com.socialcomputing.wps.server.persistence.DictionaryManager"%>
<%@page import="java.util.Iterator"%>
<%@page import="java.util.Collection"%>
<%!
// return current time to proxy server request
public long getLastModified(HttpServletRequest request) {
	return System.currentTimeMillis();
}
%>
<%
String dictionaryName = request.getParameter( "dictionary");
if (dictionaryName == null) return;
DictionaryManager dManager = new DictionaryManagerImpl();
Dictionary dic = dManager.findByName(dictionaryName); 
List<Swatch> ls = dic.getSwatchs();
%>


<html>
	<head>
		<title>WPS Administration</title>
		<META http-equiv="content-type" content="text/html;charset=ISO-8859-1">
		<META http-equiv="content-language" content="fr-FX">
		<link rel="stylesheet" href="css/main.css"/>
		<link rel="stylesheet" href="css/wps.css">
		<script type="text/javascript" src="./applet/jquery.js" ></script>
		<script type="text/javascript" src="javascript/jquery.fancybox-1.3.4.pack.js"></script>
		<link rel="stylesheet" href="css/jquery.fancybox-1.3.4.css" type="text/css" media="screen" />
		<SCRIPT LANGUAGE="JavaScript1.2" > 
			function SubmitForm(resetStart)
			{
				if( resetStart)
					ResetStart();
				document.test.submit();
				return true;
			}
			function Delete()
			{
				if( confirm("Are you sure you want to delete selected swatches ?"))
				{
					document.test.confirmdelete.value = 'y';
					document.test.submit();
				}
				return false;
			}
			function OnExport( content, contentType)
			{
				document.test.content.value = content;
				document.test.contentType.value = contentType;
				document.test.submit();
				return false;
			}
		</SCRIPT>
	</head>
	<body>
	<div id="top"><jsp:include page="top.jsp" /></div>
	<div id="menu"><jsp:include page="menu.jsp" /></div>
	<div id="content">

<script>
$(document).ready(function() {

    /* This is basic - uses default settings */
    $("a#single_image").fancybox();
        
    /* Using custom settings */
    $("a#inline").fancybox({
        'hideOnContentClick': true
    });

    /* Apply fancybox to multiple items */
    parent.$.fancybox.close();
    $("a.iframe").fancybox({
        'width'                : '75%',
        'height'            : '75%',
        'autoScale'         : false,
        'transitionIn'        : 'none',
        'transitionOut'        : 'none',
        'type'                : 'iframe'
    });
});
</script>
<!--iframe height="0" width="0" src="../exportrequest.jsp"></iframe-->
<%
SwatchManager manager = new SwatchManagerImpl();
if (request.getParameter("confirmdelete") != null && request.getParameter("confirmdelete").equalsIgnoreCase("y"))
{
	int maxDelete = Integer.parseInt( request.getParameter("maxdelete"));
	for (int i = 0; i < maxDelete; i++)
	{
		if( request.getParameter("swatch" + i) != null)
		{	// Delete
			manager.remove(request.getParameter("swatch" + i), request.getParameter("dico" + i));
		}
	}
}
%>


<table width="100%">
<tr>
<td><h1>Dictionary : <%=dictionaryName %></h1></td>
</tr>
<tr>
<td><a class="iframe" href="view_def.jsp?type=plan&dictionary=<%=java.net.URLEncoder.encode(dictionaryName,"UTF-8")%>"><span class="texblanc">View definition</span></a></td>
</tr>
<tr>
<td><a class="iframe" href="edit_def.jsp?dictionary=<%=java.net.URLEncoder.encode(dictionaryName,"UTF-8")%>"><span class="texblanc">Edit definition</span></a></td>
</tr>
<tr><td>&nbsp;</td></tr>
<tr><td>
	<form name="test" method="GET" action="view-applet.jsp" target="_blank">
	<input type="hidden" name="dictionary" value="<%=dictionaryName%>" >
	<input type="hidden" name="internal" value="n" >
	<table width="60%" border=0>
	 <tr><td colspan=3><span class="subTitleBlue" >Test it</span></td></tr>
	 <tr>
	 	<td nowrap><span class="texblanc">Input parameters</span></td>
	 	<td colspan=2><input type="text" size="60" name="appletparams" value="entityId=" ></td>
	 </tr>
	 <tr>
	 	<td />
		<td align="center" ><a href="view-applet.jsp" onclick="document.test.internal.value='n';document.test.submit();return false;" >view</a></td>
		<td align="center" ><a href="view-applet.jsp" onclick="document.test.internal.value='y';document.test.submit();return false;" >details</a></td>
	 </tr>
	</table>
	</form>
</td></tr>
</table>

<br/><br/>

<form name="test" method="GET" action="dictionary-detail.jsp">
<input type="hidden" name="dictionary" value="<%=dictionaryName%>" />
<input type="hidden" name="confirmdelete" value="n" />

<!-- For export -->
<input type="hidden" name="content" value="" />
<input type="hidden" name="contentType" value="" />
<input type="hidden" name="maxdelete" value="<%=ls.size()%>" />

<br>
<table width="100%" >
<tr><td colspan="4" >
<table border=1 width="100%">

 <tr>
  <th width="8%" ><span class="subTitleBlue">#</span></th>
  <th width="8%" ><a href="" title="Delete selected dictionaries" onclick="javascript:return Delete()">delete</a></th>
  <th width="60%" ><span class="subTitleBlue">name</span></th>
 </tr>
<%	
	int i = 0;
	for(Swatch sw : ls)
	{
	    String swatchName = sw.getSwatchPk().getName();
	    String dicoName = sw.getSwatchPk().getDictionaryName();
		%><tr>
		<td align="center" nowrap><span class="texblanc"><%=i+1%></span></td>
		<input type="hidden" name="dico<%=i%>" value="<%=dicoName%>" />
		<td align="center" valign="top"><input type="checkbox" name="swatch<%=i%>" value="<%=swatchName%>" /></td>
		<td nowrap><a href="swatch.jsp?dictionary=<%=dicoName %>&swatch=<%=java.net.URLEncoder.encode(swatchName,"UTF-8")%>" ><span class="texblanc"><%=swatchName%></span></a></td>
		</tr><%
		i++;
	}
%>	
</table>
</td></tr>
</table>
</form>

<br/><br/>

<!-- UPLOAD SWATCHES -->
<% if( request.getParameter( "openresults") != null && session.getValue( "UploadDefinitionFileResults") != null)
{%>	
	<script language="javascript">
		var win = window.open( 'upload_results.jsp', 'mpstadminresults', 'width=600,height=600,scrollbars=yes,resizable=yes,dependent=yes');
		win.focus();
	</script>
<%}%>	
<form name="upload" enctype="multipart/form-data" method="POST" action="upload">
	<input type="hidden" name="action" value="uploadSwatchFile" />
	<input type="hidden" name="dictionary" value="<%=dictionaryName %>" />
	<input type="hidden" name="redirect" value="./dictionary-detail.jsp?dictionary=<%=dictionaryName %>&openresults=1" />
	<table width="100%" align="center" border="0" cellpadding="0" cellspacing="0" >
		<tr>
			<td><span class="subTitleBlue">Load a swatch file (*.xml, *.zip) : </span></td> 
			<td><input type="file" name="definitionFile" size="50" ></td>
		</tr>
		<tr>
			<td><input type="submit" value="Load" /></td>
		</tr>
	</table>
</form>
</div>
</body>
</html>
<%
if( request.getParameter( "content") != null && request.getParameter( "content").length() > 0)
{
	StringBuffer sb = new StringBuffer( "action=export");
	sb.append( "&");
	sb.append( request.getQueryString());
	//out.print( sb.toString());
	out.print( "<iframe height=0 width=0 src=\"../sadmin?" + sb.toString() + "\"></iframe>");
}
%>