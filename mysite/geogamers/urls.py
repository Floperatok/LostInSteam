from django.urls import path
from . import views

urlpatterns = [
	path("", views.home, name="home"),
	path("game/", views.game, name="game"),
	path("api/randompano/", views.get_random_pano, name="get_random_pano"),
	path("api/panos/<uuid:pano_id>/<int:z>/<str:f>/<int:y>/<int:x>.jpg", 
		views.get_pano_tile, name="get_pano_tile"),
	path("api/panos/<uuid:pano_id>/preview.jpg", 
		views.get_pano_preview, name="get_pano_preview"),
	path("api/maps/<uuid:map_id>/<int:z>/<int:x>/<int:y>.jpg", 
		views.get_map_tile, name="get_map_tile"),
	path("api/guess/game/", views.guess_game, name="guess_game"),
	path("api/guess/pos/", views.guess_pos, name="guess_pos"),
]
