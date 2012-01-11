<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<title>Test</title>
<script type="text/javascript" src="/jmi-canvas/src/main/js/lib/jquery-1.7.1.min.js"></script>

<script type="text/javascript" src="/jmi-canvas/src/main/js/lib/json_sans_eval.js"></script>

<script type="text/javascript" src="/jmi-canvas/src/main/js/jmi.js"></script>

<script type="text/javascript" src="/jmi-canvas/src/main/js/script/ActiveZone.js"></script>
<script type="text/javascript" src="/jmi-canvas/src/main/js/script/BagZone.js"></script>
<!--script type="text/javascript" src="/jmi-canvas/src/main/js/script/Base.js"></script>
<script type="text/javascript" src="/jmi-canvas/src/main/js/script/ColorX.js"></script-->
<!--script type="text/javascript" src="/jmi-canvas/src/main/js/script/CustomMenuItemRenderer.js"></script-->
<!--script type="text/javascript" src="/jmi-canvas/src/main/js/script/Dimension.js"></script>
<script type="text/javascript" src="/jmi-canvas/src/main/js/script/Env.js"></script>
<script type="text/javascript" src="/jmi-canvas/src/main/js/script/FontX.js"></script>
<script type="text/javascript" src="/jmi-canvas/src/main/js/script/FormatToken.js"></script>
<script type="text/javascript" src="/jmi-canvas/src/main/js/script/HTMLText.js"></script>
<script type="text/javascript" src="/jmi-canvas/src/main/js/script/Insets.js"></script-->
<!--script type="text/javascript" src="/jmi-canvas/src/main/js/script/LinkZone.js"></script>
<script type="text/javascript" src="/jmi-canvas/src/main/js/script/MenuX.js"></script>
<script type="text/javascript" src="/jmi-canvas/src/main/js/script/Plan.js"></script-->
<script type="text/javascript" src="/jmi-canvas/src/main/js/script/PlanContainer.js"></script>
<script type="text/javascript" src="/jmi-canvas/src/main/js/script/Point.js"></script>
<!--script type="text/javascript" src="/jmi-canvas/src/main/js/script/Polygon.js"></script>
<script type="text/javascript" src="/jmi-canvas/src/main/js/script/Rectangle.js"></script>
<script type="text/javascript" src="/jmi-canvas/src/main/js/script/SatData.js"></script>
<script type="text/javascript" src="/jmi-canvas/src/main/js/script/Satellite.js"></script>
<script type="text/javascript" src="/jmi-canvas/src/main/js/script/ShapeX.js"></script-->
<script type="text/javascript" src="/jmi-canvas/src/main/js/script/Slice.js"></script>
<!--script type="text/javascript" src="/jmi-canvas/src/main/js/script/Swatch.js"></script>
<script type="text/javascript" src="/jmi-canvas/src/main/js/script/TextToken.js"></script>
<script type="text/javascript" src="/jmi-canvas/src/main/js/script/TipTimer.js"></script>
<script type="text/javascript" src="/jmi-canvas/src/main/js/script/Token.js"></script-->
<script type="text/javascript" src="/jmi-canvas/src/main/js/script/Transfo.js"></script>
<script type="text/javascript" src="/jmi-canvas/src/main/js/script/VContainer.js"></script>

</head>
<body>
<script>
$.get(
    "/jmi-canvas/src/main/resources/feeds.json",
    function( jmiJson) { 
		var jmiData = jsonParse( jmiJson, function (key, value) {
	        if (value && typeof value === 'object') {
	        	if( 'env' === key) {
	        		return new JMI.script.Env();
	        	}
	        	else if( 'plan' === key) {
	        		return new JMI.script.Plan();
	        	}
	        	else if( 'Transfo' === value.cls) {
	        		return new JMI.script.Transfo( value.dir, value.pos, value.scl, value.flags);
	        	}
	        	else if( 'Slice' === value.cls) {
	        		return new JMI.script.Slice();
	        	}
	        	else if( 'Point' === value.cls) {
	        		return new JMI.script.Point( value.x, value.y);
/*	        	}
	        	else if( 'ColorX' === value.cls) {
	        		return new JMI.script.ColorX( value.color);*/
		       	} else {
		         	return value;
		       	}
	       	} else {
	         	return value;
	       }
		}
		);
		alert( 'done');
		for (var k in jmiData) {
		  //alert(k + '=' + jmiData[k]);
		}
    }
);
</script>	
</body>
</html>