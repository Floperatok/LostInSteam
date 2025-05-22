
'use strict';

class App {
	constructor({gameScreenId, resultScreenId, mapContainer, panoContainerId, compassContainerId, guessGameFormId, gamePosterId, resultUIId}) {
		console.log(`[APP] - constructor : gameScreenId=${gameScreenId}, resultScreenId=${resultScreenId}, mapContainer=${mapContainer}, panoContainerId:${panoContainerId}, compassContainerId=${compassContainerId}, guessGameFormId=${guessGameFormId}, gamePosterId=${gamePosterId}, resultUIId=${resultUIId}`);
		this.mapManager 			= new MapManager(mapContainer);
		this.panoManager 			= new PanoManager(panoContainerId, compassContainerId);
		this.guessGameFormManager 	= new GuessGameFormManager(this, guessGameFormId);
		this.gamePoster 			= new GamePoster(gamePosterId);
		this.resultUI				= new ResultUI(resultUIId, this);

		this.gameScreen = document.getElementById(gameScreenId);
		if (!this.gameScreen) {
			console.error("[APP] - gameScreen element not found");
		}
		this.resultScreen = document.getElementById(resultScreenId);
		if (!this.resultScreen) {
			console.error("[APP] - resultScreen element not found");
		}

		this.#setupListeners();
	}

	async cheatSkip() {
		console.log("[APP] - 'skip' cheat");
		this.panoManager.unloadPano();
		this.panoManager.loadRandomPano();
		this.gamePoster.loadPoster(this.panoManager.gameId);
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

	async cheatGoto(gameName, panoNumber) {
		console.log(`[APP] - 'goto' cheat: going to game : "${gameName}" pano : "${panoNumber}"`);
		var response;
		try {
			response = await postApiJson("/api/command/goto/", {
				gameName: gameName,
				panoNumber: panoNumber,
			});
		} catch (error) {
			console.error(`[PANO-MANAGER] - error fetching '/api/command/goto/': ${error.message}`);
			return ;
		}
		this.panoManager.unloadPano();
		this.panoManager.loadPano(response.id, response.gameId, response.settings);
	}

	displayMinimap() {
		console.log("[APP] - display minimap");
		this.mapManager.container.classList.remove("result_map");
		this.mapManager.container.classList.add("minimap");
		this.mapManager.controls.add(new MapControlScale(this.mapManager.container));
		this.mapManager.controls.add(new MapControlGuess(this));
		this.mapManager.enableMouseHover();
		this.gameScreen.appendChild(this.mapManager.container);
		this.mapManager.displayMap();
		this.mapManager.centerMap();
	}

	displayResultMap(result) {
		console.log("[APP] - display result map");
		this.mapManager.container.classList.remove("minimap");
		this.mapManager.container.classList.add("result_map");
		this.mapManager.controls.destroyScale();
		this.mapManager.controls.guess.disableMarkerPlacement();
		this.mapManager.controls.guess.hide();
		this.mapManager.controls.add(new MapControlAttribution(this.mapManager.mapAttribution));
		this.mapManager.newMarker({
			pos: result.answerPos,
			iconUrl: '/static/image/marker-icon.png',
			shadowUrl: '/static/image/marker-shadow.png',
			iconAnchor: [12, 41],
		});
		const polyline = this.mapManager.newPolyline({
			pos1: this.mapManager.controls.guess.getMarkerPos(), 
			pos2: result.answerPos,
		});
		this.mapManager.disableMouseHover();
		this.resultScreen.appendChild(this.mapManager.container);
		this.mapManager.displayMap();
		this.mapManager.leaflet.setView(polyline.getCenter(), this.mapManager.leaflet.getBoundsZoom(polyline.getBounds()) - 1, true);
	}

	displayGameScreen() {
		console.log("[APP] - displaying game screen");
		this.guessGameFormManager.clearInputField();
		this.guessGameFormManager.display();
		displayScreen(this.gameScreen.id);
		this.panoManager._viewer.updateSize();
	}

	displayResultScreen() {
		console.log("[APP] - displaying result screen");
		displayScreen(this.resultScreen.id);
	}

	async gameFound(gameInfos) {
		if (!gameInfos || !gameInfos.valid) {
			console.error(`[APP] - gameInfos is null or game has not been found`);
			return ;
		}
		console.log(`[APP] - game found : ${gameInfos.prettyGameName}`);
		this.guessGameFormManager.hide();
		this.gamePoster.display(gameInfos.prettyGameName);
		if (!gameInfos.mapsData[0]) {
			console.warn("[APP] - game has no maps");
		}
		this.mapManager.destroyMap();
		await this.mapManager.load(gameInfos.mapsData[0].id);
		await waitForEvent(document.body, "click");
		this.displayMinimap(); 
	}

	#setupListeners() {
		// console.log("[APP] - setting up listeners");

	}
}
