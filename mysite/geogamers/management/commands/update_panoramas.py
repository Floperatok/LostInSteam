from django.core.management.base import BaseCommand, CommandError
from geogamers.models import Game, Pano
import os, json

class Command(BaseCommand):
	help = "Updates panoramas database from file"

	def add_arguments(self, parser):
		parser.add_argument("data_path", type=str)

	def handle(self, *args, **options):
		data_path = f"{options["data_path"].strip("/ ")}/data.json"

		if not os.path.exists(data_path):
			self.stdout.write(self.style.ERROR(f"Error: {data_path} not found"))
			return
		
		data_file = open(data_path, "r")
		data = json.load(data_file)
		for game in data:
			game_obj, created = Game.objects.get_or_create(
				name = game["name"],
				pretty_name = game["pretty_name"],
			)
			if created:
				self.stdout.write(self.style.SUCCESS(f"New game               : {game_obj.__str__()}"))
			else:
				self.stdout.write(self.style.SUCCESS(f"Game already exist     : {game_obj.__str__()}"))
			
			for pano in game["panoramas"]:
				pano_settings_path = (
					f"{options["data_path"].strip("/ ")}"
					f"/{game["name"].strip("/ ")}"
					f"/{pano["number"]}"
					f"/data.json"
				)

				if not os.path.exists(pano_settings_path):
					self.stdout.write(self.style.ERROR(f"Error: {pano_settings_path} not found"))
					continue

				pano_settings_file = open(pano_settings_path)
				pano_settings = json.load(pano_settings_file)

				pano_obj, created = Pano.objects.get_or_create(
					game = game_obj,
					number = pano["number"],
					posx = pano["posx"],
					posy = pano["posy"],
					settings = pano_settings,
				)
				if created:
					self.stdout.write(self.style.SUCCESS(f"New panorama           : {pano_obj.__str__()}"))
				else:
					self.stdout.write(self.style.SUCCESS(f"Panorama already exist : {pano_obj.__str__()}"))
