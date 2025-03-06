from django.shortcuts import render, get_object_or_404
from geogamers.models import Game, Pano, Map
from django.http import JsonResponse, \
						HttpResponseBadRequest, \
						HttpResponseNotFound, \
						HttpResponseServerError, \
						HttpResponseNotAllowed, \
						HttpResponse
import json, uuid, random, math

from geogamers.input_parsing import valid_game_guess

def home(request):
	return render(request, "index.html")


def game(request):
	return render(request, "game.html")


def get_random_pano(request):
	if request.method == "GET":
		panos = list(Pano.objects.all())
		pano = random.choice(panos)

		data = {
			"id": pano.id,
			"game_id": pano.game.id,
			"settings": pano.settings,
		}
		return JsonResponse(data)
	else:
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()
	

def get_map_infos(request, map_id):
	if request.method == "GET":
		try:
			map = get_object_or_404(Map, id=map_id)
		except Map.DoesNotExist:
			print(f"No map matches the given query 'id={map_id}'")
			return HttpResponseNotFound()


		if map.tile_depth == 0:
			data = {
				"id": uuid.UUID("00000000-0000-0000-0000-000000000000"),
				"tile_depth":  7,
				"attribution": "",
				"bounds": [[-185, -280], [50, 115]],
				"bg_color": "#000000",
			}
		else:
			data = {
				"id": map.id,
				"tile_depth":  map.tile_depth,
				"attribution": map.attribution,
				"bounds": map.bounds,
				"bg_color": map.bg_color,
			}
		return JsonResponse(data)
	else:
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()


def get_pano_tile(request, pano_id, z, f, y, x):
	if request.method == "GET":
		try:
			pano = get_object_or_404(Pano, id=pano_id)
		except Pano.DoesNotExist:
			print(f"No panorama matches the given query 'id={pano_id}'")
			return HttpResponseNotFound()

		tile_path = f"geogamers/data/{pano.game.name}/{pano.number}/{z}/{f}/{y}/{x}.jpg"
		try:
			with open(tile_path, "rb") as file:
				return HttpResponse(file.read(), content_type="image/jpg")
		except OSError:
			print(f"{tile_path} not found in file tree")
			return HttpResponseServerError()

	else:
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()


def get_map_tile(request, map_id, z, x, y):
	if request.method == "GET":
		if map_id == uuid.UUID("00000000-0000-0000-0000-000000000000"):
			tile_path = f"geogamers/data/placeholder/map/{z}/{x}/{y}.jpg"
		else:
			try:
				map = get_object_or_404(Map, id=map_id)
			except Map.DoesNotExist:
				print(f"No map matches the given query 'id={map.id}'")
				return HttpResponseNotFound()
			tile_path = f"geogamers/data/{map.game.name}/map/{z}/{x}/{y}.jpg"

		try:
			with open(tile_path, "rb") as file:
				return HttpResponse(file.read(), content_type="image/jpg")
		except OSError:
			print(f"{tile_path} not found in file tree")
			return HttpResponseNotFound()
			
	else:
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()


def get_pano_preview(request, pano_id):
	if request.method == "GET":
		try:
			pano = get_object_or_404(Pano, id=pano_id)
		except Pano.DoesNotExist:
			print(f"No panorama matches the given query 'id={pano_id}'")
			return HttpResponseNotFound()

		preview_path = f"geogamers/data/{pano.game.name}/{pano.number}/preview.jpg"
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
			request_body = json.loads(request.body)
			game_id = request_body.get("gameId")
			guess = request_body.get("guess")
		except json.JSONDecodeError:
			print("Invalid JSON format")
			return HttpResponseBadRequest()
		
		try:
			game = get_object_or_404(Game, id=game_id)
		except Game.DoesNotExist:
			print(f"No Game matches the given query 'id={game_id}'")
			return HttpResponseNotFound()
		
		try:
			map = get_object_or_404(Map, game=game)
		except Map.DoesNotExist:
			print(f"No Map matches the given query 'game={game.__str__()}'")
			return HttpResponseNotFound()

		if valid_game_guess(game, guess):
			data = {
				"valid": True,
				"prettyName": game.pretty_name,
				"mapId": map.id,
			}
		else:
			data = {
				"valid": False,
				"pretty_name": "",
				"map_id": 0,
			}
		return JsonResponse(data)
	else:
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()
	

def guess_pos(request):
	if request.method == "POST":
		try:
			request_body = json.loads(request.body)
			pano_id = request_body.get("panoId")
			pos = request_body.get("pos")
		except json.JSONDecodeError:
			print("Invalid JSON format")
			return HttpResponseBadRequest()

		try:
			pano = get_object_or_404(Pano, id=pano_id)
		except Pano.DoesNotExist:
			print(f"No panorama matches the given query 'id={pano_id}'")
			return HttpResponseNotFound()
		
		distance = math.sqrt((pos["lng"] - pano.lng) ** 2 + (pos["lat"] - pano.lat) ** 2)

		data = {
			"answer_lng": pano.lng,
			"answer_lat": pano.lat,
			"distance": round(distance, 2),
		}
		return JsonResponse(data)
	else:
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()