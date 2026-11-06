# EarthSound

EarthSound is an accessible PT/EN web application inspired by NASA Space Apps Challenge’s “The Earth Information Jukebox”. It pairs NASA environmental visualizations with a browser-generated sound interpretation. The app is React, TypeScript and Vite; no application server or account is required.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and pnpm 11.25.0.

```bash
pnpm install
pnpm dev
```

Open the local Vite address printed by the command. Build the static production files with:

```bash
pnpm build
pnpm preview
```

## Data and scientific limits

The 2021 temperature map uses a local 12-month extract of the NASA GISS GISTEMP v4 2° × 2° grid and the NASA global monthly series. Anomalies are relative to 1951–1980 and are not absolute temperatures. Regional aggregates are calculated by EarthSound from the grid and are not official NASA regional products. The Antarctic ozone page uses NASA Earth Observatory annual maps for 1983, 1988, 1993, 1998, 2003, 2008, 2013 and 2018. No concentration or area is estimated from image pixels, so the ozone maps do not produce a quantitative data tone.

Provenance, units, and methodology are in [docs/data-provenance.md](docs/data-provenance.md). To regenerate the GISTEMP extract, install the optional Python package and run the included script; it downloads the current NASA grid and global series:

```bash
python -m venv .venv-data
. .venv-data/bin/activate
pip install -r requirements-data.txt
python scripts/prepare_gistemp.py
```

## Accessibility and browser support

The interface and narration are available in Portuguese and English. The Web Audio API and visible controls support the temperature sonification; keyboard and screen-reader access do not depend on speech recognition. Speech recognition is detected at runtime, may require a secure context and microphone permission, and may be unavailable in Firefox or other browsers. The accessibility center then offers a text-command field that uses the same parser and actions without a microphone; conventional controls remain available as well. Speech synthesis uses a voice offered by the current operating system/browser and includes buttons and voice commands to pause, resume and stop reading. Escape interrupts both read-aloud and page audio.


## NASA media library

`/materiais` contains the nine official NASA Scientific Visualization Studio resources shared with the project. It offers topic filters, NASA video players, source links, localized descriptions/caveats, playback rate and volume controls, and Portuguese/English read-aloud. Video files are streamed from NASA SVS and require an internet connection. Three selected NASA files have an audio stream (CO₂ trends, agricultural yields, and the 1880–2021 temperature animation); the other six are silent visualizations. Track presence was checked with `ffprobe`, not transcribed. The app labels EarthSound narration as separate from NASA media and does not sonify visual pixels.

See [docs/data-provenance.md](docs/data-provenance.md) for each official page, direct media URL, audio-track evidence, and scientific limitations.
