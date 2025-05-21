
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
		this.mapId = 0;

		this._resizeObserver = new ResizeObserver(entries => {
			for (let entry of entries) {
				if (entry.target.id === this.container.id) {
					this.leaflet.invalidateSize();
				}
			}
		})
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
		this.container.classList.add("map-mouse-over");
	}

	#onMouseOutHandler = async () => {
		this.container.classList.add("map-mouse-over");
		await new Promise(r => setTimeout(r, 1000));
		if (document.querySelector(`#${this.container.id}:hover`)) {
			return ;
		}
		this.container.classList.remove("map-mouse-over");
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
		const zoom = this.leaflet.getBoundsZoom(this._mapBounds) + 1;
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

	newMarker({pos, iconUrl, shadowUrl, iconAnchor}) {
		console.log(`[MAP-MANAGER] - new marker at ${pos.lat},${pos.lng} with icon '${iconUrl}'`);
		var icon;
		try {
			icon = L.icon({
				iconUrl: iconUrl,
				shadowUrl: shadowUrl,
				iconAnchor: iconAnchor,
			});
		} catch {
			console.error("[MAP-MANAGER] - error fetching marker icon");
			return ;
		}
		const marker = L.marker(pos, {icon: icon}).addTo(this.leaflet);
		return (marker);
	}

	newPolyline({pos1, pos2}) {
		console.log(`[MAP-MANAGER] - new polyline from ${pos1.lat},${pos1.lng} to ${pos2.lat},${pos2.lng}`);
		const polyline = L.polyline([pos1, pos2], {
			color: "white",
			dashArray: "20, 20",
		}).addTo(this.leaflet);
		return (polyline);
	}

	async load(mapId) {
		console.log(`[MAP-MANAGER] - loading map from id : ${mapId}`);
		this.mapId = mapId;
		var response;
		try {
			response = await getApiJson(`/api/map/info/${mapId}`);
		} catch (error) {
			console.error(`[MAP-MANAGER] - error fetching map: ${error.message}`);
			return ;
		}
		this._mapBounds = response.bounds;
		this.container.style.backgroundColor = response.bgColor;
		L.tileLayer(`/api/map/${mapId}/{z}/{y}/{x}.jpg`, {
			noWrap: true,
			maxNativeZoom: response.tileDepth,
			maxZoom: response.tileDepth + 1,
			minZoom: 0,
			keepBuffer: 20,
		}).addTo(this.leaflet);
	}

	unloadMap() {
		console.log("[MAP-MANAGER] - unloading map");
		this.leaflet.eachLayer(layer => layer.remove());
	}

	destroyMap() {
		console.log("[MAP-MANAGER] - destroying map");
		this.leaflet.eachLayer(layer => layer.remove());
		this.controls.destroyAll();
		this.container.remove();
	}
}
