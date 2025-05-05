
'use strict';


function createControlA(classes, innerText) {
	const elem = document.createElement("a");
	elem.href = "#";
	if (typeof classes === "string") {
		classes = [classes];
	}
	elem.classList.add(...classes);
	elem.innerText = innerText;
	return (elem);
}


function disableMarkerOnClick(map) {
	if (map._mapClickHandler) {
		map.off('click', map._mapClickHandler);
		delete map._mapClickHandler;
	}
}


function enableMarkerOnClick(map) {
	function onMapClick(e) {
		map._container.querySelector(".map-control-guess-pos").style.display = "block";
		mapLayerGroup.clearLayers();
		map._userMarker = L.marker(e.latlng);
		map._userMarker._mapId = map._id;

		map._userMarker.bindPopup(e.latlng.toString());

		map._userMarker.addTo(mapLayerGroup);
	}
	map._mapClickHandler = onMapClick;
	map.on('click', map._mapClickHandler);
}


function mapContainerMouseHover(map, container) {
	let isHovered = false;
	function onMouseOver(event) {
		isHovered = true;
		container.classList.add("map-mouse-over");
	}

	document.addEventListener("click", function(event) {
		if (!container.contains(event.target)) {
			isHovered = false;
			container.classList.remove("map-mouse-over");
		}
	});

	async function onMouseOut(event) {
		isHovered = false;
		if (!container.classList.contains("scale0")) {

			await new Promise(r => setTimeout(r, 1000));
		}
		if (isHovered) {
			return ;
		}
		container.classList.remove("map-mouse-over");
	}
	map.on("mouseover", onMouseOver);
	map.on("mouseout", onMouseOut);
}


function createMapControls(container) {

	// guess position button
	const guessPosControlDiv = document.createElement("div");
	guessPosControlDiv.classList.add("map-control", "map-control-guess-pos");
	const guessPosControlA = createControlA("guess-pos", "");
	const guessPosIcon = document.createElement("div");
	guessPosIcon.classList.add("check-mark");
	guessPosControlA.appendChild(guessPosIcon);
	guessPosControlDiv.appendChild(guessPosControlA);

	// change map menu
	const mapSelectionControlDiv = document.createElement("div");
	mapSelectionControlDiv.classList.add("map-control", "map-control-map-selection");
	const mapSelectionControlHeaderDiv = document.createElement("div");
	mapSelectionControlHeaderDiv.classList.add("map-control-map-selection-header")
	mapSelectionControlHeaderDiv.innerText = "Map Selection";
	const mapSelectionControlListDiv = document.createElement("div");
	mapSelectionControlListDiv.classList.add("map-control-map-selection-list");
	mapSelectionControlDiv.appendChild(mapSelectionControlHeaderDiv);
	mapSelectionControlDiv.appendChild(mapSelectionControlListDiv);

	// map scale buttons
	const scaleControlDiv = document.createElement("div");
	scaleControlDiv.classList.add("map-control", "map-control-scale");
	const scaleUpControlA = createControlA("scale_up_map", "+");
	const scaleDownControlA = createControlA("scale_down_map", "-");
	scaleControlDiv.appendChild(scaleUpControlA);
	scaleControlDiv.appendChild(scaleDownControlA);

	// map attribution
	const attributionControlDiv = document.createElement("div");
	attributionControlDiv.classList.add("map-control", "map-control-attribution");
	const attributionA = createControlA("map-attribution", "Map");
	attributionA.target = "_blank"
	attributionControlDiv.appendChild(attributionA);


	// controls event listeners
	guessPosControlA.addEventListener("click", function(event) {

	})
	scaleUpControlA.addEventListener("click", function(event) {
		event.stopPropagation();
		event.preventDefault();
		scaleUpMap(container);
	});
	scaleDownControlA.addEventListener("click", function(event) {
		event.stopPropagation();
		event.preventDefault();
		scaleDownMap(container);
	});
	mapSelectionControlHeaderDiv.addEventListener("click", function(event) {
		event.preventDefault();
		event.stopPropagation();
	});
	mapSelectionControlListDiv.addEventListener("wheel", function(event) {
		event.stopPropagation();
	})
	mapSelectionMenuAnimation(
		mapSelectionControlHeaderDiv, 
		mapSelectionControlListDiv,
		mapSelectionControlDiv
	);

	container.appendChild(mapSelectionControlDiv);
	container.appendChild(guessPosControlDiv);
	container.appendChild(scaleControlDiv);
	container.appendChild(attributionControlDiv);
}
