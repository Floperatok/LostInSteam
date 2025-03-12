from geogamers.models import Game
from django.http import HttpResponseNotAllowed, \
						HttpResponseNotFound, \
						HttpResponseServerError, \
						HttpResponse

def get_poster(request, game_id):
	if request.method == "GET":
		try:
			game = Game.objects.get(id=game_id)
		except Game.DoesNotExist:
			print(f"No game matches the given query 'id={game_id}'")
			return HttpResponseNotFound()
		except Game.MultipleObjectsReturned:
			print(f"Multiple games matches the given query 'id={game_id}'")
			return HttpResponseServerError()
		path = f"geogamers/data/{game.name}/poster.png"
		try:
			with open(path, "rb") as file:
				return HttpResponse(file.read(), content_type="image/png")
		except OSError:
			print(f"{path} not found in file tree")
			return HttpResponseNotFound()
		
	else:
		print(f"{request.method} not allowed")
		return HttpResponseNotAllowed()