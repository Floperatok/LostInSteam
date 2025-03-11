
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


async function displayResultMap(map, container, result) {

	if (!container.classList.contains("map_result")) {
		container.classList.toggle("map_result");
	}
	if (container.classList.contains("map_ingame")) {
		container.classList.toggle("map_ingame");
	}

	disableMarkerOnClick(map);
	disableMouseHover(map);

	const guessMarker = mapLayerGroup.getLayers()[0];
	const icon = L.icon({
		iconUrl: '/static/image/marker-icon.png',
		shadowUrl: '/static/image/marker-shadow.png',
		iconAnchor: [12, 41],
	})

	var answerMarker = new L.marker(L.latLng(result.answerLat, result.answerLng), {icon: icon})
		.addTo(mapLayerGroup).bindPopup(`${L.latLng(result.answerLat, result.answerLng)}`);
	var polyline = L.polyline([guessMarker.getLatLng(), answerMarker.getLatLng()], {
		color: "white",
		dashArray: "20, 20",
	}).addTo(mapLayerGroup);
	L.DomUtil.removeClass(map._container, 'crosshair-cursor-enabled');

	map.setView(polyline.getCenter(), map.getBoundsZoom(polyline.getBounds()));
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
	map.invalidateSize(false);

	const mapData = await loadMap(map, mapId, container);
	var center = L.latLng(
		(mapData.bounds[0][0] + mapData.bounds[1][0]) / 2, 
		(mapData.bounds[0][1] + mapData.bounds[1][1]) / 2
	);
	map.setView(center, map.getBoundsZoom(mapData.bounds), false);

	enableMarkerOnClick(map);
	enableMouseHover(map, container);
	L.DomUtil.addClass(map._container, 'crosshair-cursor-enabled');
	container.style.opacity = "1";
}
