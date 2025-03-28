
'use strict';


function getContainerScaleLevel(container) {
	let scaleClass = container.className.match(/\bscale\d+\b/);
	let scaleLevel;
	if (scaleClass) {
		scaleLevel = parseInt(scaleClass[0].replace("scale", ""), 10);
	} else {
		scaleLevel = 0;
	}
	return (scaleLevel);
}


function scaleUpMap(container) {
	let scale = getContainerScaleLevel(container);
	if (scale >= 4) {
		return ;
	}
	container.classList.remove(`scale${scale}`);
	container.classList.add(`scale${scale + 1}`);
}


function scaleDownMap(container) {
	let scale = getContainerScaleLevel(container);
	if (scale <= 0) {
		return ;
	}
	container.classList.remove(`scale${scale}`);
	container.classList.add(`scale${scale - 1}`);
}
