
'use strict';

function createMapContainer() {
	const	mapDiv = document.createElement("div");
	const	guessPosBtn = document.createElement("button");

	guessPosBtn.id = "guess_pos_btn";
	guessPosBtn.innerText = "Guess";
	
	mapDiv.id = "map";
	mapDiv.appendChild(guessPosBtn);
	return (mapDiv);
}


function errorScreen(status, statusText) {

	document.getElementById("error_title").innerText = statusText;
	const errorMsg = document.getElementById("error_msg");

	switch (status) {
		case 404:
			errorMsg.innerText = "Seems like the ressource you are trying to access does not exist...";
			break;
		case 500:
			errorMsg.innerText = "Congratulations ! You broke our server. Press F5 to pay respect...";
			break;
		default:
			errorMsg.innerText = "This might not be your fault, refresh the page. Please contact the devs if this keep happening";
	}
	displayScreen("error_screen");
}


function resultScreen(map, mapDiv, result) {
	const resultScreenDiv = document.getElementById("result_screen"); 
	resultScreenDiv.insertBefore(mapDiv, resultScreenDiv.firstChild);
	document.getElementById("distance").innerText = `Distance: ${result.distance}`;
	displayResultMap(map, mapDiv, result);
	displayScreen("result_screen");

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

	const	guessGameForm	= document.getElementById("guess_game_form");
	const	guessInput		= document.getElementById("guess_input");
	const	nextBtn			= document.getElementById("next_btn");

	guessGameForm.addEventListener("submit", handleGuessGame);
	nextBtn.addEventListener("click", handleNext);
	document.body.addEventListener("click", handleDynamicBtn);

	async function handleGuessGame(event) {
		event.preventDefault();
		const guess = guessInput.value.trim();
		if (guess == "") {
			return ;
		}
		if (guess[0] == "/") {
			manageCheatCommands(guess.slice(1));
			return ;
		}
		try {
			const response = await postApi("/api/guess/game/", {
				gameId: pano.gameId, 
				guess: guess,
			});
			if (response.valid) {
				alert(`Correct! ${response.prettyName}`);
				guessGameForm.style.display = "none";
				displayMinimap(map, response.mapId, mapDiv);
			} else {
				alert(`Incorrect.`);
			}
		} catch (error) {
			errorScreen(error.status, error.message);
			return ;
		}
	}


	async function handleDynamicBtn(event) {
		if (event.target.id == "guess_pos_btn") {
			try {
				let result = await postApi("/api/guess/pos/", {
					pos: mapLayerGroup.getLayers()[0]._latlng,
					panoId: pano.id,
				});
				resultScreen(map, mapDiv, result);
				pano = await switchToRandomScene(viewer);
			} catch (error) {
				errorScreen(error.status, error.message);
				return ;
			}
		}
	}


	async function handleNext(event) {
		gameScreen(mapDiv);
	}


	function manageCheatCommands(guess) {
		const guessWords = guess.split(" ");

		switch (guessWords[0]) {
			case "skip":
				cheatSkipScene();
				guessInput.value = "";
				break;
			case "goto":
				cheatGotoScene(guessWords[1], guessWords[2]);
				guessInput.value = "";
				break;
			case "find":
				cheatFindGame();
				guessInput.value = "";
				break;
			default:
				console.log(`Unknown command "${guessWords[0]}"`);
		}
	}


	async function cheatSkipScene() {
		try {
			pano = await switchToRandomScene(viewer);
			gameScreen(mapDiv);
		} catch (error) {
			if (error.status == 404) {
				console.error("/skip tried to skip to an inexistent scene");
			} else {
				console.error(`/skip crashed : ${error.message}`);
			}
			return ;
		}
	}


	async function cheatFindGame() {
		try {
			const response = await postApi("/api/command/find/", {
				gameId: pano.gameId,
			});
			guessGameForm.style.display = "none";
			displayMinimap(map, response.mapId, mapDiv);
		} catch (error) {
			console.error(`/find crashed : ${error.message}`);
			return ;
		}
	}


	async function cheatGotoScene(gameName, panoNumber) {
		try {
			pano = await postApi("/api/command/goto/", {
				gameName: gameName,
				panoNumber: panoNumber,
			});
		} catch (error) {
			if (error.status == 404) {
				if (panoNumber) {
					console.error(`goto: Game or scene not found: ${gameName} ${panoNumber}`);
				} else {
					console.error(`goto: Game not found: ${gameName}`);
				}
			} else {
				errorScreen(error.status, error.message);
			}
			return ;
		}
		var scene = await loadPanoScene(viewer, pano);
		scene.switchTo();
		gameScreen(mapDiv);
	}


	try {
		pano = await switchToRandomScene(viewer);
		gameScreen(mapDiv);
	} catch (error) {
		console.log(error.status);
		errorScreen(error.status, error.message);
	}
}
