
'use strict';

class MapControlSelect {
	constructor({mapManager, mapsData}) {
		console.log(`[MAP-CONTROL-SELECT] - constructor : mapManager=${mapManager}, mapsData=${mapsData}`);
		this.mapManager = mapManager;
		if (!this.mapManager) {
			console.error("[MAP-CONTROL-SELECT] - mapManager is null");
		}
		this.mapContainer = mapManager.container;
		if (!this.mapContainer) {
			console.error("[MAP-CONTROL-SELECT] - map container element not found");
		}
		this.mapsData = mapsData;
		if (!this.mapsData) {
			console.error("[MAP-CONTROL-SELECT] - mapsData is null");
		}
		this.currentMapIndex = 0;
		this.#create();
		this.#setupListeners();
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

	#stopPropagationHandler(event) {
		event.preventDefault();
		event.stopPropagation();
	}

	#openMenuHandler = (event) => {
		console.log("[MAP-CONTROL-SELECT] - handling open menu");
		this.listDiv.style.transform = "translateY(-100%)";
	}

	#closeMenuHandler = async (event) => {
		console.log("[MAP-CONTROL-SELECT] - handling close menu");
		if (this.element.contains(event.relatedTarget) &&
			event.relatedTarget != this.element) {
			return ;
		}
		await new Promise(r => setTimeout(r, 1000));
		if (this.element.querySelector(":hover")) {
			return ;
		}
		this.listDiv.style.transform = "";
	}

	#forceCloseMenuHandler = (event) => {
		console.log("[MAP-CONTROL-SELECT] - handling force close menu");
		if (event.target !== this.element) {
			this.listDiv.style.transform = "";
		}
	}

	#mapSelectBtnHandler = (event, index) => {
		event.preventDefault();
		event.stopPropagation();

		this.mapManager.unload();
		this.mapManager.load(this.mapsData[index].id);
	}

	#setupListeners() {
		console.log("[MAP-CONTROL-SELECT] - setting up listeners");
		this.headerDiv.addEventListener("click", this.#stopPropagationHandler);
		this.listDiv.addEventListener("wheel", this.#stopPropagationHandler);
		this.headerDiv.addEventListener("mouseenter", this.#openMenuHandler);
		this.element.addEventListener("mouseout", this.#closeMenuHandler);
		document.addEventListener("click", this.#forceCloseMenuHandler);

		this.mapSelectHandlers = [];
		for (let index = 0; index < this.mapSelectBtn.length; index++) {
			const handler = (event) => this.#mapSelectBtnHandler(event, index);

			this.mapSelectBtn[index].addEventListener("click", handler);
			this.mapSelectHandlers.push({button, handler});
		}
	}

	#create() {
		console.log("[MAP-CONTROL-SELECT] - creating DOM elements");
		this.element = document.createElement("div");
		this.element.classList.add("map-control", "map-selection");
		this.headerDiv = document.createElement("div");
		this.headerDiv.classList.add("map-selection-header")
		this.headerDiv.innerText = "Map Selection";
		this.listDiv = document.createElement("div");
		this.listDiv.classList.add("map-selection-list");
		this.mapSelectBtn = [];
		for (let index = 0; index < this.mapsData.length; index++) {
			const button = this.#createControlButton("map-select", this.mapsData[index].name);
			this.mapSelectBtn.push(button);
			this.listDiv.appendChild(button);
		}
		this.element.appendChild(this.headerDiv);
		this.element.appendChild(this.listDiv);
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
		this.headerDiv.removeEventListener("click", this.#stopPropagationHandler);
		this.listDiv.removeEventListener("wheel", this.#stopPropagationHandler);
		this.headerDiv.removeEventListener("mouseenter", this.#openMenuHandler);
		this.element.removeEventListener("mouseout", this.#closeMenuHandler);
		document.removeEventListener("click", this.#forceCloseMenuHandler);
		this.mapSelectHandlers.forEach((button, handler) => {
			button.removeEventListener("click", handler);
		});
		this.element.remove();
	}
}
