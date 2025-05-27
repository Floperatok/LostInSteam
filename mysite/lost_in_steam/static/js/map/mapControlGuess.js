
'use strict';

class MapControlGuess {
	constructor(app, markersManager) {
		console.log(`[MAP-CONTROL-GUESS] - constructor : app=${app}`);
		this.type = "guess";
		if (!app) {
			console.error("[MAP-CONTROL-GUESS] - app is not defined");
		}
		this._app = app;
		if (!markersManager) {
			console.error("[MAP-CONTROL-GUESS] - markersManager is not defined");
		}
		this._markerManager = markersManager;
		
		this.#create();
		this.#setupListeners();
		this.hide();
	}

	#createControlButton(classes, innerText) {
		const elem = document.createElement("a");
		if (typeof classes === "string") {
			classes = [classes];
		}
		elem.classList.add(...classes);
		elem.innerText = innerText;
		elem.target = "_blank";
		return (elem);
	}

	#onMapClickHandler = (event) => {
		console.log("[MAP-CONTROL-GUESS] - handling map click");
		this.display();
		this._markerManager.add(event.latlng, "player", this._app.mapManager.mapId);
	}

	#handleMapGuess = async (event) => {
		event.stopPropagation();
		event.preventDefault();
		console.log("[MAP-CONTROL-GUESS] - handling map guess")
		var response;
		try {
			response = await postApiJson("/api/guess/pos/", {
				guessedMapId: this._app.mapManager.markers.player.mapId,
				pos: this._markerManager.player.getLatLng(),
				panoId: this._app.panoManager.panoId,
			})
		} catch (error) {
			console.error(`[MAP-CONTROL-GUESS] - error fetching results: ${error.message}`);
			return ;
		}
		this._app.positionGuessed(response);
	}

	enableMarkerPlacement() {
		console.log("[MAP-CONTROL-GUESS] - enabling marker placement");
		this._app.mapManager.container.classList.add("crosshair-cursor-enabled");
		this._app.mapManager.leaflet.on("click", this.#onMapClickHandler);
	}

	disableMarkerPlacement() {
		console.log("[MAP-CONTROL-GUESS] - disabling marker placement");
		this._app.mapManager.container.classList.remove("crosshair-cursor-enabled");
		this._app.mapManager.leaflet.off("click", this.#onMapClickHandler);
	}

	#setupListeners() {
		this.element.addEventListener("click", this.#handleMapGuess);
		this.enableMarkerPlacement();
	}

	#create() {
		console.log("[MAP-CONTROL-GUESS] - creating DOM elements");
		this.element = document.createElement("div");
		this.element.classList.add("map-control", "guess-button");
		this._guessButton = this.#createControlButton("guess-pos", "");
		this._guessButtonIcon = document.createElement("div");
		this._guessButtonIcon.classList.add("check-mark");
		this._guessButton.appendChild(this._guessButtonIcon);
		this.element.appendChild(this._guessButton);
	}

	hide() {
		console.log("[MAP-CONTROL-GUESS] - hide");
		this.element.classList.add("hidden");
	}

	display() {
		console.log("[MAP-CONTROL-GUESS] - display");
		this.element.classList.remove("hidden");
	}

	destroy() {
		console.log("[MAP-CONTROL-GUESS] - destroy");
		this._app.mapManager.container.classList.remove("crosshair-cursor-enabled");
		this._app.mapManager.leaflet.off("click", this.#onMapClickHandler);
		this.element.removeEventListener("click", this.#handleMapGuess);
		this.element.remove();
	}
}
