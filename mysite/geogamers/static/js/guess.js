
'use strict';

async function guess_game(game_id, guess) {
	const path = "/api/guess/";
	try {
		const response = await fetch(path, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": csrftoken
			},
			body: JSON.stringify({ game_id, guess })
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