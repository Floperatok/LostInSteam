
'use strict';

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


function disableMouseOver(map) {

}


function enableMouseOver(map) {
	map.on("mouseover", onMouseOver);
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
