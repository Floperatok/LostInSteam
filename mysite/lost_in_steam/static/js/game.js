
document.addEventListener("DOMContentLoaded", game)

async function game() {
	const mapContainer = document.createElement("div");
	mapContainer.id = "map";
	mapContainer.classList.add("scale1");
	const app = new App({
		gameScreenId: "game_screen",
		resultScreenId: "result_screen",
		mapContainer: mapContainer,
		panoContainerId: "pano",
		compassContainerId: "compass",
		guessGameFormId: "guess_game_form",
		gamePosterId: "game_answer",
		resultUIId: "result_island",
	});
	app.displayGameScreen();
	await app.panoManager.loadRandomPano();
	app.gamePoster.loadPoster(app.panoManager.gameId);

}