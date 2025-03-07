
'use strict';

function logMapLayers(map) {
	let tiles = 0;
	let marker = 0;
	let line = 0;
	let layerGroup = 0;
	let other = 0;
	map.eachLayer(function(layer) {
		if (layer instanceof L.TileLayer) {
			tiles++;
		} else if (layer instanceof L.Marker) {
			marker++;
		} else if (layer instanceof L.Polyline) {
			line++;
		} else if (layer instanceof L.LayerGroup) {
			layerGroup++;
		} else {
			other++;
		}
	});
	console.log(`MAP LAYERS: tiles:${tiles} markers:${marker} line:${line} layerGroup: ${layerGroup} other:${other}`);
}


function addMarkerOnClick(map) {
	var guessPosBtn = document.getElementById('guess_pos_btn')

	function onMapClick(e) {
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
	const mapData = await getApi(`/api/map/info/${mapId}`);
	document.querySelector(".leaflet-control-attribution").innerHTML = 
		mapData.attribution ? `<a href="${mapData.attribution}" target="_blank">Map</a>` : "";
	container.style.backgroundColor = mapData.bgColor;

	if (mapLayerGroup.getLayers().length > 0) {
		mapLayerGroup.clearLayers();
	}
	map.eachLayer(function (layer) {
		if (layer instanceof L.TileLayer) {
			map.removeLayer(layer);
		}
	});


	var baseUrl = `/api/map/${mapData.id}`;
	L.tileLayer(`${baseUrl}/{z}/{x}/{y}.jpg`, {
		noWrap: true,
		maxNativeZoom: mapData.tileDepth,
		maxZoom: mapData.tileDepth + 1,
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

	var answerMarker = new L.marker(L.latLng(result.answerLat, result.answerLng), {icon: icon})
		.addTo(mapLayerGroup);
	var polyline = L.polyline([guessMarker.getLatLng(), answerMarker.getLatLng()], {
		color: "white",
		dashArray: "20, 20",
	}).addTo(mapLayerGroup);

	map.setView(polyline.getCenter(), map.getBoundsZoom(polyline.getBounds()));
	setTimeout(function(){ map.invalidateSize(true)}, 100);
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