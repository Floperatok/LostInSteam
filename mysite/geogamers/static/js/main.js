
'use strict';

function switchToScreen(screenId) {
	const screens = document.querySelectorAll('.screen');
	screens.forEach(screen => screen.classList.add("hidden"));

	const activeScreen = document.getElementById(screenId);
	if (!activeScreen) {
		console.error(`No screen with id ${screenId} found`);
		return ;
	}
	activeScreen.classList.remove("hidden");
	switch (screenId) {
		case "game_screen":
			loadGameScreen();
			return ;
		case "result_screen":
			loadResultScreen();
			return ;
	}
}

function getCSRFToken() {
	let cookieValue = null;
	const cookies = document.cookie.split(';');
	for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i].trim();
		if (cookie.startsWith('csrftoken=')) {
			cookieValue = cookie.substring('csrftoken='.length);
			break;
		}
	}
	return cookieValue;
}


var guessMarker = null;
const csrftoken = getCSRFToken();
if (!csrftoken) {
	console.error("CSRFtoken not found");
}

