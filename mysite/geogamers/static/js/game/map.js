
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


function getContainerScale(container) {
	let scaleClass = container.className.match(/\bscale\d+\b/);
	console.log(scaleClass);
	let scaleLevel;
	if (scaleClass) {
		scaleLevel = parseInt(scaleClass[0].replace("scale", ""), 10);
	} else {
		scaleLevel = 0;
	}
	console.log(`SCALE: ${scaleLevel}`);
	return (scaleLevel);
}


function scaleUpMap(container) {
	let scale = getContainerScale(container);
	if (scale >= 4) {
		return ;
	}
	container.classList.remove(`scale${scale}`);
	container.classList.add(`scale${scale + 1}`);
}


function scaleDownMap(container) {
	let scale = getContainerScale(container);
	if (scale <= 0) {
		return ;
	}
	container.classList.remove(`scale${scale}`);
	container.classList.add(`scale${scale - 1}`);
}


function leafletControls(map, container) {
	const scaleMapControl = L.control({ position: "topleft"});

	scaleMapControl.onAdd = function() {
		const div = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-scale");
		div.innerHTML = `
			<a href="#" id="scale_up_map">+</a>
        	<a href="#" id="scale_down_map">-</a>
		`;
		div.querySelector("#scale_up_map").addEventListener("click", function(e) {
			e.preventDefault();
			e.stopPropagation();
			scaleUpMap(container);
		});
		div.querySelector("#scale_down_map").addEventListener("click", function(e) {
			e.preventDefault();
			e.stopPropagation();
			scaleDownMap(container);
		});

		return (div);
	};

	scaleMapControl.addTo(map);
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


async function displayResultMap(map, container, result) {

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

	const mapData = await loadMap(map, mapId, container);
	var center = L.latLng(
		(mapData.bounds[0][0] + mapData.bounds[1][0]) / 2, 
		(mapData.bounds[0][1] + mapData.bounds[1][1]) / 2
	);
	map.setView(center, map.getBoundsZoom(mapData.bounds), false);

	enableMarkerOnClick(map);
	L.DomUtil.addClass(map._container, 'crosshair-cursor-enabled');
	container.style.opacity = "1";
}
