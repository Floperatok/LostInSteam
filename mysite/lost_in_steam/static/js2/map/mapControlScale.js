
'use strict';

class MapControlScale {
	constructor(mapContainer) {
		console.log(`[MAP-CONTROL-SCALE] - constructor : mapContainer=${mapContainer}`);
		this.mapContainer = mapContainer;
		if (!this.mapContainer) {
			console.error("[MAP-CONTROL-SCALE] - map container element not found");
		}
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

	#getScaleLevel(mapContainer) {
		let scaleClass = mapContainer.className.match(/\bscale\d+\b/);
		let scaleLevel;
		if (scaleClass) {
			scaleLevel = parseInt(scaleClass[0].replace("scale", ""), 10);
		} else {
			scaleLevel = 0;
		}
		return (scaleLevel);
	}

	#scaleUpHandler = (event) => {
		event.stopPropagation();
		event.preventDefault();
		const scale = this.#getScaleLevel(this.mapContainer);
		if (scale >= 4) {
			return ;
		}
		console.log(`[MAP-CONTROL-SCALE] - handling scale up to scale : ${scale + 1}`);
		this.mapContainer.classList.remove(`scale${scale}`);
		this.mapContainer.classList.add(`scale${scale + 1}`);
	}

	#scaleDownHandler = (event) => {
		event.stopPropagation();
		event.preventDefault();
		const scale = this.#getScaleLevel(this.mapContainer);
		if (scale <= 0) {
			return ;
		}
		console.log(`[MAP-CONTROL-SCALE] - handling scale down to scale : ${scale - 1}`);
		this.mapContainer.classList.remove(`scale${scale}`);
		this.mapContainer.classList.add(`scale${scale - 1}`);
	}

	#setupListeners() {
		console.log("[MAP-CONTROL-SCALE] - setting up listeners");
		this.scaleUpButton.addEventListener("click", this.#scaleUpHandler);
		this.scaleDownButton.addEventListener("click", this.#scaleDownHandler);
	}
	
	#create() {
		console.log("[MAP-CONTROL-SCALE] - creating DOM elements");
		this.element = document.createElement("div");
		this.element.classList.add("map-control", "scale");
		this.scaleUpButton = this.#createControlButton("scale-up", "+");
		this.scaleDownButton = this.#createControlButton("scale-down", "-");
		this.element.appendChild(this.scaleUpButton);
		this.element.appendChild(this.scaleDownButton);
	}

	hide() {
		console.log("[MAP-CONTROL-SCALE] - hide");
		this.element.classList.add("hidden");
	}

	display() {
		console.log("[MAP-CONTROL-SCALE] - display");
		this.element.classList.remove("hidden");
	}

	destroy() {
		console.log("[MAP-CONTROL-SCALE] - destroy");
		this.scaleUpButton.removeEventListener("click", this.#scaleUpHandler);
		this.scaleDownButton.removeEventListener("click", this.#scaleDownHandler);
		this.element.remove();
	}
}
