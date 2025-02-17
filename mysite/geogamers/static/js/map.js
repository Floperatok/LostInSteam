
'use strict';

async function guessPos(pos, panoId) {
	const path = "/api/guess/pos/";
	try {
		const response = await fetch(path, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": csrftoken
			},
			body: JSON.stringify({ pos, panoId })
		});
		if (!response.ok) {
			throw new Error(`${response.status} - ${path}`);
		}
		const data = await response.json();
		return data;

	} catch (error) {
		console.error(`Fetch: ${error}`);
		return null;
	}
}

function loadMap(mapData) {
	var mapBounds = mapData["bounds"];

	document.getElementById("map").style.backgroundColor = mapData["bg_color"];

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

	map.doubleClickZoom.disable();
	L.DomUtil.addClass(map._container,'crosshair-cursor-enabled');
	
	var baseUrl = `/api/maps/${mapData["id"]}`;
	L.tileLayer(`${baseUrl}/{z}/{x}/{y}.jpg`, {
		noWrap: true,
		maxNativeZoom: mapData["tile_depth"],
		maxZoom: mapData["tile_depth"] + 1,
		tms: true,
		keepBuffer: 20,
	}).addTo(map);
	
	var guessPosBtn = document.getElementById('guess_pos_btn')
	function onMapClick(e) {
		guessPosBtn.style.display = "block";
		if (mapMarker) {
			map.removeLayer(mapMarker);
		}
		mapMarker = new L.marker(e.latlng).addTo(map);
		// mapMarker = new L.marker(e.latlng).addTo(map)
		// 	.bindPopup(`${e.latlng}`);
	}

	guessPosBtn.addEventListener('click', function() {
		map.off('click', onMapClick);
		setTimeout(() => {
			map.on('click', onMapClick);
		}, 10);
	});
	map.on('click', onMapClick);
}