import math





def compute_points(user_pos, answer_pos, map_bounds, map_depth):

	MAX_POINTS = 5000

	# threshold (as a fraction of the map diagonal size) at which the user starts earning points
	POINTS_THRESHOLD = 0.5
	# threshold (as a fraction of the map diagonal size) at which the user earn the maximum number of points
	MAX_POINTS_THRESHOLD = 0.05 / map_depth ** 2
	
	# diagonal size of the map bounds
	diagonal_size = math.sqrt(pow(map_bounds[0][0] - map_bounds[1][0], 2) + pow(map_bounds[0][1] - map_bounds[1][1], 2))

	# distance between the user marker and the answer
	distance = math.sqrt(pow(user_pos["lat"] - answer_pos["lat"], 2) + pow(user_pos["lng"] - answer_pos["lng"], 2))

	# ratio distance / diagonal
	distance_ratio = distance / diagonal_size

	normalized_ratio = 0
	if (distance_ratio >= POINTS_THRESHOLD):
		points = 0
	elif (distance_ratio <= MAX_POINTS_THRESHOLD):
		points = MAX_POINTS
	else:
		normalized_ratio = (POINTS_THRESHOLD - distance_ratio) / (POINTS_THRESHOLD - MAX_POINTS_THRESHOLD)
		points = pow(normalized_ratio, map_depth - 1) * MAX_POINTS
	
	print("")
	print("user pos:", user_pos)
	print("answer pos:", answer_pos)
	print("bounds:", map_bounds)
	print("tile_depth:", map_depth)
	print("diagonal distance:", diagonal_size)
	print("distance:", distance)
	print("distance ratio:", distance_ratio)
	print("normalized_ratio:", normalized_ratio)
	print("points:", points)
	print("")
	return points