
'use strict';

const MAX_RESOLUTION_ZOOM_MULT = 5
const MAX_V_FOV = 100
const MAX_H_FOV = 120

class PanoManager {
	constructor(panoContainerId, compassContainerId) {
		console.log(`[PANO-MANAGER] - constructor : panoContainerId=${panoContainerId}, compassContainerId=${compassContainerId}`);
		this.container = document.getElementById(panoContainerId);
		if (!this.container) {
			console.error("[PANO-MANAGER] - pano container element not found");
		}
		
		this._viewer = this.#initViewer();
		if (!this._viewer) {
			console.error("[PANO-MANAGER] - viewer initialization failed");
		}
		this.compass = new Compass(compassContainerId, this._viewer);
		this.panoId = null;
		this.gameId = null;

		this._settings = null;
	}

	unloadPano() {
		console.log("[PANO-MANAGER] - unloading pano");
		this._viewer.destroyAllScenes();
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
		this._settings = response.settings;
		this.#load(this._viewer, response);
	}
	
	async loadPano(panoId, gameId, settings) {
		console.log(`[PANO-MANAGER] - loading pano from id ${panoId}`);
		this.panoId = panoId;
		this.gameId = gameId;
		this._settings = settings;
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
	
		if (!this.panoId || !this._settings) {
			console.error("[PANO-MANAGER] - Cannot load pano : No panorama informations found")
			return ;
		}
		const urlPrefix = "/api/pano";
		var tilesUrl = `${urlPrefix}/${this.panoId}`;
	
		try {
			var source = Marzipano.ImageUrlSource.fromString(
				`${tilesUrl}/{z}/{f}/{y}/{x}.jpg`,
				{ cubeMapPreviewUrl: `${tilesUrl}/preview.jpg` });
			var geometry = new Marzipano.CubeGeometry(this._settings.levels);
			var limiter = Marzipano.RectilinearView.limit.traditional(
				this._settings.faceSize*MAX_RESOLUTION_ZOOM_MULT, 
				MAX_V_FOV*Math.PI/180, 
				MAX_H_FOV*Math.PI/180);
			var view = new Marzipano.RectilinearView(
				this._settings.initialViewParameters, 
				limiter);
			
			var scene = this._viewer.createScene({
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
		if (!this._settings.initialViewParameters) {
			console.warn("[PANO-MANAGER] - no initial view parameters found");
		}
		this.compass.set_yaw(this._settings.initialViewParameters.yaw);
	}
}
