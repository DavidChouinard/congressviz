import json, requests, itertools
import networkx as nx
from networkx.readwrite import json_graph
from bs4 import BeautifulSoup

# GovTrack only has data for the 101th Congress onwards
start_congress = 101

def main():
    congress = start_congress
    while True:
        votes = get_senate_votes(congress)
        if votes is None:
            break

        votes = vote_graph(votes)

        # Only include edges above a weight threshold
        votes.remove_edges_from([(u,v,d) for u,v,d in votes.edges(data=True) if d['weight'] <= 105])

        # Remove isolated edges (eg. senators who had very short terms)
        votes.remove_nodes_from(nx.isolates(votes))

        open('data/' + str(congress) + '.json', 'w').write(json.dumps(json_graph.node_link_data(votes)))
        congress += 1

def get_senate_votes(congress):
    print "Fetching data for the " + str(congress) + "th Congress"
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
                    result.append(json.loads(requests.get(root + year + a.get('href') + '/data.json').text))

    return result


def vote_graph(data):
    g = nx.Graph()

    for vote in data:
        for senators in vote["votes"].values():
            # Make sure sentors are already in graph
            for senator in senators:
                if "display_name" in senator:
                    if senator["display_name"] not in g:
                        if senator["party"] == "R":
                            color = 'r'
                        elif senator["party"] == "D":
                            color = 'b'
                        else:
                            color = 'k'
                        g.add_node(senator["display_name"], color=color)
                else:
                    print senator

            for senator1, senator2 in itertools.combinations(senators, 2):
                if "display_name" in senator1 and "display_name" in senator2:
                    if g.has_edge(senator1["display_name"], senator2["display_name"]):
                        g[senator1["display_name"]][senator2["display_name"]]["weight"] += 1
                    else:
                        g.add_edge(senator1["display_name"], senator2["display_name"], weight=1)

    for node0, node1 in g.edges_iter():
        edge = g[node0][node1]
        edge["difference"] = 1.0 / edge["weight"]

    return g

if __name__ == "__main__":
    main()
