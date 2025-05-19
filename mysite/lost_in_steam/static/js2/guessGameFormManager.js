
'use strict';

class GuessGameFormManager {
	constructor({app, guessGameFormId}) {
		console.log(`[GUESS-GAME-FORM-MANAGER] - constructor : app=${app}, guessGameFormId=${guessGameFormId}`);
		this.app = app;
		this.container = document.getElementById(guessGameFormId);
		if (!this.container) {
			console.error("[GUESS-GAME-FORM-MANAGER] - form element not found");
		}
		this.inputField = this.container.querySelector("input");
		if (!this.inputField) {
			console.error("[GUESS-GAME-FORM-MANAGER] - input field element not found");
		}
		this.guessButton = this.container.querySelector("button");
		if (!this.guessButton) {
			console.error("[GUESS-GAME-FORM-MANAGER] - guess button element not found");
		}
		this.clearInputField();
		this.#setupListeners();
	}

	incorrectGuess() {
		console.log("[GUESS-GAME-FORM-MANAGER] - incorrect guess");

		this.inputField.style.animation = "shake 300ms";
		setTimeout(() => { this.inputField.style.animation = ""; }, 300);
	}

	getInputValue() {
		return (this.inputField.value);
	}

	clearInputField() {
		console.log("[GUESS-GAME-FORM-MANAGER] - clear input field");
		this.inputField.value = "";
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
				this.app.cheatSkip();
				this.clearInputField();
				break;
			case "/goto":
				this.app.cheatGoto(words[1], words[2]);
				this.clearInputField();
				break;
			case "/find":
				this.app.cheatFind();
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
				gameId: this.app.panoManager.gameId,
				guess: inputValue,
			});
		} catch (error) {
			console.error(`[GUESS-GAME-FORM-MANAGER] - error fetching '/api/guess/game/': ${error.message}`);
			return ;
		}
		if (response.valid) {
			this.app.gameFound(response);
		} else {
			this.incorrectGuess();
		}
	}

	#setupListeners() {
		console.log("[GUESS-GAME-FORM-MANAGER] - setting up listeners");
		this.container.addEventListener("submit", this.#guessGameHandler);

	}
}
