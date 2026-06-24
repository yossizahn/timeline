# CLAUDE.md

Interactive, vertical, **RTL Hebrew** timeline of the sages of Israel — תנאים ·
אמוראים · גאונים · ראשונים · אחרונים — with their works and world/Jewish events.
Live at <https://yossizahn.github.io/timeline/>.

## Stack & running

- **Static site, no build step.** Plain HTML/CSS/JS loaded in order:
  `data.js` → `map.js` → `icons.js` → `app.js`.
- **Preview:** `.claude/launch.json` runs `python3 -m http.server 4178`. Use the
  preview server rather than opening files directly (relative script paths).
- Deploys automatically: pushing `main` rebuilds **GitHub Pages**
  (`yossizahn/timeline`, public, served from `main` / root).

## Files

| File | Role |
|---|---|
| `index.html` | Structure: topbar (era toggle, legend, region-reset, events toggle), chart canvas, map panel, tooltip, Wikipedia drawer. |
| `data.js` | All content: `ERAS`, `REGIONS`, `MIGRATION`, `FIGURES`, `EVENTS`. Edit this to add people/events. |
| `app.js` | Rendering & interaction. Reads CSS vars for layout; lane-packing; tooltip; drawer; map; region filter; events rail. |
| `style.css` | Theming via CSS custom properties in `:root` (colors, `--start-year`, `--end-year`, `--px-year`, `--evt-gutter`, `--axis-w`, `--lane-w`). |
| `map.js` | `LAND_PATH` — generated coastline (Natural Earth 110m land, regional equirectangular projection, viewBox `285×252`). Do not hand-edit. |
| `icons.js` | Inline SVG icon set (vendored [Lucide](https://lucide.dev) line icons + a custom `star-of-david`). `icon(name, cls)` returns an `<svg>` string for dynamic markup; `fillStaticIcons()` populates `[data-icon]` elements in `index.html` on load. All UI glyphs go through here — no raw emoji/symbols in the UI. |
| `borders/` | Per-year political-border slices (`<year>.json`) + `index.json` (sorted slice years). Loaded on demand for the era-borders overlay shown when hovering a sage; `app.js` snaps the figure's date to the nearest slice. **GENERATED** by `tools/borders/` — don't hand-edit. |
| `tools/borders/` | Offline pipeline that produces `borders/` (`fetch.sh` → `clip.py` → `generate.py`, with `names.json` for label placement). See its `README.md`. |

## Map interaction (`app.js`, `map.js`)

- The map panel is **resizable** (drag the `.map-resize` grip) and **draggable** on desktop; size
  and position persist in `localStorage` (`mapWidth`, `mapPos`).
- Hovering a sage drops an **exact city pin** (PLACES gazetteer) with an approximate ring + move
  arrow, and paints the **era political-border overlay** for that figure's date.
- Map labels follow the **UI language** (Hebrew/English); the toggle persists in `localStorage` (`lang`).

## Data model (`data.js`)

- **`FIGURES[]`**: `{ era, he, en, born, died, circa?, region, place, w, note, books:[{y,he,en}] }`.
  Dates are **CE**. `circa: true` renders a `±` and is right for any traditional/approximate date.
  `w` = exact **he.wikipedia** article title (see verification below). `region` keys into `REGIONS`.
- **`EVENTS[]`**: `{ y, he, en, place, w, j?, shift? }`. Three visual types:
  - default = world event (purple),
  - `j: true` = inner-Jewish history (teal, ✡),
  - `shift: true` = Torah-center migration marker (gold, ⇦; e.g. 942/970/1038/1088).
  `en` is split on `[;&]` and its first part feeds the English Wikipedia search.
- **`REGIONS{}`**: each has `mx,my` = dot position in the map's `285×252` space (plus `off:true` for
  out-of-frame USA). **`MIGRATION[]`**: cubic-Bézier paths in the same space (Bavel → west).
- **`ERAS{}`**: ordered chronologically (tannaim → acharonim); drives the legend and bar colors.
- **`WIKI_EN{}`** (bottom of `data.js`): authoritative `en.wikipedia` titles keyed by the `w`
  (he.wikipedia) title, pulled from each article's **language switcher** (he→en interlanguage
  links). **GENERATED — don't hand-edit**; regenerate via the langlinks API
  (`prop=langlinks&lllang=en`) after adding/renaming figures. `app.js` links the English drawer
  directly to `WIKI_EN[w]`; entries with no English article fall back to search-with-go.

## Year math

Hebrew year = CE + 3760 (`HEB_OFFSET`; ±1 near Rosh Hashanah). `gematria()` renders it.
Vertical position: `y(year) = (year - START) * PX`, with `START`/`END`/`PX` from the CSS vars
`--start-year` / `--end-year` / `--px-year`. To extend the range, change those vars — nothing is hardcoded.

## Layout notes

- **Global lane-packing** (`packLanes`) lays all figures into the fewest non-overlapping columns;
  `MIN_BAR_H` gives short lifespans a readable minimum height.
- **Events rail** is pinned to the physical left and stays put during **horizontal** scroll while
  tracking vertical scroll — done with `position:absolute; left:0` + a JS `translateX` in `syncRail()`
  (RTL `position:sticky` does **not** hold here; don't revert to it).
- Year axis is on the **right**; the world map floats **bottom-left**.

## Wikipedia links (important)

- Drawer links use **desktop** domains. Hebrew → direct `/wiki/` article. English → direct
  `/wiki/` article when `WIKI_EN[w]` has the language-switcher title (the common case), else
  `…/index.php?search=…&go=Go`. The **mobile** `.m` host's redirect can *abort* inside the iframe
  on some networks — never use it.
- **Verify every new `w` (he.wikipedia) title exists before adding it.** Broken titles have slipped in
  before. Batch-check with the Wikipedia API and use the canonical target when a title resolves via
  `redirect`; fix anything reported `missing`:

  ```sh
  curl -s "https://he.wikipedia.org/w/api.php?action=query&redirects=1&format=json&titles=$(python3 -c 'import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))' 'רב אשי|רבא|…')"
  ```

## Conventions

- All user-facing content is **Hebrew, RTL**. Match the surrounding tone (concise scholarly notes).
- `[hidden]` is overridden by `display:flex/inline-flex` — any such element needs an explicit
  `.selector[hidden]{display:none}` (already done for the drawer and region-reset; watch for new ones).
- Keep `gh`/git operations to `main`; pushing deploys, so verify in the preview first.
