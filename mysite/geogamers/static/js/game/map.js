
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
		const data = response.json();
		return (data);

	} catch (error) {
		console.error(`Fetch: ${error}`);
		return null;
	}
}

async function getMapInfos(mapId) {
	const path = `/api/map/${mapId}`
	try {
		const response = await fetch(path, {
			method: "GET",
			headers: {
				"X-CSRFToken": csrftoken
			},
		});
		const data = await response.json();
		return data;

	} catch (error) {
		console.error(`Fetch: ${error}`);
		return null;
	}
}

function addMarkerOnClick(map) {
	var guessPosBtn = document.getElementById('guess_pos_btn')
	function onMapClick(e) {
		guessPosBtn.style.display = "block";
		if (guessMarker) {
			map.removeLayer(guessMarker);
		}
		// guessMarker = new L.marker(e.latlng).addTo(map);
		guessMarker = new L.marker(e.latlng).addTo(map)
			.bindPopup(`${e.latlng}`);
	}

	guessPosBtn.addEventListener('click', function() {
		map.off('click', onMapClick);
		setTimeout(() => {
			map.on('click', onMapClick);
		}, 10);
	});
	map.on('click', onMapClick);
	return (map);
}

function unloadMap(map) {
	if (map) {
		map.remove();
	}
}

async function loadMap(containerId, mapId, boundMap = false) {
	var mapData = await getMapInfos(mapId);
	var mapBounds = mapData["bounds"];

	document.getElementById(containerId).style.backgroundColor = mapData["bg_color"];

	var map = L.map(containerId, {
        scrollWheelZoom: false,
        smoothWheelZoom: true,
        smoothSensitivity: 1,
		maxBounds: boundMap ? mapBounds : null,
		maxBoundsViscosity: 1.0,
	});
	document.querySelector(".leaflet-control-attribution").innerHTML = 
		mapData["attribution"] ? `<a href="${mapData['attribution']}" target="_blank">Map</a>` : "";

	map.setMinZoom(1);
	map.setView([0, 0], map.getBoundsZoom(mapBounds, false));

	map.doubleClickZoom.disable();
	
	var baseUrl = `/api/maps/${mapData["id"]}`;
	L.tileLayer(`${baseUrl}/{z}/{x}/{y}.jpg`, {
		noWrap: true,
		maxNativeZoom: mapData["tile_depth"],
		maxZoom: mapData["tile_depth"] + 1,
		tms: true,
		keepBuffer: 20,
	}).addTo(map);
	return (map);
}
