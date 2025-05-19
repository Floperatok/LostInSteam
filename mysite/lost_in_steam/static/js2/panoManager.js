
'use strict';

const MAX_RESOLUTION_ZOOM_MULT = 5
const MAX_V_FOV = 100
const MAX_H_FOV = 120

class PanoManager {
	constructor({panoContainerId, compassContainerId}) {
		console.log(`[PANO-MANAGER] - constructor : panoContainerId=${panoContainerId}, compassContainerId=${compassContainerId}`);
		this.container = document.getElementById(panoContainerId);
		if (!this.container) {
			console.error("[PANO-MANAGER] - pano container element not found");
		}
		this.viewer = this.#initViewer();
		if (!this.viewer) {
			console.error("[PANO-MANAGER] - viewer initialization failed");
		}
		this.compass = new Compass(compassContainerId, this.viewer);
		this.panoId = null;
		this.gameId = null;
		this.settings = null;
	}

	unloadPano() {
		console.log("[PANO-MANAGER] - unloading pano");
		this.viewer.destroyAllScenes();
	}

	async loadRandomPano() {	
		console.log("[PANO-MANAGER] - loading random pano");
		var response;
		try {
			response = await getApiJson(`/api/randompano/`);
		} catch (error) {
			console.error(`[PANO-MANAGER] - error fetching random pano: ${error.message}`);
			return ;
		}
		
		this.panoId = response.id;
		this.gameId = response.gameId;
		this.settings = response.settings;
		this.#load(this.viewer, response);
	}
	
	async loadPano(gameName, panoNumber) {
		console.log("[PANO-MANAGER] - loading pano");
		if (!gameName) {
			console.error("Error: cannot fetch pano: no game name provided");
			return ;
		}
		const data = await postApiJson("/api/command/goto", {
			gameName: gameName,
			panoNumber: panoNumber,
		});
		this.panoId = data.id;
		this.gameId = data.gameId;
		this.settings = data.settings;
		this.#load();
	}

	#initViewer() {
		console.log("[PANO-MANAGER] - initializing viewer");
		var Marzipano = window.Marzipano;
		var viewerOpts = {
			controls: {
				mouseViewMode: "drag"
			}
		};
		return (new Marzipano.Viewer(this.container, viewerOpts));
	}

	async #load() {
		var Marzipano = window.Marzipano;
	
		if (!this.panoId || !this.settings) {
			console.error("[PANO-MANAGER] - Cannot load pano : No panorama informations found")
			return ;
		}
		const urlPrefix = "/api/pano";
		var tilesUrl = `${urlPrefix}/${this.panoId}`;
	
		try {
			var source = Marzipano.ImageUrlSource.fromString(
				`${tilesUrl}/{z}/{f}/{y}/{x}.jpg`,
				{ cubeMapPreviewUrl: `${tilesUrl}/preview.jpg` });
			var geometry = new Marzipano.CubeGeometry(this.settings.levels);
			var limiter = Marzipano.RectilinearView.limit.traditional(
				this.settings.faceSize*MAX_RESOLUTION_ZOOM_MULT, 
				MAX_V_FOV*Math.PI/180, 
				MAX_H_FOV*Math.PI/180);
			var view = new Marzipano.RectilinearView(
				this.settings.initialViewParameters, 
				limiter);
			
			var scene = this.viewer.createScene({
				source: source,
				geometry: geometry,
				view: view,
				pinFirstLevel: false
			});
			scene.switchTo();
	
		} catch (error) {
			console.error(`[PANO-MANAGER] - Error loading panorama : ${error}`);
			return ;
		}
		if (!this.settings.initialViewParameters) {
			console.warn("[PANO-MANAGER] - no initial view parameters found");
		}
		this.compass.set_yaw(this.settings.initialViewParameters.yaw);
	}
}
