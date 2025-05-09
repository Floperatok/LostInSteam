from django.core.management.base import BaseCommand, CommandError
from lost_in_steam.models import Game, Pano, Map
import os, json

class Command(BaseCommand):
	help = "Updates panoramas database from file"

	def add_arguments(self, parser):
		parser.add_argument("data_path", type=str)


	def create_pano_obj(self, pano_data, game_obj, map_obj):
		pano_settings_path = f"{pano_data["path"]}/data.json"

		if not os.path.exists(pano_settings_path):
			self.stderr.write(self.style.ERROR(f"Error: {pano_settings_path} not found"))
			return

		pano_settings_file = open(pano_settings_path)
		pano_settings = json.load(pano_settings_file)

		try:
			pano_obj, created = Pano.objects.update_or_create(
				game = game_obj,
				number = pano_data["number"],
				defaults={
					"map": map_obj,
					"lat": pano_data["lat"],
					"lng": pano_data["lng"],
					"settings": pano_settings,
				},
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
			map_obj, created = Map.objects.update_or_create(
				game = game_obj,
				name = map_data["name"],
				defaults={
					"tile_depth": map_data["tile_depth"],
					"attribution": map_data["attribution"],
					"bounds": map_data["bounds"],
					"bg_color": map_data["bg_color"],
				}
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
		
		for map in game_data["maps"]:
			self.create_map_obj(map, game_obj)

		for pano_data in game_data["panoramas"]:
			pano_data["path"] = f"{game_data["path"]}/{pano_data["number"]}"
			if pano_data["map_name"] == "":
				map_obj = Map.objects.get(game__name="placeholder", name="placeholder")
			else:
				map_obj = Map.objects.get(game=game_obj, name=pano_data["map_name"])
			self.create_pano_obj(pano_data, game_obj, map_obj)


	def handle(self, *args, **options):
		data_path = f"{options["data_path"].rstrip("/ ")}/data.json"

		if not os.path.exists(data_path):
			self.stdout.write(self.style.ERROR(f"Error: {data_path} not found"))
			return
		
		data_file = open(data_path, "r")
		data = json.load(data_file)
		for game_data in data:
			game_data["path"] = options["data_path"].rstrip("/ ") + "/" + game_data["name"]
			self.create_game_obj(game_data)
