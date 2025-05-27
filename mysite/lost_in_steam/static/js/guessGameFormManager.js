
'use strict';

class GuessGameFormManager {
	constructor(app, guessGameFormId) {
		console.log(`[GUESS-GAME-FORM-MANAGER] - constructor : app=${app}, guessGameFormId=${guessGameFormId}`);
		if (!app) {
			console.error("[GUESS-GAME-FORM-MANAGER] - app is not defined");
		}
		this.container = document.getElementById(guessGameFormId);
		if (!this.container) {
			console.error("[GUESS-GAME-FORM-MANAGER] - form element not found");
		}

		this._inputField = this.container.querySelector("#guess_input");
		if (!this._inputField) {
			console.error("[GUESS-GAME-FORM-MANAGER] - input field element not found");
		}
		this._app = app;

		this.#setupListeners();
	}

	incorrectGuess() {
		console.log("[GUESS-GAME-FORM-MANAGER] - incorrect guess");

		this._inputField.style.animation = "shake 300ms";
		setTimeout(() => { this._inputField.style.animation = ""; }, 300);
	}

	getInputValue() {
		return (this._inputField.value);
	}

	clearInputField() {
		console.log("[GUESS-GAME-FORM-MANAGER] - clear input field");
		this._inputField.value = "";
	}

	display() {
		console.log("[GUESS-GAME-FORM-MANAGER] - display form");
		this.container.classList.remove("hidden");
	}

	hide() {
		console.log("[GUESS-GAME-FORM-MANAGER] - hide form");
		this.container.classList.add("hidden");
	}

	#cheatCommand(string) {
		console.log(`[GUESS-GAME-FORM-MANAGER] - managing cheat command : ${string}`);
		const words = string.split(" ");
		switch (words[0]) {
		case "/skip":
			this._app.cheatSkip();
			this.clearInputField();
			break;
		case "/goto":
			this._app.cheatGoto(words[1], words[2]);
			this.clearInputField();
			break;
		case "/find":
			this._app.cheatFind();
			this.clearInputField();
			break;
		default:
			console.warn(`[GUESS-GAME-FORM-MANAGER] - unknown command "${words[0]}"`);
		}
	}

	#guessGameHandler = async (event) => {
		event.preventDefault();
		console.log(`[GUESS-GAME-FORM-MANAGER] - handling game guess : ${this.getInputValue()}`);
		const inputValue = this.getInputValue().trim();
		if (inputValue === "") {
			this.incorrectGuess();
			return ;
		}
		if (inputValue[0] == "/") {
			this.#cheatCommand(inputValue);
			return ;
		}
		var response;
		try {
			response = await postApiJson("/api/guess/game/", {
				gameId: this._app.panoManager.gameId,
				guess: inputValue,
			});
		} catch (error) {
			console.error(`[GUESS-GAME-FORM-MANAGER] - error fetching '/api/guess/game/': ${error.message}`);
			return ;
		}
		if (response.valid) {
			this._app.gameFound(response);
		} else {
			this.incorrectGuess();
		}
	}

	#setupListeners() {
		console.log("[GUESS-GAME-FORM-MANAGER] - setting up listeners");
		this.container.addEventListener("submit", this.#guessGameHandler);

	}
}
