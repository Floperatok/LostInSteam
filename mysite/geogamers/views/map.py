from geogamers.models import Map
from django.http import JsonResponse, \
						HttpResponseNotFound, \
						HttpResponseServerError, \
						HttpResponseNotAllowed, \
						HttpResponse
import uuid


def get_map_infos(request, map_id):
	if request.method == "GET":
		try:
			map = Map.objects.get(id=map_id)
		except Map.DoesNotExist:
			print(f"No map matches the given query 'id={map_id}'")
			return HttpResponseNotFound()
		except Map.MultipleObjectsReturned:
			print(f"Multiple maps matches the given query 'id={map_id}'")

		if map.tile_depth == 0:
			return JsonResponse({
				"id": uuid.UUID("00000000-0000-0000-0000-000000000000"),
				"tileDepth":  7,
				"attribution": "",
				"bounds": [[-185, -280], [50, 115]],
				"bgColor": "#000000",
			})
		else:
			return JsonResponse({
				"id": map.id,
				"tileDepth":  map.tile_depth,
				"attribution": map.attribution,
				"bounds": map.bounds,
				"bgColor": map.bg_color,
			})
	else:
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()



def get_map_tile(request, map_id, z, x, y):
	if request.method == "GET":
		if map_id == uuid.UUID("00000000-0000-0000-0000-000000000000"):
			tile_path = f"geogamers/data/placeholder/map/{z}/{x}/{y}.jpg"
		else:
			try:
				map = Map.objects.get(id=map_id)
			except Map.DoesNotExist:
				print(f"No map matches the given query 'id={map_id}'")
				return HttpResponseNotFound()
			except Map.MultipleObjectsReturned:
				print(f"Multiple maps matches the given query 'id={map_id}'")
				return HttpResponseServerError()
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
