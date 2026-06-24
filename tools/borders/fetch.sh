#!/usr/bin/env bash
# Download the historical-basemaps slices we use into ./geojson (skips existing).
# Source: https://github.com/aourednik/historical-basemaps (CC-BY-SA 4.0)
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p geojson
BASE="https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson"
YEARS="bc1 100 200 300 400 500 600 700 800 900 1000 1100 1200 1279 1300 1400 \
1492 1500 1530 1600 1650 1700 1715 1783 1800 1815 1880 1900 1914 1920 1930 \
1938 1945 1960 1994 2000 2010"
for y in $YEARS; do
  f="geojson/world_$y.geojson"
  [ -s "$f" ] || curl -fsSL "$BASE/world_$y.geojson" -o "$f"
done
echo "have $(ls geojson/world_*.geojson | wc -l | tr -d ' ') slices in ./geojson"
