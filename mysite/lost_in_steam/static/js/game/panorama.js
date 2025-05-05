
'use strict';

const MAX_RESOLUTION_ZOOM_MULT = 5
const MAX_V_FOV = 100
const MAX_H_FOV = 120

async function loadPanoScene(viewer, pano) {
	var Marzipano = window.Marzipano;

	if (!pano) {
		console.error("Cannot load scene: No panorama informations found")
		return null;
	}
	const urlPrefix = "/api/pano";
	var tilesUrl = `${urlPrefix}/${pano.id}`;

	try {
		var source = Marzipano.ImageUrlSource.fromString(
			`${tilesUrl}/{z}/{f}/{y}/{x}.jpg`,
			{ cubeMapPreviewUrl: `${tilesUrl}/preview.jpg` });
		var geometry = new Marzipano.CubeGeometry(pano.settings.levels);
		var limiter = Marzipano.RectilinearView.limit.traditional(
			pano.settings.faceSize*MAX_RESOLUTION_ZOOM_MULT, 
			MAX_V_FOV*Math.PI/180, 
			MAX_H_FOV*Math.PI/180);
		var view = new Marzipano.RectilinearView(
			pano.settings.initialViewParameters, 
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


function initCompass(viewer) {
	const compass = document.getElementById("compass_graduations");
	const compassChunk = document.getElementsByClassName("compass_graduations_chunk")[0];
	const centerOffset = compassChunk.offsetWidth 
		- document.getElementById("compass").offsetWidth / 2 
		+ document.getElementsByClassName("compass_cardinal")[0].offsetWidth / 2;
	viewer.addEventListener("viewChange", function() {
		compass.style.transform = `translateX(${-viewer.view()._yaw * (compassChunk.offsetWidth / Math.PI / 2) - centerOffset}px)`;
	})
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


async function switchToRandomScene(viewer) {
	const mapWrapper = document.getElementById("map_wrapper");
	const guessGameForm = document.getElementById("guess_game_form");
	guessGameForm.style.display = "flex";

	const pano = await getApiJson(`/api/randompano/`);
	viewer.destroyAllScenes();
	var scene = await loadPanoScene(viewer, pano);
	scene.switchTo();
	return (pano);
}
