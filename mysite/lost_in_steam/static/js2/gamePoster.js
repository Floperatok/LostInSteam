
'use strict';

class GamePoster {
	constructor(gamePosterId) {
		console.log(`[GAME-POSTER] - constructor : gamePosterId=${gamePosterId}`);
		this.element = document.getElementById(gamePosterId);
		if (!this.element) {
			console.error(`[GAME-POSTER] - game poster element not found`);
		}
		this.posterElement = this.element.querySelector("img");
		if (!this.posterElement) {
			console.error(`[GAME-POSTER] - poster image element not found`);
		}
		this.gameNameElement = this.element.querySelector("#game_name");
		if (!this.gameNameElement) {
			console.error(`[GAME-POSTER] - game name element not found`);
		}
		this.hide();
		this.posterData = null;
		this.posterUrl = null;
	}

	async loadPoster(gameId) {
		this.posterData = null;
		this.posterUrl = null;
		this.posterElement.src = "";
		if (!gameId) {
			console.error("[GAME-POSTER] - cannot fetch poster, gameId is null");
			return ;
		}
		console.log(`[GAME-POSTER] - loading poster from gameId: ${gameId}`);
		try {
			this.posterData = await getApiImage(`/api/game/${gameId}/poster`);
		} catch (error) {
			console.error(`[GAME-POSTER] - error fetching poster image: ${error.message}`);
			return ;
		}
	}

	#closingHandler = async () => {
		await new Promise((resolve) => {
			this.element.style.opacity = "0";
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
		if (!this.posterData) {
			console.error("[GAME-POSTER] - poster image not found");
		}
		if (this.posterUrl) {
			console.warn("[GAME-POSTER] - poster unchanged");
		} else {
			this.posterUrl = URL.createObjectURL(this.posterData);
			this.posterElement.src = this.posterUrl;
		}
		this.gameNameElement.textContent = `${prettyGameName}`;
		this.element.style.opacity = "";
		this.element.classList.remove("hidden");
		document.body.addEventListener("click", this.#closingHandler);
	
	}

	hide() {
		console.log("[GAME-POSTER] - hide");
		this.element.style.opacity = "";
		this.element.classList.add("hidden");
	}
}
