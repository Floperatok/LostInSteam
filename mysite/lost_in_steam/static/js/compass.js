
'use strict';

class Compass {
	constructor(compassContainerId, viewer) {
		console.log(`[COMPASS] - constructor : compassContainerId=${compassContainerId}, viewer=${viewer}`);
		if (!viewer) {
			console.error("[COMPASS] - viewer is not defined");
		}
		this.container = document.getElementById(compassContainerId);
		if (!this.container) {
			console.error("[COMPASS] - compass container element not found");
		}

		this._graduations = this.container.querySelector("#compass_graduations");
		if (!this._graduations) {
			console.error("[COMPASS] - graduations element not found");
		}
		this._chunk = this.container.querySelector(".compass_graduations_chunk");
		if (!this._chunk) {
			console.error("[COMPASS] - chunk element not found");
		}
		this._chunkWidth = this._chunk.offsetWidth;
		this._centerOffset = this._chunkWidth 
			- this._graduations.offsetWidth / 2 
			+ this._graduations.querySelector(".compass_cardinal").offsetWidth / 2;
		this._yaw = 0;
		this._viewer = viewer;

		this.#setupListeners();
	}

	#viewChangeHandler = () => {
		const translateX = -(this._viewer.view()._yaw - this._yaw) 
			* (this._chunkWidth / Math.PI / 2) - this._centerOffset;
		this._graduations.style.transform = `translateX(${translateX}px)`;
	}

	#setupListeners() {
		console.log("[COMPASS] - setting up listeners");
		this._viewer.addEventListener("viewChange", this.#viewChangeHandler);
	}

	set_yaw(yaw) {
		if (!yaw) {
			return ;
		}
		console.log(`[COMPASS] - set yaw to : ${yaw}`);
		this._yaw = yaw;
	}

	display() {
		console.log("[COMPASS] - display");
		this.container.classList.remove("hidden");
	}

	hide() {
		console.log("[COMPASS] - hide");
		this.container.classList.add("hidden");
	}
}
