from django.urls import path, include
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("game/", views.game, name="game"),
    path("api/randompano/", views.get_random_pano, name="get_random_pano"),
	path("api/tiles/<int:game_id>/<int:pano_number>/<int:zoom>/<str:face>/<int:y>/<int:x>.jpg", 
		views.get_pano_tiles, name="get_pano_tiles"),
	path("api/tiles/<int:game_id>/<int:pano_number>/preview.jpg", 
		views.get_pano_preview, name="get_pano_preview"),
	path("api/guess/", views.guess_game, name="guess_game"),
]
