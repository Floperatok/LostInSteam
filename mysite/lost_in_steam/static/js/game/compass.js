
'use strict';

class Compass {
	constructor(viewer) {
		this._compass = document.getElementById("compass_graduations");
		this._compassChunk = document.getElementsByClassName("compass_graduations_chunk")[0];
		this._centerOffset = this._compassChunk.offsetWidth 
			- document.getElementById("compass").offsetWidth / 2 
			+ document.getElementsByClassName("compass_cardinal")[0].offsetWidth / 2;
		this._yaw = 0;

		viewer.addEventListener("viewChange", () => {
			console.log(viewer.view()._yaw);
			this._compass.style.transform = `translateX(${-(viewer.view()._yaw - this._yaw) * (this._compassChunk.offsetWidth / Math.PI / 2) - this._centerOffset}px)`;
		});
	}

	set_yaw(yaw) {
		this._yaw = yaw;
	}
}
