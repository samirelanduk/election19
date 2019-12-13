import json
from django.shortcuts import render
from django.http import JsonResponse

def home(request):
    return render(request, "home.html")


def data(request):
    with open("data.json") as f:
        return JsonResponse(json.load(f))