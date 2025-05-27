
'use strict';

class MapManager {
	constructor(mapContainer) {
		console.log(`[MAP-MANAGER] - constructor : mapContainer=${mapContainer}`);
		this.container = mapContainer;
		if (!this.container) {
			console.error("[MAP-MANAGER] - map container element not found");
		}
		this.leaflet = this.#initLeaflet();
		if (!this.leaflet) {
			console.error("[MAP-MANAGER] - leaflet initialization failed");
		}
		this.controls = new MapControls(this.container);
		this.markers = new MapMarkers(this.leaflet);
		this.polylines = new MapPolylines(this.leaflet);
		this.mapId = 0;

		this._resizeObserver = new ResizeObserver(entries => {
			for (let entry of entries) {
				if (entry.target.id === this.container.id) {
					this.leaflet.invalidateSize();
				}
			}
		});
		this._tileLayer = null;
		this._mapBounds = null;
		this._resetMouseOutCooldown = 0;
		this._resizeObserver.observe(this.container);
		this.hideMap();
	}
	
	#initLeaflet() {
		console.log("[MAP-MANAGER] - initializing leaflet");
		return (L.map(this.container, {
			zoomSnap: 0.1,
			scrollWheelZoom: false,
			smoothWheelZoom: true,
			smoothSensitivity: 1,
			doubleClickZoom: false,
			zoomControl: false,
			crs: L.CRS.Simple,
		}));
	}

	#onMouseOverHandler = () => {
		if (this._mouseOutTimeout) {
			clearTimeout(this._mouseOutTimeout);
			this._mouseOutTimeout = null;
		}
		this.container.classList.add("map-mouse-over");
	}

	#onMouseOutHandler = async () => {
		this._mouseOutTimeout = setTimeout(() => {
			this.container.classList.remove("map-mouse-over");
			this._mouseOutTimeout = null;
		}, 1000);
	}

	#forceOnMouseOutHandler = async (event) => {
		if (event.target !== this.container &&
			!this.container.contains(event.target) &&
			this.container.classList.contains("map-mouse-over")) {
			console.log("[MAP-MANAGER] - force mouse out");
			this.container.classList.remove("map-mouse-over");
		}
	}

	enableMouseHover() {
		console.log("[MAP-MANAGER] - enable mouse hover listener");
		this.container.addEventListener("mouseover", this.#onMouseOverHandler);
		this.container.addEventListener("mouseout", this.#onMouseOutHandler);
		document.body.addEventListener("mousedown", this.#forceOnMouseOutHandler);
	}

	disableMouseHover() {
		console.log("[MAP-MANAGER] - disable mouse hover listener");
		this.container.removeEventListener("mouseover", this.#onMouseOverHandler);
		this.container.removeEventListener("mouseout", this.#onMouseOutHandler);
		document.body.removeEventListener("mousedown", this.#forceOnMouseOutHandler);
	}

	centerMap() {
		console.log("[MAP-MANAGER] - center map");
		const center = L.latLng(
			(this._mapBounds[0][0] + this._mapBounds[1][0]) / 2, 
			(this._mapBounds[0][1] + this._mapBounds[1][1]) / 2
		);
		const zoom = this.leaflet.getBoundsZoom(this._mapBounds);
		this.leaflet.setView(center, zoom, true);
	}

	displayMap() {
		console.log("[MAP-MANAGER] - display map");
		this.container.classList.remove("hidden");
		this.leaflet.invalidateSize(false);
	}

	hideMap() {
		console.log("[MAP-MANAGER] - hide map");
		this.container.classList.add("hidden");
	}

	async load(mapId) {
		console.log(`[MAP-MANAGER] - loading map from id : ${mapId}`);
		if (mapId == this.mapId) {
			console.warn("[MAP-MANAGER] - the requested map is already loaded, aborting...");
			return ;
		}
		this.mapId = mapId;
		var response;
		try {
			response = await getApiJson(`/api/map/info/${mapId}`);
		} catch (error) {
			console.error(`[MAP-MANAGER] - error fetching map: ${error.message}`);
			return ;
		}
		this._mapBounds = response.bounds;
		this.mapAttribution = response.attribution;
		this.container.style.backgroundColor = response.bgColor;
		this._tileLayer = L.tileLayer(`/api/map/${mapId}/{z}/{y}/{x}.jpg`, {
			noWrap: true,
			maxNativeZoom: response.tileDepth,
			maxZoom: response.tileDepth + 1,
			minZoom: 0,
			keepBuffer: 20,
		}).addTo(this.leaflet);
		this.markers.setCurrentMapId(this.mapId);
		this.polylines.setCurrentMapId(this.mapId);
	}

	unloadMap() {
		console.log("[MAP-MANAGER] - unloading map");
		if (this._tileLayer) {
			this._tileLayer.remove();
		}
		this.mapId = null;
		this._mapBounds = null;
		this._tileLayer = null;
		this.markers.setCurrentMapId(null);
		this.polylines.setCurrentMapId(null);
		this.container.classList.remove("map-mouse-over");
	}

	destroyMap() {
		console.log("[MAP-MANAGER] - destroying map");
		this.leaflet.eachLayer(layer => layer.remove());
		this.markers.destroyAll();
		this.markers.setCurrentMapId(null);
		this.polylines.destroyAll();
		this.polylines.setCurrentMapId(null);
		this.controls.destroyAll();
		this.container.remove();
		this.mapId = null;
		this._mapBounds = null;
		this._tileLayer = null;
		this.container.classList.remove("map-mouse-over");
	}
}
