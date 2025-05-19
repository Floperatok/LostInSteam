
'use strict';

class Compass {
	constructor(compassContainerId, viewer) {
		console.log(`[COMPASS] - constructor : compassContainerId=${compassContainerId}, viewer=${viewer}`);
		this.container = document.getElementById(compassContainerId);
		if (!this.container) {
			console.error("[COMPASS] - compass container element not found");
		}
		this.viewer = viewer;
		if (!this.viewer) {
			console.error("[COMPASS] - viewer is null");
		}
		this.graduations = this.container.querySelector("#compass_graduations");
		if (!this.graduations) {
			console.error("[COMPASS] - graduations element not found");
		}
		this.chunk = this.container.querySelector(".compass_graduations_chunk");
		if (!this.chunk) {
			console.error("[COMPASS] - chunk element not found");
		}
		this.chunkWidth = this.chunk.offsetWidth;
		this.centerOffset = this.chunkWidth 
			- this.graduations.offsetWidth / 2 
			+ this.graduations.querySelector(".compass_cardinal").offsetWidth / 2;
		this.yaw = 0;
		this.#setupListeners();
	}

	#viewChangeHandler = () => {
		const translateX = -(this.viewer.view()._yaw - this.yaw) 
			* (this.chunkWidth / Math.PI / 2) - this.centerOffset;
		this.graduations.style.transform = `translateX(${translateX}px)`;
	}

	#setupListeners() {
		console.log("[COMPASS] - setting up listeners");
		this.viewer.addEventListener("viewChange", this.#viewChangeHandler);
	}

	set_yaw(yaw) {
		if (!yaw) {
			return ;
		}
		console.log(`[COMPASS] - set yaw to : ${yaw}`);
		this.yaw = yaw;
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
