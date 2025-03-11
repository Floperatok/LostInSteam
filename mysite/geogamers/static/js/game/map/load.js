
'use strict';

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
		zoomControl: false,
		crs: L.CRS.Simple,
	});
	mapLayerGroup = L.layerGroup().addTo(map);
	leafletControls(map, container);
	return (map);
}