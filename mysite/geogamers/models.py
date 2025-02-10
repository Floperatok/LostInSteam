from django.db import models
import uuid

# Create your models here.

class Game(models.Model):
    id = models.PositiveIntegerField(primary_key=True)
    game_name = models.CharField(max_length=100, default="")
    files_path = models.CharField(max_length=100, default="/")
    def __str__(self):
        return f'"{self.game_name}"'

class Pano(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    id = models.PositiveIntegerField(primary_key=True)
    posx = models.FloatField(default=0)
    posy = models.FloatField(default=0)
    def __str__(self):
        return f'"{self.game.game_name}" x={self.posx} y={self.posy}'