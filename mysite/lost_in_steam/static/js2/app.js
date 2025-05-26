
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
		this.displayGameScreen();
		await this.panoManager.loadRandomPano();
		this.gamePoster.loadPoster(this.panoManager.gameId);
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
		await this.panoManager.loadPano(response.id, response.gameId, response.settings);
		this.gamePoster.loadPoster(this.panoManager.gameId);
	}

	configureMinimap(mapsData) {
		console.log("[APP] - configure minimap");
		this.mapManager.controls.destroyAll();
		this.mapManager.container.classList.remove("result_map");
		this.mapManager.container.classList.add("minimap");
		this.mapManager.controls.add(new MapControlScale(this.mapManager.container));
		this.mapManager.controls.add(new MapControlGuess(this, this.mapManager.markers));
		if (mapsData && mapsData.length > 1) {
			this.mapManager.controls.add(new MapControlSelect(this.mapManager, mapsData));
		}
		this.mapManager.enableMouseHover();
		this.mapManager.container.classList.add("map-mouse-over");
	}

	async configureResultMap(result) {
		console.log("[APP] - configure result map");
		this.mapManager.container.classList.remove("minimap");
		this.mapManager.container.classList.add("result_map");
		this.mapManager.disableMouseHover();
		this.mapManager.controls.destroyScale();
		this.mapManager.controls.guess.disableMarkerPlacement();
		this.mapManager.controls.guess.hide();
		this.mapManager.controls.add(new MapControlAttribution(this.mapManager.mapAttribution));
		const answerMarker = this.mapManager.markers.add(result.answerPos, "answer", result.answerMapId);
		if (result.answerMapId != this.mapManager.mapId) {
			this.mapManager.unloadMap();
			await this.mapManager.load(result.answerMapId);
		}
		const polyline = this.mapManager.polylines.addFromMarkers(
			this.mapManager.markers.player,
			this.mapManager.markers.answer
		);
		if (polyline) {
			this.mapManager.leaflet.setView(
				polyline.getCenter(), 
				this.mapManager.leaflet.getBoundsZoom(polyline.getBounds()), 
				true
			);
		} else {
			this.mapManager.leaflet.setView(
				answerMarker.getLatLng(), 
				this.mapManager.leaflet.getMaxZoom() - 2, 
				true
			);
		}
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
		if (gameInfos.mapsData.length == 0) {
			console.warn(`[APP] - game "${gameInfos.prettyGameName}" has no maps`);
		}
		await this.mapManager.load(gameInfos.mapsData[0].id);
		await waitForEvent(document.body, "click");
		this.configureMinimap(gameInfos.mapsData); 
		this.gameScreen.appendChild(this.mapManager.container);
		this.mapManager.displayMap();
		this.mapManager.centerMap();
	}

	async positionGuessed(result) {
		this.displayResultScreen();
		this.resultUI.setPoints(result.points);
		this.configureResultMap(result);
		this.mapManager.container.remove();
		this.resultScreen.appendChild(this.mapManager.container);
		this.panoManager.unloadPano();
		await this.panoManager.loadRandomPano();
		this.gamePoster.loadPoster(this.panoManager.gameId);
	}

	#setupListeners() {
		// console.log("[APP] - setting up listeners");

	}
}
