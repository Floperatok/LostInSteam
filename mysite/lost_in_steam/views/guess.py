from lost_in_steam.models import Pano, Game, Map
from django.http import JsonResponse, \
						HttpResponseBadRequest, \
						HttpResponseNotFound, \
						HttpResponseServerError, \
						HttpResponseNotAllowed
import json, math
from lost_in_steam.input_parsing import valid_game_guess
from lost_in_steam.points import compute_points
from .game import return_game_infos


def guess_game(request):
	if request.method != "POST":
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()
	try:
		request_body = json.loads(request.body)
		game_id = request_body.get("gameId")
		guess = request_body.get("guess")
	except json.JSONDecodeError:
		print("Invalid JSON format")
		return HttpResponseBadRequest()
	
	try:
		game = Game.objects.get(id=game_id)
	except Game.DoesNotExist:
		print(f"No game matches the given query 'id={game_id}'")
		return HttpResponseNotFound()
	except Game.MultipleObjectsReturned:
		print(f"Multiple games matches the given query 'id={game_id}'")
		return HttpResponseServerError()
	
	if valid_game_guess(game, guess):
		return return_game_infos(game)
	else:
		return JsonResponse({
			"valid": False,
			"prettyGameName": "",
			"mapsData": [],
		})


def guess_pos(request):
	if request.method != "POST":
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()
	try:
		request_body = json.loads(request.body)
		guessed_map_id = request_body.get("guessedMapId")
		pano_id = request_body.get("panoId")
		user_pos = request_body.get("pos")
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

	points = compute_points(user_pos, {"lat": pano.lat, "lng": pano.lng}, pano.map.bounds, pano.map.tile_depth)

	if str(pano.map.id) != guessed_map_id:
		points = 0
	return JsonResponse({
		"answerPos": {"lng": pano.lng, "lat": pano.lat},
		"answerMapId": pano.map.id,
		"points": round(points),
	})
