from geogamers.models import Pano
from django.http import JsonResponse, \
						HttpResponseNotFound, \
						HttpResponseServerError, \
						HttpResponseNotAllowed, \
						HttpResponse
import random


def get_random_pano(request):
	if request.method == "GET":
		panos = list(Pano.objects.all())
		pano = random.choice(panos)

		return JsonResponse({
			"id": pano.id,
			"gameId": pano.game.id,
			"settings": pano.settings,
		})
	else:
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()


def get_pano_tile(request, pano_id, z, f, y, x):
	if request.method == "GET":
		try:
			pano = Pano.objects.get(id=pano_id)
		except Pano.DoesNotExist:
			print(f"No pano matches the given query 'id={pano_id}'")
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


def get_pano_preview(request, pano_id):
	if request.method == "GET":
		try:
			pano = Pano.objects.get(id=pano_id)
		except Pano.DoesNotExist:
			print(f"No pano matches the given query 'id={pano_id}'")
			return HttpResponseNotFound()
		except Pano.MultipleObjectsReturned:
			print(f"Multiple panos matches the given query 'id={pano_id}'")
			return HttpResponseServerError()

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
