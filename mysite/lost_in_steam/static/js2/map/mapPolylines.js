
'use strict';

class MapPolylines {
	constructor(leaflet) {
		console.log(`[MAP-POLYLINES] - constructor : leaflet=${leaflet}`)
		if (!leaflet) {
			console.error("[MAP-POLYLINES] - leaflet is null");
		}
		this._leaflet = leaflet;
		this._currentMapId = null;

		this._COLOR = "white";
		this._DASH_ARRAY = "20, 20";

		this.polylines = [];
	}

	setCurrentMapId(currentMapId) {
		this._currentMapId = currentMapId;
		this.polylines.forEach(polyline => {
			polyline.remove();
			if (polyline.mapId == currentMapId) {
				polyline.addTo(this._leaflet);
			}
		});
	}

	add(from, to, mapId) {
		if (!from || !to) {
			console.error("[MAP-POLYLINES] - two positions needs to be provided");
			return ;
		}
		if (!this._currentMapId) {
			console.warn("[MAP-POLYLINES] - trying to add polyline but currentMapId is undefined");
		}
		console.log(`[MAP-POLYLINES] - add polyline : from=${from}, to=${to}`);
		const polyline = L.polyline([from, to], {
			color: this._COLOR,
			dashArray: this._DASH_ARRAY,
		});
		polyline.mapId = mapId;
		this.polylines.push(polyline);
		if (this._currentMapId == mapId) {
			polyline.addTo(this._leaflet);
		}
		return (polyline);
	}

	addFromMarkers(marker1, marker2) {
		console.log("[MAP-POLYLINES] - add polyline from markers");
		if (marker1.mapId != marker2.mapId) {
			console.log("[MAP-POLYLINES] - marker1 and marker2 are not on the same map, aborting...");
			return (null);
		}
		return (this.add(marker1.getLatLng(), marker2.getLatLng(), marker1.mapId));
	}

	destroyAll() {
		console.log("[MAP-POLYLINES] - destroying all polylines");
		this.polylines.forEach(polyline => polyline.remove());
		this.polylines = [];
	}
}
