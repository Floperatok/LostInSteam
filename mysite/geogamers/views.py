from django.shortcuts import render, get_object_or_404
from geogamers.models import Game, Pano
from django.http import JsonResponse, \
						HttpResponseBadRequest, \
						HttpResponseNotFound, \
						HttpResponseServerError, \
						HttpResponseNotAllowed, \
						HttpResponse
import json, os, random

from geogamers.input_parsing import valid_game_guess

# Create your views here.

def home(request):
	return render(request, "index.html")


def game(request):
	return render(request, "game.html")


def get_random_pano(request):
	if request.method == "POST":
		try:
			current_pano_id = json.loads(request.body).get("currentPanoId")
		except json.JSONDecodeError:
			print("Invalid JSON format")
			return HttpResponseBadRequest()

		panos = list(Pano.objects.all())
		if (not current_pano_id):
			pano = random.choice(panos)
		else:
			filtered_panos = [p for p in panos if p.id != current_pano_id]
			pano = random.choice(filtered_panos) if filtered_panos else None

		data = {
			"id": pano.id,
			"game_id": pano.game.id,
			"number": pano.number,
			"posx": pano.posx,
			"posy": pano.posy,
			"settings": pano.settings,
		}
		return JsonResponse(data)
	else:
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()


def get_pano_tiles(request, game_id, pano_number, zoom, face, y, x):
	if request.method == "GET":
		try:
			game_name = get_object_or_404(Game, id=game_id).name
		except Game.DoesNotExist:
			print(f"No Game matches the given query 'id={game_id}'")
			return HttpResponseNotFound()

		tile_path = f"geogamers/data/{game_name}/{pano_number}/{zoom}/{face}/{y}/{x}.jpg"
		try:
			with open(tile_path, "rb") as file:
				return HttpResponse(file.read(), content_type="image/jpg")
		except OSError:
			print(f"{tile_path} found in database but not in file tree")
			return HttpResponseServerError()

	else:
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()


def get_pano_preview(request, game_id, pano_number):
	if request.method == "GET":
		try:
			game_name = get_object_or_404(Game, id=game_id).name
		except Game.DoesNotExist:
			print(f"No Game matches the given query 'id={game_id}'")
			return HttpResponseNotFound()

		preview_path = f"geogamers/data/{game_name}/{pano_number}/preview.jpg"
		try:
			with open(preview_path, "rb") as file:
				return HttpResponse(file.read(), content_type="image/jpg")
		except OSError:
			print(f"{preview_path} found in database but not in file tree")
			return HttpResponseServerError()
	else:
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()


def guess_game(request):
	if request.method == "POST":
		try:
			data = json.loads(request.body)
			game_id = data.get("game_id")
			guess = data.get("guess")
		except json.JSONDecodeError:
			print("Invalid JSON format")
			return HttpResponseBadRequest()
		
		try:
			game = get_object_or_404(Game, id=game_id)
		except Game.DoesNotExist:
			print(f"No Game matches the given query 'id={game_id}'")
			return HttpResponseNotFound()

		if valid_game_guess(game, guess):
			data = {
				"valid": True,
				"pretty_name": game.pretty_name 
			}
		else:
			data = {
				"valid": False,
				"pretty_name": "" 
			}
		return JsonResponse(data)
	else:
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()