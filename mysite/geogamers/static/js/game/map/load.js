
'use strict';

async function loadMap(map, mapId, container) {
	const mapSettings = await getApiJson(`/api/map/info/${mapId}`);

	map._id = mapId;
	map._bounds = mapSettings.bounds;

	map._zoom = 0;
	// attributions
	const attributionA = document.querySelector(".map-attribution"); 
	if (mapSettings.attribution) {
		attributionA.href = mapSettings.attribution;
		attributionA.classList.remove("hidden");
	} else {
		attributionA.href = mapSettings.attribution;
		attributionA.classList.add("hidden");
	}

	container.style.backgroundColor = mapSettings.bgColor;

	// markers management
	mapLayerGroup.clearLayers();
	map.eachLayer(function (layer) {
		if (layer != mapLayerGroup) {
			map.removeLayer(layer);
		}
	});
	if (map._userMarker && map._userMarker._mapId == map._id) {
		container.querySelector(".map-control-guess-pos").style.display = "block";
		map._userMarker.addTo(mapLayerGroup);
	}
	else {
		container.querySelector(".map-control-guess-pos").style.display = "";
	}
	
	L.tileLayer(`/api/map/${map._id}/{z}/{y}/{x}.jpg`, {
		noWrap: true,
		maxNativeZoom: mapSettings.tileDepth,
		maxZoom: mapSettings.tileDepth + 1,
		minZoom: 0,
		keepBuffer: 20,
	}).addTo(map);

	console.log(map);
}


function initLeaflet(container) {
	var map = L.map(container, {
		zoomSnap: 0.1,
        scrollWheelZoom: false,
        smoothWheelZoom: true,
        smoothSensitivity: 1,
		doubleClickZoom: false,
		zoomControl: false,
		crs: L.CRS.Simple,
	});
	map._resultPos = L.LatLng(0, 0);
	map._userMarker = null;
	
	mapLayerGroup = L.layerGroup().addTo(map);
	createMapControls(container);
	mapContainerMouseHover(map, container);
	return (map);
}
