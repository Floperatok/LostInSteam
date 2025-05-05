
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


function displayResultUI(map, answerPos) {
	const icon = L.icon({
		iconUrl: '/static/image/marker-icon.png',
		shadowUrl: '/static/image/marker-shadow.png',
		iconAnchor: [12, 41],
	})
	var answerMarker = new L.marker(L.latLng(answerPos.lat, answerPos.lng), {icon: icon})
		.addTo(mapLayerGroup)
	if (map._userMarker._mapId == map._id) {
		var polyline = L.polyline([map._userMarker.getLatLng(), answerMarker.getLatLng()], {
			color: "white",
			dashArray: "20, 20",
		}).addTo(mapLayerGroup);
		map.setView(polyline.getCenter(), map.getBoundsZoom(polyline.getBounds()) - 1, true);
	} else {
		map.setView(answerMarker.getLatLng(), map.getMaxZoom() - 2, true);
	}
}


async function centerMap(map) {
	const center = L.latLng(
		(map._bounds[0][0] + map._bounds[1][0]) / 2, 
		(map._bounds[0][1] + map._bounds[1][1]) / 2
	);
	const zoom = map.getBoundsZoom(map._bounds) + 1;
	map.setView(center, zoom, true);
}


async function displayResultMap(map, mapsData, container, result) {
	container.style.opacity = "0";
	if (!container.classList.contains("map_result")) {
		container.classList.toggle("map_result");
	}
	if (container.classList.contains("minimap")) {
		container.classList.toggle("minimap");
	}
	map._resultPos = result.answerPos;
	
	await loadMap(map, result.answerMapId, container);
	mapSelectionListControl(map, mapsData, container);

	
	displayResultUI(map, result.answerPos);
	disableMarkerOnClick(map);
	container.classList.remove("crosshair-cursor-enabled");
	container.style.opacity = "";
}


async function displayMinimap(map, mapsData, container) {
	if (container.classList.contains("map_result")) {
		container.classList.toggle("map_result");
	}
	if (!container.classList.contains("minimap")) {
		container.classList.toggle("minimap");
	}

	mapSelectionListControl(map, mapsData, container);

	container.style.opacity = "0";
	container.style.display = "block";
	map.invalidateSize(false);
	centerMap(map);

	enableMarkerOnClick(map);
	container.classList.add("crosshair-cursor-enabled");
	container.style.opacity = "";
}
