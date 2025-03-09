
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


function onMapClick(e) {
	document.getElementById('guess_pos_btn').style.display = "block";
	if (mapLayerGroup.getLayers().length > 0) {
		mapLayerGroup.clearLayers();
	}
	L.marker(e.latlng).addTo(mapLayerGroup).bindPopup(`${e.latlng}`);
}


function disableMarkerOnClick(map) {
	map.off('click', onMapClick);
}


function enableMarkerOnClick(map) {
	const guessPosBtn = document.getElementById('guess_pos_btn');

	guessPosBtn.removeEventListener('click', handleDisableMarkerOnButtonPress);
	guessPosBtn.addEventListener('click', handleDisableMarkerOnButtonPress);
	map.on('click', onMapClick);

	function handleDisableMarkerOnButtonPress(event) {
		map.off('click', onMapClick);
		setTimeout(() => {
			map.on('click', onMapClick);
		}, 10);
	}
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
	
	L.tileLayer(`/api/map/${mapData.id}/{z}/{y}/{x}.png`, {
		noWrap: true,
		maxNativeZoom: 9,
		maxZoom: 10,
		noWrap: true,
		maxNativeZoom: mapData.tileDepth,
		maxZoom: mapData.tileDepth + 1,
		minZoom: 0,
		keepBuffer: 20,
	}).addTo(map);
	return (mapData);
}


function initLeaflet(container) {

	var map = L.map(container, {
		zoomSnap: 0.1,
        scrollWheelZoom: false,
        smoothWheelZoom: true,
        smoothSensitivity: 1,
		doubleClickZoom: false,
		crs: L.CRS.Simple,
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

	disableMarkerOnClick(map);

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
	L.DomUtil.removeClass(map._container, 'crosshair-cursor-enabled');

	map.setView(polyline.getCenter(), map.getBoundsZoom(polyline.getBounds()));
	setTimeout(function(){ map.invalidateSize(true);}, 100);
}


async function displayMinimap(map, mapId, container) {
	container.querySelector("#guess_pos_btn").style.display = "none";
	if (container.classList.contains("map_result")) {
		container.classList.toggle("map_result");
	}
	if (!container.classList.contains("map_ingame")) {
		container.classList.toggle("map_ingame");
	}
	container.style.opacity = "0";
	container.style.display = "block";
	map.invalidateSize();

	const mapData = await loadMap(map, mapId, container);

	L.marker(mapData.bounds[0]).addTo(mapLayerGroup).bindPopup(`${mapData.bounds[0]}`);
	L.marker(mapData.bounds[1]).addTo(mapLayerGroup).bindPopup(`${mapData.bounds[1]}`);
	var center = L.latLng(
		(mapData.bounds[0][0] + mapData.bounds[1][0]) / 2, 
		(mapData.bounds[0][1] + mapData.bounds[1][1]) / 2
	);
	map.setView(center, map.getBoundsZoom(mapData.bounds));

	enableMarkerOnClick(map);
	L.DomUtil.addClass(map._container, 'crosshair-cursor-enabled');
	container.style.animation = "fadeIn 0.2s";
	container.style.opacity = "1";
}
