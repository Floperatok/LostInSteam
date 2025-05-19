
'use strict';

class MapControlMarker {
	constructor(leaflet) {
		console.log(`[MAP-CONTROL-MARKER] - constructor : leaflet=${leaflet}`);
		this.leaflet = leaflet;
		if (!this.leaflet) {
			console.error("[MAP-CONTROL-MARKER] - leaflet is null");
		}
		this.marker = null;
		this.element = null;
		this.#setupListeners();
	}

	#onMapClickHandler = (e) => {
		console.log("[MAP-CONTROL-MARKER] - handling map click");
		this.marker = L.marker(e.latlng);
		this.leaflet.removeLayer(this.marker);
		// this.marker.bindPopup(e.latlng.toString());
		this.leaflet.addLayer(this.marker);
	}

	#setupListeners() {
		console.log("[MAP-CONTROL-MARKER] - setting up listeners");
		this.leaflet.on("click", this.#onMapClickHandler);
	}

	getPos() {
		if (this.marker) {
			return (this.marker.getLatLng());
		}
		console.warn("[MAP-CONTROL-MARKER] - tried to access marker \
			position but marker is null");
		return (null);
	}

	hide() {
		console.log("[MAP-CONTROL-MARKER] - hide");
		// this.element.classList.add("hidden");
	}

	display() {
		console.log("[MAP-CONTROL-MARKER] - display");
		// this.element.classList.remove("hidden");
	}
	
	destroy() {
		console.log("[MAP-CONTROL-MARKER] - destroy");
		this.leaflet.off("click", this.#onMapClickHandler);
	}
}
