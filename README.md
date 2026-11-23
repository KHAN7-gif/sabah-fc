# Sabah FC Fan Portal

Unofficial Sabah FC fan portal for the 2026/2027 season, hosted as a static site
on GitHub Pages: https://khan7-gif.github.io/sabah-fc/

## Features

- Fixtures, match results, standings and player profiles
- Goals, assists, cards and Minutes Played rankings
- English on opening, with an optional BM language switch
- Local editor with JSON export and draft recovery

## Publish

In repository Settings → Pages, deploy the `main` branch from `/` (root).
No build command, server backend or hosting credentials are required.
See [editing and publication](docs/local-editing.md) for the JSON workflow.

## Local preview

Run `python -m http.server 3000` from the repository root and open
http://localhost:3000/.

## Android TV / Google TV

The [Android TV source](android-tv/README.md) opens the same GitHub Pages portal.
