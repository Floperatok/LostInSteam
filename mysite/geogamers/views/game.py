from geogamers.models import Game, Map
from django.http import HttpResponseNotAllowed, \
						HttpResponseNotFound, \
						HttpResponseServerError, \
						JsonResponse                            
from .accel_redirect_response import HttpResponseAccelRedirect
from .map import get_placeholder_map


def get_poster(request, game_id):
	if request.method != "GET":
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()
	try:
		game = Game.objects.get(id=game_id)
	except Game.DoesNotExist:
		print(f"No game matches the given query 'id={game_id}'")
		return HttpResponseNotFound()
	except Game.MultipleObjectsReturned:
		print(f"Multiple games matches the given query 'id={game_id}'")
		return HttpResponseServerError()
	return HttpResponseAccelRedirect(f"{game.name}/poster.jpg")


def return_game_infos(game):
	maps = Map.objects.filter(game__id=game.id)
	if len(maps) == 0:
		print(f"No map matches the given query 'game__id={game.id}', using placeholder")
		maps = get_placeholder_map()
		if not maps:
			return HttpResponseServerError()
	maps_data = [{"id": map.id, "name": map.name} for map in maps]
	return JsonResponse({
		"valid": True,
		"prettyGameName": game.pretty_name,
		"mapsData": maps_data,
	})