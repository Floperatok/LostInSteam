
'use strict';

class App {
	constructor({mapContainer, panoContainerId, compassContainerId, guessGameFormId, gameAnswerId}) {
		console.log(`[APP] - constructor : mapContainer=${mapContainer}, panoContainerId:${panoContainerId}, compassContainerId=${compassContainerId}, guessGameFormId=${guessGameFormId}`);
		this.mapManager = new MapManager(mapContainer);
		this.panoManager = new PanoManager({
			panoContainerId: panoContainerId,
			compassContainerId: compassContainerId
		});
		this.guessGameFormManager = new GuessGameFormManager({
			app: this,
			guessGameFormId: guessGameFormId,
		});
		this.gameAnswer = new GamePoster(gameAnswerId);

		this.#setupListeners();
	}

	async handleGuessGame(event) {
		console.log("[APP] - handling guess game");
		event.preventDefault();
	}

	async cheatSkip() {
		console.log("[APP] - 'skip' cheat");
		this.panoManager.unloadPano();
		this.panoManager.loadRandomPano();
		this.gameAnswer.loadPoster(this.panoManager.gameId);
		this.displayGameScreen();
	}

	async cheatFind() {
		console.log("[APP] - 'find' cheat");
		var response;
		try {
			response = await postApiJson("/api/command/find/", {
				gameId: this.panoManager.gameId,
			});
		} catch (error) {
			console.error(`[APP] - error fetching '/api/command/find/': ${error.message}`);
			return ;
		}
		this.gameFound(response);
	}

	displayGameScreen() {
		console.log("[APP] - displaying game screen");
		this.mapManager.hideMap();
		this.guessGameFormManager.clearInputField();
		this.guessGameFormManager.display();
		displayScreen("game_screen");
	}

	displayResultScreen() {
		console.log("[APP] - displaying result screen");
		this.mapManager.displayResultMap();
		displayScreen("result_screen");
	}

	async gameFound(gameInfos) {
		if (!gameInfos || !gameInfos.valid) {
			console.error(`[APP] - gameInfos is null or game has not been found`);
			return ;
		}
		console.log(`[APP] - game found : ${gameInfos.prettyGameName}`);
		this.guessGameFormManager.hide();
		this.gameAnswer.display(gameInfos.prettyGameName);
		this.mapManager.displayMinimap(); // le container de map n'est pas dans le dom. Trouve un truc
	}

	#setupListeners() {
		// console.log("[APP] - setting up listeners");

	}
}
