
'use strict';

class MapControlAttribution {
	constructor(src) {
		console.log(`[MAP-CONTROL-ATTRIBUTION] - constructor : src=${src}`);
		this.type = "attribution";
		if (!src) {
			console.warn("[MAP-CONTROL-ATTRIBUTION] - no src");
		}
		this.src = src;
		this.#create();
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

	#create() {
		this.element = document.createElement("div");
		this.element.classList.add("map-control", "attribution");
		this._attributionButton = this.#createControlButton("attribution-button", "Map");
		this._attributionButton.target = "_blank";
		if (this.src) {
			this._attributionButton.href = this.src;
		}
		this.element.appendChild(this._attributionButton);
	}

	hide() {
		this.element.classList.add("hidden");
	}

	display() {
		this.element.classList.remove("hidden");
	}

	destroy() {
		this.element.remove();
	}
}
