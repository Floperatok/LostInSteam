
'use strict';

function createMapContainer() {
	const	mapDiv = document.createElement("div");

	mapDiv.id = "map";
	mapDiv.classList.add("scale1");
	return (mapDiv);
}


function incorrectGuess() {
	const inputElement = document.getElementById("guess_input");

	inputElement.style.animation = "shake 300ms";
	setTimeout(() => { inputElement.style.animation = ""; }, 300);
}


async function displayGameAnswer(gameId, prettyGameName) {
	try {
		var posterImage = await getApiImage(`/api/game/${gameId}/poster`);
	} catch (error) {
		errorScreen(error.status, error.message);
		return ;
	}
	document.getElementById("guess_game_form").style.display = "none";
	document.getElementById("guess_input").style.color = "";

	const imageUrl = URL.createObjectURL(posterImage);
	const imageElement = document.createElement("img");
	imageElement.src = imageUrl;
	const posterContainer = document.getElementById("poster_wrapper");
	posterContainer.innerHTML = "";
	posterContainer.appendChild(imageElement);

	const gameNameElement = document.getElementById("game_name");
	gameNameElement.innerHTML = `${prettyGameName}`;

	const gameAnswerElement = document.getElementById("game_answer");
	gameAnswerElement.style.display = "flex";

    await new Promise((resolve) => {
        function handleClick(e) {
            gameAnswerElement.style.opacity = "0";
            setTimeout(() => {
                gameAnswerElement.style.display = "none";
                document.body.removeEventListener("click", handleClick);
                resolve();
            }, 300);
        }
        document.body.addEventListener("click", handleClick);
    });
}


function resultScreen(map, mapsData, mapDiv, result) {
	const resultScreenDiv = document.getElementById("result_screen"); 
	resultScreenDiv.insertBefore(mapDiv, resultScreenDiv.firstChild);
	document.getElementById("distance").innerText = `Distance: ${result.distance}`;
	displayResultMap(map, mapsData, mapDiv, result);
	displayScreen("result_screen");
}


function gameScreen(mapDiv) {
	mapDiv.style.display = "none";
	document.getElementById("game_screen").appendChild(mapDiv);
	document.getElementById("guess_input").value = "";
	document.getElementById("game_answer").style.display = "none";
	document.getElementById("game_answer").style.opacity = "1";
	displayScreen("game_screen");
}


let	mapLayerGroup = null;

document.addEventListener("DOMContentLoaded", game)

async function game() {

	const	mapDiv = createMapContainer();
	const	map = initLeaflet(mapDiv);
	let 	mapsData = [];

	const	viewer = initMarzipano();
	const	compass = new Compass(viewer);
	let		pano = {};

	const resizeObserver = new ResizeObserver(entries => {
		for (let entry of entries) {
			if (entry.target.id === "map") {
				map.invalidateSize();
			}
		}
	});
	resizeObserver.observe(mapDiv);

	const	guessGameForm	= document.getElementById("guess_game_form");
	const	guessInput		= document.getElementById("guess_input");
	const	nextBtn			= document.getElementById("next_btn");
	const	guessPosBtn		= mapDiv.querySelector(".guess-pos");
	
	guessGameForm.addEventListener("submit", handleGuessGame);
	nextBtn.addEventListener("click", handleNext);
	guessPosBtn.addEventListener("click", handleGuessPos);


	async function handleGuessGame(event) {
		event.preventDefault();
		const guess = guessInput.value.trim();
		if (guess == "") {
			incorrectGuess();
			return ;
		}
		if (guess[0] == "/") {
			manageCheatCommands(guess.slice(1));
			return ;
		}
		try {
			var response = await postApiJson("/api/guess/game/", {
				gameId: pano.gameId, 
				guess: guess,
			});
		} catch (error) {
			errorScreen(error.status, error.message);
			return ;
		}
		if (response.valid) {
			mapsData = response.mapsData;
			const mapPromise = loadMap(map, mapsData[0].id, mapDiv);
			await displayGameAnswer(pano.gameId, response.prettyGameName);
			await mapPromise;
			displayMinimap(map, mapsData, mapDiv);
		} else {
			incorrectGuess();
		}
	}


	async function handleGuessPos(event) {
		event.stopPropagation();
		try {
			let result = await postApiJson("/api/guess/pos/", {
				mapId: map._id,
				pos: mapLayerGroup.getLayers()[0]._latlng,
				panoId: pano.id,
			});
			resultScreen(map, mapsData, mapDiv, result);
			pano = await switchToRandomScene(viewer);
			compass.set_yaw(pano.settings.initialViewParameters.yaw);
		} catch (error) {
			errorScreen(error.status, error.message);
			return ;
		}
	}


	function handleNext(event) {
		map._userMarker = null;
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
			gameScreen(mapDiv);
			pano = await switchToRandomScene(viewer);
			compass.set_yaw(pano.settings.initialViewParameters.yaw);
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
			guessInput.style.color = "grey";
			const response = await postApiJson("/api/command/find/", {
				gameId: pano.gameId,
			});
			mapsData = response.mapsData;
			const mapPromise = loadMap(map, mapsData[0].id, mapDiv);
			await displayGameAnswer(pano.gameId, response.prettyGameName);
			await mapPromise;
			displayMinimap(map, mapsData, mapDiv);
		} catch (error) {
			console.error(`/find crashed : ${error.message}`);
			return ;
		}
	}


	async function cheatGotoScene(gameName, panoNumber) {
		try {
			pano = await postApiJson("/api/command/goto/", {
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
		gameScreen(mapDiv);
		var scene = await loadPanoScene(viewer, pano);
		compass.set_yaw(pano.settings.initialViewParameters.yaw);
		scene.switchTo();
	}

	
	try {
		gameScreen(mapDiv);
		pano = await switchToRandomScene(viewer);
		compass.set_yaw(pano.settings.initialViewParameters.yaw);
	} catch (error) {
		console.log(error.status);
		errorScreen(error.status, error.message);
	}
}
