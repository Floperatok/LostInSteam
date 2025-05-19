
'use strict';

class MapManager {
	constructor(mapContainer) {
		console.log(`[MAP-MANAGER] - constructor : mapContainer=${mapContainer}`);
		this.container = mapContainer;
		if (!this.container) {
			console.error("[MAP-MANAGER] - map container element not found");
		}
		this.controls = new MapControls(this.container);
		this.leaflet = this.#initLeaflet();
		if (!this.leaflet) {
			console.error("[MAP-MANAGER] - leaflet initialization failed");
		}
		this.hideMap();
		this.mapId = 0;
		this.mapBounds = null;
		this.resizeObserver = new ResizeObserver(entries => {
			for (let entry of entries) {
				if (entry.target.id === this.container.id) {
					this.leaflet.invalidateSize();
				}
			}
		})
		this.resizeObserver.observe(this.container);
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
		console.log("[MAP-MANAGER] - mouse over");
		this.container.classList.add("map-mouse-over");
	}

	#onMouseOutHandler = async () => {
		console.log("[MAP-MANAGER] - mouse out");
		this.container.classList.add("map-mouse-over");
		await new Promise(r => setTimeout(r, 1000));
		if (document.querySelector(`#${this.container.id}:hover`)) {
			return ;
		}
		this.container.classList.remove("map-mouse-over");
	}

	#enableMouseHover() {
		console.log("[MAP-MANAGER] - enable mouse hover listener");
		this.container.addEventListener("mouseover", this.#onMouseOverHandler);
		this.container.addEventListener("mouseout", this.#onMouseOutHandler);
	}

	#disableMouseHover() {
		console.log("[MAP-MANAGER] - disable mouse hover listener");
		this.container.removeEventListener("mouseover", this.#onMouseOverHandler);
		this.container.removeEventListener("mouseout", this.#onMouseOutHandler);
	}

	centerMap() {
		console.log("[MAP-MANAGER] - center map");
		const center = L.latLng(
			(this.mapBounds[0][0] + this.mapBounds[1][0]) / 2, 
			(this.mapBounds[0][1] + this.mapBounds[1][1]) / 2
		);
		const zoom = this.leaflet.getBoundsZoom(this.mapBounds) + 1;
		this.leaflet.setView(center, zoom, true);
	}

	displayResultMap() {
		console.log("[MAP-MANAGER] - display result-map");
		if (this.state === "resultmap") {
			return ;
		}
		this.state = "resultmap";
		this.controls.display();
		this.#disableMouseHover();
		this.container.classList.remove("hidden");
		this.container.classList.remove("minimap");
		this.container.classList.add("map_result");
		this.container.classList.remove("crosshair-cursor-enabled");
	}

	displayMinimap() {
		console.log("[MAP-MANAGER] - display mini-map");
		if (this.state === "minimap") {
			return ;
		}
		this.state = "minimap";
		this.controls.displayAll();
		this.#enableMouseHover();
		this.container.style.opacity = "0";
		this.container.classList.remove("map_result");
		this.container.classList.remove("hidden");
		this.container.classList.add("minimap");
		this.container.classList.add("crosshair-cursor-enabled");
		this.leaflet.invalidateSize(false);
		this.container.style.opacity = "";
	}

	hideMap() {
		console.log("[MAP-MANAGER] - hide map");
		if (this.state === "hidden") {
			return ;
		}
		this.state = "hidden";
		this.controls.hideAll();
		this.#disableMouseHover();
		this.container.classList.remove("map_result");
		this.container.classList.remove("minimap");
		this.container.classList.add("hidden");
	}

	async load(mapId) {
		console.log(`[MAP-MANAGER] - loading map from id : ${mapId}`);
		this.mapId = mapId;
		const mapSettings = await getApiJson(`/api/map/info/${mapId}`);
		this.mapBounds = mapSettings.bounds;
		this.container.style.backgroundColor = mapSettings.bgColor;

		L.tileLayer(`/api/map/${mapId}/{z}/{y}/{x}.jpg`, {
			noWrap: true,
			maxNativeZoom: mapSettings.tileDepth,
			maxZoom: mapSettings.tileDepth + 1,
			minZoom: 0,
			keepBuffer: 20,
		}).addTo(this.map.leaflet);
	}

	unload() {
		console.log("[MAP-MANAGER] - unloading map");
		this.leaflet.eachLayer(layer => layer.remove());
		this.controls.destroyAll();
	}
}
