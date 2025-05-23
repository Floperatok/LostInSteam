
'use strict';

class MapControls {
	constructor(mapContainer) {
		console.log(`[MAP-CONTROLS] - constructor : mapContainer=${mapContainer}`);
		if (!mapContainer) {
			console.error("[MAP-CONTROLS] - map container element is not defined");
		}
		this.scale = null;
		this.select = null;
		this.guess = null;
		this.attribution = null;

		this._mapContainer = mapContainer;
	}

	add(control) {
		if (!control.type) {
			console.error("[MAP-CONTROLS] - no control type found");
			return ;
		}
		console.log(`[MAP-CONTROLS] - new control : ${control.type}`);
		switch (control.type) {
		case "scale":
			this.destroyScale();
			this.scale = control;
			break;
		case "select":
			this.destroySelect();
			this.select = control;
			break;
		case "guess":
			this.destroyGuess();
			this.guess = control;
			break;
		case "attribution":
			this.destroyAttribution();
			this.attribution = control;
			break;
		default:
			console.error(`[MAP-CONTROLS] - unrecognized control type : ${control.type}`)
			break;
		}
		if (!control.element) {
			console.warn(`[MAP-CONTROLS] - no element found for '${control.type}'`);
		} else {
			if (control.type == "attribution") {
				console.log("append attribution control to map container");
			}
			this._mapContainer.appendChild(control.element);
		}
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

	displayGuess() {
		if (this.guess) {
			console.log("[MAP-CONTROLS] - display guess");
			this.guess.display();
		}
	}

	displayAttribution() {
		if (this.attribution) {
			console.log("[MAP-CONTROLS] - display attribution");
			this.attribution.display();
		}
	}

	displayAll() {
		console.log("[MAP-CONTROLS] - display all controls");
		this.displayScale();
		this.displaySelect();
		this.displayGuess();
		this.displayAttribution();
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

	hideGuess() {
		if (this.guess) {
			console.log("[MAP-CONTROLS] - hide guess");
			this.guess.hide();
		}
	}

	hideAttribution() {
		if (this.attribution) {
			console.log("[MAP-CONTROLS] - hide attribution");
			this.attribution.hide();
		}
	}

	hideAll() {
		console.log("[MAP-CONTROLS] - hide all controls");
		this.hideScale();
		this.hideSelect();
		this.hideGuess();
		this.hideAttribution();
	}

	destroyScale() {
		if (this.scale) {
			console.log("[MAP-CONTROLS] - destroy scale");
			this._mapContainer.removeChild(this.scale.element);
			this.scale.destroy();
			this.scale = null;
		}
	}

	destroySelect() {
		if (this.select) {
			console.log("[MAP-CONTROLS] - destroy select");
			this._mapContainer.removeChild(this.select.element);
			this.select.destroy();
			this.select = null;
		}
	}

	destroyGuess() {
		if (this.guess) {
			console.log("[MAP-CONTROLS] - destroy guess");
			this._mapContainer.removeChild(this.guess.element);
			this.guess.destroy();
			this.guess = null;
		}
	}

	destroyAttribution() {
		if (this.attribution) {
			console.log("[MAP-CONTROLS] - destroy attribution");
			this._mapContainer.removeChild(this.attribution.element);
			this.attribution.destroy();
			this.attribution = null;
		}
	}

	destroyAll() {
		console.log("[MAP-CONTROLS] - destroying all controls");
		this.destroyScale();
		this.destroySelect();
		this.destroyGuess();
		this.destroyAttribution();
	}
}
