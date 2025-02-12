
'use strict';

function getCSRFToken() {
	let cookieValue = null;
	const cookies = document.cookie.split(';');
	for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i].trim();
		if (cookie.startsWith('csrftoken=')) {
			cookieValue = cookie.substring('csrftoken='.length);
			break;
		}
	}
	return cookieValue;
}

const csrftoken = getCSRFToken();
if (!csrftoken) {
	console.error("CSRFtoken not found");
}

(async function() {

	var viewer = initMarzipano();
	var panoInfo = null;
	var scene = null;

    var devChangePanoButton = document.getElementById("dev_change_pano_button");
	var guessInput = document.getElementById("guess_input");
	var guessGameForm = document.getElementById("guess_form");

    devChangePanoButton.addEventListener("click", async function(e) {
		panoInfo = await getRandomPanoInfos(panoInfo["id"]);
		scene = await createPanoScene(viewer, panoInfo);
		scene.switchTo();
    });

	guessGameForm.addEventListener("submit", async function(event) {
		event.preventDefault()
		if (guessInput.value.trim() !== '') {
			const data = await guess_game(panoInfo["game_id"], guessInput.value);
			if (data.valid) {
				alert(`Correct! ${data["pretty_name"]}`);
				panoInfo = await getRandomPanoInfos(panoInfo["id"]);
				scene = await createPanoScene(viewer, panoInfo);
				scene.switchTo();
			} else {
				alert(`Incorrect.`);
			}

			guessInput.value = "";
		}
	});

	panoInfo = await getRandomPanoInfos();
	scene = await createPanoScene(viewer, panoInfo);
	scene.switchTo();

})();
