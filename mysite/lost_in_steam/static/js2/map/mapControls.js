
'use strict';

class MapControls {
	constructor(mapContainer) {
		console.log(`[MAP-CONTROLS] - constructor : mapContainer=${mapContainer}`);
		this.mapContainer = mapContainer;
		if (!this.mapContainer) {
			console.error("[MAP-CONTROLS] - map container element is null");
		}
		this.scale = null;
		this.select = null;
		this.marker = null;
		this.guessButton = null;
	}

	new(control) {
		console.log(`[MAP-CONTROLS] - new control : ${typeof control}`);
		switch (typeof control) {
			case "MapControlScale":
				this.destroyScale();
				this.scale = control;
				break;
			case "MapControlSelect":
				this.destroySelect();
				this.select = control;
				break;
			case "MapControlMarker":
				this.destroyMarker();
				this.marker = control;
				break;
			case "MapControlGuessButton":
				this.destroyGuessButton();
				this.guessButton = control;
				break;
			default:
				console.warn(`[MAP-CONTROLS] - unrecognized control type : ${typeof control}`)
				break;
		}
		this.mapContainer.appendChild(control.element);
	}

	displayScale() {
		if (this.scale) {
			console.log("[MAP-CONTROLS] - display scale");
			this.scale.display();
		}
	}

	displaySelect() {
		if (this.select) {
			console.log("[MAP-CONTROLS] - display select");
			this.select.display();
		}
	}

	displayMarker() {
		if (this.marker) {
			console.log("[MAP-CONTROLS] - display marker");
			this.marker.display();
		}
	}

	displayGuessButton() {
		if (this.guessButton) {
			console.log("[MAP-CONTROLS] - display guess button");
			this.guessButton.display();
		}
	}

	displayAll() {
		console.log("[MAP-CONTROLS] - display all controls");
		this.displayScale();
		this.displaySelect();
		this.displayMarker();
		this.displayGuessButton();
	}

	hideScale() {
		if (this.scale) {
			console.log("[MAP-CONTROLS] - hide scale");
			this.scale.hide();
		}
	}

	hideSelect() {
		if (this.select) {
			console.log("[MAP-CONTROLS] - hide select");
			this.select.hide();
		}
	}

	hideMarker() {
		if (this.marker) {
			console.log("[MAP-CONTROLS] - hide marker");
			this.marker.hide();
		}
	}

	hideGuessButton() {
		if (this.guessButton) {
			console.log("[MAP-CONTROLS] - hide guess button");
			this.guessButton.hide();
		}
	}

	hideAll() {
		console.log("[MAP-CONTROLS] - hide all controls");
		this.hideScale();
		this.hideSelect();
		this.hideMarker();
		this.hideGuessButton();
	}

	destroyScale() {
		if (this.scale) {
			console.log("[MAP-CONTROLS] - destroy scale");
			this.scale.destroy();
			this.mapContainer.removeChild(this.scale.element);
			this.scale = null;
		}
	}

	destroySelect() {
		if (this.select) {
			console.log("[MAP-CONTROLS] - destroy select");
			this.select.destroy();
			this.mapContainer.removeChild(this.select.element);
			this.select = null;
		}
	}

	destroyMarker() {
		if (this.marker) {
			console.log("[MAP-CONTROLS] - destroy marker");
			this.marker.destroy();
			this.mapContainer.removeChild(this.marker.element);
			this.marker = null;
		}
	}

	destroyGuessButton() {
		if (this.guessButton) {
			console.log("[MAP-CONTROLS] - destroy guess button");
			this.guessButton.destroy();
			this.mapContainer.removeChild(this.guessButton.element);
			this.guessButton = null;
		}
	}

	destroyAll() {
		console.log("[MAP-CONTROLS] - destroy all controls");
		this.destroyScale();
		this.destroySelect();
		this.destroyMarker();
		this.destroyGuessButton();
	}
}
