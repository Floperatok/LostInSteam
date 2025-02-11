from django.db import models
import uuid

# Create your models here.

class Game(models.Model):
    id = models.PositiveIntegerField(primary_key=True)
    game_name = models.CharField(max_length=100, default="")
    files_path = models.CharField(max_length=100, default="/")
    def __str__(self):
        return f'GameObj {self.id} ; "{self.game_name}"'

class Pano(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    id = models.AutoField(primary_key=True)
    pano_id = models.PositiveIntegerField(default=-1)
    posx = models.FloatField(default=0)
    posy = models.FloatField(default=0)

    class Meta:
        unique_together = ('game', 'pano_id')

    def __str__(self):
        return f'PanoObj {self.id} ; "{self.game.game_name}" id={self.pano_id} x={self.posx} y={self.posy}'