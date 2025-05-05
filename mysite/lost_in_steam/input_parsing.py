
def valid_game_guess(game, guess):
	charset = " ;:'"
	for char in charset:
		guess = guess.replace(char, "")
	guess = guess.lower()

	for name in game.accepted_names:
		if name.replace(" ", "").lower() == guess:
			return True
	
	print(f"Not found. Guess: {guess}. Game: {game.pretty_name}")
	return False
