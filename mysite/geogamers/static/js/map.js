
'use strict';

function loadMap(mapData) {


	var mapBounds = [[76, -169], [-83, 122]]; 

	var map = L.map('map', {
        scrollWheelZoom: false,
        smoothWheelZoom: true,
        smoothSensitivity: 1,
		maxBounds: mapBounds,
		maxBoundsViscosity: 1.0,
	});
	document.querySelector(".leaflet-control-attribution").innerHTML = 
		mapData["attribution"] ? `<a href="${mapData['attribution']}" target="_blank">Map</a>` : "";

	map.setMinZoom(map.getBoundsZoom(mapBounds, true));
	map.setView([0, 0], map.getBoundsZoom(mapBounds, true));
	
	var baseUrl = `/api/maps/${mapData["id"]}`;
	L.tileLayer(`${baseUrl}/{z}/{x}/{y}.jpg`, {
		noWrap: true,
		maxNativeZoom: mapData["tile_depth"],
		maxZoom: mapData["tile_depth"] + 1,
		tms: true,
		keepBuffer: 20,
	}).addTo(map);
	
	
	var marker;
	map.on('click', function(e){
		if (marker) {
			map.removeLayer(marker);
		}
		marker = new L.marker(e.latlng).addTo(map)
			.bindPopup(`${e.latlng}`)
			// .openPopup();
	});
}