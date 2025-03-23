from geogamers.models import Pano, Map, Game
from django.http import JsonResponse, \
						HttpResponseBadRequest, \
						HttpResponseNotFound, \
						HttpResponseServerError, \
						HttpResponseNotAllowed
import json, random
from .map import get_placeholder_map


def find_game_command(request):
	if request.method != "POST":
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()
	try:
		request_body = json.loads(request.body)
		game_id = request_body.get("gameId")
	except json.JSONDecodeError:
		print("Invalid JSON format")
		return HttpResponseBadRequest()

	try:
		game = Game.objects.get(id=game_id)
	except Game.DoesNotExist:
		print(f"No game matches the given query 'gameId={game_id}'")
		return HttpResponseServerError()
	except Game.MultipleObjectsReturned:
		print(f"Multiple games matches the given query 'gameId={game_id}'")
		return HttpResponseServerError()
		
	try:
		map = Map.objects.get(game=game)
	except Map.DoesNotExist:
		print(f"No map matches the given query 'game={game.name}', using placeholder")
		map = get_placeholder_map()
		if not map:
			return HttpResponseServerError()
	except Map.MultipleObjectsReturned:
		print(f"Multiple maps matches the given query 'game={game.name}'")
		return HttpResponseServerError()

	if map.tile_depth == 0:
		print("invalid map, using placeholder")
		map = get_placeholder_map()
	return JsonResponse({
		"mapId": map.id,
		"prettyGameName": game.pretty_name
	})


def	goto_pano_command(request):
	if request.method != "POST":
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()
	try:
		request_body = json.loads(request.body)
		game_name = request_body.get("gameName")
		pano_number = request_body.get("panoNumber")
	except json.JSONDecodeError:
		print("Invalid JSON format")
		return HttpResponseBadRequest()
	if not pano_number or pano_number == -1:
		panos = Pano.objects.filter(game__name=game_name)
		if len(panos) == 0:
			print(f"No pano matches the given query 'game_name={game_name}'")
			return HttpResponseNotFound()
		pano = random.choice(panos)
	else:
		try:
			pano = Pano.objects.get(game__name=game_name, number=pano_number)
		except Pano.DoesNotExist:
			print(f"No pano matches the given query 'game_name={game_name} number={pano_number}'")
			return HttpResponseNotFound()
		except Pano.MultipleObjectsReturned:
			print(f"Multiple panos matches the given query 'game_name={game_name} number={pano_number}'")
			return HttpResponseServerError()
	return JsonResponse({
		"id": pano.id,
		"gameId": pano.game.id,
		"settings": pano.settings,
	})
