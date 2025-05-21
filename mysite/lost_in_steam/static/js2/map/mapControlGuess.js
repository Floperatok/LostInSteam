
'use strict';

class MapControlGuess {
	constructor(app) {
		console.log(`[MAP-CONTROL-GUESS] - constructor : app=${app}`);
		this.type = "guess";
		if (!leaflet) {
			console.error("[MAP-CONTROL-GUESS] - leaflet is not defined");
		}
		this._marker = null;

		if (!app) {
			console.error("[MAP-CONTROL-GUESS] - app is not defined");
		}
		this._app = app;
		
		this.#create();
		this.#setupListeners();
		this.hide();
	}

	#createControlButton(classes, innerText) {
		const elem = document.createElement("a");
		elem.href = "#";
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
		if (this._marker) {
			this._app.mapManager.leaflet.removeLayer(this._marker);
		}
		this.display();
		this._marker = L.marker(event.latlng);
		// this._marker.bindPopup(e.latlng.toString());
		this._app.mapManager.leaflet.addLayer(this._marker);
	}

	#handleMapGuess = async (event) => {
		event.stopPropagation();
		event.preventDefault();
		console.log("[MAP-CONTROL-GUESS] - handling map guess")
		var response;
		try {
			response = await postApiJson("/api/guess/pos/", {
				gameId: this._app.panoManager.gameId,
				pos: this._app.mapManager.controls.guess.getMarkerPos(),
				panoId: this._app.panoManager.panoId,
			})
		} catch (error) {
			console.error(`[MAP-CONTROL-GUESS] - error fetching results: ${error.message}`);
			return ;
		}
		this._app.displayResultScreen();
		this._app.displayResultMap(response);
		this._app.panoManager.unloadPano();
		await this._app.panoManager.loadRandomPano();
		this._app.gamePoster.loadPoster(this._app.panoManager.gameId);
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

	getMarkerPos() {
		if (this._marker) {
			return (this._marker.getLatLng());
		}
		console.warn("[MAP-CONTROL-GUESS] - tried to access marker position but marker is not defined");
		return (null);
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
		this._app.mapManager.leaflet.removeLayer(this._marker);
		this.element.remove();
	}
}
