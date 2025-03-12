
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
		return (response);
	
	} catch (error) {
		if (error instanceof TypeError) {
			error = new Error(`503 - Service Unavailable`);
			error.status = 503;
		}
		throw (error);
	}
}


async function getApiJson(path) {
	const response = await getApi(path);
	return (await response.json());
}


async function getApiImage(path) {
	const response = await getApi(path);
	return (await response.blob());
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
		return (response);
	} catch (error) {
		if (error instanceof TypeError) {
			error = new Error(`503 - Service Unavailable`);
			error.status = 503;
		}
		throw (error);
	}
}


async function postApiJson(path, data) {
	const response = await postApi(path, data);
	return (await response.json());
}


function errorScreen(status, statusText) {
	document.getElementById("error_title").innerText = statusText;
	const errorMsg = document.getElementById("error_msg");
	switch (status) {
		case 404:
			errorMsg.innerText = "Seems like the ressource you are trying to access does not exist...";
			break;
		case 500:
			errorMsg.innerText = "Congratulations ! You broke our server. Press F5 to pay respect...";
			break;
		case 503:
			errorMsg.innerText = "Server is down, please come again !"
			break;
		default:
			errorMsg.innerText = "This might not be your fault, refresh the page. Please contact the devs if this keep happening";
	}
	displayScreen("error_screen");
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

