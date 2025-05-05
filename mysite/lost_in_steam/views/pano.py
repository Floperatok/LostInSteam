from lost_in_steam.models import Pano
from django.http import JsonResponse, \
						HttpResponseNotFound, \
						HttpResponseServerError, \
						HttpResponseNotAllowed, \
						HttpResponse
import random
from .accel_redirect_response import HttpResponseAccelRedirect


def get_random_pano(request):
	if request.method != "GET":
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()
	panos = list(Pano.objects.all())
	pano = random.choice(panos)
	return JsonResponse({
		"id": pano.id,
		"gameId": pano.game.id,
		"settings": pano.settings,
	})


def get_pano_tile(request, pano_id, z, f, y, x):
	if request.method != "GET":
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()
	try:
		pano = Pano.objects.get(id=pano_id)
	except Pano.DoesNotExist:
		print(f"No pano matches the given query 'id={pano_id}'")
		return HttpResponseNotFound()

	return HttpResponseAccelRedirect(f"{pano.game.name}/{pano.number}/{z}/{f}/{y}/{x}.jpg")


def get_pano_preview(request, pano_id):
	if request.method != "GET":
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()
	try:
		pano = Pano.objects.get(id=pano_id)
	except Pano.DoesNotExist:
		print(f"No pano matches the given query 'id={pano_id}'")
		return HttpResponseNotFound()
	except Pano.MultipleObjectsReturned:
		print(f"Multiple panos matches the given query 'id={pano_id}'")
		return HttpResponseServerError()
	return HttpResponseAccelRedirect(f"{pano.game.name}/{pano.number}/preview.jpg")