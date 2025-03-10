from geogamers.models import Pano, Map
from django.http import JsonResponse, \
						HttpResponseBadRequest, \
						HttpResponseNotFound, \
						HttpResponseServerError, \
						HttpResponseNotAllowed
import json, random
from .map import get_placeholder_map


def find_game_command(request):
	if request.method == "POST":
		try:
			request_body = json.loads(request.body)
			game_id = request_body.get("gameId")
		except json.JSONDecodeError:
			print("Invalid JSON format")
			return HttpResponseBadRequest()
		try:
			map = Map.objects.get(game__id=game_id)
		except Map.DoesNotExist:
			print(f"No map matches the given query 'game__id={game_id}', using placeholder")
			map = get_placeholder_map()
			if not map:
				return HttpResponseServerError()
		except Map.MultipleObjectsReturned:
			print(f"Multiple maps matches the given query 'gameId={game_id}'")
			return HttpResponseServerError()

		if map.tile_depth == 0:
			print("invalid map, using placeholder")
			map = get_placeholder_map()
		return JsonResponse({
			"mapId": map.id,
		})
	else:
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()


def	goto_pano_command(request):
	if request.method == "POST":
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
	else:
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()
