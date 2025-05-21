
'use strict';

class ResultUI {
	constructor(resultContainerId, app) {
		console.log(`[RESULT-UI] - constructor : resultContainerId=${resultContainerId}, app=${app}`);
		if (!app) {
			console.error("[RESULT-UI] - app is not defined");
		}
		this.element = document.getElementById(resultContainerId);
		if (!this.element) {
			console.error("[RESULT-UI] - result element not found");
		}
		this.points = this.element.querySelector("#points");
		if (!this.points) {
			console.error("[RESULT-UI] - points element not found");
		}
		this.nextButton = this.element.querySelector("#next_btn");
		if (!this.nextButton) {
			console.error("[RESULT-UI] - next element not found");
		}

		this._app = app;
		this.#setupListeners();
	}

	#handleNextGame = (event) => {
		event.stopPropagation();
		event.preventDefault();
		console.log("[RESULT-UI] - handling next game");
		this._app.mapManager.destroyMap();
		this._app.displayGameScreen();
	} 
	
	#setupListeners() {
		this.nextButton.addEventListener("click", this.#handleNextGame);
	}
}
