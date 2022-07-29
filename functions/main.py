import profile
from attr import attributes
from bs4 import BeautifulSoup
import requests
import re
import json
import time
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Use a service account
cred_path = "/Users/fosterangus/Documents/Code/RunningRanks/creds/runningranks-admin.json"
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

db = firestore.client()

events = [
    '100m/women',
    '200m/women',
    "400m/women",
    "800m/women",
    '1500m/women',
    '5000m/women',
    '10000m/women',
    '400mh/women',
    'marathon/women',
    '100m/men',
    '200m/men',
    '400m/men',
    '800m/men',
    '1500m/men',
    '5000m/men',
    '10000m/men',
    '400mh/men',
    'marathon/men',
]

base_url = 'https://worldathletics.org'
events_base_url = base_url + '/world-rankings/'

# re.compile('((https?):((//)|(\\\\))+([\w\d:#@%/;$()~_?\+-=\\\.&](#!)?)*)', re.DOTALL)
link_regex = r"(?i)\b((?:https?://|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'\".,<>?«»“”‘’]))"

num_athletes = 12

athletes = {}
event_objs = {}


def main():
    for event in events:
        print(event)
        scrape_event(event)

    with open("/Users/fosterangus/Documents/Code/RunningRanks/functions/data/athletes.json", "w") as f:
        json.dump(athletes, f)
    with open('/Users/fosterangus/Documents/Code/RunningRanks/functions/data/events.json', "w") as f:
        json.dump(event_objs, f)

    upload_data(event_objs, athletes)


def scrape_event(event):

    event_obj = {}
    ranks = []

    # Grab data
    event_url = events_base_url + event
    res = requests.get(event_url)
    content = res.text
    soup = BeautifulSoup(content, features="html.parser")
    tbody = soup.find('table', attrs={'class': 'records-table'}).find('tbody')
    rows = tbody.find_all('tr')

    for i, row in enumerate(rows):
        # Break once number of athletes has bee reached
        if i == num_athletes:
            break

        athlete_url = row['data-athlete-url']
        name = innerHTML(
            row.find('td', attrs={'data-th': 'Competitor'})).strip()
        DOB = innerHTML(row.find('td', attrs={'data-th': 'DOB'})).strip()
        nat = innerHTML(row.find('td', attrs={'data-th': 'Nat'})).strip()
        athlete = add_athlete(name, athlete_url, DOB, nat).copy()
        athlete['score'] = 0
        ranks.append(athlete)
    event_obj['ranks'] = ranks
    event_objs[event] = event_obj


def add_athlete(name, athlete_url, DOB, nat):

    if name in athletes.keys():
        return athletes[name]

    athlete = {
        'name': name,
        'DOB': DOB,
        'nat': nat,
    }

    url = base_url + athlete_url
    res = requests.get(url)
    content = res.text

    # Deal with bad gateways whatever they are
    if content == '<html>\r\n<head><title>502 Bad Gateway</title></head>\r\n<body>\r\n<center><h1>502 Bad Gateway</h1></center>\r\n</body>\r\n</html>\r\n':
        print(f'\tBad gateway with {name}')
        time.sleep(5)
        print("\t pause over")
        return add_athlete(name, athlete_url, DOB, nat)

    soup = BeautifulSoup(content, features="html.parser")

    img_div = soup.find(
        'div', attrs={'class': 'profileBasicInfo_largeMedia__HdWK2'})
    style = str(img_div['style'])
    # Get rid of rest of css
    # style = style.replace('background-image:url(', '').replace(');background-position:center 20%;background-size:cover;height:714px', '')
    try:
        image_url = re.findall(link_regex, style)[0][0]
    except:
        image_url = None

    athlete['image_url'] = image_url
    athletes[name] = athlete
    return athlete


def innerHTML(soup):
    html = ''
    for x in soup.contents:
        html += str(x)
    return html


def upload_data(events, athletes):

    # Upload events
    batch = db.batch()

    for name, event in events.items():
        name = name.replace('/', '-')
        event_ref = db.collection('events').document(name)
        batch.set(event_ref, event)
    batch.commit()

    # Upload athletes
    batch = db.batch()

    for name, athlete in athletes.items():
        name = name.replace(' ', '-')
        athlete_ref = db.collection('athletes').document(name)
        batch.set(athlete_ref, athlete)
    batch.commit()


if __name__ == '__main__':
    main()
