// ---------- config ----------
const css = getComputedStyle(document.documentElement);
const PX = parseFloat(css.getPropertyValue("--px-year")) || 2.5;
const START = parseInt(css.getPropertyValue("--start-year")) || 680;
const END = parseInt(css.getPropertyValue("--end-year")) || 2000;
const LANE_W = parseFloat(css.getPropertyValue("--lane-w")) || 158;
const LANE_GAP = parseFloat(css.getPropertyValue("--lane-gap")) || 12;
const HEB_OFFSET = 3760; // CE -> Hebrew year (approx.)
const MIN_BAR_H = 88;    // px; short lifespans get a readable minimum (name + years + region chip)
const MIN_YEARS = MIN_BAR_H / PX;

let mode = "heb";        // "heb" | "sec"
let selRegion = null;    // active region filter, or null

// English search terms where deriving from the label is unreliable.
const EN_OVERRIDE = {
  "הגר\"א (הגאון מווילנא)": "Vilna Gaon",
  "חזון איש": "Chazon Ish",
  "הראי\"ה קוק": "Abraham Isaac Kook",
  "ערוך השולחן (י\"מ עפשטיין)": "Yechiel Michel Epstein",
  "ר' ישראל סלנטר": "Israel Salanter",
  "ר' משה פיינשטיין": "Moshe Feinstein",
  "מגן אברהם": "Abraham Abele Gombiner",
  "בן איש חי (יוסף חיים)": "Yosef Hayyim",
  "מהרי\"ל (יעקב מולין)": "Yaakov Moelin",
  "מהרי\"ק (יוסף קולון)": "Joseph Colon Trabotto",
};
function enTerm(f) {
  if (EN_OVERRIDE[f.he]) return EN_OVERRIDE[f.he];
  const m = f.en.match(/\(([^)]+)\)/); // prefer the real name inside parentheses
  return m ? m[1] : f.en;
}
// Hebrew: direct article. English: search-with-go (lands on the article even
// when the exact title differs), so we never hit a dead link.
// NB: use the desktop domain — on some networks the .m mobile host's redirect
// aborts inside an iframe, while the desktop host follows redirects cleanly.
const heUrl = (term) => "https://he.wikipedia.org/wiki/" + encodeURIComponent(term.replace(/ /g, "_"));
const enUrl = (term) => "https://en.wikipedia.org/w/index.php?search=" + encodeURIComponent(term) + "&go=Go";

const y = (year) => (year - START) * PX;     // CE year -> vertical px
const totalH = y(END);

// ---------- Hebrew year as gematria (e.g. 5300 -> ה'ש') ----------
function gematria(num) {
  const thousands = Math.floor(num / 1000);
  let rem = num % 1000;
  const out = [];
  const TH = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
  if (thousands) out.push(TH[thousands] + "׳");
  const hundreds = ["", "ק", "ר", "ש", "ת", "תק", "תר", "תש", "תת", "תתק"];
  const tens = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
  const ones = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
  let letters = hundreds[Math.floor(rem / 100)];
  rem %= 100;
  if (rem === 15) letters += "טו";
  else if (rem === 16) letters += "טז";
  else letters += tens[Math.floor(rem / 10)] + ones[rem % 10];
  if (letters.length === 1) letters += "׳";
  else if (letters.length > 1) letters = letters.slice(0, -1) + "״" + letters.slice(-1);
  out.push(letters);
  return out.join("");
}

function fmtYear(ce) { return mode === "sec" ? String(ce) : gematria(ce + HEB_OFFSET); }
function fmtRange(b, d) { return `${fmtYear(b)}–${fmtYear(d)}`; }

// ---------- global lane packing ----------
// All figures share one field of lanes (eras barely overlap in time, so this
// frees horizontal room for readable horizontal names). Color marks the era.
// A display duration keeps short-lived figures from overlapping their neighbour.
function packLanes(items) {
  const sorted = [...items].sort((a, b) => a.born - b.born);
  const laneEnds = []; // last "display end" year per lane
  sorted.forEach((it) => {
    const dispEnd = Math.max(it.died, it.born + MIN_YEARS);
    let lane = laneEnds.findIndex((end) => it.born >= end + 3);
    if (lane === -1) { lane = laneEnds.length; laneEnds.push(0); }
    laneEnds[lane] = dispEnd;
    it._lane = lane;
  });
  return { items: sorted, laneCount: Math.max(laneEnds.length, 1) };
}

const layout = packLanes(FIGURES);
const FIELD_W = layout.laneCount * LANE_W;

// ---------- tooltip ----------
const tip = document.getElementById("tooltip");
function showTip(html, ev) {
  tip.innerHTML = html; tip.hidden = false;
  const pad = 14;
  let lx = ev.clientX - tip.offsetWidth - pad;
  if (lx < 8) lx = ev.clientX + pad;
  let ly = ev.clientY + pad;
  if (ly + tip.offsetHeight > window.innerHeight) ly = window.innerHeight - tip.offsetHeight - 8;
  tip.style.left = lx + "px"; tip.style.top = Math.max(8, ly) + "px";
}
function hideTip() { tip.hidden = true; }

// ---------- Wikipedia drawer (embedded iframe) ----------
let drawerTerms = { he: "", en: "", title: "" };
let drawerLang = "he";
const drawer = document.getElementById("drawer");

function openDrawer(heTerm, enTermStr, title) {
  drawerTerms = { he: heTerm, en: enTermStr, title };
  drawerLang = "he";
  document.getElementById("d-title").textContent = title;
  setDrawerLang("he");
  drawer.hidden = false;
}
function setDrawerLang(lang) {
  drawerLang = lang;
  const url = lang === "he" ? heUrl(drawerTerms.he) : enUrl(drawerTerms.en);
  document.getElementById("d-frame").src = url;
  document.getElementById("d-open").href = url;
  document.getElementById("d-he").classList.toggle("active", lang === "he");
  document.getElementById("d-en").classList.toggle("active", lang === "en");
}
function closeDrawer() {
  drawer.hidden = true;
  document.getElementById("d-frame").src = "about:blank"; // stop loading
}
document.getElementById("d-he").addEventListener("click", () => setDrawerLang("he"));
document.getElementById("d-en").addEventListener("click", () => setDrawerLang("en"));
document.getElementById("d-close").addEventListener("click", closeDrawer);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

function figureTip(f) {
  const books = f.books.map((b) =>
    `<div class="b">📖 ${b.he} <span class="by">(${fmtYear(b.y)})</span><br><span style="color:#9b9384">${b.en}</span></div>`
  ).join("");
  const r = REGIONS[f.region];
  return `<h4>${f.he}</h4>
    <div class="en">${f.en}</div>
    <div>${f.note}</div>
    <div class="meta">${fmtRange(f.born, f.died)}${f.circa ? " (לערך)" : ""} · 📍 ${f.place}</div>
    <div class="region-tip"><i style="background:${r.color}"></i>${r.he} · ${r.en}</div>
    <div class="books">${books}</div>
    <div class="go">↗ ויקיפדיה — לחצו לפתיחה</div>`;
}

// ---------- builders ----------
function buildGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  for (let yr = Math.ceil(START / 50) * 50; yr <= END; yr += 50) {
    const major = yr % 100 === 0;
    const row = document.createElement("div");
    row.className = "row " + (major ? "major" : "minor");
    row.style.top = y(yr) + "px";
    grid.appendChild(row);
    if (major) {
      const lab = document.createElement("div");
      lab.className = "ylabel";
      lab.style.top = y(yr) + "px";
      lab.innerHTML = mode === "heb"
        ? `<span class="heb">${gematria(yr + HEB_OFFSET)}</span>`
        : yr;
      grid.appendChild(lab);
    }
  }
}

function buildCols() {
  const cols = document.getElementById("cols");
  cols.innerHTML = `<div class="axis-col"></div>`;

  const field = document.createElement("div");
  field.className = "field";
  field.style.width = FIELD_W + "px";
  field.style.height = totalH + "px";
  // reserve the left rail for events (inline-end = left under RTL)
  const showEvents = document.getElementById("show-events").checked;
  field.style.marginInlineEnd = showEvents ? EVT_GUTTER + "px" : "0";

  layout.items.forEach((f) => {
    const top = y(f.born);
    const h = Math.max(y(f.died) - top, MIN_BAR_H);
    const r = REGIONS[f.region];
    const bar = document.createElement("div");
    bar.className = "bar" + (f.circa ? " circa" : "");
    bar.dataset.region = f.region;
    bar.style.setProperty("--c", ERAS[f.era].color);
    bar.style.top = top + "px";
    bar.style.height = h + "px";
    // RTL: position lanes from the right edge of the field
    bar.style.right = f._lane * LANE_W + "px";
    bar.style.width = LANE_W - LANE_GAP + "px";
    bar.innerHTML =
      `<span class="name">${f.he}</span>` +
      `<span class="yrs">${fmtRange(f.born, f.died)}</span>` +
      `<span class="region"><i style="background:${r.color}"></i>${r.he}</span>`;
    bar.title = "לחצו לפתיחת הערך בוויקיפדיה";
    bar.addEventListener("mousemove", (e) => showTip(figureTip(f), e));
    bar.addEventListener("mouseleave", hideTip);
    bar.addEventListener("click", () => { hideTip(); openDrawer(f.w, enTerm(f), f.he); });

    // region chip → toggle the geographic highlight (don't open Wikipedia)
    bar.querySelector(".region").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleRegion(f.region);
    });

    f.books.forEach((b) => {
      const dot = document.createElement("div");
      dot.className = "book";
      dot.style.top = (y(b.y) - top) + "px";
      dot.addEventListener("mousemove", (e) => {
        e.stopPropagation();
        showTip(`<h4>📖 ${b.he}</h4><div class="en">${b.en}</div><div class="meta">${fmtYear(b.y)} · ${f.he}</div>`, e);
      });
      dot.addEventListener("mouseleave", hideTip);
      bar.appendChild(dot);
    });

    field.appendChild(bar);
  });

  cols.appendChild(field);
  document.getElementById("canvas").style.height = totalH + "px";
  applyRegion(); // keep any active filter after a re-render
}

// ---------- geographic filter ----------
function toggleRegion(key) {
  selRegion = selRegion === key ? null : key;
  applyRegion();
}
function applyRegion() {
  document.querySelectorAll(".bar").forEach((b) => {
    b.classList.toggle("dim", selRegion !== null && b.dataset.region !== selRegion);
  });
  // sync the map markers
  document.querySelectorAll("#map-dots .mdot").forEach((el) => {
    const isSel = selRegion === el.dataset.region;
    el.classList.toggle("active", isSel);
    el.classList.toggle("dim", selRegion !== null && !isSel);
    el.querySelector("circle").setAttribute("r", isSel ? 9 : 6);
  });
  const btn = document.getElementById("region-reset");
  if (selRegion) {
    const r = REGIONS[selRegion];
    btn.hidden = false;
    btn.innerHTML = `<i style="background:${r.color}"></i>${r.he}<span class="x">✕</span>`;
  } else {
    btn.hidden = true;
  }
}

// ---------- world map ----------
function buildMap() {
  const land = document.getElementById("land");
  if (land && typeof LAND_PATH === "string") land.setAttribute("d", LAND_PATH);

  const routes = document.getElementById("map-routes");
  if (routes && typeof MIGRATION !== "undefined") {
    routes.innerHTML = MIGRATION.map((r) =>
      `<path d="${r.d}" marker-end="url(#mig-arrow)"><title>${r.he}</title></path>`).join("");
  }

  const g = document.getElementById("map-dots");
  g.innerHTML = Object.entries(REGIONS).map(([key, r]) => {
    const arrow = r.off
      ? `<text class="moff" x="${r.mx - 6}" y="${r.my + 1.4}" text-anchor="middle">←</text>`
      : "";
    const ly = r.my - 6.5;
    return `<g class="mdot" data-region="${key}">
       <circle cx="${r.mx}" cy="${r.my}" r="4.2" fill="${r.color}" stroke="#fff" stroke-width="1.3"></circle>
       ${arrow}
       <text class="mlabel" x="${r.mx}" y="${ly}" text-anchor="middle">${r.he}</text>
     </g>`;
  }).join("");
  g.querySelectorAll(".mdot").forEach((el) =>
    el.addEventListener("click", () => toggleRegion(el.dataset.region)));
}

const EVT_GUTTER = parseFloat(css.getPropertyValue("--evt-gutter")) || 212;

function buildEvents() {
  const layer = document.getElementById("events");
  layer.innerHTML = "";
  const show = document.getElementById("show-events").checked;
  layer.style.display = show ? "block" : "none";
  if (!show) return;

  const spineX = EVT_GUTTER - 1;      // spine sits at the gutter's inner edge
  const flagInset = 12;               // flag's right edge distance from the spine
  const flagX = EVT_GUTTER - flagInset;
  const MINGAP = 23;                  // min vertical spacing between labels

  // de-cluster: push overlapping labels down, keep the true year on the spine
  let lastY = -999;
  const placed = EVENTS.slice().sort((a, b) => a.y - b.y).map((evt) => {
    const trueY = y(evt.y);
    const labelY = Math.max(trueY, lastY + MINGAP);
    lastY = labelY;
    return { evt, trueY, labelY };
  });

  // solid backing so figures slide cleanly behind the pinned rail
  const bg = document.createElement("div");
  bg.className = "erail-bg";
  bg.style.height = totalH + "px";
  layer.appendChild(bg);

  // full-width correlation line (revealed on hover)
  const hl = document.createElement("div");
  hl.className = "ehl";
  layer.appendChild(hl);

  // spine + dots + leader lines (SVG)
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "espine");
  svg.setAttribute("width", EVT_GUTTER);
  svg.setAttribute("height", totalH);
  const COL = {
    event: css.getPropertyValue("--event").trim() || "#9333ea",
    eventj: css.getPropertyValue("--event-j").trim() || "#0d7a6f",
    shift: css.getPropertyValue("--shift").trim() || "#b7791f",
  };
  const evColor = (evt) => evt.shift ? COL.shift : evt.j ? COL.eventj : COL.event;
  let inner = `<line class="spine-line" x1="${spineX}" y1="0" x2="${spineX}" y2="${totalH}"/>`;
  placed.forEach(({ evt, trueY, labelY }) => {
    const c = evColor(evt);
    inner += `<path d="M${spineX} ${trueY} L${flagX} ${labelY}" stroke="${c}" stroke-width="1" fill="none" opacity=".5"/>`;
    const r = evt.shift ? 3.4 : 2.8;
    inner += `<circle cx="${spineX}" cy="${trueY}" r="${r}" fill="${c}"/>`;
  });
  svg.innerHTML = inner;
  layer.appendChild(svg);

  // labels (right-aligned to the spine inside the gutter)
  const fwrap = document.createElement("div");
  fwrap.className = "eflags";
  fwrap.style.width = EVT_GUTTER + "px";
  layer.appendChild(fwrap);

  placed.forEach(({ evt, trueY }, i) => {
    const flag = document.createElement("div");
    flag.className = evt.shift ? "eflag shift" : evt.j ? "eflag jewish" : "eflag";
    flag.style.top = placed[i].labelY + "px";
    flag.style.right = flagInset + "px";
    const mark = evt.shift ? `<span class="smark">⇦</span>`
               : evt.j ? `<span class="emark">✡</span>` : "";
    flag.innerHTML = `${mark}${evt.he}<span class="yr">${fmtYear(evt.y)}</span>`;
    const place = evt.place ? `<div class="meta">📍 ${evt.place}</div>` : "";
    const note = evt.shift ? `<div class="meta">מעבר מרכז התורה</div>` : "";
    flag.addEventListener("mousemove", (e) =>
      showTip(`<h4>${evt.he}</h4><div class="en">${evt.en}</div>` +
              `<div class="meta">${fmtYear(evt.y)}</div>${place}${note}` +
              `<div class="go">↗ ויקיפדיה — לחצו לפתיחה</div>`, e));
    flag.addEventListener("mouseenter", () => {
      hl.style.top = trueY + "px";
      hl.style.borderTopColor = evColor(evt);
      hl.classList.add("show");
    });
    flag.addEventListener("mouseleave", () => { hideTip(); hl.classList.remove("show"); });
    flag.addEventListener("click", () => {
      hideTip();
      openDrawer(evt.w, evt.en.split(/[;&]/)[0].trim(), evt.he);
    });
    fwrap.appendChild(flag);
  });
}

function buildLegend() {
  document.getElementById("legend").innerHTML = Object.values(ERAS).map((e) =>
    `<span class="item"><span class="dot" style="background:${e.color}"></span>${e.he}</span>`
  ).join("");
}

function renderAll() { buildGrid(); buildCols(); buildEvents(); syncRail(); }

// Pin the events rail to the viewport's left edge during horizontal scroll
// (RTL-proof: counter the horizontal offset with a transform; vertical scroll
// is left alone so the rail still tracks the timeline up/down).
const chartWrap = document.getElementById("chart-wrap");
let railTx = 0;
function syncRail() {
  const ev = document.getElementById("events");
  if (!ev || ev.style.display === "none") return;
  const wrapLeft = chartWrap.getBoundingClientRect().left;
  const baseLeft = ev.getBoundingClientRect().left - railTx; // un-transformed position
  railTx = wrapLeft - baseLeft;
  ev.style.transform = `translateX(${railTx}px)`;
}
chartWrap.addEventListener("scroll", syncRail, { passive: true });
window.addEventListener("resize", syncRail);

// ---------- events ----------
document.getElementById("btn-heb").addEventListener("click", () => setMode("heb"));
document.getElementById("btn-sec").addEventListener("click", () => setMode("sec"));
document.getElementById("show-events").addEventListener("change", renderAll);
document.getElementById("region-reset").addEventListener("click", () => { selRegion = null; applyRegion(); });
document.getElementById("map-toggle").addEventListener("click", () =>
  document.getElementById("map-panel").classList.toggle("collapsed"));

// ---- draggable map panel (grab the header to move it out of the way) ----
(function makeMapDraggable() {
  const panel = document.getElementById("map-panel");
  const head = document.getElementById("map-head") || panel.querySelector(".map-head");
  if (!panel || !head) return;
  let dragging = false, dx = 0, dy = 0, moved = false;

  function place(left, top) {
    // clamp inside the viewport so it can't be lost off-screen
    const w = panel.offsetWidth, h = panel.offsetHeight;
    left = Math.max(0, Math.min(left, window.innerWidth - w));
    top = Math.max(0, Math.min(top, window.innerHeight - h));
    panel.style.left = left + "px";
    panel.style.top = top + "px";
    panel.style.right = "auto";
    panel.style.bottom = "auto";
  }

  head.addEventListener("pointerdown", e => {
    if (e.target.closest(".map-toggle")) return; // let the collapse button work
    const r = panel.getBoundingClientRect();
    dragging = true; moved = false;
    dx = e.clientX - r.left; dy = e.clientY - r.top;
    place(r.left, r.top); // pin current position before moving
    head.setPointerCapture(e.pointerId);
    head.classList.add("dragging");
    e.preventDefault();
  });

  head.addEventListener("pointermove", e => {
    if (!dragging) return;
    moved = true;
    place(e.clientX - dx, e.clientY - dy);
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    head.classList.remove("dragging");
    try { head.releasePointerCapture(e.pointerId); } catch (_) {}
  }
  head.addEventListener("pointerup", endDrag);
  head.addEventListener("pointercancel", endDrag);
})();

function setMode(m) {
  mode = m;
  document.getElementById("btn-heb").classList.toggle("active", m === "heb");
  document.getElementById("btn-sec").classList.toggle("active", m === "sec");
  renderAll();
}

buildLegend();
buildMap();
renderAll();
