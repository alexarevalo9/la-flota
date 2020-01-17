var geojson;
var map;
var arrayMarkers = [];
var currentMarker;
var size = 200;
var flagLayer;
var selectCountry;


jQuery(document).ready(function() {
  mapboxgl.accessToken = "pk.eyJ1IjoiYWxleGFyZXZhbG85IiwiYSI6ImNqenNqZTFjNTAydDIzbW54bXZvMHpjYmsifQ._GESnmG3HCwGT5thJrIyWw";
  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [-78.6284947, -1.2465876],
    zoom: 6
  });
  
  fetch("js/datos.json").then(response => response.json()).then(json => {
      geojson = json;
      hiddenBox();
      selectCountry = document.getElementById("selectCountry");
      // add markers to map
      geojson.features.forEach(function(marker, i) {
        // create a HTML element for each feature
        var el = document.createElement("div");
        el.className = "marker";

        // make a marker for each feature and add to the map
        new mapboxgl.Marker(el)
          .setLngLat(marker.geometry.coordinates)
          .addTo(map);

        el.addEventListener("click", function() {
          addDescriptionPublicationListener(marker);
          addAnimatedIcon(marker);
          showBox();
        });

        arrayMarkers[i] = marker;

        selectCountry.addEventListener("change", function() {
          var selectedOption = this.options[selectCountry.selectedIndex];
          flyToCoordinates(arrayMarkers[selectedOption.value].geometry.coordinates);
          addDescriptionPublication(selectedOption, arrayMarkers)
          addAnimatedIcon(arrayMarkers[selectedOption.value]);
          showBox();
        });
        
      });

      fillSelects()
      addSelectListener(geojson);
    });
});

function fillSelects(){

    //var filterCountries = arrayCountries.filter((value, index, self) => self.indexOf(value) === index);
    //var filterCountries = arrayMarkers.sort();
    //console.log(filterCountries);

    arrayMarkers.forEach(function(country, i) {
      
      //Create Option Items Country
      var optionCountry = document.createElement("option");
      optionCountry.setAttribute("value", i);
      optionCountry.innerHTML = country.properties.City;
      selectCountry.appendChild(optionCountry);
    });
  
}

function addSelectListener(geojson){
  selectCountry.addEventListener("change", function() {
    var selectedOptionCountry = selectCountry.options[selectCountry.selectedIndex].text;
    searchPublicationCountry(geojson, selectedOptionCountry);
  });

}


function searchPublicationCountry(geojson, country){
  resultCountries = geojson.features.filter(json => json.properties.Country == country);
  
  resultCountries.forEach(function(res, i) {
    //Create Option Items IArea
    var opctionIArea = document.createElement("option");
    opctionIArea.setAttribute("value", i);
    opctionIArea.setAttribute("class", "res-option");
    opctionIArea.innerHTML = res.properties.DoctoralStudent +"-"+ res.properties.ResearchAreas;
  });
}


function showSelectResult(){
  document.getElementById('resultado').style.display = "inline";
}

function cleanselectCountry(){
  for (let i = selectCountry.options.length; i >= 0; i--) {
    selectCountry.remove(i);
  }
  var opctionIArea = document.createElement("option");
  opctionIArea.setAttribute("selected","");
  opctionIArea.setAttribute("disabled","");
  opctionIArea.setAttribute("hidden","");
  opctionIArea.innerHTML = "País";
  selectCountry.appendChild(opctionIArea); 
}

function addDescriptionPublicationListener(marker){
  var nameBox = document.getElementById("name-bar-box");
  nameBox.innerHTML = marker.properties.DoctoralStudent;
  var areaBox = document.getElementById("area-box");
  areaBox.innerHTML = '<p class="element-title">Doctoral Student</p>'+
  '<p align="justify">' + marker.properties.DoctoralStudent + "</p>"+
  '<p class="element-title">Publication</p>'+
  '<p align="justify">' + marker.properties.Publications + "</p>"+
  '<p class="element-title">Conference Congress Symposium</p>'+
  '<p align="justify">' + marker.properties.ConferenceCongressSymposium + "</p>"+
  '<p class="element-title">Year</p>'+
  '<p align="justify">' + marker.properties.Year + "</p>"+
  '<p class="element-title">City</p>'+
  '<p align="justify">' + marker.properties.City + "</p>"+
  '<p class="element-title">Published In</p>'+
  '<p align="justify">' + marker.properties.Publishedin + "</p>"+
  '<p class="element-title">Research Area</p>'+
  '<p align="justify">' + marker.properties.ResearchAreas + "</p>"+
  '<p class="element-title">Indexing In</p>'+
  '<p align="justify">' + marker.properties.Indexing + "</p> <br>";
}

function addDescriptionPublication(selectedOption, arrayOptions){
  var nameBox = document.getElementById("name-bar-box");
  nameBox.innerHTML = arrayOptions[selectedOption.value].properties.DoctoralStudent;
  var areaBox = document.getElementById("area-box");
  areaBox.innerHTML ='<p class="element-title">Doctoral Student</p>'+
  '<p align="justify">' + arrayOptions[selectedOption.value].properties.DoctoralStudent + "</p>"+
  '<p class="element-title">Publication</p>'+
  '<p align="justify">' + arrayOptions[selectedOption.value].properties.Publications + "</p>"+
  '<p class="element-title">Conference Congress Symposium</p>'+
  '<p align="justify">' + arrayOptions[selectedOption.value].properties.ConferenceCongressSymposium + "</p>"+
  '<p class="element-title">Year</p>'+
  '<p align="justify">' + arrayOptions[selectedOption.value].properties.Year + "</p>"+
  '<p class="element-title">City</p>'+
  '<p align="justify">' + arrayOptions[selectedOption.value].properties.City + "</p>"+
  '<p class="element-title">Published In</p>'+
  '<p align="justify">' + arrayOptions[selectedOption.value].properties.Publishedin + "</p>"+
  '<p class="element-title">Research Area</p>'+
  '<p align="justify">' + arrayOptions[selectedOption.value].properties.ResearchAreas + "</p>"+
  '<p class="element-title">Indexing In</p>'+
  '<p align="justify">' + arrayOptions[selectedOption.value].properties.Indexing + "</p> <br>";
}

function addAnimatedIcon(marker) {
  removeIconLayer(marker);
  map.addImage(marker.properties.Country, pulsingDot, { pixelRatio: 2 });
  map.addLayer({
    id: marker.properties.Country,
    type: "symbol",
    source: {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: marker.geometry.coordinates
            }
          }
        ]
      }
    },
    layout: {
      "icon-image": marker.properties.Country
    }
  });
}

function removeIconLayer(marker) {
  if (flagLayer != null) {
    map.removeLayer(flagLayer);
    map.removeImage(flagLayer);
    map.removeSource(flagLayer);
    flagLayer = null;
  }

  if (marker != null) {
    flagLayer = marker.properties.Country;
  }
}

function hiddenBox() {
  removeIconLayer(null);
  $("#right")
    .children(".box-slide")
    .stop()
    .animate({ left: "-310px" }, 500);
}

function showBox() {
  $("#right")
    .children(".box-slide")
    .stop()
    .animate({ top: "0px", left: "0px" }, 500);

  if (document.getElementById("map-box").style.display != "block") {
    document.getElementById("map-box").style.display = "block";
  }
}

function flyToCoordinates(latLag) {
  map.flyTo({
    center: latLag,
    zoom: 18
  });
}

/*
 *    Country: Add an animated icon to the map
 *    Author: mapbox
 *    Availability: https://docs.mapbox.com/mapbox-gl-js/example/add-image-animated/
 */
var pulsingDot = {
  width: size,
  height: size,
  data: new Uint8Array(size * size * 4),

  // get rendering context for the map canvas when layer is added to the map
  onAdd: function() {
    var canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    this.context = canvas.getContext("2d");
  },

  // called once before every frame where the icon will be used
  render: function() {
    var duration = 1000;
    var t = (performance.now() % duration) / duration;

    var radius = (size / 2) * 0.3;
    var outerRadius = (size / 2) * 0.7 * t + radius;
    var context = this.context;

    // draw outer circle
    context.clearRect(0, 0, this.width, this.height);
    context.beginPath();
    context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
    context.fillStyle = "rgba(255, 150, 150," + (1 - t) + ")";
    context.fill();
    // update this image's data with data from the canvas
    this.data = context.getImageData(0, 0, this.width, this.height).data;

    // continuously repaint the map, resulting in the smooth animation of the dot
    map.triggerRepaint();

    // return `true` to let the map know that the image was updated
    return true;
  }
};
