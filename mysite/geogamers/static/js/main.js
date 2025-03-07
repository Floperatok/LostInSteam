
'use strict';

async function getApi(path) {
	try {
		const response = await fetch(path, {
			method: "GET",
			headers: {
				"X-CSRFToken": csrftoken
			},
		});
		if (!response.ok) {
			const error = new Error(`${response.status} - ${response.statusText}`);
			error.status = response.status;
			throw (error);
		}
		const responseData = await response.json();
		return (responseData);
	} catch (error) {
		throw (error);
	}
}


async function postApi(path, data) {
	try {
		const response = await fetch(path, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": csrftoken
			},
			body: JSON.stringify(data)
		});
		if (!response.ok) {
			const error = new Error(`${response.status} - ${response.statusText}`);
			error.status = response.status;
			throw (error);
		}
		const responseData = await response.json();
		return (responseData);
	} catch (error) {
		throw (error);
	}
}


function displayScreen(screenId) {
	const screens = document.querySelectorAll('.screen');
	screens.forEach(screen => screen.classList.add("hidden"));

	const activeScreen = document.getElementById(screenId);
	if (!activeScreen) {
		console.error(`No screen with id ${screenId} found`);
		return ;
	}
	activeScreen.classList.remove("hidden");
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

