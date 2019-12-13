import json
from time import sleep
import requests
from tqdm import tqdm
from bs4 import BeautifulSoup

with open("bbc-codes.json") as f:
    data = json.load(f)

print(len(data), "constituencies")
for code, constituency in tqdm(list(data.items())):
    r = requests.get("https://www.bbc.co.uk/news/politics/constituencies/" + code)
    soup = BeautifulSoup(r.text, features="html.parser")
    results = soup.findAll("li", {"class": "ge2019-constituency-result__item"})
    constituency["parties"] = {}
    for result in results:
        party = result.find("span", {"class": "ge2019-constituency-result__party-name"}).text
        votes = int(result.find("span", {"class": "ge2019-constituency-result__details-value"}).text.replace(",",""))
        constituency["parties"][party] = votes
    sleep(0.5)

with open("data.json", "w") as f:
    json.dump(data, f)