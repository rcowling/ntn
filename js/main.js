// Load the Visualization API and the columnchart package.
google.load('visualization', '1', {packages: ['line', 'corechart']});
'use strict';
var div,usa,thWindow,parkWindow,path,start,end;
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
usa=new google.maps.LatLng( 46.5292104377584, -87.42428541183472 );         

// creates an infowindow for the trailheads
thWindow = new google.maps.InfoWindow();

// creates an infowindow for the parking areas
parkWindow = new google.maps.InfoWindow();

options = {
    zoom: 15,
    center: usa,
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    streetViewControl: false,
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

var mapMaxZoom = 18;

// add a control to get the users geolocation https required
var geoloccontrol = new klokantech.GeolocationControl(map, mapMaxZoom);

// setup the layers
var th_layer = new google.maps.Data({map: map});
var parking_layer = new google.maps.Data({map: map});

// load the trailheads data onto the map
th_layer.loadGeoJson('data/trailheads.geojson');

// load the parking lots data onto the map
parking_layer.loadGeoJson('data/parking.geojson');

var th_icon = {
url: "img/trailhead.svg", // url
scaledSize: new google.maps.Size(30,30) // size
};

var parking_icon = {
url: "img/parking.svg", // url
scaledSize: new google.maps.Size(20,20) // size
};

// change the icons for the trailheads and parking lots
th_layer.setStyle(function(feature) {
  return /** @type {google.maps.Data.StyleOptions} */({
    icon: th_icon
  });
});

parking_layer.setStyle(function(feature) {
  return /** @type {google.maps.Data.StyleOptions} */({
    icon: parking_icon
  });
});

// set the infowindow for the trailheads layer
th_layer.addListener('click', function(event) {
  var myHTML = event.feature.getProperty("NAME");
  thWindow.setContent("<div style='width:150px; text-align: center;'>"+myHTML+"</div>");
  thWindow.setPosition(event.feature.getGeometry().get());
  thWindow.setOptions({pixelOffset: new google.maps.Size(0,-30)});
  thWindow.open(map);
});  

// set the infowindow for the parking layer
parking_layer.addListener('click', function(event) {
  var myHTML = event.feature.getProperty("NAME");
  parkWindow.setContent("<div style='width:150px; text-align: center;'>"+myHTML+"</div>");
  parkWindow.setPosition(event.feature.getGeometry().get());
  parkWindow.setOptions({pixelOffset: new google.maps.Size(0,-20)});
  parkWindow.open(map);
});  

// load trails data onto the map 
map.data.loadGeoJson('data/ntn2018.geojson');

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
        strokeWeight: 1,
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

// add the original color style for the trails
// style trails based on skill level
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
      }
});        


map.data.addListener('click', function(event) {    
    // open modal that contains info from the trail infowindow    
    $('#modal1').modal(); 
    $('#modal1').modal('open'); 
    // setup infowindow variables and use them in the modal
    var name = event.feature.getProperty('trail_name');
    var level = event.feature.getProperty('skill_leve');
    $('#name').html(name);
    $('#level').html(level);            

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
    
    console.log("the length of the trail is " + trailLength + " km");

    // place a marker at the start and end of each line
    markers.push( new google.maps.Marker({
        position: start, 
        title:'Trail start',
        map:map
    }));
    markers.push( new google.maps.Marker({
        position: end, 
        title:'Trail end',
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
        data.addColumn('number', 'Elevation');
        for (var i = 0; i < elevations.length; i++) {
          data.addRow(['', elevations[i].elevation*3.28084]); // convert meters to feet
        }

        // Draw the chart using the data within its DIV.
        chart.draw(data, {
          height: 150,
          legend: 'none',
          color: 'green',        
          titleY: 'Elevation (ft)'
        });   
        

        // display a marker at position of the current elevation on the chart
        google.visualization.events.addListener(chart, 'onmouseover', function(e) {
          if (mousemarker == null) {
            mousemarker = new google.maps.Marker({
              position: elevations[e.row].location,
              map: map,
              icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
            });      

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
    
    // close of the bottomsheet on mapclick
    map.addListener('click', function() {
        $('#modal1').modal('close');        
    });  
    
       function clearMouseMarker() {
    if (mousemarker != null) {
      mousemarker.setMap(null);
      mousemarker = null;
    }
  }
   
});   