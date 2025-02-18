
'use strict';

const MAX_RESOLUTION_ZOOM_MULT = 5
const MAX_V_FOV = 100
const MAX_H_FOV = 120

async function getRandomPanoInfos(currentPanoId) {
	const path = `/api/randompano/${currentPanoId}`
	try {
		const response = await fetch(path, {
			method: "GET",
			headers: {
				"X-CSRFToken": csrftoken
			},
		});
		const data = response.json();
		return data;

	} catch (error) {
		console.error(`Fetch: ${error}`);
		return null;
	}
}


async function createPanoScene(viewer, panoInfos) {
	var Marzipano = window.Marzipano;

	if (!panoInfos) {
		console.error("No panorama informations found")
		return null;
	}
	const urlPrefix = "/api/panos";
	var tilesUrl = `${urlPrefix}/${panoInfos.id}`;

	try {
		var source = Marzipano.ImageUrlSource.fromString(
			`${tilesUrl}/{z}/{f}/{y}/{x}.jpg`,
			{ cubeMapPreviewUrl: `${tilesUrl}/preview.jpg` });
		var geometry = new Marzipano.CubeGeometry(panoInfos.settings.levels);
		var limiter = Marzipano.RectilinearView.limit.traditional(
			panoInfos.settings.faceSize*MAX_RESOLUTION_ZOOM_MULT, 
			MAX_V_FOV*Math.PI/180, 
			MAX_H_FOV*Math.PI/180);
		var view = new Marzipano.RectilinearView(
			panoInfos.settings.initialViewParameters, 
			limiter);
		
		var scene = viewer.createScene({
			source: source,
			geometry: geometry,
			view: view,
			pinFirstLevel: false
		});
		return (scene);

	} catch (error) {
		console.error(`Error loading panorama: ${error}`);
		return null;
	}
}

function unloadViewer(viewer) {
	if (viewer) {
		viewer.destroy();
	}
}

function initMarzipano() {
	var data = {
		"settings": {
			"mouseViewMode": "drag",
			"autorotateEnabled": false,
		}
	};
	var Marzipano = window.Marzipano;
	var panoElement = document.getElementById("pano");

	var viewerOpts = {
		controls: {
			mouseViewMode: data.settings.mouseViewMode
		}
	};
	var viewer = new Marzipano.Viewer(panoElement, viewerOpts);

	return (viewer);
}

async function switchRandomScene(viewer, currentPanoId) {
	const mapWrapper = document.getElementById("map_wrapper");
	const guessGameForm = document.getElementById("guess_game_form");
	mapWrapper.style.display = "none";
	guessGameForm.style.display = "flex";

	var panoInfos = await getRandomPanoInfos(currentPanoId);
	var scene = await createPanoScene(viewer, panoInfos);
	scene.switchTo();
	return panoInfos;
}
