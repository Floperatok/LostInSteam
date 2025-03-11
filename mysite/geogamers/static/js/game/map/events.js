
'use strict';

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
	return ({ scaleLevel, scaleClass });
}


function getContainerScaleLevel(container) {
	const scale = getContainerScale(container);
	return (scale.scaleLevel);
}


function getContainerScaleClass(container) {
	const scale = getContainerScale(container);
	return (scale.scaleClass);
}


function disableMarkerOnClick(map) {
	if (map._mapClickHandler) {
		map.off('click', map._mapClickHandler);
		delete map._mapClickHandler;
	}
}


function enableMarkerOnClick(map) {
	function onMapClick(e) {
		document.getElementById('guess_pos_btn').style.display = "block";
		if (mapLayerGroup.getLayers().length > 0) {
			mapLayerGroup.clearLayers();
		}
		L.marker(e.latlng).addTo(mapLayerGroup).bindPopup(`${e.latlng}`);
	}
	map._mapClickHandler = onMapClick;
	map.on('click', map._mapClickHandler);
}


function disableMouseHover(map) {
	if (map._mouseOverHandling) {
		map.off('mouseover', map._mouseOverHandling);
		delete map._mouseOverHandling;
	}
	if (map._mouseOutHandling) {
		map.off('mouseout', map._mouseOutHandling);
		delete map._mouseOutHandling;
	}
}


function enableMouseHover(map, container) {
	function onMouseOver(e) {
		if (map._containerScale) {
			container.classList.remove("map_mouse_out");
			container.classList.add(map._containerScale);
		}
	}

	function onMouseOut(e) {
		map._containerScale = getContainerScaleClass(container);
		container.classList.remove(map._containerScale);
		container.classList.add("map_mouse_out");
	}
	map._mouseOverHandling = onMouseOver;
	map._mouseOutHandling = onMouseOut;
	map.on("mouseover", map._mouseOverHandling);
	map.on("mouseout", map._mouseOutHandling);
}


function scaleUpMap(container) {
	let scale = getContainerScaleLevel(container);
	if (scale >= 4) {
		return ;
	}
	container.classList.remove(`scale${scale}`);
	container.classList.add(`scale${scale + 1}`);
}


function scaleDownMap(container) {
	let scale = getContainerScaleLevel(container);
	if (scale <= 0) {
		return ;
	}
	container.classList.remove(`scale${scale}`);
	container.classList.add(`scale${scale - 1}`);
}


function leafletControls(map, container) {
	const scaleMapControl = L.control({ position: "bottomright"});

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
