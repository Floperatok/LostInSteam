from geogamers.models import Pano, Map
from django.http import JsonResponse, \
						HttpResponseBadRequest, \
						HttpResponseNotFound, \
						HttpResponseServerError, \
						HttpResponseNotAllowed
import json, math
from geogamers.input_parsing import valid_game_guess


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
			map = Map.objects.get(game__id=game_id)
		except Map.DoesNotExist:
			print(f"No map matches the given query 'game__id={game_id}'")
			return HttpResponseNotFound()
		except Map.MultipleObjectsReturned:
			print(f"Multiple maps matches the given query 'game__id={game_id}'")
			return HttpResponseServerError()
		
		game = map.game
		if valid_game_guess(game, guess):
			return JsonResponse({
				"valid": True,
				"prettyName": game.pretty_name,
				"mapId": map.id,
			})
		else:
			return JsonResponse({
				"valid": False,
				"prettyName": "",
				"mapId": 0,
			})
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
			pano = Pano.objects.get(id=pano_id)
		except Pano.DoesNotExist:
			print(f"No pano matches the given query 'id={pano_id}'")
			return HttpResponseNotFound()
		except Pano.MultipleObjectsReturned:
			print(f"Multiple panos matches the given query 'id={pano_id}'")
			return HttpResponseServerError()
		
		distance = math.sqrt((pos["lng"] - pano.lng) ** 2 + (pos["lat"] - pano.lat) ** 2)
		return JsonResponse({
			"answerLng": pano.lng,
			"answerLat": pano.lat,
			"distance": round(distance, 2),
		})
	else:
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()
