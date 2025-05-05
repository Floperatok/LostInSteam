from django.db import models
import uuid

class Game(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	name = models.CharField(max_length=25, default="")
	pretty_name = models.CharField(max_length=100, default="")
	accepted_names = models.JSONField(default=list)
	
	def __str__(self):
		return f"GameObj {self.id} ; '{self.name}'"


class Map(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	name = models.CharField(max_length=100, default="")
	tile_depth = models.PositiveIntegerField(default=7)
	attribution = models.CharField(max_length=200, default="")
	bounds = models.JSONField(default=list)
	bg_color = models.CharField(max_length=10, default="#000000")
	game = models.ForeignKey(Game, on_delete=models.CASCADE)
	
	class Meta:
		unique_together = ('game', 'name')

	def __str__(self):
		return f"MapObj {self.id} ; '{self.name}' ; '{self.game.name}'"


class Pano(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	number = models.PositiveIntegerField(default=0)
	map_name = models.CharField(max_length=100, default="")
	lat = models.FloatField(default=0)
	lng = models.FloatField(default=0)
	settings = models.JSONField(default=list)
	game = models.ForeignKey(Game, on_delete=models.CASCADE)
	map = models.ForeignKey(Map, on_delete=models.CASCADE)

	class Meta:
		unique_together = ('game', 'number')

	def __str__(self):
		return f"PanoObj {self.id} ; '{self.game.name}' number={self.number} lat={self.lat} lng={self.lng}"
