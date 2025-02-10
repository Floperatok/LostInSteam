from django.shortcuts import render

# Create your views here.

def home(request):
    return render(request, "index.html")

def game(request):
    return render(request, "game.html")
