
def valid_game_guess(game, guess):
	parsed_guess = guess.replace(" ", "").lower()

	for name in game.accepted_names:
		if name.replace(" ", "").lower() == parsed_guess:
			return True
	
	print(f"Not found. Guess: {guess}. Game: {game.pretty_name}")
	return False
