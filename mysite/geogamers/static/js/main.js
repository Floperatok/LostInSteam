
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

	var devChangePanoButton = document.getElementById("dev_change_pano_button");
	var guessInput = document.getElementById("guess_input");
	var guessGameForm = document.getElementById("guess_form");
	var mapBlock = document.getElementById("map");

	devChangePanoButton.addEventListener("click", async function(e) {
		panoInfo = await switchRandomScene(viewer, panoInfo["id"]);
	});

	guessGameForm.addEventListener("submit", async function(event) {
		event.preventDefault()
		if (guessInput.value.trim() !== '') {
			const data = await guess_game(panoInfo["game_id"], guessInput.value);
			if (data.valid) {
				mapBlock.style.display = "block";
				loadMap(data["map"]);
				alert(`Correct! ${data["pretty_name"]}`);
				guessGameForm.style.display = "none";
			} else {
				alert(`Incorrect.`);
			}

			guessInput.value = "";
		}
	});

	panoInfo = await switchRandomScene(viewer, "");

})();
