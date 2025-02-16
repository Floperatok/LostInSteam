from django.core.management.base import BaseCommand, CommandError
from geogamers.models import Game, Pano, Map
import os, json

class Command(BaseCommand):
	help = "Updates panoramas database from file"

	def add_arguments(self, parser):
		parser.add_argument("data_path", type=str)


	def create_pano_obj(self, pano_data, game_obj):
		pano_settings_path = f"{pano_data["path"]}/data.json"

		if not os.path.exists(pano_settings_path):
			self.stderr.write(self.style.ERROR(f"Error: {pano_settings_path} not found"))
			return

		pano_settings_file = open(pano_settings_path)
		pano_settings = json.load(pano_settings_file)

		try:
			pano_obj, created = Pano.objects.get_or_create(
				game = game_obj,
				number = pano_data["number"],
				posx = pano_data["posx"],
				posy = pano_data["posy"],
				settings = pano_settings,
			)
		except Exception as err:
			self.stderr.write(self.style.ERROR(f"Error creating panoramas {pano_data["number"]} for the game {game_obj.name}: {err}"))
			return

		if created:
			self.stdout.write(self.style.SUCCESS(f"New panorama           : {pano_obj.__str__()}"))
		else:
			self.stdout.write(f"Panorama already exist : {pano_obj.__str__()}")

	
	def create_map_obj(self, map_data, game_obj):
		try:
			map_obj, created = Map.objects.get_or_create(
				game = game_obj,
				tile_depth = map_data["tile_depth"],
				attribution = map_data["attribution"],
			)
		except Exception as err:
			self.stderr.write(self.style.ERROR(f"Error creating map for the game {game_obj.name}: {err}"))
			return

		if created:
			self.stdout.write(self.style.SUCCESS(f"New map                : {map_obj.__str__()}"))
		else:
			self.stdout.write(f"Map already exist      : {map_obj.__str__()}")


	def create_game_obj(self, game_data):
		try:
			game_obj, created = Game.objects.get_or_create(
				name = game_data["name"],
				pretty_name = game_data["pretty_name"],
				accepted_names = game_data["accepted_names"],
			)
		except Exception as err:
			self.stderr.write(self.style.ERROR(f"Error creating game {game_data["name"]}: {err}"))
			return

		if created:
			self.stdout.write(self.style.SUCCESS(f"New game               : {game_obj.__str__()}"))
		else:
			self.stdout.write(f"Game already exist     : {game_obj.__str__()}")
		
		self.create_map_obj(game_data["map"], game_obj)

		for pano_data in game_data["panoramas"]:
			pano_data["path"] = f"{game_data["path"]}/{pano_data["number"]}"
			self.create_pano_obj(pano_data, game_obj)


	def handle(self, *args, **options):
		data_path = f"{options["data_path"].strip("/ ")}/data.json"

		if not os.path.exists(data_path):
			self.stdout.write(self.style.ERROR(f"Error: {data_path} not found"))
			return
		
		data_file = open(data_path, "r")
		data = json.load(data_file)
		for game_data in data:
			game_data["path"] = options["data_path"].rstrip("/ ") + "/" + game_data["name"]
			self.create_game_obj(game_data)
