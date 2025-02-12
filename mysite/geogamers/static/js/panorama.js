
'use strict';

const MAX_RESOLUTION_ZOOM_MULT = 5
const MAX_V_FOV = 100
const MAX_H_FOV = 120

async function getPanoInfos(game_id, pano_number) {
	const path = `/api/panoinfo/${game_id}/${pano_number}`
	try {
		const response = await fetch(path, {method: "GET"});
		if (!response.ok) {
			throw new Error(`${response.status} - ${path}`);
		}
		const data = await response.json();
		return data;

	} catch (error) {
		console.error(`Fetch: ${error}`);
		return null;
	}
}

async function createPanoScene(viewer, game_id, pano_number) {
	var Marzipano = window.Marzipano;

	const panoInfo = await getPanoInfos(game_id, pano_number);
	if (!panoInfo) {
		console.error("No panorama informations found")
		return null;
	}
	const urlPrefix = "/api/tiles";
	var tilesUrl = `${urlPrefix}/${panoInfo["game_id"]}/${panoInfo["number"]}`;

	try {
		var source = Marzipano.ImageUrlSource.fromString(
			`${tilesUrl}/{z}/{f}/{y}/{x}.jpg`,
			{ cubeMapPreviewUrl: `${tilesUrl}/preview.jpg` });
		var geometry = new Marzipano.CubeGeometry(panoInfo["settings"].levels);
		var limiter = Marzipano.RectilinearView.limit.traditional(
			panoInfo["settings"].faceSize*MAX_RESOLUTION_ZOOM_MULT, 
			MAX_V_FOV*Math.PI/180, 
			MAX_H_FOV*Math.PI/180);
		var view = new Marzipano.RectilinearView(
			panoInfo["settings"].initialViewParameters, 
			limiter);
		
		var scene = viewer.createScene({
			source: source,
			geometry: geometry,
			view: view,
			pinFirstLevel: false
		});
		console.log("Scene created");
		return (scene);

	} catch (error) {
		console.error(`Error loading panorama: ${error}`);
		return null;
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
