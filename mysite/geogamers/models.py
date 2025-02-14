from django.db import models
import uuid

# Create your models here.

class Game(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	name = models.CharField(max_length=25, default="")
	pretty_name = models.CharField(max_length=100, default="")
	accepted_names = models.JSONField(default=list)
	
	def __str__(self):
		return f'GameObj {self.id} ; "{self.name}"'

class Pano(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	number = models.PositiveIntegerField(default=0)
	game = models.ForeignKey(Game, on_delete=models.CASCADE)
	posx = models.FloatField(default=0)
	posy = models.FloatField(default=0)
	settings = models.JSONField(default=list)

	class Meta:
		unique_together = ('game', 'number')

	def __str__(self):
		return f'PanoObj {self.id} ; "{self.game.name}" number={self.number} x={self.posx} y={self.posy}'
	
