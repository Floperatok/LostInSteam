from geogamers.models import Game
from django.http import HttpResponseNotAllowed, \
						HttpResponseNotFound, \
						HttpResponseServerError                              
from .accel_redirect_response import HttpResponseAccelRedirect


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
	return HttpResponseAccelRedirect(f"{game.name}/poster.png")
