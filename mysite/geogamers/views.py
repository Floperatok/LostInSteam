from django.shortcuts import render, get_object_or_404
from geogamers.models import Game, Pano
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseNotFound, HttpResponse
import json
import os

# Create your views here.

def home(request):
	return render(request, "index.html")

def game(request):
	return render(request, "game.html")

def get_pano_info(request, game_name, pano_number):
	if request.method == "GET":
		try:
			game = get_object_or_404(Game, name=game_name)
			pano = get_object_or_404(Pano, game=game, number=pano_number)
		except Game.DoesNotExist:
			print(f"No Game matches the given query '{game_name}'")
			return HttpResponseNotFound()
		except Pano.DoesNotExist:
			print(f"No Pano matches the given query '{game_name}'/{pano_number}")
			return HttpResponseNotFound()

		data = {
			"id": pano.id,
			"game_name": game.name,
			"number": pano.number,
			"posx": pano.posx,
			"posy": pano.posy,
			"settings": pano.settings,
		}
		return JsonResponse(data)
	else:
		return HttpResponseBadRequest(f"{request.method} not supported")
	
def get_pano_tiles(request, game_name, pano_number, zoom, face, y, x):
	if request.method == "GET":
		tile_path = f"geogamers/data/{game_name}/{pano_number}/{zoom}/{face}/{y}/{x}.jpg"
		try:
			with open(tile_path, "rb") as file:
				return HttpResponse(file.read(), content_type="image/jpg")
		except OSError:
			return HttpResponseNotFound()

	else:
		return HttpResponseBadRequest(f"{request.method} not supported")
