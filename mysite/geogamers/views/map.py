from geogamers.models import Map
from django.http import JsonResponse, \
						HttpResponseNotFound, \
						HttpResponseServerError, \
						HttpResponseNotAllowed, \
						HttpResponse
import uuid
from .accel_redirect_response import HttpResponseAccelRedirect


def get_placeholder_map():
	try:
		map = Map.objects.get(game__name="placeholder")
		return map
	except Map.DoesNotExist:
		print("Placeholder map not found")
		return 
	except Map.MultipleObjectsReturned:
		print(f"Multiple maps matches the given query 'game_name=placeholder'")
		return


def get_map_infos(request, map_id):
	if request.method != "GET":
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()
	try:
		map = Map.objects.get(id=map_id)
	except Map.DoesNotExist:
		print(f"No map matches the given query 'id={map_id}'")
		return HttpResponseNotFound()
	except Map.MultipleObjectsReturned:
		print(f"Multiple maps matches the given query 'id={map_id}'")
		return HttpResponseServerError()

	return JsonResponse({
		"id": map.id,
		"tileDepth":  map.tile_depth,
		"attribution": map.attribution,
		"bounds": map.bounds,
		"bgColor": map.bg_color,
	})


def get_map_tile(request, map_id, z, x, y):
	if request.method != "GET":
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()
	if map_id == uuid.UUID("00000000-0000-0000-0000-000000000000"):
		tile_path = f"placeholder/map/{z}/{x}/{y}.jpg"
	else:
		try:
			map = Map.objects.get(id=map_id)
		except Map.DoesNotExist:
			print(f"No map matches the given query 'id={map_id}'")
			return HttpResponseNotFound()
		except Map.MultipleObjectsReturned:
			print(f"Multiple maps matches the given query 'id={map_id}'")
			return HttpResponseServerError()
		tile_path = f"{map.game.name}/map/{z}/{x}/{y}.jpg"
	return HttpResponseAccelRedirect(tile_path)
