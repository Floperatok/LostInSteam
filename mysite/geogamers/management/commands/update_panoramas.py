from django.core.management.base import BaseCommand, CommandError
from geogamers.models import Game, Pano
import os, json

class Command(BaseCommand):
    help = "Updates panoramas database from file"

    def add_arguments(self, parser):
        parser.add_argument("data_folder_path", type=str)

    def handle(self, *args, **options):
        filename = f"{options["data_folder_path"]}/data.json"
        if not os.path.exists(filename):
            return 
        with open(filename, "r") as file:
            data = json.load(file)
            for game in data:
                gameObj, created = Game.objects.get_or_create(
                    id = game["id"],
                    game_name = game["name"],
                    files_path = game["path"],
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f"New game : {gameObj.__str__()}"))
                else:
                    self.stdout.write(self.style.SUCCESS(f"Game already exist : {gameObj.__str__()}"))
                
                for pano in game["panoramas"]:
                    panoObj, created = Pano.objects.get_or_create(
                        game = gameObj,
                        id = pano["id"],
                        posx = pano["posx"],
                        posy = pano["posy"],
                    )
                    if created:
                        self.stdout.write(self.style.SUCCESS(f"New panorama : {panoObj.__str__()}"))
                    else:
                        self.stdout.write(self.style.SUCCESS(f"Panorama already exist : {panoObj.__str__()}"))
