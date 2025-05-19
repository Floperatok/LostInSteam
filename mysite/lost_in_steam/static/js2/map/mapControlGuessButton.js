
'use strict';

class MapControlGuessButton {
	constructor() {
		console.log(`[MAP-CONTROL-GUESS-BUTTON] - constructor`);
		this.#create();
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

	#create() {
		console.log("[MAP-CONTROL-GUESS-BUTTON] - creating DOM elements");
		this.element = document.createElement("div");
		this.element.classList.add("map-control", "guess-button");
		this.guessButton = this.#createControlButton("guess-pos", "");
		this.guessButtonIcon = document.createElement("div");
		this.guessButtonIcon.classList.add("check-mark");
		this.guessButton.appendChild(this.guessButtonIcon);
		this.element.appendChild(this.guessButton);
	}

	hide() {
		console.log("[MAP-CONTROL-GUESS-BUTTON] - hide");
		this.element.classList.add("hidden");
	}

	display() {
		console.log("[MAP-CONTROL-GUESS-BUTTON] - display");
		this.element.classList.remove("hidden");
	}

	destroy() {
		this.element.remove();
	}
}