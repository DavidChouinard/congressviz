import json, requests
from bs4 import BeautifulSoup

# GovTrack only has data for the 101th Congress onwards
start_congress = 101

def main():
    congress = start_congress
    while True:
        votes = get_senate_votes(congress)
        if votes is None:
            break

        open('data/' + str(congress) + '.json', 'w').write(json.dumps(votes))
        congress += 1

def get_senate_votes(congress):
    print "Fetching data for " + str(congress) + "th Congress"
    root = 'https://www.govtrack.us/data/congress/' + str(congress) + '/votes/'
    r = requests.get(root)

    if r.status_code == 404:
        print "Congress " + str(congress) + " doesn't exit; our work here is done"
        return None

    soup = BeautifulSoup(r.text)

    result = []

    for a in soup.select('pre a'):
        if a.string[0] != ".":
            year = a.get('href')
            soup = BeautifulSoup(requests.get(root + year).text)

            for a in soup.select('pre a'):
                if a.string[0] == "s":
                    print "Fetching votes for Senate bill " + a.string[1:-1]
                    result.append(requests.get(root + year + a.get('href') + '/data.json').text)

    return result

if __name__ == "__main__":
    main()
