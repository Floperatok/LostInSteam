
document.addEventListener("DOMContentLoaded", game)

async function game() {
	const mapContainer = document.createElement("div");
	mapContainer.id = "map";
	mapContainer.classList.add("scale1");
	const app = new App({
		mapContainer: mapContainer,
		panoContainerId: "pano",
		compassContainerId: "compass",
		guessGameFormId: "guess_game_form",
		gameAnswerId: "game_answer",
	});
	app.displayGameScreen();
	await app.panoManager.loadRandomPano();
	app.gameAnswer.loadPoster(app.panoManager.gameId);

}