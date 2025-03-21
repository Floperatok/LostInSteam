
'use strict';

function createMapContainer() {
	const	mapDiv = document.createElement("div");
	const	guessPosBtn = document.createElement("button");

	guessPosBtn.id = "guess_pos_btn";
	guessPosBtn.innerText = "Guess";
	
	mapDiv.id = "map";
	mapDiv.classList.add("scale1");
	mapDiv.appendChild(guessPosBtn);
	return (mapDiv);
}


async function correctGuess(gameId, prettyGameName) {
	try {
		var posterImage = await getApiImage(`/api/game/${gameId}/poster`);
	} catch (error) {
		errorScreen(error.status, error.message);
		return ;
	}
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


function incorrectGuess() {
	const inputElement = document.getElementById("guess_input");

	inputElement.style.animation = "shake 300ms";
	setTimeout(() => { inputElement.style.animation = ""; }, 300);
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
	document.getElementById("game_answer").style.display = "none";
	document.getElementById("game_answer").style.opacity = "1";
	displayScreen("game_screen");
}


let	mapLayerGroup = null;

document.addEventListener("DOMContentLoaded", game)

async function game() {

	const	mapDiv = createMapContainer();

	const	viewer = initMarzipano();
	const	map = initLeaflet(mapDiv);
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

	guessGameForm.addEventListener("submit", handleGuessGame);
	nextBtn.addEventListener("click", handleNext);

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
			guessGameForm.style.display = "none";
			await correctGuess(pano.gameId, response.prettyGameName)
			displayMinimap(map, response.mapId, mapDiv);
		} else {
			incorrectGuess();
		}
	}


	async function handleGuessPos(event) {
		event.stopPropagation();
		try {
			let result = await postApiJson("/api/guess/pos/", {
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
			gameScreen(mapDiv);
			pano = await switchToRandomScene(viewer);
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
			const response = await postApiJson("/api/command/find/", {
				gameId: pano.gameId,
			});
			guessGameForm.style.display = "none";
			await correctGuess(pano.gameId, response.prettyGameName);
			displayMinimap(map, response.mapId, mapDiv);
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
		scene.switchTo();
	}


	try {
		gameScreen(mapDiv);
		pano = await switchToRandomScene(viewer);

		document.getElementById("guess_pos_btn").addEventListener("click", handleGuessPos);
} catch (error) {
		console.log(error.status);
		errorScreen(error.status, error.message);
	}
}
