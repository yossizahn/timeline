#!/usr/bin/env python3
"""Clip + reproject the historical-basemaps slices into the timeline map space.

Reads ./geojson/world_*.geojson, clips each to the map's geographic window,
reprojects into the 285x252 viewBox, simplifies, and writes ./clipped.json
(intermediate, consumed by generate.py).

Projection — regional equirectangular, standard parallel 40N — recovered from
the REGIONS anchor points in data.js. If you change the map's viewBox or want a
different region/zoom, edit the constants and window below, then re-run the
pipeline (clip.py then generate.py).

Requires shapely:  pip install --target ./.pylibs shapely
                    PYTHONPATH=./.pylibs python3 clip.py
"""
import json, glob, os, math
import shapely
from shapely.geometry import shape, box, mapping
from shapely.validation import make_valid
from shapely.ops import transform

HERE = os.path.dirname(os.path.abspath(__file__))

# --- viewBox the map SVG uses (index.html: <svg viewBox="0 0 W H">) ---
VIEW_W, VIEW_H = 285, 252

# --- projection: pixel = (A*lon + B, D - C*lat) ---
A = 6.0 * math.cos(math.radians(40))   # 4.5963 px / deg lon
B = 55.18
C = 6.0                                  # px / deg lat
D = 359.9
def px(lon, lat): return (A * lon + B, D - C * lat)

VIEW = box(0, 0, VIEW_W, VIEW_H)
# lon/lat window, a touch larger than the viewBox (clip here first = fewer points)
WIN = box(-13.0, 16.0, 51.0, 61.0)
SIMPLIFY = 0.5        # px tolerance; lower = more detail (raise map res -> lower this)
MIN_AREA = 0          # keep everything here; generate.py applies the display threshold

def year_of(path):
    s = os.path.basename(path)[len('world_'):-len('.geojson')]
    return -int(s[2:]) if s.startswith('bc') else int(s)

def round_geom(geom, nd=1):
    return transform(lambda x, y, z=None: (round(x, nd), round(y, nd)), geom)

def polygons_only(geom):
    """Keep just the polygonal parts of a possibly-mixed geometry (set_precision
    and make_valid can spit out stray lines/points when slivers collapse)."""
    if geom.geom_type in ('Polygon', 'MultiPolygon'):
        return geom
    parts = [g for g in getattr(geom, 'geoms', [])
             if g.geom_type in ('Polygon', 'MultiPolygon') and not g.is_empty]
    return shapely.unary_union(parts) if parts else None

def clean(geom):
    """Snap to the 0.1 px output grid so the rounded coordinates we emit stay a
    valid, non-self-intersecting polygon. Rounding after simplify (the old path)
    nudged near-coincident vertices into crossings and zero-width spikes that
    rendered as stray intersecting lines (e.g. Byzantine/Carolingian at 800 CE).
    set_precision does the rounding topologically; make_valid mops up the rest."""
    geom = shapely.set_precision(geom, 0.1)
    if not geom.is_valid:
        geom = make_valid(geom)
    geom = polygons_only(geom)
    return geom if geom is not None and not geom.is_empty else None

def main():
    out, names = {}, {}
    for path in sorted(glob.glob(os.path.join(HERE, 'geojson', 'world_*.geojson'))):
        yr = year_of(path)
        polys = []                        # (name, cleaned shapely geom)
        for ft in json.load(open(path))['features']:
            name = (ft['properties'] or {}).get('NAME')
            if not name:
                continue
            try:
                g = shape(ft['geometry'])
            except Exception:
                continue
            if not g.is_valid:
                g = g.buffer(0)
            g = g.intersection(WIN)
            if g.is_empty:
                continue
            g = transform(px, g).intersection(VIEW).simplify(SIMPLIFY, preserve_topology=True)
            if g.is_empty:
                continue
            g = clean(g)
            if g is None:
                continue
            polys.append((name, g))

        # The source isn't a clean partition: vague ethnographic blobs (e.g.
        # "Slavonic tribes") overlap the defined polities inside them, so their
        # outlines cross on the map. Carve each region down by every smaller one,
        # largest first — the more specific (smaller) polity wins the shared land.
        polys.sort(key=lambda nm_g: -nm_g[1].area)
        feats = []
        for i, (name, g) in enumerate(polys):
            for _, smaller in polys[i + 1:]:
                if g.intersects(smaller):
                    g = clean(g.difference(smaller))
                    if g is None:
                        break
            if g is None or g.is_empty:
                continue
            names[name] = names.get(name, 0) + 1
            rp = g.representative_point()
            feats.append({'n': name, 'g': mapping(round_geom(g)),
                          'lx': round(rp.x, 1), 'ly': round(rp.y, 1),
                          'area': round(g.area, 1)})
        out[str(yr)] = feats
        print(f"{yr:>5}: {len(feats):>3} features")
    json.dump(out, open(os.path.join(HERE, 'clipped.json'), 'w'))
    json.dump(sorted(names.items(), key=lambda kv: -kv[1]),
              open(os.path.join(HERE, 'names.json'), 'w'), ensure_ascii=False, indent=0)
    print(f"\n{len(names)} distinct names -> names.json ; geometry -> clipped.json")

if __name__ == '__main__':
    main()
