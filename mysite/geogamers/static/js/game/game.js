
'use strict';

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
		const guess = document.getElementById("guess_input").value.trim();
		if (guess == "") {
			return ;
		}
		if (guess[0] == "/") {
			manageCommands(guess.slice(1));
			return ;
		}
		const response = await postApi("/api/guess/game/", {
			gameId: pano.gameId, 
			guess: guess,
		});
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
			let result = await postApi("/api/guess/pos/", {
				pos: mapLayerGroup.getLayers()[0]._latlng,
				panoId: pano.id,
			});
			resultScreen(map, mapDiv, result);
			pano = await switchToRandomScene(viewer);
		}
	}


	async function handleNext(event) {
		logMapLayers(map);
		gameScreen(mapDiv);
	}


	function manageCommands(guess) {
		if (guess == "skip")
			skipScene();
		else if (guess.split(" ")[0] == "goto") {
			gotoScene(guess.split(" ")[1], guess.split(" ")[2]);
		}
	}


	async function skipScene() {
		pano = await switchToRandomScene(viewer);
		gameScreen(mapDiv);
	}


	async function gotoScene(gameName, panoNumber) {
		let path;
		if (panoNumber) {
			path = `/api/command/goto/${gameName}/${panoNumber}`;
		} else {
			path = `/api/command/goto/${gameName}`;
		}
		const pano = await getApi(path);
		var scene = await loadPanoScene(viewer, pano);
		scene.switchTo();
		gameScreen(mapDiv);
	}


	logMapLayers(map);
	pano = await switchToRandomScene(viewer);
	gameScreen(mapDiv);
}
