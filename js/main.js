// Load the Visualization API and the columnchart package.
google.charts.load('current', {'packages':['corechart']});
'use strict';
var div,mqt,thWindow,parkWindow,path,start,end;
var options,latlng,marker,markers;
var mousemarker = null;
markers = [];

var clearMarkers=function(){
    markers.forEach( function( mkr ){
        mkr.setMap( null );
    }.bind( markers ) );
    markers=[];
};        

div=document.getElementById('map');
mqt=new google.maps.LatLng(46.6125248, -87.4940628 );         

// creates an infowindow for the trailheads
thWindow = new google.maps.InfoWindow();

/*// creates an infowindow for the parking areas
parkWindow = new google.maps.InfoWindow();*/

options = {
    zoom: 10,
    center: mqt,
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    streetViewControl: false,
    fullscreenControl: false,
     styles: [{
            featureType: "poi",
            //elementType: "labels",
            stylers: [{
                visibility: "off"
            }]
        }]    
};

var map = new google.maps.Map( div, options );

function clearMouseMarker() {
    if (mousemarker != null) {
      mousemarker.setMap(null);
      mousemarker = null;
    }
}

// setup the custom icons
var geo_icon = {
url: "img/bluedot.png", // url
scaledSize: new google.maps.Size(25,25), // size   
};

var mapMaxZoom = 18;
function addYourLocationButton(map, marker, circle) {
var controlDiv = document.createElement('div');
	
	var firstChild = document.createElement('button');
	firstChild.style.backgroundColor = '#fff';
	firstChild.style.border = 'none';
	firstChild.style.outline = 'none';
	firstChild.style.width = '28px';
	firstChild.style.height = '28px';
	firstChild.style.borderRadius = '2px';
	firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
	firstChild.style.cursor = 'pointer';
	firstChild.style.marginRight = '10px';
	firstChild.style.padding = '0px';
	firstChild.title = 'Your Location';
	controlDiv.appendChild(firstChild);
	
	var secondChild = document.createElement('div');
	secondChild.style.margin = '5px';
	secondChild.style.width = '18px';
	secondChild.style.height = '18px';
	secondChild.style.backgroundImage = 'url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-1x.png)';
	secondChild.style.backgroundSize = '180px 18px';
	secondChild.style.backgroundPosition = '0px 0px';
	secondChild.style.backgroundRepeat = 'no-repeat';
	secondChild.id = 'you_location_img';
	firstChild.appendChild(secondChild);
	
	google.maps.event.addListener(map, 'dragend', function() {
		$('#you_location_img').css('background-position', '0px 0px');
	});

	firstChild.addEventListener('click', function() {
		var imgX = '0';
		var animationInterval = setInterval(function(){
			if(imgX == '-18') imgX = '0';
			else imgX = '-18';
			$('#you_location_img').css('background-position', imgX+'px 0px');
		}, 500);
		if(navigator.geolocation) {
			function setGeolocation() {
    var geolocation = window.navigator.geolocation.watchPosition( 
        function ( position ) {
            var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
             
                marker.setPosition(latlng);
                circle.setRadius(position.coords.accuracy);
                circle.setCenter(latlng);
             map.panTo(latlng);
    map.setZoom(16);
				//map.setCenter(latlng);
				clearInterval(animationInterval);                
				$('#you_location_img').css('background-position', '-144px 0px');
            accuracy = position.coords.accuracy;
           console.log(latlng, accuracy);
        },
        function () { /*error*/ }, {
          //  maximumAge: 250, 
            enableHighAccuracy: true
        } 
    );

   /* window.setTimeout( function () {
            window.navigator.geolocation.clearWatch( geolocation ) 
        }, 
        5000 //stop checking after 5 seconds
    );*/
};
window.setInterval( function () {
        setGeolocation();
    }, 
    5000 //check every 15 seconds
);   
		}
		else{
			clearInterval(animationInterval);
			$('#you_location_img').css('background-position', '0px 0px');
		} 
        
       
    });
	
	controlDiv.index = 1;
	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);

}

	
	var myLocationMkr = new google.maps.Marker({
		map: map,		
		position: latlng,
        zIndex: 800000000000000000000000000000000,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,scale:6,fillColor:"#3a84df",fillOpacity:1,strokeColor:"#fff",strokeWeight:2}
    
    });
	
    var radCircle = new google.maps.Circle({clickable:!1,strokeColor:"#3a84df",
strokeOpacity:.8,strokeWeight:.5,fillColor:"#3a84df",fillOpacity:.25,map:map,center:latlng,radius:1, zIndex: 900000000000000000000000000});
            


	addYourLocationButton(map, myLocationMkr, radCircle);



// add a control to get the users geolocation https required
//var geoloccontrol = new klokantech.GeolocationControl(map, mapMaxZoom);

// setup the layers
var th_layer = new google.maps.Data({map: map});
var parking_layer = new google.maps.Data({map: map});

// load the trailheads data onto the map
th_layer.loadGeoJson('data/trailheads.geojson');

// load the parking lots data onto the map
// remove for now save for potential future use
//parking_layer.loadGeoJson('data/parking.geojson');

// setup the custom icons
var th_icon = {
url: "img/th2.svg", // url
scaledSize: new google.maps.Size(25,25), // size   
};

var startIcon = {
url: "img/start.svg", // url
scaledSize: new google.maps.Size(30,30), // size   
};

var endIcon = {
url: "img/end.svg", // url
scaledSize: new google.maps.Size(30,30), // size   
};

var elevIcon = {
url: "img/elev.svg", // url
scaledSize: new google.maps.Size(25,25), // size   
};

/*var parking_icon = {
url: "img/parking.svg", // url
scaledSize: new google.maps.Size(20,20) // size
};*/

// change the icons for the trailheads and parking lots
th_layer.setStyle(function(feature) {
  return /** @type {google.maps.Data.StyleOptions} */({
    icon: th_icon
  });
});

/*parking_layer.setStyle(function(feature) {
  return * @type {google.maps.Data.StyleOptions} ({
    icon: parking_icon
  });
});*/

// set the infowindow for the trailheads layer
th_layer.addListener('click', function(event) {
  var myHTML = event.feature.getProperty("NAME");
  thWindow.setContent("<div style='width:120px; text-align: center;'>"+myHTML+"</div>");
  thWindow.setPosition(event.feature.getGeometry().get());
  thWindow.setOptions({pixelOffset: new google.maps.Size(0,-25)});
  thWindow.open(map);
  // zoom into the marker when it is clicked
  var zoom = map.getZoom();    
  if (zoom <= 13) {
      map.setZoom(13);
  }
  map.panTo(event.feature.getGeometry().get());
});

// close the infowindow on mapclick
map.addListener('click', function() {    
    thWindow.close(map);    
});  

/*// set the infowindow for the parking layer
parking_layer.addListener('click', function(event) {
  var myHTML = event.feature.getProperty("NAME");
  parkWindow.setContent("<div style='width:120px; text-align: center;'>"+myHTML+"</div>");
  parkWindow.setPosition(event.feature.getGeometry().get());
  parkWindow.setOptions({pixelOffset: new google.maps.Size(0,-20)});
  parkWindow.open(map);
});*/  

// load trails data onto the map 
map.data.loadGeoJson('data/trailsnew6.geojson');

// fuction to filter out trails that are used for snow biking
function catBiking() {
    map.data.setStyle(function(feature) {
     var category = feature.getProperty('snowbike');
     if (category == 'Y'){
      return /** @type {google.maps.Data.StyleOptions} */({        
        strokeColor: 'orange',
        strokeWeight: 3,
        visible: true  
      });
     } else {
      return /** @type {google.maps.Data.StyleOptions} */({        
        strokeColor: 'gray',
        strokeWeight: 1,
        visible: true  
      });    
     }
    })
}

// fuction to filter out trails that are used for skiing
function catSki() {
    map.data.setStyle(function(feature) {
     var category = feature.getProperty('skiing');
     if (category == 'Y'){
      return /** @type {google.maps.Data.StyleOptions} */({        
        strokeColor: 'orange',
        strokeWeight: 3,
        visible: true  
      });
     } else {
      return /** @type {google.maps.Data.StyleOptions} */({        
        strokeColor: 'gray',
        strokeWeight: 2,
        visible: true  
      });    
     }
    })
}

// fuction to filter out trails that are used for skiing
function catShoe() {
    map.data.setStyle(function(feature) {
     var category = feature.getProperty('snowshoe');
     if (category == 'Y'){
      return /** @type {google.maps.Data.StyleOptions} */({        
        strokeColor: 'orange',
        strokeWeight: 2,
        visible: true  
      });
     } else {
      return /** @type {google.maps.Data.StyleOptions} */({        
        strokeColor: 'gray',
        strokeWeight: 2,
        visible: true  
      });    
     }
    })
}

// add the original color style for the trails
// style trails based on skill level
function createStyle(){
 map.data.setStyle(function(feature) {
     var skill = feature.getProperty('skill_leve');
     if (skill == 'ADVANCED'){
      return /** @type {google.maps.Data.StyleOptions} */({
        fillColor: 'white',
        strokeColor: 'black',
        strokeWeight: 3
      });
      } else if (skill == 'INTERMEDIATE'){
      return /** @type {google.maps.Data.StyleOptions} */({
        strokeColor: 'blue',
        strokeWeight: 3 
          
      });
      } else if (skill == 'BEGINNER'){
      return /** @type {google.maps.Data.StyleOptions} */({
        strokeColor: 'green',
        strokeWeight: 3
      });
      } else {
      return /** @type {google.maps.Data.StyleOptions} */({
        strokeColor: 'purple',
        strokeWeight: 3
      });          
      }
 });
}

createStyle();
/*    
function highLight() {
map.data.addListener('mouseover', function(event) { 
     map.data.overrideStyle( event.feature, { strokeWeight: 3, strokeColor: 'white' } );   
});
}
highLight();
if (highLight) {
map.data.addListener('mouseout', function(event) { 
     map.data.revertStyle();
});
}*/


map.data.addListener('click', function(event) {    
    // open modal that contains info from the trail infowindow    
    $('#modal1').modal(); 
    $('#modal1').modal('open'); 
    // setup infowindow variables and use them in the modal
    var name = event.feature.getProperty('trail_name');
    var level = event.feature.getProperty('skill_leve');
    $('#name').html(name);
    $('#level').html(level);
    
    // color the trail name according to difficulty
    if (level == 'BEGINNER') {
        document.getElementById("name").style.color = "green";
    } else if (level == 'INTERMEDIATE') {
        document.getElementById("name").style.color = "blue";        
    } else if (level == 'ADVANCED') {
        document.getElementById("name").style.color = "black";  
    } else {
        document.getElementById("name").style.color = "purple"; 
    }

    // change the line back to its original color style
    map.data.revertStyle();
    // if there are already markers on the map, clear them.     
    clearMarkers.call( this );
    // get the coordinates for the start and end of each polyline    
    path = event.feature.getGeometry().getAt(0).getArray();
    start = event.feature.getGeometry().getAt(0).getAt( 0 );
    end  = event.feature.getGeometry().getAt(0).getAt( path.length-1 );
    
    // calculate the length of the trail in kilometers
    var trailLength = Math.round((google.maps.geometry.spherical.computeLength(path)/1000) * 10)/10;
    $('#length').html(trailLength);
    console.log("the length of the trail is " + trailLength + " km");

    // place a marker at the start and end of each line
    markers.push( new google.maps.Marker({
        position: start, 
        title:'Trail start',
        icon: startIcon,
        zIndex: 100,
        map:map
    }));
    markers.push( new google.maps.Marker({
        position: end, 
        title:'Trail end',
        icon: endIcon,
        zIndex: 100,
        map:map
    }));

    // Create an ElevationService.
    var elevator = new google.maps.ElevationService;

    // Draw the path, using the Visualization API and the Elevation service.
    displayPathElevation(path, elevator, map);

    function displayPathElevation(path, elevator, map) {
        // Display a polyline of the elevation path.
       var poly = new google.maps.Polyline({
          path: path,
          strokeColor: '#0000CC',
          strokeOpacity: 0.4,
          map: map
        });

    // Create a PathElevationRequest object using this array.
    // Ask for 256 samples along that path.
    // Initiate the path request.
    elevator.getElevationAlongPath({
      'path': path,
      'samples': 256
    }, plotElevation);

    // clear paths
    poly.setMap(null);
  }

  // Takes an array of ElevationResult objects, draws the path on the map
  // and plots the elevation profile on a Visualization API ColumnChart.
  function plotElevation(elevations, status) {
    var chartDiv = document.getElementById('elevation_chart');
    if (status !== 'OK') {
      // Show the error code inside the chartDiv.
      chartDiv.innerHTML = 'Cannot show elevation: request failed because ' +
          status;
      return;
    }
    
    // Draws and elevation chart on the map using data from Elevation API  
    function drawChart() {    
        // Create a new chart in the elevation_chart DIV.
        var chart = new google.visualization.AreaChart(chartDiv);

        // Extract the data from which to populate the chart.
        // Because the samples are equidistant, the 'Sample'
        // column here does double duty as distance along the
        // X axis.
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Sample');
        data.addColumn('number', 'Elevation (ft)');        
        for (var i = 0; i < elevations.length; i++) {
          data.addRow(['', Math.round(elevations[i].elevation*3.28084)]); // convert meters to feet
        }  

        // Draw the chart using the data within its DIV.
        // Color the chart according to skill level.
        if (level == 'BEGINNER') {
            chart.draw(data, {
              height: 150,
              legend: 'none',
              colors : ['green'],
              backgroundColor: '#fafafa',
              isStacked: true,
              focusTarget: 'category',    
              titleY: 'Elevation (ft)'                
            });
        } else if (level == 'INTERMEDIATE') {
            chart.draw(data, {
              height: 150,
              legend: 'none',
              colors : ['blue'], 
              backgroundColor: '#fafafa',
              focusTarget: 'category',    
              titleY: 'Elevation (ft)'
            });            
        } else if (level == 'ADVANCED') {
            chart.draw(data, {
              height: 150,
              legend: 'none',
              colors : ['black'],
              backgroundColor: '#fafafa', 
              focusTarget: 'category',    
              titleY: 'Elevation (ft)'
            });            
        } else {
            chart.draw(data, {
              height: 150,
              legend: 'none',
              colors : ['purple'],
              backgroundColor: '#fafafa',
              focusTarget: 'category',    
              titleY: 'Elevation (ft)'
            });            
        }       

        // display a marker at position of the current elevation on the chart
        google.visualization.events.addListener(chart, 'onmouseover', function(e) {
          if (mousemarker == null) {
            mousemarker = new google.maps.Marker({
              position: elevations[e.row].location,
              map: map,
              zIndex: 200,    
              icon: elevIcon
            });      
            console.log(elevations[e.row].location);
          } else {
            mousemarker.setPosition(elevations[e.row].location);
          }
            
        });
    }        
      drawChart();
      // when the window size is changed resize the chart
      $(window).resize(function(){
          drawChart();
      });
  }

    // when a line is clicked change its color    
     map.data.overrideStyle( event.feature, { strokeWeight: 7 } );    
    
    // close of the bottomsheet, trail markers, and styles on mapclick
    map.addListener('click', function() {
        $('#modal1').modal('close');
        thWindow.close(map);
        map.data.revertStyle();         
        clearMarkers.call( this );
        if (mousemarker != null) {
         mousemarker.setMap(null);
         mousemarker = null;
        }
    });  
}); 