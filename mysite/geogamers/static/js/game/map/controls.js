
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


function getContainerScale(container) {
	let scaleClass = container.className.match(/\bscale\d+\b/);
	let scaleLevel;
	if (scaleClass) {
		scaleLevel = parseInt(scaleClass[0].replace("scale", ""), 10);
	} else {
		scaleLevel = 0;
	}
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
		mapLayerGroup.clearLayers();
		map._userMarker = L.marker(e.latlng);
		map._userMarker._mapId = map._id;
		map._userMarker.addTo(mapLayerGroup);
	}
	map._mapClickHandler = onMapClick;
	map.on('click', map._mapClickHandler);
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


function mapSelectionMenuAnimation(menuTrigger, menuList, menuContainer) {
	menuTrigger.addEventListener("mouseenter", async function(event) {
		menuList.style.transform = "translateY(0%)";
	});

	menuContainer.addEventListener("mouseout", async function(event) {
		if (menuContainer.contains(event.relatedTarget) &&
			event.relatedTarget != menuContainer) {
			return ;
		}
		await new Promise(r => setTimeout(r, 1000));
		if (menuContainer.querySelector(":hover")) {
			return ;
		}
		menuList.style.transform = "translateY(-100%)";
	});
} 


function mapSelectionListControl(map, mapsData, container) {
	const selectionListDiv = container.querySelector(".map-control-map-selection-list");
	selectionListDiv.innerHTML = "";
	if (mapsData.length == 1) {
		container.querySelector(".map-control-map-selection").style.display = "";
		return null;
	}
	container.querySelector(".map-control-map-selection").style.display = "block";

	for (let index = 0; index < mapsData.length; index++) {
		let mapSelectBtn;
		if (index == 0) {
			mapSelectBtn = createControlA(["map-select", "current-map"], mapsData[index].name);
		} else {
			mapSelectBtn = createControlA("map-select", mapsData[index].name);
		}
		
		mapSelectBtn.addEventListener("click", async function(event) {
			event.preventDefault();
			event.stopPropagation();
			if (event.target.classList.contains("current-map")) {
				return ;
			}
			selectionListDiv.querySelector(".current-map").classList.remove("current-map");
			mapSelectBtn.classList.add("current-map");
			await loadMap(map, mapsData[index].id, container);

			// if result map, manage markers when switching map
			if (container.classList.contains("map_result") && 
			selectionListDiv.querySelector(".current-map.answer-map")) {
				displayResultUI(map, map._resultPos);
			} else {
				centerMap(map);
			}
		});
		selectionListDiv.appendChild(mapSelectBtn);
	}
	return (selectionListDiv);
}


function mapContainerMouseHover(map, container) {

	let scale = getContainerScaleClass(container);
	
	function onMouseOver(e) {
		container.classList.add(scale);
	}

	function onMouseOut(e) {
		scale = getContainerScaleClass(container);
		container.classList.remove(scale);
	}
	map.on("mouseover", onMouseOver);
	map.on("mouseout", onMouseOut);
}


function createMapControls(container) {
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
	mapSelectionMenuAnimation(mapSelectionControlHeaderDiv, 
		mapSelectionControlListDiv,
		mapSelectionControlDiv);

	container.appendChild(scaleControlDiv);
	container.appendChild(mapSelectionControlDiv);
	container.appendChild(attributionControlDiv);
}
