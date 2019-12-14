import json
from django.shortcuts import render
from django.http import JsonResponse

parties = {
    "CON": "Conservative", "LAB": "Labour",
    "LD": "Liberal Democrat", "GREEN": "Green",
    "SNP": "Scottish National Party", "BP": "The Brexit Party",
    "DUP": "Democratic Unionist Party", "SF": "Sinn Féin"
}

regions = {
    "ENG": "England", "SCO": "Scotland", "WAL": "Wales", "NI": "Northern Ireland"
}

def home(request):
    rules = []
    for key, value in request.GET.items():
        words = key.split("-")
        if 2 <= len(words) <= 3:
            if words[0].upper() in parties and words[1].upper() in parties:
                if len(words) == 2 or words[2].upper() in regions:
                    if value.isdigit() and 0 <= int(value) <= 100:
                        rules.append([
                            int(value),
                            parties[words[0].upper()],
                            regions[words[2].upper()] if len(words) == 3 else "The whole UK",
                            parties[words[1].upper()]
                        ])
    if not rules: rules = [["", "", "The whole UK", ""]]
    return render(request, "home.html", {"rules": rules})


def data(request):
    with open("data.json") as f:
        return JsonResponse(json.load(f))