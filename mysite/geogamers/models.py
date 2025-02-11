from django.db import models
import uuid

# Create your models here.

class Game(models.Model):
    name = models.CharField(max_length=100, default="")
    pretty_name = models.CharField(max_length=200, default="")
    def __str__(self):
        return f'GameObj {self.id} ; "{self.name}"'

class Pano(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    number = models.PositiveIntegerField(default=0)
    posx = models.FloatField(default=0)
    posy = models.FloatField(default=0)
    settings = models.JSONField(default=list)

    class Meta:
        unique_together = ('game', 'number')

    def __str__(self):
        return f'PanoObj {self.id} ; "{self.game.name}" number={self.number} x={self.posx} y={self.posy}'