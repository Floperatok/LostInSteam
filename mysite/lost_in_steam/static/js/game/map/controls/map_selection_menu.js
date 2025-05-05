
'use strict';


function mapSelectionMenuAnimation(menuTrigger, menuList, menuContainer) {
	menuTrigger.addEventListener("mouseenter", async function(event) {
		menuList.style.transform = "translateY(-100%)";
	});

	document.addEventListener("click", function(event) {
		if (event.target !== menuContainer) {
			menuList.style.transform = "";
		}
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
		menuList.style.transform = "";
	});
}


async function handleMapSelectBtn(event, map) {
	event.preventDefault();
	event.stopPropagation();
	if (event.target.classList.contains("current-map")) {
		return ;
	}
	const selectionListDiv = map._container.querySelector(".map-control-map-selection-list");
	selectionListDiv.querySelector(".current-map").classList.remove("current-map");
	event.target.classList.add("current-map");
	
	const buttonMapId = event.target.getAttribute("mapId");
	await loadMap(map, buttonMapId, map._container);

	// if result map, manage markers when switching map
	if (map._container.classList.contains("map_result") 
		&& buttonMapId == selectionListDiv.querySelector(".answer-map").getAttribute("mapId")) {
		displayResultUI(map, map._resultPos);
	} else {
		centerMap(map);
	}
}


function mapSelectionListControl(map, mapsData, container) {
	const selectionListDiv = container.querySelector(".map-control-map-selection-list");
	selectionListDiv.innerHTML = "";
	if (mapsData.length == 1) {
		container.querySelector(".map-control-map-selection").style.display = "";
		return ;
	
	}
	container.querySelector(".map-control-map-selection").style.display = "block";

	for (let index = 0; index < mapsData.length; index++) {
		const mapSelectBtn = createControlA("map-select", mapsData[index].name);
		if (mapsData[index].id == map._id) {
			mapSelectBtn.classList.add("current-map");
			if (container.classList.contains("map_result")) {
				mapSelectBtn.classList.add("answer-map");
			}
		}
		mapSelectBtn.setAttribute("mapId", mapsData[index].id);
		mapSelectBtn.addEventListener("click", (event) => handleMapSelectBtn(event, map))
		selectionListDiv.appendChild(mapSelectBtn);
	}
}
