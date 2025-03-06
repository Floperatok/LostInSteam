
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
		return (response.json());

	} catch (error) {
		console.error(`Fetch: ${error}`);
		return null;
	}
}


function createMapContainer() {
	const	mapDiv = document.createElement("div");
	const	guessPosBtn = document.createElement("button");

	guessPosBtn.id = "guess_pos_btn";
	guessPosBtn.innerHTML = "Guess";
	
	mapDiv.id = "map";
	mapDiv.appendChild(guessPosBtn);
	return (mapDiv);
}


function resultScreen(map, mapDiv, result) {
	const resultScreenDiv = document.getElementById("result_screen"); 
	resultScreenDiv.insertBefore(mapDiv, resultScreenDiv.firstChild);
	document.getElementById("distance").innerHTML = `Distance: ${result.distance}`;
	displayResultMap(map, mapDiv, result);
	displayScreen("result_screen");
	logMapLayers(map);

}


function gameScreen(mapDiv) {
	mapDiv.style.display = "none";
	document.getElementById("game_screen").appendChild(mapDiv);
	document.getElementById("guess_input").value = "";
	displayScreen("game_screen");
}


let	mapLayerGroup = null;

document.addEventListener("DOMContentLoaded", game)

async function game() {

	const	mapDiv = createMapContainer();

	const	viewer = initMarzipano();
	const	map = initLeaflet(mapDiv);
	let		pano = {};

	const	guessGameForm		= document.getElementById("guess_game_form");
	const	nextBtn				= document.getElementById("next_btn");

	guessGameForm.addEventListener("submit", handleGuessGame);
	nextBtn.addEventListener("click", handleNext);
	document.body.addEventListener("click", handleDynamicButton);

	async function handleGuessGame(event) {
		event.preventDefault();
		const guess = document.getElementById("guess_input").value;
		if (guess.trim() == "") {
			return ;
		}
		if (guess.trim() == "/skip") {
			skipscene();
			return ;
		}
		const response = await guessGame(pano.game_id, guess);
		if (response.valid) {
			alert(`Correct! ${response.prettyName}`);
			event.target.style.display = "none";
			loadMap(map, response.mapId, mapDiv);
			displayMinimap(map, mapDiv);
		} else {
			alert(`Incorrect.`);
		}
	}


	async function handleDynamicButton(event) {
		if (event.target.id == "guess_pos_btn") {
			let result = await guessPos(mapLayerGroup.getLayers()[0]._latlng, pano.id);
			resultScreen(map, mapDiv, result);
			pano = await switchToRandomScene(viewer);
		}
	}


	async function handleNext(event) {
		logMapLayers(map);
		gameScreen(mapDiv);
	}


	async function skipscene() {
		pano = await switchToRandomScene(viewer);
		gameScreen(mapDiv);
	}


	logMapLayers(map);
	pano = await switchToRandomScene(viewer);
	gameScreen(mapDiv);
}
