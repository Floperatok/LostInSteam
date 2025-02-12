from django.shortcuts import render, get_object_or_404
from geogamers.models import Game, Pano
from django.http import JsonResponse, \
						HttpResponseBadRequest, \
						HttpResponseNotFound, \
						HttpResponseServerError, \
						HttpResponse
import json
import os

# Create your views here.

def home(request):
	return render(request, "index.html")

def game(request):
	return render(request, "game.html")

def get_pano_info(request, game_id, pano_number):
	if request.method == "GET":
		try:
			game = get_object_or_404(Game, id=game_id)
			pano = get_object_or_404(Pano, game=game, number=pano_number)
		except Game.DoesNotExist:
			return HttpResponseNotFound(f"No Game matches the given query 'id={game_id}'")
		except Pano.DoesNotExist:
			return HttpResponseNotFound(f"No Pano matches the given query 'id={game_id}'/{pano_number}")

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
		return HttpResponseBadRequest(f"{request.method} not supported")
	
def get_pano_tiles(request, game_id, pano_number, zoom, face, y, x):
	if request.method == "GET":
		try:
			game_name = get_object_or_404(Game, id=game_id).name
		except Game.DoesNotExist:
			return HttpResponseNotFound(f"No Game matches the given query 'id={game_id}'")

		tile_path = f"geogamers/data/{game_name}/{pano_number}/{zoom}/{face}/{y}/{x}.jpg"
		try:
			with open(tile_path, "rb") as file:
				return HttpResponse(file.read(), content_type="image/jpg")
		except OSError:
			return HttpResponseServerError(f"{tile_path} found in database but not in file tree")

	else:
		return HttpResponseBadRequest(f"{request.method} not supported")

def get_pano_preview(request, game_id, pano_number):
	if request.method == "GET":
		try:
			game_name = get_object_or_404(Game, id=game_id).name
		except Game.DoesNotExist:
			return HttpResponseNotFound(f"No Game matches the given query 'id={game_id}'")

		preview_path = f"geogamers/data/{game_name}/{pano_number}/preview.jpg"
		try:
			with open(preview_path, "rb") as file:
				return HttpResponse(file.read(), content_type="image/jpg")
		except OSError:
			return HttpResponseServerError(f"{preview_path} found in database but not in file tree")

	else:
		return HttpResponseBadRequest(f"{request.method} not supported")