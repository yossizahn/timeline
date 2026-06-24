# Era political borders — build pipeline

Generates the `borders/<year>.json` files that the map overlay lazy-loads when
you hover a sage (see `showBorders` in `app.js`). Like `map.js`'s `LAND_PATH`,
the output under `/borders` is **generated** — edit it here and regenerate, not
by hand.

## Source

[`aourednik/historical-basemaps`](https://github.com/aourednik/historical-basemaps)
— approximate world political borders at many time slices. Licensed **CC-BY-SA 4.0**
(attribution is in the site's About panel).

## Pipeline

```sh
cd tools/borders
./fetch.sh                                   # download slices -> ./geojson  (~53 MB, gitignored)
pip install --target ./.pylibs shapely       # one-time; .pylibs is gitignored
PYTHONPATH=./.pylibs python3 clip.py         # clip + reproject + simplify -> clipped.json
PYTHONPATH=./.pylibs python3 generate.py     # + Hebrew labels -> ../../borders/*.json
```

`clip.py` does the geography; `generate.py` does presentation (which polities get
a Hebrew label, the per-slice area threshold, path encoding).

## The projection

Recovered from the `REGIONS` anchors in `data.js` — a regional equirectangular
projection, standard parallel 40°N, matching the generated coastline:

```
x = 6·cos(40°)·lon + 55.18      # 4.5963 px per degree longitude
y = 359.9 − 6·lat               #      6  px per degree latitude
```

Constants live at the top of `clip.py` (`A B C D`), alongside `VIEW_W/VIEW_H`
(the SVG viewBox), the `WIN` lon/lat window, and `SIMPLIFY` (px tolerance).

## Changing resolution

The SVG scales freely, so a **resizable map pane needs no regeneration** — the
`285×252` coordinates scale with it. Regenerate only if you change the actual
geometry:

- **Different viewBox dimensions** → update `VIEW_W/VIEW_H` and re-derive `A–D`
  from the region anchors, then rerun both scripts.
- **Finer detail** (e.g. a much larger rendered map) → lower `SIMPLIFY` in
  `clip.py` and/or the `area > 40` label threshold in `generate.py`.
- **Zoom to a sub-region** → tighten `WIN` and recompute `B`/`D` offsets.

## Labels

`generate.py` holds `HE`, a curated English→Hebrew dictionary (~75 polities,
variant spellings collapsed). A polity is labeled only if it's in `HE` **and**
big enough (`area > 40`); everything else draws as an unlabeled outline. After a
run, the script prints the major polities it had **no** Hebrew name for — that
list is the to-do for extending `HE`. The full English vocabulary per run is in
`names.json`.
