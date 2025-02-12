
'use strict';

(async function() {

    var devChangePanoButton = document.getElementById("dev_change_pano_button");
	if (!devChangePanoButton)
		console.log("WHYY");
    devChangePanoButton.addEventListener("click", function(e) {
        return ;
    });

	var viewer = initMarzipano();
	var scene = await createPanoScene(viewer, 2, 0);

	scene.switchTo();

})();

