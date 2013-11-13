Voting Relationships in the US Senate
===========

D3-based visualization of partisanship in Congress. Outgrown out of work for Harvard's CS109 (Data Science).

![Preview](https://raw.github.com/DavidChouinard/congressviz/master/preview.png)

### Running locally

This project requires a basic HTTP server (because of the same-origin policy). This will do:

```
python -m SimpleHTTPServer 8008
```

The visualization will then be reachable at [http://localhost:8008/](http://localhost:8008/).

###  Source data

Run `fetch.py` to download the source data from [GovTrack](http://www.govtrack.us/). GovTrack has data for the 101th Congress (1989) onwards.

This repo includes Senate vote data (see `data/`) for the 101th to 112th Congresses and data for the 113th Congress as of November 12, 2013.
