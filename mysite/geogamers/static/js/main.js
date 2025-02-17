
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

var mapMarker = null;


(async function() {

	var viewer = initMarzipano();
	var panoInfo = null;

	var devChangePanoButton = document.getElementById("dev_change_pano_button");
	var guessInput = document.getElementById("guess_input");
	var guessGameForm = document.getElementById("guess_game_form");
	var mapWrapper = document.getElementById("map_wrapper");
	var guessPosBtn = document.getElementById("guess_pos_btn");

	devChangePanoButton.addEventListener("click", async function(e) {
		panoInfo = await switchRandomScene(viewer, panoInfo["id"]);
	});

	guessGameForm.addEventListener("submit", async function(event) {
		event.preventDefault()
		if (guessInput.value.trim() !== '') {
			const data = await guessGame(panoInfo["game_id"], guessInput.value);
			if (data.valid) {
				mapWrapper.style.display = "block";
				loadMap(data["map"]);
				alert(`Correct! ${data["pretty_name"]}`);
				guessGameForm.style.display = "none";
			} else {
				alert(`Incorrect.`);
			}

			guessInput.value = "";
		}
	});

	guessPosBtn.addEventListener("click", async function(event) {
		console.log(mapMarker._latlng);
		const data = await guessPos(mapMarker._latlng, panoInfo["id"]);
		console.log(`Distance : ${data["distance"]}`);
	});


	panoInfo = await switchRandomScene(viewer, "");

})();
