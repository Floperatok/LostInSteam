
'use strict';

class MapMarkers {
	constructor(leaflet) {
		console.log(`[MAP-MARKERS] - constructor : leaflet=${leaflet}`)
		if (!leaflet) {
			console.error("[MAP-MARKERS] - leaflet is null");
		}
		this._leaflet = leaflet;
		this._currentMapId = null;

		this._ICON_PLAYER_URL = "/static/image/player-marker-icon.png";
		this._ICON_OPPONENT_URL = "/static/image/opponent-marker-icon.png";
		this._ICON_ANSWER_URL = "/static/image/answer-marker-icon.png";
		this._ICON_SHADOW_URL = "/static/image/marker-shadow.png";
		this._ICON_ANCHOR = [12, 41];

		this.player = null;
		this.opponent = [];
		this.answer = null;
	}

	setCurrentMapId(currentMapId) {
		this._currentMapId = currentMapId;
		if (this.player) {
			this.player.remove();
			if (this.player.mapId == currentMapId) {
				this.player.addTo(this._leaflet);
			}
		}
		if (this.answer) {
			this.answer.remove();
			if (this.answer.mapId == currentMapId) {
				this.answer.addTo(this._leaflet);
			}
		}
		this.opponent.forEach(marker => {
			marker.remove();
			if (marker.mapId == currentMapId) {
				marker.addTo(this._leaflet);
			}
		});
	}

	add(pos, type, mapId) {
		if (!pos) {
			console.error("[MAP-MARKERS] - no position provided");
			return ;
		}
		if (!type) {
			console.error("[MAP-MARKERS] - no type provided");
			return ;
		}
		if (!this._currentMapId) {
			console.warn("[MAP-MARKERS] - trying to add marker but currentMapId is undefined");
		}
		console.log(`[MAP-MARKERS] - add marker : pos=${pos}, type=${type}`);
		var icon;
		switch (type) {
		case "player":
			icon = L.icon({
				iconUrl: this._ICON_PLAYER_URL,
				shadowUrl: this._ICON_SHADOW_URL,
				iconAnchor: this._ICON_ANCHOR,
			});
			this.destroyPlayer();
			this.player = L.marker(pos, {icon: icon});
			this.player.mapId = mapId;
			if (this._currentMapId == mapId) {
				this.player.addTo(this._leaflet);
			}
			return (this.player);
		case "opponent":
			icon = L.icon({
				iconUrl: this._ICON_OPPONENT_URL,
				shadowUrl: this._ICON_SHADOW_URL,
				iconAnchor: this._ICON_ANCHOR,
			});
			const marker = L.marker(pos, {icon: icon});
			marker.mapId = mapId;
			this.opponent.push(marker);
			if (this._currentMapId == mapId) {
				marker.addTo(this._leaflet);
			}
			return (marker);
		case "answer":
			icon = L.icon({
				iconUrl: this._ICON_ANSWER_URL,
				shadowUrl: this._ICON_SHADOW_URL,
				iconAnchor: this._ICON_ANCHOR,
			});
			this.destroyAnswer();
			this.answer = L.marker(pos, {icon: icon});
			this.answer.mapId = mapId;
			if (this._currentMapId == mapId) {
				this.answer.addTo(this._leaflet);
			}
			return (this.answer);
		default:
			console.error(`[MAP-MARKERS] - unknown marker type : ${type}`);
			return ;
		}
	}

	destroyPlayer() {
		if (this.player) {
			this.player.remove();
			this.player = null;
		}
	}

	destroyOpponents() {
		this.opponent.forEach(marker => marker.remove());
		this.opponent = [];
	}

	destroyAnswer() {
		if (this.answer) {
			this.answer.remove();
			this.answer = null;
		}
	}

	destroyAll() {
		console.log("[MAP-MARKERS] - destroying all markers");
		this.destroyPlayer();
		this.destroyOpponents();
		this.destroyAnswer();
	}
}
