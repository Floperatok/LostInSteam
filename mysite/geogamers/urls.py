from django.urls import path
from geogamers.views import *

urlpatterns = [
	path("", views.home, name="home"),
	path("game/", views.game, name="game"),

	path("api/randompano/", pano.get_random_pano, name="get_random_pano"),
	path("api/pano/<uuid:pano_id>/preview.jpg", pano.get_pano_preview, name="get_pano_preview"),
	path("api/pano/<uuid:pano_id>/<int:z>/<str:f>/<int:y>/<int:x>.jpg", pano.get_pano_tile, name="get_pano_tile"),

	path("api/map/<uuid:map_id>/<int:z>/<int:x>/<int:y>.jpg", map.get_map_tile, name="get_map_tile"),
	path("api/map/info/<uuid:map_id>/", map.get_map_infos, name="get_map_infos"),

	path("api/guess/game/", guess.guess_game, name="guess_game"),
	path("api/guess/pos/", guess.guess_pos, name="guess_pos"),

	path("api/command/goto/", command.goto_pano_command, name="goto_pano_command"),
	path("api/command/find/", command.find_game_command, name="find_game_command"),
]
