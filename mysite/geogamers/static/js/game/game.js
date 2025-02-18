
'use strict';

async function guessGame(gameId, guess) {
	const path = "/api/guess/game/";
	try {
		const response = await fetch(path, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": csrftoken
			},
			body: JSON.stringify({ gameId, guess })
		});
		if (!response.ok) {
			throw new Error(`${response.status} - ${path}`);
		}
		const data = await response.json();
		return data;

	} catch (error) {
		console.error(`Fetch: ${error}`);
		return null;
	}
}


async function loadResultScreen() {

	function handleNext(event) {
		unloadMap(map);
		next_btn.removeEventListener("click", handleNext);
		switchToScreen("game_screen");
	}

	const data = JSON.parse(localStorage.getItem("data"));
	var map = loadMap("result_map", data.map_id);
	var next_btn = document.getElementById("next_btn");

	document.getElementById("distance").innerHTML = `Distance: ${data.distance}`;

	const icon = L.icon({
		iconUrl: '/static/image/marker-icon.png',
		shadowUrl: '/static/image/marker-shadow.png',
		iconAnchor: [12, 41],
	})
	
	map = await map;
	var userMarker = new L.marker(L.latLng(data.guess_lat, data.guess_lng)).addTo(map);
	var answerMarker = new L.marker(L.latLng(data.answer_lat, data.answer_lng), {icon: icon}).addTo(map);

	var polyline = L.polyline([userMarker.getLatLng(), answerMarker.getLatLng()], {
		color: "white",
		dashArray: "20, 20",
	}).addTo(map);
	map.setView(polyline.getCenter(), map.getBoundsZoom(polyline.getBounds()));
	
	next_btn.addEventListener("click", handleNext);
}



async function loadGameScreen() {

	async function handleGuessGame(event) {
		event.preventDefault()
		if (guessInput.value.trim() !== '') {
			response = await guessGame(panoInfo.game_id, guessInput.value);
			if (response.valid) {
				mapWrapper.style.display = "block";
				map = loadMap("map", response["map_id"], true);
				alert(`Correct! ${response["pretty_name"]}`);
				guessGameForm.style.display = "none";
				map = await map;
				addMarkerOnClick(map);
				L.DomUtil.addClass(map._container,'crosshair-cursor-enabled');
			} else {
				alert(`Incorrect.`);
			}
			guessInput.value = "";
		}
	}

	async function handleDevSwitch(event) {
		panoInfo = await switchRandomScene(viewer, localStorage.getItem("currentPanoId"));
		localStorage.setItem("currentPanoId", panoInfo.id);
	}

	async function handleGuessPos(event) {
		let data = await guessPos(guessMarker._latlng, panoInfo.id);
		unloadViewer(viewer);
		unloadMap(await map); // car loadmap n'est pas en await, elle renvoie donc une promesse
		data["map_id"] = response["map_id"];
		localStorage.setItem("data", JSON.stringify(data));
		devChangePanoButton.removeEventListener("click", handleDevSwitch);
		guessGameForm.removeEventListener("submit", handleGuessGame);
		guessPosBtn.removeEventListener("click", handleGuessPos);
		switchToScreen("result_screen");
	}

	var viewer = initMarzipano();
	var map = null;
	var panoInfo = null;
	var response = null;

	const guessInput = document.getElementById("guess_input");
	const mapWrapper = document.getElementById("map_wrapper");
	const devChangePanoButton = document.getElementById("dev_change_pano_button");
	const guessGameForm = document.getElementById("guess_game_form");
	const guessPosBtn = document.getElementById("guess_pos_btn");

	devChangePanoButton.addEventListener("click", handleDevSwitch);
	guessGameForm.addEventListener("submit", handleGuessGame);
	guessPosBtn.addEventListener("click", handleGuessPos);

	panoInfo = await switchRandomScene(viewer, localStorage.getItem("currentPanoId"));
	localStorage.setItem("currentPanoId", panoInfo.id);
}

(async function() {
	localStorage.setItem("currentPanoId", "");
	switchToScreen("game_screen");
})();