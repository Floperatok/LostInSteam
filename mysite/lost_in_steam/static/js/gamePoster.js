
'use strict';

class GamePoster {
	constructor(gamePosterId) {
		console.log(`[GAME-POSTER] - constructor : gamePosterId=${gamePosterId}`);
		this.container = document.getElementById(gamePosterId);
		if (!this.container) {
			console.error(`[GAME-POSTER] - game poster element not found`);
		}

		this._posterElement = this.container.querySelector("img");
		if (!this._posterElement) {
			console.error(`[GAME-POSTER] - poster image element not found`);
		}
		this._gameNameElement = this.container.querySelector("#game_name");
		if (!this._gameNameElement) {
			console.error(`[GAME-POSTER] - game name element not found`);
		}
		this._posterData = null;
		this._posterUrl = null;

		this.hide();
	}

	async loadPoster(gameId) {
		this._posterData = null;
		this._posterUrl = null;
		this._posterElement.src = "";
		if (!gameId) {
			console.error("[GAME-POSTER] - cannot fetch poster, gameId is not defined");
			return ;
		}
		console.log(`[GAME-POSTER] - loading poster from gameId: ${gameId}`);
		try {
			this._posterData = await getApiImage(`/api/game/${gameId}/poster`);
		} catch (error) {
			console.error(`[GAME-POSTER] - error fetching poster image: ${error.message}`);
			return ;
		}
	}

	#closingHandler = async () => {
		await new Promise((resolve) => {
			this.container.style.opacity = "0";
			setTimeout(() => {
				this.hide();
				document.body.removeEventListener("click", this.#closingHandler);
				resolve();
			}, 300);
		});
	}

	async display(prettyGameName) {
		console.log("[GAME-POSTER] - display");
		if (!prettyGameName) {
			console.error("[GAME-POSTER] - game name not provided");
		}
		if (!this._posterData) {
			console.error("[GAME-POSTER] - poster image not found");
		}
		if (this._posterUrl) {
			console.warn("[GAME-POSTER] - poster unchanged");
		} else {
			this._posterUrl = URL.createObjectURL(this._posterData);
			this._posterElement.src = this._posterUrl;
		}
		this._gameNameElement.textContent = `${prettyGameName}`;
		this.container.style.opacity = "";
		this.container.classList.remove("hidden");
		document.body.addEventListener("click", this.#closingHandler);
	
	}

	hide() {
		console.log("[GAME-POSTER] - hide");
		this.container.style.opacity = "";
		this.container.classList.add("hidden");
	}
}
