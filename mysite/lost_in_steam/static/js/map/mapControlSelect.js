
'use strict';

class MapControlSelect {
	constructor(mapManager, mapsData) {
		console.log(`[MAP-CONTROL-SELECT] - constructor : mapManager=${mapManager}, mapsData=${mapsData}`);
		this.type = "select";
		if (!mapManager) {
			console.error("[MAP-CONTROL-SELECT] - mapManager is not defined");
		}
		if (!mapsData) {
			console.error("[MAP-CONTROL-SELECT] - mapsData is not defined");
		}

		this._mapContainer = mapManager.container;
		this._mapsData = mapsData;
		this._mapManager = mapManager;

		this.#create();
		this.#setupListeners();
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

	#stopPropagationHandler(event) {
		event.preventDefault();
		event.stopPropagation();
	}

	#openMenuHandler = (event) => {
		if (this._closeMenuTimeout) {
			clearTimeout(this._closeMenuTimeout);
			this._closeMenuTimeout = null;
		}
		this._listDiv.style.transform = "translateY(-100%)";
	}

	#closeMenuHandler = async (event) => {
		if (this.element.contains(event.relatedTarget) &&
			event.relatedTarget != this.element) {
			return ;
		}
		this._closeMenuTimeout = setTimeout(() => {
			this._listDiv.style.transform = "";
			this._mouseOutTimeout = null;
		}, 1000);
	}

	#forceCloseMenuHandler = (event) => {
		if (event.target !== this.element) {
			console.log("[MAP-CONTROL-SELECT] - handling force close menu");
			this._listDiv.style.transform = "";
		}
	}

	#mapSelectBtnHandler = async (event, index) => {
		event.preventDefault();
		event.stopPropagation();

		this._mapManager.unloadMap();
		await this._mapManager.load(this._mapsData[index].id);
		this._mapManager.centerMap();
	}

	#setupListeners() {
		console.log("[MAP-CONTROL-SELECT] - setting up listeners");
		this._headerDiv.addEventListener("click", this.#stopPropagationHandler);
		this._listDiv.addEventListener("wheel", this.#stopPropagationHandler);
		this._headerDiv.addEventListener("mouseenter", this.#openMenuHandler);
		this.element.addEventListener("mouseout", this.#closeMenuHandler);
		document.addEventListener("click", this.#forceCloseMenuHandler);
		this._mapSelectHandlers = [];
		for (let index = 0; index < this._mapSelectBtn.length; index++) {
			const handler = (event) => this.#mapSelectBtnHandler(event, index);

			this._mapSelectBtn[index].addEventListener("click", handler);
			this._mapSelectHandlers.push({button: this._mapSelectBtn[index], handler: handler});
		}
	}

	#create() {
		console.log("[MAP-CONTROL-SELECT] - creating DOM elements");
		this.element = document.createElement("div");
		this.element.classList.add("map-control", "map-selection");
		this._headerDiv = document.createElement("div");
		this._headerDiv.classList.add("map-selection-header")
		this._headerDiv.innerText = "Map Selection";
		this._listDiv = document.createElement("div");
		this._listDiv.classList.add("map-selection-list");
		this._mapSelectBtn = [];
		for (let index = 0; index < this._mapsData.length; index++) {
			const button = this.#createControlButton("map-select", this._mapsData[index].name);
			this._mapSelectBtn.push(button);
			this._listDiv.appendChild(button);
		}
		this.element.appendChild(this._headerDiv);
		this.element.appendChild(this._listDiv);
	}

	hide() {
		console.log("[MAP-CONTROL-SELECT] - hide");
		this.element.classList.add("hidden");
	}

	display() {
		console.log("[MAP-CONTROL-SELECT] - display");
		this.element.classList.remove("hidden");
	}

	destroy() {
		console.log("[MAP-CONTROL-SELECT] - destroy");
		this._headerDiv.removeEventListener("click", this.#stopPropagationHandler);
		this._listDiv.removeEventListener("wheel", this.#stopPropagationHandler);
		this._headerDiv.removeEventListener("mouseenter", this.#openMenuHandler);
		this.element.removeEventListener("mouseout", this.#closeMenuHandler);
		document.removeEventListener("click", this.#forceCloseMenuHandler);
		this._mapSelectHandlers.forEach(({ button, handler }) => {
			button.removeEventListener("click", handler);
		});
		this.element.remove();
	}
}
