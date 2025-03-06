
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
		return (response.json());

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
		return (response.json());

	} catch (error) {
		console.error(`Fetch: ${error}`);
		return null;
	}
}


function logMapLayers(map) {
	let tiles = 0;
	let marker = 0;
	let line = 0;
	let layerGroup = 0;
	let other = 0;
	map.eachLayer(function(layer) {
		if (layer instanceof L.TileLayer) {
			tiles++;
		}
		else if (layer instanceof L.Marker) {
			marker++;
		}
		else if (layer instanceof L.Polyline) {
			line++;
		}
		else if (layer instanceof L.LayerGroup) {
			layerGroup++;
		}
		else {
			other++;
		}
	});
	console.log(`MAP LAYERS: tiles:${tiles} markers:${marker} line:${line} layerGroup: ${layerGroup} other:${other}`);
}


function addMarkerOnClick(map) {
	var guessPosBtn = document.getElementById('guess_pos_btn')

	function onMapClick(e) {
		logMapLayers(map);
		guessPosBtn.style.display = "block";
		if (mapLayerGroup.getLayers().length > 0) {
			mapLayerGroup.clearLayers();
		}
		// guessMarker = new L.marker(e.latlng).addTo(map);
		L.marker(e.latlng).addTo(mapLayerGroup).bindPopup(`${e.latlng}`);
	}

	guessPosBtn.addEventListener('click', function() {
		map.off('click', onMapClick);
		setTimeout(() => {
			map.on('click', onMapClick);
		}, 10);
	});
	map.on('click', onMapClick);
}


async function loadMap(map, mapId, container) {
	var mapData = await getMapInfos(mapId);
	document.querySelector(".leaflet-control-attribution").innerHTML = 
		mapData["attribution"] ? `<a href="${mapData['attribution']}" target="_blank">Map</a>` : "";
	container.style.backgroundColor = mapData["bg_color"];

	if (mapLayerGroup.getLayers().length > 0) {
		mapLayerGroup.clearLayers();
	}
	map.eachLayer(function (layer) {
		if (layer instanceof L.TileLayer) {
			map.removeLayer(layer);
		}
	});


	var baseUrl = `/api/maps/${mapData["id"]}`;
	L.tileLayer(`${baseUrl}/{z}/{x}/{y}.jpg`, {
		noWrap: true,
		maxNativeZoom: mapData["tile_depth"],
		maxZoom: mapData["tile_depth"] + 1,
		minZoom: 1,
		tms: true,
		keepBuffer: 20,
	}).addTo(map);
}


function initLeaflet(container) {

	var map = L.map(container, {
        scrollWheelZoom: false,
        smoothWheelZoom: true,
        smoothSensitivity: 1,
		doubleClickZoom: false,
	});
	mapLayerGroup = L.layerGroup().addTo(map);
	return (map);
}


async function displayResultMap(map, container, result) {

	container.querySelector("#guess_pos_btn").style.display = "none";
	if (!container.classList.contains("map_result")) {
		container.classList.toggle("map_result");
	}
	if (container.classList.contains("map_ingame")) {
		container.classList.toggle("map_ingame");
	}

	const guessMarker = mapLayerGroup.getLayers()[0];
	const icon = L.icon({
		iconUrl: '/static/image/marker-icon.png',
		shadowUrl: '/static/image/marker-shadow.png',
		iconAnchor: [12, 41],
	})

	var answerMarker = new L.marker(L.latLng(result.answer_lat, result.answer_lng), {icon: icon})
		.addTo(mapLayerGroup);
	var polyline = L.polyline([guessMarker.getLatLng(), answerMarker.getLatLng()], {
		color: "white",
		dashArray: "20, 20",
	}).addTo(mapLayerGroup);

	map.setView(polyline.getCenter(), map.getBoundsZoom(polyline.getBounds()));
	map.invalidateSize()
}


async function displayMinimap(map, container) {
	container.querySelector("#guess_pos_btn").style.display = "none";
	if (container.classList.contains("map_result")) {
		container.classList.toggle("map_result");
	}
	if (!container.classList.contains("map_ingame")) {
		container.classList.toggle("map_ingame");
	}

	container.style.display = "block";
	
	addMarkerOnClick(map);
	L.DomUtil.addClass(map._container,'crosshair-cursor-enabled');
	map.setView([0, 0], 3);
	map.invalidateSize()
}