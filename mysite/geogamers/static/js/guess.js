
'use strict';

async function guessGame(gameId, guess) {
	const path = "/api/guess/game/";
	try {
		const response = await fetch(path, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": csrftoken
			},
			body: JSON.stringify({ gameId, guess })
		});
		if (!response.ok) {
			throw new Error(`${response.status} - ${path}`);
		}
		const data = await response.json();
		return data;

	} catch (error) {
		console.error(`Fetch: ${error}`);
		return null;
	}
}