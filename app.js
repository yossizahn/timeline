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

// UI language: an explicit saved choice wins; otherwise follow the browser's
// primary language — Hebrew for Hebrew browsers, English for everything else.
const savedLang = localStorage.getItem("lang");
const navLang = ((navigator.languages && navigator.languages[0]) || navigator.language || "").toLowerCase();
let lang = savedLang === "en" || savedLang === "he" ? savedLang : /^(he|iw)/.test(navLang) ? "he" : "en";

// Year display ("heb" | "sec"): an explicit saved choice wins; otherwise it
// follows the language (Hebrew → Hebrew years, English → Common Era).
const savedMode = localStorage.getItem("yearMode");
let mode = savedMode === "heb" || savedMode === "sec" ? savedMode : lang === "he" ? "heb" : "sec";
const selRegions = new Set(); // active region (country) filters; empty = show all
const selEventTypes = new Set(); // active event-type filters (world/jewish/shift); empty = show all
const eventType = (evt) => evt.shift ? "shift" : evt.j ? "jewish" : "world";
const eventTypeShown = (evt) => !selEventTypes.size || selEventTypes.has(eventType(evt));

// ---------- UI strings (RTL Hebrew / LTR English) ----------
const I18N = {
  he: {
    title: "ציר הזמן — גאונים · ראשונים · אחרונים",
    h1: "ציר הזמן של חכמי ישראל",
    subtitle: "תנאים · אמוראים · גאונים · ראשונים · אחרונים — חיבוריהם ואירועי העולם",
    langGroup: "שפת הממשק",
    yearGroup: "שנה עברית או לועזית",
    yearHeb: "שנה עברית",
    yearSec: "שנה לועזית",
    events: "אירועים היסטוריים",
    hint: "גלול מעלה ומטה לאורך הדורות · רחף לפרטים · לחצו על שם או אירוע לערך בוויקיפדיה · לחצו על תווית אזור כדי לסנן לפי מרכז תורה",
    mapTitle: "מפה",
    mapHint: "לחצו על אזור כדי לסנן",
    mapToggle: "הצג/הסתר מפה",
    warn: "שימו לב: הנתונים נוצרו אוטומטית. התאריכים הוצלבו באופן ממוחשב מול מקורות ויקימדיה (ויקיפדיה וויקינתונים), אך לא עברו בדיקה אנושית — ייתכנו טעויות בתאריכים, בשמות ובפרטים. אמתו מול מקור מהימן לפני הסתמכות.",
    warnClose: "סגירת ההודעה",
    dMobile: "גרסת מובייל של ויקיפדיה",
    dOpen: "פתח בלשונית חדשה",
    dClose: "סגור",
    legendWorld: "היסטוריה עולמית",
    legendJewish: "היסטוריה יהודית",
    legendShift: "מעבר מרכז התורה",
    railHandle: "גררו לשינוי רוחב",
    barOpen: "לחצו לפתיחת הערך בוויקיפדיה",
    pinFig: "נעצו כדי לשמר את מיקומו על המפה",
    unpinFig: "ביטול הנעיצה",
    approx: "לערך",
    centerMove: "מעבר מרכז התורה",
    wikiGo: "ויקיפדיה — לחצו לפתיחה",
    aboutBtn: "אודות",
    search: "חיפוש חכם…",
    legendCap: "תקופות",
    regionsWord: "אזורים",
    aboutTitle: "אודות הפרויקט",
    aboutClose: "סגור",
    aboutBody:
      "<p>ציר זמן אינטראקטיבי ואנכי של חכמי ישראל — תנאים, אמוראים, גאונים, ראשונים ואחרונים — לצד חיבוריהם, מרכזי התורה בעולם, ואירועים מההיסטוריה היהודית והכללית. הציר נגלל לאורך הדורות; רחיפה מציגה פרטים ולחיצה פותחת את הערך בוויקיפדיה.</p>" +
      "<h3>מקורות הנתונים</h3>" +
      "<p>הנתונים נאספו ונערכו באופן אוטומטי. תאריכי הלידה והפטירה הוצלבו באופן ממוחשב מול מקורות ויקימדיה: לכל דמות אותר הערך בוויקיפדיה העברית, וממנו פריט ויקינתונים (Wikidata) המתאים, שמתוכו נשלפו שנת הלידה (<code>P569</code>) ושנת הפטירה (<code>P570</code>) והושוו לנתוני הציר. כשנמצאה אי-התאמה, הוכרעה השנה לפי גוף הערך בוויקיפדיה העברית.</p>" +
      "<h3>שנים ותאריכים</h3>" +
      "<p>הלידה והפטירה מוצגות לפי הספירה הנוצרית (לספירה). השנה העברית מחושבת כשנה הלועזית בתוספת 3760 — בקירוב, שכן ייתכן הפרש של שנה סביב ראש השנה. הסימן ± מציין תאריך מסורתי או משוער, הנפוץ במיוחד בקרב התנאים והאמוראים, שתאריכיהם אינם ודאיים.</p>" +
      "<h3>קישורי ויקיפדיה</h3>" +
      "<p>בעברית הקישור מוביל ישירות לערך; באנגלית הוא נקבע לפי הקישור הבין-לשוני שבערך העברי, ובהיעדר ערך מקביל מתבצע חיפוש.</p>" +
      "<h3>מפת הגבולות</h3>" +
      "<p>בעת רחיפה על דמות, המפה מציגה את הגבולות המדיניים המשוערים בתקופתה. נתוני הגבולות לקוחים ממיזם <a href='https://github.com/aourednik/historical-basemaps' target='_blank' rel='noopener'>Historical Basemaps</a> (רישיון CC-BY-SA 4.0), הוקרנו אל מרחב המפה של הציר, ושמות הממלכות תורגמו לעברית באופן חלקי — גבולות ללא שם מסומנים בקו בלבד. הגבולות ההיסטוריים משוערים ושנויים במחלוקת מטבעם.</p>" +
      "<h3>הסתייגות</h3>" +
      "<p>הנתונים לא עברו בדיקה אנושית מלאה וייתכנו טעויות בתאריכים, בשמות ובפרטים. יש לאמת מול מקור מהימן לפני הסתמכות.</p>" +
      "<h3>קוד המקור</h3>" +
      "<p>הפרויקט פתוח בקוד מקור ב-<a href='https://github.com/yossizahn/timeline' target='_blank' rel='noopener'>GitHub</a>. אתם מוזמנים לדווח על טעויות או להציע תיקונים.</p>",
  },
  en: {
    title: "Timeline — Sages of Israel",
    h1: "Timeline of the Sages of Israel",
    subtitle: "Tannaim · Amoraim · Geonim · Rishonim · Acharonim — their works and world events",
    langGroup: "Interface language",
    yearGroup: "Hebrew or Common Era year",
    yearHeb: "Hebrew year",
    yearSec: "Common era",
    events: "Historical events",
    hint: "Scroll up and down through the generations · hover for details · click a name or event for its Wikipedia article · click a region label to filter by Torah center",
    mapTitle: "Map",
    mapHint: "Click a region to filter",
    mapToggle: "Show/hide map",
    warn: "Note: this data was generated automatically. Dates have been machine-crosschecked against Wikimedia sources (Wikipedia and Wikidata), but it has not been human-verified — dates, names, and details may contain errors. Confirm against a reliable source before relying on it.",
    warnClose: "Dismiss",
    dMobile: "Wikipedia mobile version",
    dOpen: "Open in a new tab",
    dClose: "Close",
    legendWorld: "World history",
    legendJewish: "Jewish history",
    legendShift: "Torah center moves",
    railHandle: "Drag to resize",
    barOpen: "Click to open the Wikipedia article",
    pinFig: "Pin to keep this location on the map",
    unpinFig: "Unpin",
    approx: "approx.",
    centerMove: "Torah center moves",
    wikiGo: "Wikipedia — click to open",
    aboutBtn: "About",
    search: "Search a sage…",
    legendCap: "Eras",
    regionsWord: "regions",
    aboutTitle: "About this project",
    aboutClose: "Close",
    aboutBody:
      "<p>An interactive, vertical timeline of the sages of Israel — Tannaim, Amoraim, Geonim, Rishonim and Acharonim — alongside their works, the world's centers of Torah, and events from Jewish and general history. Scroll through the generations; hover for details and click to open the Wikipedia article.</p>" +
      "<h3>Data sources</h3>" +
      "<p>The data was compiled and edited automatically. Birth and death years were machine-crosschecked against Wikimedia sources: each figure's Hebrew Wikipedia article was resolved to its Wikidata item, from which the birth year (<code>P569</code>) and death year (<code>P570</code>) were read and compared with the timeline. Where they disagreed, the year was adjudicated against the body of the Hebrew Wikipedia article.</p>" +
      "<h3>Years and dates</h3>" +
      "<p>Birth and death are shown in the Common Era (CE). The Hebrew year is the CE year plus 3760 — approximately, since it can differ by a year around Rosh Hashanah. A ± marks a traditional or approximate date, common especially among the Tannaim and Amoraim, whose dates are uncertain.</p>" +
      "<h3>Wikipedia links</h3>" +
      "<p>In Hebrew the link goes straight to the article; in English it follows the interlanguage link in the Hebrew article, falling back to a search when no parallel article exists.</p>" +
      "<h3>Border map</h3>" +
      "<p>Hovering a figure overlays the approximate political borders of their era. Border data is from the <a href='https://github.com/aourednik/historical-basemaps' target='_blank' rel='noopener'>Historical Basemaps</a> project (CC-BY-SA 4.0), reprojected into the timeline's map space; polity names are partly translated to Hebrew — unnamed borders show as outline only. Historical borders are approximate and inherently contested.</p>" +
      "<h3>Disclaimer</h3>" +
      "<p>The data has not been fully human-verified and may contain errors in dates, names, and details. Confirm against a reliable source before relying on it.</p>" +
      "<h3>Source code</h3>" +
      "<p>The project is open source on <a href='https://github.com/yossizahn/timeline' target='_blank' rel='noopener'>GitHub</a>. Reports of errors and suggested fixes are welcome.</p>",
  },
};
const t = (k) => I18N[lang][k];
const isRTL = () => lang === "he";

// Fallback English search term, used only when WIKI_EN has no authoritative
// title for this figure (see enUrl). Prefer the real name inside parentheses.
function enTerm(f) {
  const m = f.en.match(/\(([^)]+)\)/);
  return m ? m[1] : f.en;
}
// Hebrew: direct article. English: search-with-go (lands on the article even
// when the exact title differs), so we never hit a dead link.
// Default to the desktop domain — on some networks the .m mobile host's redirect
// aborts inside an iframe, while the desktop host follows redirects cleanly. The
// drawer's mobile (smartphone) toggle opts into the .m host for the nicer mobile reading layout.
let mobileWiki = localStorage.getItem("mobileWiki") === "1";
const wikiHost = (lang) => lang + (mobileWiki ? ".m" : "") + ".wikipedia.org";
const articleUrl = (lang, title) => "https://" + wikiHost(lang) + "/wiki/" + encodeURIComponent(title.replace(/ /g, "_"));
const heUrl = (term) => articleUrl("he", term);
// English: prefer the authoritative title from the article's language switcher
// (WIKI_EN, keyed by the he title) for a direct, never-dead article link; fall
// back to search-with-go only where no English article exists.
const enUrl = (heTitle, term) => WIKI_EN[heTitle]
  ? articleUrl("en", WIKI_EN[heTitle])
  : "https://" + wikiHost("en") + "/w/index.php?search=" + encodeURIComponent(term) + "&go=Go";

const y = (year) => (year - START) * PX;     // CE year -> vertical px
// cover late figures (some die after END) so their bars aren't clipped
const totalH = y(Math.max(END, ...FIGURES.map((f) => f.died)));

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

// Era focus: when set, only that era's figures render, re-packed on their own —
// which collapses the ~36-lane wall (all eras at once) down to the handful of
// columns a single era needs. null = show every era together.
let focusEra = null;

// stable id per figure so search can locate a bar across re-renders
FIGURES.forEach((f, i) => { f._idx = i; });

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
  drawerLang = lang;            // open in the current UI language
  document.getElementById("d-title").textContent = title;
  setDrawerLang(drawerLang);
  drawer.hidden = false;
}
function setDrawerLang(lang) {
  drawerLang = lang;
  const url = lang === "he" ? heUrl(drawerTerms.he) : enUrl(drawerTerms.he, drawerTerms.en);
  document.getElementById("d-loader").hidden = false; // show until the iframe loads
  document.getElementById("d-frame").src = url;
  document.getElementById("d-open").href = url;
  document.getElementById("d-he").classList.toggle("active", lang === "he");
  document.getElementById("d-en").classList.toggle("active", lang === "en");
}
function closeDrawer() {
  drawer.hidden = true;
  document.getElementById("d-frame").src = "about:blank"; // stop loading
}
document.getElementById("d-frame").addEventListener("load", () => {
  document.getElementById("d-loader").hidden = true; // hide once the article paints
});
document.getElementById("d-he").addEventListener("click", () => setDrawerLang("he"));
document.getElementById("d-en").addEventListener("click", () => setDrawerLang("en"));
function syncMobileBtn() {
  const btn = document.getElementById("d-mobile");
  btn.classList.toggle("active", mobileWiki);
  btn.setAttribute("aria-pressed", mobileWiki ? "true" : "false");
}
document.getElementById("d-mobile").addEventListener("click", () => {
  mobileWiki = !mobileWiki;
  localStorage.setItem("mobileWiki", mobileWiki ? "1" : "0");
  syncMobileBtn();
  setDrawerLang(drawerLang); // reload the current article on the new host
});
syncMobileBtn();
document.getElementById("d-close").addEventListener("click", closeDrawer);

// ---- About modal ----
const aboutOverlay = document.getElementById("about-overlay");
function openAbout() { aboutOverlay.hidden = false; }
function closeAbout() { aboutOverlay.hidden = true; }
document.getElementById("about-btn").addEventListener("click", openAbout);
document.getElementById("about-close").addEventListener("click", closeAbout);
aboutOverlay.addEventListener("click", (e) => { if (e.target === aboutOverlay) closeAbout(); });

document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeDrawer(); closeAbout(); } });

function figureTip(f) {
  const books = f.books.map((b) => {
    const primary = isRTL() ? b.he : b.en, secondary = isRTL() ? b.en : b.he;
    return `<div class="b">${icon("book-open", "ic-book")}${primary} <span class="by">(${fmtYear(b.y)})</span><br><span style="color:#9b9384">${secondary}</span></div>`;
  }).join("");
  const r = REGIONS[f.region];
  const primary = isRTL() ? f.he : f.en, secondary = isRTL() ? f.en : f.he;
  const region = isRTL() ? `${r.he} · ${r.en}` : `${r.en} · ${r.he}`;
  return `<h4>${primary}</h4>
    <div class="en">${secondary}</div>
    <div>${f.note}</div>
    <div class="meta">${fmtRange(f.born, f.died)}${f.circa ? " (" + t("approx") + ")" : ""} · ${icon("map-pin", "ic-pin")}${f.place}</div>
    <div class="region-tip"><i style="background:${r.color}"></i>${region}</div>
    <div class="books">${books}</div>
    <div class="go">${icon("arrow-up-right", "ic-go")}${t("wikiGo")}</div>`;
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

  // pack the current view: era focus and country filters both hide non-matches
  // entirely (not dim), so the field re-packs into far fewer lanes.
  let items = FIGURES;
  if (focusEra) items = items.filter((f) => f.era === focusEra);
  if (selRegions.size) items = items.filter((f) => selRegions.has(f.region));
  const layout = packLanes(items);
  const FIELD_W = layout.laneCount * LANE_W;

  const field = document.createElement("div");
  field.className = "field";
  field.style.width = FIELD_W + "px";
  field.style.height = totalH + "px";
  // the events sidebar is a separate column now — the field needs no left reserve

  layout.items.forEach((f) => {
    const top = y(f.born);
    const h = Math.max(y(f.died) - top, MIN_BAR_H);
    const r = REGIONS[f.region];
    const bar = document.createElement("div");
    bar.className = "bar" + (f.circa ? " circa" : "");
    bar.dataset.region = f.region;
    bar.dataset.fig = f._idx;
    bar.style.setProperty("--c", ERAS[f.era].color);
    bar.style.top = top + "px";
    bar.style.height = h + "px";
    // pack lanes from the reading-start edge: right in RTL, left in LTR
    bar.style[isRTL() ? "right" : "left"] = f._lane * LANE_W + "px";
    bar.style.width = LANE_W - LANE_GAP + "px";
    bar.innerHTML =
      `<span class="name">${isRTL() ? f.he : f.en}</span>` +
      `<span class="yrs">${fmtRange(f.born, f.died)}</span>` +
      `<span class="region"><i style="background:${r.color}"></i>${isRTL() ? r.he : r.en}</span>`;
    bar.title = t("barOpen");
    bar.addEventListener("mousemove", (e) => showTip(figureTip(f), e));
    bar.addEventListener("mouseenter", () => { showBorders(f); showPin(f); });
    bar.addEventListener("mouseleave", () => { hideTip(); restoreMap(); });
    bar.addEventListener("click", () => { hideTip(); openDrawer(f.w, enTerm(f), isRTL() ? f.he : f.en); });

    // region chip → toggle the geographic highlight (don't open Wikipedia)
    bar.querySelector(".region").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleRegion(f.region);
    });

    // pin toggle → keep this sage's pin + era borders on the map at rest
    const pinBtn = document.createElement("button");
    pinBtn.className = "bar-pin";
    pinBtn.innerHTML = icon("pin", "ic-barpin");
    pinBtn.title = t(f === pinnedFig ? "unpinFig" : "pinFig");
    pinBtn.setAttribute("aria-label", pinBtn.title);
    if (f === pinnedFig) bar.classList.add("pinned");
    pinBtn.addEventListener("click", (e) => { e.stopPropagation(); togglePin(f); });
    bar.appendChild(pinBtn);

    f.books.forEach((b) => {
      const dot = document.createElement("div");
      dot.className = "book";
      dot.style.top = (y(b.y) - top) + "px";
      dot.addEventListener("mousemove", (e) => {
        e.stopPropagation();
        const bp = isRTL() ? b.he : b.en, bs = isRTL() ? b.en : b.he, fn = isRTL() ? f.he : f.en;
        showTip(`<h4>${icon("book-open", "ic-book")}${bp}</h4><div class="en">${bs}</div><div class="meta">${fmtYear(b.y)} · ${fn}</div>`, e);
      });
      dot.addEventListener("mouseleave", hideTip);
      bar.appendChild(dot);
    });

    field.appendChild(bar);
  });

  cols.appendChild(field);
  document.getElementById("canvas").style.height = totalH + "px";
  syncRegionUI(); // keep map markers + reset chip in sync after a re-render
}

// ---------- name search (autocomplete) ----------
// Type to get a dropdown of matching sages; pick one to scroll to its bar and
// briefly highlight it. No dimming of the rest — just a guided jump.
const searchBox = document.getElementById("search");
const searchMenu = document.createElement("div");
searchMenu.className = "search-menu";
searchMenu.setAttribute("role", "listbox");
searchMenu.hidden = true;
searchBox.parentElement.appendChild(searchMenu);
let searchMatches = [];
let searchActive = -1;

function buildMatches(raw) {
  const q = raw.trim().toLowerCase();
  if (!q) return [];
  const out = [];
  for (const f of FIGURES) {
    const pos = `${f.he} ${f.en}`.toLowerCase().indexOf(q);
    if (pos !== -1) out.push({ f, pos });
  }
  // earlier matches (start of name) first, then chronological
  out.sort((a, b) => a.pos - b.pos || a.f.born - b.f.born);
  return out.slice(0, 8);
}

function renderMenu() {
  if (!searchMatches.length) { searchMenu.hidden = true; searchMenu.innerHTML = ""; return; }
  searchMenu.innerHTML = searchMatches.map(({ f }, i) =>
    `<button type="button" class="search-opt${i === searchActive ? " active" : ""}" data-i="${i}" role="option">` +
    `<span class="so-dot" style="background:${ERAS[f.era].color}"></span>` +
    `<span class="so-name">${isRTL() ? f.he : f.en}</span>` +
    `<span class="so-yrs">${fmtRange(f.born, f.died)}</span></button>`
  ).join("");
  searchMenu.hidden = false;
}

function clearHighlight() {
  document.querySelectorAll(".bar.search-hit").forEach((b) =>
    b.classList.remove("search-hit", "pulse"));
}

function chooseMatch(i) {
  const m = searchMatches[i];
  if (!m) return;
  // a match may be hidden by an active era focus or country filter — drop
  // whichever would hide it so the jump always lands on a real bar
  const hiddenByEra = focusEra && m.f.era !== focusEra;
  const hiddenByRegion = selRegions.size && !selRegions.has(m.f.region);
  if (hiddenByEra) focusEra = null;
  if (hiddenByRegion) selRegions.clear();
  if (hiddenByEra || hiddenByRegion) { buildCols(); syncLegend(); }
  const bar = document.querySelector(`.bar[data-fig="${m.f._idx}"]`);
  if (bar) {
    // bring it into view on BOTH axes — a far-lane bar would be off-screen
    // horizontally if we only scrolled vertically (scrollIntoView also gets RTL right)
    bar.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    clearHighlight();
    bar.classList.add("search-hit");
    void bar.offsetWidth;        // restart the pulse animation
    bar.classList.add("pulse");
  }
  searchBox.value = isRTL() ? m.f.he : m.f.en;
  closeMenu();
}

function closeMenu() { searchMenu.hidden = true; searchActive = -1; }

searchBox.addEventListener("input", () => {
  if (!searchBox.value.trim()) clearHighlight();
  searchMatches = buildMatches(searchBox.value);
  searchActive = searchMatches.length ? 0 : -1;
  renderMenu();
});
searchBox.addEventListener("keydown", (e) => {
  if (searchMenu.hidden || !searchMatches.length) return;
  if (e.key === "ArrowDown") { e.preventDefault(); searchActive = (searchActive + 1) % searchMatches.length; renderMenu(); }
  else if (e.key === "ArrowUp") { e.preventDefault(); searchActive = (searchActive - 1 + searchMatches.length) % searchMatches.length; renderMenu(); }
  else if (e.key === "Enter") { e.preventDefault(); chooseMatch(searchActive); }
  else if (e.key === "Escape") { closeMenu(); }
});
// mousedown (before the input's blur) so the pick registers
searchMenu.addEventListener("mousedown", (e) => {
  const opt = e.target.closest(".search-opt");
  if (opt) { e.preventDefault(); chooseMatch(+opt.dataset.i); }
});
searchBox.addEventListener("blur", () => setTimeout(closeMenu, 120));

// ---------- geographic filter (multi-select; hides non-matches like era focus) ----------
function toggleRegion(key) {
  if (selRegions.has(key)) selRegions.delete(key);
  else selRegions.add(key);
  buildCols();      // re-pack so only the chosen countries show; syncRegionUI runs inside
  scrollToFirstVisible(); // jump to the earliest matching figure, not an empty stretch
}
// after a region filter, scroll to the topmost (earliest-born) bar still showing,
// so the view lands on a person rather than blank time before the first match.
function scrollToFirstVisible() {
  if (!selRegions.size) return;
  let topY = Infinity;
  document.querySelectorAll(".bar").forEach((b) => {
    topY = Math.min(topY, parseFloat(b.style.top));
  });
  if (topY !== Infinity) chartWrap.scrollTop = Math.max(0, topY - 24);
}
function clearRegions() {
  if (!selRegions.size) return;
  selRegions.clear();
  buildCols();
}
function syncRegionUI() {
  const any = selRegions.size > 0;
  // map markers: selected ones grow + stay lit, the rest fade while a filter is on
  document.querySelectorAll("#map-dots .mdot").forEach((el) => {
    const isSel = selRegions.has(el.dataset.region);
    el.classList.toggle("active", isSel);
    el.classList.toggle("dim", any && !isSel);
    el.querySelector("circle").setAttribute("r", isSel ? 9 : 6);
  });
  // reset chip lists the active countries (≤2 by name, else a count) and clears all
  const btn = document.getElementById("region-reset");
  if (!any) { btn.hidden = true; return; }
  btn.hidden = false;
  const keys = [...selRegions];
  const dots = keys.map((k) => `<i style="background:${REGIONS[k].color}"></i>`).join("");
  const label = keys.length <= 2
    ? keys.map((k) => isRTL() ? REGIONS[k].he : REGIONS[k].en).join(" · ")
    : `${keys.length} ${t("regionsWord")}`;
  btn.innerHTML = `${dots}${label}<span class="x">${icon("x")}</span>`;
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
    const label = isRTL() ? r.he : r.en;
    if (r.off) {
      // Off-frame marker (the New World, far west of this map): the dot is pinned
      // to the very left edge and half-clipped by the svg frame, with a bold "«"
      // just inside it — so it reads as "off the map, across the ocean that way"
      // rather than a stray dot floating in the Atlantic. Label rides to its right.
      return `<g class="mdot off-dot" data-region="${key}">
         <circle cx="${r.mx}" cy="${r.my}" r="4.2" fill="${r.color}" stroke="#fff" stroke-width="1.3"></circle>
         <text class="moff" x="${r.mx + 13}" y="${r.my + 5}" text-anchor="middle">«</text>
         <text class="mlabel" x="${r.mx + 42}" y="${r.my + 3.4}" text-anchor="middle">${label}</text>
       </g>`;
    }
    return `<g class="mdot" data-region="${key}">
       <circle cx="${r.mx}" cy="${r.my}" r="4.2" fill="${r.color}" stroke="#fff" stroke-width="1.3"></circle>
       <text class="mlabel" x="${r.mx}" y="${r.my - 6.5}" text-anchor="middle">${label}</text>
     </g>`;
  }).join("");
  g.querySelectorAll(".mdot").forEach((el) =>
    el.addEventListener("click", () => toggleRegion(el.dataset.region)));
}

// ---------- era political borders (hover overlay) ----------
// Per-era border geometry lives in borders/<year>.json (generated offline from
// historical-basemaps, reprojected into this map's 285x252 space). We lazy-load
// the nearest slice the first time a sage from that period is hovered, cache it,
// and paint outlines + Hebrew labels into #map-borders until the mouse leaves.
let BORDER_YEARS = null;                 // sorted slice years, from borders/index.json
const borderCache = {};                  // year -> features array (or "loading")
let wantedSlice = null;                  // slice the cursor currently wants painted

fetch("borders/index.json")
  .then((r) => r.json())
  .then((ys) => { BORDER_YEARS = ys; restBorders(); })  // paint the resting (contemporary) map
  .catch(() => { BORDER_YEARS = []; });  // fail quiet: overlay just stays off

function figureYear(f) {                 // mid-life best represents a sage's era
  return Math.round((f.born + f.died) / 2);
}
function nearestSlice(year) {
  if (!BORDER_YEARS || !BORDER_YEARS.length) return null;
  return BORDER_YEARS.reduce((best, y) =>
    Math.abs(y - year) < Math.abs(best - year) ? y : best);
}
function borderCaption(y) {
  if (!isRTL()) return y < 0 ? `Borders · ${-y} BCE` : `Borders · ${y} CE`;
  return y < 0 ? `גבולות · ${-y} לפנה"ס` : `גבולות · שנת ${y} לסה"נ`;
}
// A small spinning ring (echoing the Wikipedia drawer's .dspinner, but subtle —
// it's only a map layer) shown while a slice is being fetched, so a slow load
// reads as "loading" rather than "no borders for this era". Tucked into the
// caption corner; replaced by paintBorders (or cleared) once the fetch settles.
function paintBorderLoading() {
  const g = document.getElementById("map-borders");
  const cx = 142.5, cy = 120, r = 13;
  const msg = isRTL() ? "טוען נתוני מפה" : "Loading map data";
  g.innerHTML =
    `<rect class="bloader-dim" x="0" y="0" width="285" height="252"></rect>` +
    `<g class="bloader">` +
    `<circle class="bloader-track" cx="${cx}" cy="${cy}" r="${r}"></circle>` +
    `<circle class="bloader-arc" cx="${cx}" cy="${cy}" r="${r}"></circle>` +
    `</g>` +
    `<text class="bloader-msg" x="${cx}" y="${cy + r + 16}">${msg}</text>`;
}
function paintBorders(year, feats) {
  const g = document.getElementById("map-borders");
  const rtl = isRTL();
  const paths = feats.map((ft) => `<path class="bder" d="${ft.d}"></path>`).join("");
  const labels = feats.filter((ft) => ft.l)
    .map((ft) => `<text class="blabel" x="${ft.x}" y="${ft.y}">${rtl ? ft.l : (ft.le || ft.l)}</text>`).join("");
  // Anchor the caption to the appropriate side so the (RTL Hebrew) run flows
  // inward instead of off the left edge of the 285-wide map.
  const cap = rtl
    ? `<text class="bcap" x="281" y="248" text-anchor="start" direction="rtl">${borderCaption(year)}</text>`
    : `<text class="bcap" x="4" y="248">${borderCaption(year)}</text>`;
  g.innerHTML = paths + labels + cap;
  declutterLabels(g.querySelectorAll(".blabel"), g.querySelector(".bcap"));
}
// Nudge overlapping border labels apart along their axis of least overlap, so
// the (wider) English names stay legible. Anchored "middle"; bbox.x already
// accounts for that. The caption joins as a fixed obstacle (labels yield to it,
// it doesn't move). A few relaxation passes settle most maps.
function declutterLabels(nodes, cap) {
  const PAD = 1;                         // px of breathing room between boxes
  const box = (n, fixed) => {
    const b = n.getBBox();
    // operate on bbox centers; remember the offset to the anchor (x, y baseline)
    return { n, fixed, cx: b.x + b.width / 2, cy: b.y + b.height / 2,
             dx: +n.getAttribute("x") - (b.x + b.width / 2),
             dy: +n.getAttribute("y") - (b.y + b.height / 2),
             hw: b.width / 2 + PAD, hh: b.height / 2 + PAD };
  };
  const boxes = Array.from(nodes).map((n) => box(n, false));
  if (cap) boxes.push(box(cap, true));
  // push a movable box by `amt` along an axis; flip toward the interior if the
  // chosen direction would shove it out of frame (matters next to the corner
  // caption, where the natural "away" direction has no room).
  const shove = (m, axis, amt, dir) => {
    const c = axis === "x" ? "cx" : "cy", hh = axis === "x" ? "hw" : "hh";
    const hi = (axis === "x" ? 285 : 250) - m[hh];
    if (m[c] + dir * amt > hi || m[c] + dir * amt < m[hh]) dir = -dir;
    m[c] += dir * amt;
  };
  for (let pass = 0; pass < 14; pass++) {
    let moved = false;
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        if (a.fixed && b.fixed) continue;
        const ox = a.hw + b.hw - Math.abs(a.cx - b.cx);
        const oy = a.hh + b.hh - Math.abs(a.cy - b.cy);
        if (ox <= 0 || oy <= 0) continue;             // no overlap
        moved = true;
        const axis = oy <= ox ? "y" : "x", o = oy <= ox ? oy : ox;
        const c = axis === "x" ? "cx" : "cy";
        if (a.fixed || b.fixed) {                      // move only the movable one
          const m = a.fixed ? b : a, f = a.fixed ? a : b;
          shove(m, axis, o, m[c] >= f[c] ? 1 : -1);    // away from the fixed box
        } else {                                        // split between the two
          const dir = a[c] <= b[c] ? 1 : -1;
          a[c] -= dir * o / 2; b[c] += dir * o / 2;
        }
      }
    if (!moved) break;
  }
  boxes.forEach((bx) => {
    if (bx.fixed) return;
    const x = Math.max(bx.hw, Math.min(285 - bx.hw, bx.cx));   // keep in frame
    const y = Math.max(bx.hh, Math.min(250 - bx.hh, bx.cy));
    bx.n.setAttribute("x", (x + bx.dx).toFixed(1));            // back to anchor
    bx.n.setAttribute("y", (y + bx.dy).toFixed(1));
  });
}
function loadAndPaint(slice) {
  if (slice === null) return;
  wantedSlice = slice;                    // remember what the cursor wants now
  const cached = borderCache[slice];
  if (Array.isArray(cached)) { paintBorders(slice, cached); return; }
  paintBorderLoading();                   // show a loading hint until the fetch lands
  if (cached === "loading") return;       // in-flight; its .then will paint if still wanted
  borderCache[slice] = "loading";
  fetch(`borders/${slice}.json`)
    .then((r) => r.json())
    .then((data) => {
      borderCache[slice] = data.f;
      if (wantedSlice === slice) paintBorders(slice, data.f); // still the slice we want
    })
    .catch(() => {
      borderCache[slice] = [];
      if (wantedSlice === slice) clearBorders();              // drop the loading hint
    });
}
function showBorders(f) { loadAndPaint(nearestSlice(figureYear(f))); }
// Resting state: with no sage hovered, the map shows present-day borders (the
// most recent slice). Hover swaps in the era map; mouseleave returns here.
function restBorders() {
  if (BORDER_YEARS && BORDER_YEARS.length) loadAndPaint(BORDER_YEARS[BORDER_YEARS.length - 1]);
}
// Repaint the currently-wanted slice in the active UI language (e.g. after a
// language toggle), so resting labels track the chrome without a fresh hover.
function repaintBorders() {
  if (wantedSlice !== null && Array.isArray(borderCache[wantedSlice]))
    paintBorders(wantedSlice, borderCache[wantedSlice]);
}
function clearBorders() {
  wantedSlice = null;
  document.getElementById("map-borders").innerHTML = "";
}

// ---------- hover pin (a sage's exact location, or his move) ----------
// On figure hover we resolve the free-text `place` into precise map points via
// the PLACES gazetteer, drop a teardrop pin at where he ended up, mark earlier
// stops with a small ring, draw an arrow along the move, and hide the colored
// region-filter dots so the location reads cleanly.

// Same regional-equirectangular projection as the coastline and era borders.
const MAP_K = 6 * Math.cos(40 * Math.PI / 180);   // 6·cos40° ≈ 4.596
function projectPlace(p) {
  if (!p) return null;
  if (p.off) return { x: p.mx, y: p.my, off: true };
  return { x: MAP_K * p.lon + 55.18, y: 359.9 - 6 * p.lat };
}
// Resolve one `place` token ("city, region (aside)") to a gazetteer entry plus
// the name we actually matched on (for the on-map label).
function resolvePlace(token) {
  const t = token.replace(/\([^)]*\)/g, "").trim();   // drop parentheticals
  const tries = [t, t.split(",")[0].trim(),           // whole token, then city
    t.split(",")[0].split(/ ו/)[0].trim(),            // "ספרד וצפון אפריקה" → "ספרד"
    (t.split(",")[1] || "").trim()];                  // fall back to the region word
  for (const name of tries)
    if (name && PLACES[name]) return { p: PLACES[name], name };
  return null;
}
// Ordered list of distinct map points for a figure (origin → … → destination),
// each as {x,y,name,approx,off}. `place` uses "←" for a move; the rightmost
// (first) segment is the origin.
function figurePoints(f) {
  const segs = (f.place || "").split("←").map((s) => s.trim()).filter(Boolean);
  const out = [];
  for (const seg of segs) {
    const hit = resolvePlace(seg);
    const pt = hit && projectPlace(hit.p);
    if (!pt) continue;
    pt.name = hit.name;
    pt.nameEn = PLACES_EN[hit.name] || hit.name;
    pt.approx = APPROX_PLACES.has(hit.name);
    if (!out.length || Math.hypot(pt.x - out[out.length - 1].x, pt.y - out[out.length - 1].y) > 0.5)
      out.push(pt);
  }
  // last resort: the figure's region center, so every sage still gets a pin
  if (!out.length) {
    const r = REGIONS[f.region];
    if (r) out.push({ x: r.mx, y: r.my, off: r.off, name: r.he, nameEn: r.en, approx: true });
  }
  return out;
}
function teardrop(x, y, color) {
  return `<ellipse class="pin-shadow" cx="${x}" cy="${y}" rx="3.4" ry="1.2"/>` +
    `<path class="pin-body" d="M${x},${y} C${x - 6.8},${y - 9} ${x - 6.8},${y - 15.5} ${x},${y - 17} ` +
    `C${x + 6.8},${y - 15.5} ${x + 6.8},${y - 9} ${x},${y} Z" fill="${color}"/>` +
    `<circle class="pin-eye" cx="${x}" cy="${y - 10.5}" r="2.7" fill="#fff"/>`;
}
// A gently bowed arrow from a→b, stopping short of b so the pin tip stays clear.
function moveArrow(a, b, color) {
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const sx = a.x + ux * 4, sy = a.y + uy * 4;          // leave the origin ring
  const ex = b.x - ux * 5, ey = b.y - uy * 5;          // stop just shy of the dest tip
  const mx = (sx + ex) / 2 - (ey - sy) * 0.18;         // perpendicular bow
  const my = (sy + ey) / 2 + (ex - sx) * 0.18;
  // arrowhead at the end, aimed along the final tangent
  const tx = ex - mx, ty = ey - my, tl = Math.hypot(tx, ty) || 1;
  const hx = tx / tl, hy = ty / tl, h = 4.5, w = 2.6;
  const head = `M${ex},${ey} L${ex - hx * h - hy * w},${ey - hy * h + hx * w} ` +
    `L${ex - hx * h + hy * w},${ey - hy * h - hx * w} Z`;
  return `<path class="pin-move" d="M${sx},${sy} Q${mx},${my} ${ex},${ey}" stroke="${color}" fill="none"/>` +
    `<path class="pin-move-head" d="${head}" fill="${color}"/>`;
}
// Name tag above a point. Destination tags ride above the teardrop body, origin
// tags sit just over the ring; an approximate point gets a dashed extent circle.
function pinLabel(p, isDest, color) {
  let s = "";
  if (p.approx)
    s += `<circle class="pin-approx" cx="${p.x}" cy="${p.y}" r="11" stroke="${color}"/>`;
  const ly = isDest ? p.y - 21 : p.y - (p.approx ? 14 : 7);
  const name = isRTL() ? p.name : (p.nameEn || p.name);
  s += `<text class="pin-label${isDest ? " dest" : ""}" x="${p.x}" y="${ly}">${name}</text>`;
  return s;
}
function showPin(f) {
  const pts = figurePoints(f);
  if (!pts.length) return;
  const color = (REGIONS[f.region] && REGIONS[f.region].color) || "#444";
  const dest = pts[pts.length - 1];
  let svg = "";
  for (let i = 0; i < pts.length - 1; i++) svg += moveArrow(pts[i], pts[i + 1], color);
  for (let i = 0; i < pts.length - 1; i++)               // earlier stops: small rings
    svg += `<circle class="pin-origin" cx="${pts[i].x}" cy="${pts[i].y}" r="2.8" fill="${color}"/>`;
  svg += teardrop(dest.x, dest.y, color);
  for (let i = 0; i < pts.length - 1; i++) svg += pinLabel(pts[i], false, color);
  svg += pinLabel(dest, true, color);
  const g = document.getElementById("map-pin");
  // animate the whole group around the destination pin's tip (reliable across browsers)
  g.style.transformOrigin = `${dest.x}px ${dest.y}px`;
  g.innerHTML = svg;
  g.style.animation = "none";
  void g.getBoundingClientRect();        // reflow so the drop replays on every hover
  g.style.animation = "";
  document.getElementById("map-svg").classList.add("pinned");
}
function hidePin() {
  document.getElementById("map-pin").innerHTML = "";
  document.getElementById("map-svg").classList.remove("pinned");
}

// ---------- sticky pin (a sage held on the map without hovering) ----------
// One figure may be "pinned": its era borders + location pin persist on the map
// at rest, instead of the contemporary resting map. Hover still previews other
// sages; leaving a bar returns to the pinned sage (or the resting map if none).
let pinnedFig = null;
function restoreMap() {
  if (pinnedFig) { showBorders(pinnedFig); showPin(pinnedFig); }
  else { restBorders(); hidePin(); }
}
function togglePin(f) {
  pinnedFig = (pinnedFig === f) ? null : f;
  document.querySelectorAll(".bar.pinned").forEach((b) => b.classList.remove("pinned"));
  document.querySelectorAll(".bar").forEach((b) => {
    const btn = b.querySelector(".bar-pin");
    if (!btn) return;
    const isPinned = +b.dataset.fig === (pinnedFig ? pinnedFig._idx : -1);
    b.classList.toggle("pinned", isPinned);
    btn.title = t(isPinned ? "unpinFig" : "pinFig");
    btn.setAttribute("aria-label", btn.title);
  });
  restoreMap();
}

// gutter width is user-resizable (drag handle on the rail's inner edge); persisted.
// on phones a 150px+ gutter would swallow the screen, so allow it to go narrower.
const isMobile = window.innerWidth <= 640;
const GUTTER_MIN = isMobile ? 92 : 150, GUTTER_MAX = isMobile ? 180 : 480;
let EVT_GUTTER = (() => {
  const saved = parseFloat(localStorage.getItem("evtGutter"));
  const base = saved || parseFloat(css.getPropertyValue("--evt-gutter")) || 250;
  // ignore a wide desktop default/saved value on mobile; start compact
  const want = isMobile && !saved ? 124 : base;
  return Math.min(GUTTER_MAX, Math.max(GUTTER_MIN, want));
})();
document.documentElement.style.setProperty("--evt-gutter", EVT_GUTTER + "px");

function buildEvents() {
  const layer = document.getElementById("events");
  layer.innerHTML = "";
  const show = document.getElementById("show-events").checked;
  layer.style.display = show ? "block" : "none";
  if (!show) return;

  // everything except the resize handle lives in .einner (translated by -scrollTop)
  const einner = document.createElement("div");
  einner.className = "einner";
  layer.appendChild(einner);

  // pinned legend for the three event types (stays put, not translated).
  // Each item is a filter toggle: click one to isolate its type, click more to
  // add them back. Empty selection == all shown (the default). The legend takes
  // pointer events so clicks land on it instead of falling through to a flag
  // that has scrolled underneath it.
  const elegend = document.createElement("div");
  elegend.className = "elegend";
  const legItems = [
    { type: "world", dot: `<span class="edot world"></span>`, label: t("legendWorld") },
    { type: "jewish", dot: `<span class="edot jewish">${icon("star-of-david")}</span>`, label: t("legendJewish") },
    { type: "shift", dot: `<span class="edot shift">${icon("arrow-left")}</span>`, label: t("legendShift") },
  ];
  elegend.innerHTML = legItems.map(({ type, dot, label }) => {
    const on = !selEventTypes.size || selEventTypes.has(type);
    return `<button type="button" class="eitem${on ? " on" : " off"}" ` +
           `data-type="${type}" aria-pressed="${on}">${dot}${label}</button>`;
  }).join("");
  elegend.querySelectorAll(".eitem").forEach((el) =>
    el.addEventListener("click", () => toggleEventType(el.dataset.type)));
  layer.appendChild(elegend);

  // resize handle on the rail's inner edge (stays full-height, not translated)
  const handle = document.createElement("div");
  handle.className = "erail-handle";
  handle.title = t("railHandle");
  handle.addEventListener("pointerdown", startGutterResize);
  layer.appendChild(handle);

  // the rail sits on the physical-left in RTL and physical-right in LTR; the spine
  // hugs the edge facing the chart (inner edge) either way.
  const rtl = isRTL();
  const flagInset = 12;               // flag's edge distance from the spine
  const spineX = rtl ? EVT_GUTTER - 1 : 1;
  const flagX = rtl ? EVT_GUTTER - flagInset : flagInset;
  const MINGAP = 23;                  // min vertical spacing between labels

  // de-cluster: push overlapping labels down, keep the true year on the spine
  let lastY = -999;
  const placed = EVENTS.filter(eventTypeShown).sort((a, b) => a.y - b.y).map((evt) => {
    const trueY = y(evt.y);
    const labelY = Math.max(trueY, lastY + MINGAP);
    lastY = labelY;
    return { evt, trueY, labelY };
  });

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
  einner.appendChild(svg);

  // labels (right-aligned to the spine inside the gutter)
  const fwrap = document.createElement("div");
  fwrap.className = "eflags";
  fwrap.style.width = EVT_GUTTER + "px";
  einner.appendChild(fwrap);

  placed.forEach(({ evt, trueY }, i) => {
    const flag = document.createElement("div");
    flag.className = evt.shift ? "eflag shift" : evt.j ? "eflag jewish" : "eflag";
    flag.style.top = placed[i].labelY + "px";
    flag.style[rtl ? "right" : "left"] = flagInset + "px";
    const mark = evt.shift ? `<span class="smark">${icon("arrow-left")}</span>`
               : evt.j ? `<span class="emark">${icon("star-of-david")}</span>` : "";
    // event `en` strings carry search hints after ";"/"&"; the flag wants a concise label
    const enLabel = evt.en.split(/[;&]/)[0].trim();
    const ep = rtl ? evt.he : enLabel, es = rtl ? evt.en : evt.he;
    flag.innerHTML = `${mark}${ep}<span class="yr">${fmtYear(evt.y)}</span>`;
    const place = evt.place ? `<div class="meta">${icon("map-pin", "ic-pin")}${evt.place}</div>` : "";
    const note = evt.shift ? `<div class="meta">${t("centerMove")}</div>` : "";
    flag.addEventListener("mousemove", (e) =>
      showTip(`<h4>${ep}</h4><div class="en">${es}</div>` +
              `<div class="meta">${fmtYear(evt.y)}</div>${place}${note}` +
              `<div class="go">${icon("arrow-up-right", "ic-go")}${t("wikiGo")}</div>`, e));
    flag.addEventListener("mouseenter", () => showHL(trueY, evColor(evt)));
    flag.addEventListener("mouseleave", () => { hideTip(); hideHL(); });
    flag.addEventListener("click", () => {
      hideTip();
      openDrawer(evt.w, evt.en.split(/[;&]/)[0].trim(), ep);
    });
    fwrap.appendChild(flag);
  });
}

// Event-type legend filter (multi-select). From the all-shown default the first
// click isolates that type; further clicks toggle the others in and out. An
// empty selection means "show all" — so a full or emptied set both reset to it.
function toggleEventType(type) {
  if (selEventTypes.has(type)) selEventTypes.delete(type);
  else selEventTypes.add(type);
  if (selEventTypes.size === 3) selEventTypes.clear();   // all on == default
  buildEvents();
  syncRail();
}

function buildLegend() {
  const legend = document.getElementById("legend");
  legend.innerHTML = Object.entries(ERAS).map(([key, e]) =>
    `<button class="item" data-era="${key}" type="button" aria-pressed="false">` +
    `<span class="dot" style="background:${e.color}"></span>${isRTL() ? e.he : e.en}</button>`
  ).join("");
  legend.querySelectorAll(".item").forEach((el) =>
    el.addEventListener("click", () => setFocusEra(el.dataset.era)));
  syncLegend();
}

// click an era to study it alone (others collapse away); click it again to
// bring everyone back. Re-packs into far fewer lanes, then scrolls to the era.
function setFocusEra(key) {
  focusEra = focusEra === key ? null : key;
  buildCols();
  syncLegend();
  if (focusEra) {
    const first = document.querySelector(".bar");
    if (first) chartWrap.scrollTop = Math.max(0, parseFloat(first.style.top) - 24);
  }
}
function syncLegend() {
  document.querySelectorAll("#legend .item").forEach((el) => {
    const on = el.dataset.era === focusEra;
    el.classList.toggle("on", on);
    el.classList.toggle("off", focusEra !== null && !on);
    el.setAttribute("aria-pressed", on ? "true" : "false");
  });
}

function renderAll() { buildGrid(); buildCols(); buildEvents(); syncRail(); }

// The events sidebar is a flex column beside the scroller. It doesn't move
// horizontally; we only translate its inner layer by -scrollTop so it tracks the
// timeline's vertical scroll.
const chartWrap = document.getElementById("chart-wrap");
function syncRail() {
  const ev = document.getElementById("events");
  if (!ev || ev.style.display === "none") return;
  const einner = ev.querySelector(".einner");
  if (einner) einner.style.transform = `translateY(${-chartWrap.scrollTop}px)`;
  positionHL();
}
chartWrap.addEventListener("scroll", syncRail, { passive: true });
window.addEventListener("resize", syncRail);

// ---------- correlation line (fixed across the chart, follows vertical scroll) ----------
const ehl = document.createElement("div");
ehl.className = "ehl";
document.body.appendChild(ehl);
let hlY = null, hlColor = null;       // hlY is in canvas coords (same as y())
function positionHL() {
  if (hlY === null) return;
  const r = chartWrap.getBoundingClientRect();
  ehl.style.top = (r.top + hlY - chartWrap.scrollTop) + "px";
  ehl.style.left = r.left + "px";     // span only the chart, not the sidebar
  ehl.style.width = r.width + "px";
}
function showHL(canvasY, color) {
  hlY = canvasY; hlColor = color;
  ehl.style.borderTopColor = color;
  positionHL();
  ehl.classList.add("show");
}
function hideHL() { hlY = null; ehl.classList.remove("show"); }

// ---------- resizable events sidebar ----------
function startGutterResize(e) {
  e.preventDefault();
  const layer = document.getElementById("events");
  layer.classList.add("resizing");
  document.body.classList.add("col-resizing");
  hideHL(); hideTip();
  const rect = layer.getBoundingClientRect();
  let raf = 0;
  const onMove = (ev) => {
    // inner (chart-facing) edge is the rail's right edge in RTL, left edge in LTR
    const raw = isRTL() ? ev.clientX - rect.left : rect.right - ev.clientX;
    const w = Math.min(GUTTER_MAX, Math.max(GUTTER_MIN, raw));
    if (w === EVT_GUTTER) return;
    EVT_GUTTER = w;
    document.documentElement.style.setProperty("--evt-gutter", w + "px");
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; buildEvents(); syncRail(); });
  };
  const onUp = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    layer.classList.remove("resizing");
    document.body.classList.remove("col-resizing");
    localStorage.setItem("evtGutter", EVT_GUTTER);
    renderAll();
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

// ---------- events ----------
document.getElementById("btn-heb").addEventListener("click", () => setMode("heb"));
document.getElementById("btn-sec").addEventListener("click", () => setMode("sec"));
document.getElementById("btn-lang-he").addEventListener("click", () => setLang("he"));
document.getElementById("btn-lang-en").addEventListener("click", () => setLang("en"));
document.getElementById("show-events").addEventListener("change", renderAll);
document.getElementById("region-reset").addEventListener("click", clearRegions);
document.getElementById("map-toggle").addEventListener("click", () =>
  document.getElementById("map-panel").classList.toggle("collapsed"));
// ---- free-resizable map: drag the corner grip to any size; the enlarge button is a
// quick default↔2x preset. Width is persisted; the SVG (width:100%) scales to fit.
(function makeMapResizable() {
  const panel = document.getElementById("map-panel");
  if (!panel) return;
  const DEFW = 260, MINW = 190;
  const maxW = () => Math.min(window.innerWidth * 0.94, 760);

  function setWidth(w) {
    w = Math.max(MINW, Math.min(maxW(), w));
    panel.style.width = w + "px";
    try { localStorage.setItem("mapWidth", String(Math.round(w))); } catch (_) {}
    return w;
  }

  // restore a remembered width (skip on mobile, where the map starts collapsed)
  if (!isMobile) try {
    const saved = parseFloat(localStorage.getItem("mapWidth"));
    if (saved) setWidth(saved);
  } catch (_) {}

  if (isMobile) return;                          // no edge-resize on touch layouts
  const grip = document.createElement("div");    // bottom-corner affordance only
  grip.className = "map-resize";
  grip.title = "גרור משולי המסגרת לשינוי גודל המפה";
  panel.appendChild(grip);

  // Resize by dragging anywhere on the panel's frame: grab within EDGE px of the
  // left/right/bottom border and drag. The left edge anchors the right side (grows
  // leftward); the right/bottom edges anchor the left side. Width drives everything
  // (the SVG is width:100%), so vertical drags just track the corner.
  const EDGE = 8;
  function zone(e) {
    if (e.target.closest(".map-toggle")) return null; // let header buttons work
    const r = panel.getBoundingClientRect();
    const nearL = e.clientX <= r.left + EDGE, nearR = e.clientX >= r.right - EDGE;
    const nearB = e.clientY >= r.bottom - EDGE;
    // cursor: vertical on the bottom edge, diagonal on the bottom corners, else horizontal
    if (nearL && !nearR) return { dir: "left", cursor: nearB ? "nesw-resize" : "ew-resize", r };
    if (nearR) return { dir: "right", cursor: nearB ? "nwse-resize" : "ew-resize", r };
    if (nearB) return { dir: "bottom", cursor: "ns-resize", r };
    return null;
  }
  // The map's aspect ratio is locked (svg width:100%, height:auto), so the bottom edge
  // resizes vertically: map a desired panel height to the width that yields it.
  const svg = panel.querySelector("#map-svg");
  function widthForHeight(h) {
    const sr = svg.getBoundingClientRect(), pr = panel.getBoundingClientRect();
    const ratio = sr.width / sr.height;          // svg aspect (≈285/252)
    const chromeH = pr.height - sr.height;        // header + hint + paddings
    const chromeW = pr.width - sr.width;          // horizontal paddings
    return (h - chromeH) * ratio + chromeW;
  }

  // hover affordance: show the matching resize cursor over the frame
  panel.addEventListener("pointermove", e => {
    if (resizing) return;
    const z = zone(e);
    panel.style.cursor = z ? z.cursor : "";
  });
  panel.addEventListener("pointerleave", () => { if (!resizing) panel.style.cursor = ""; });

  let resizing = false, anchorDir = "right", left0 = 0, right0 = 0, top0 = 0;
  panel.addEventListener("pointerdown", e => {
    const z = zone(e);
    if (!z) return;                              // interior → let header drag etc. run
    const r = z.r;
    panel.style.left = r.left + "px"; panel.style.top = r.top + "px";
    panel.style.right = "auto"; panel.style.bottom = "auto";
    left0 = r.left; right0 = r.right; top0 = r.top; anchorDir = z.dir; resizing = true;
    panel.setPointerCapture(e.pointerId);
    e.preventDefault(); e.stopPropagation();     // capture phase: beat the header drag
  }, true);
  panel.addEventListener("pointermove", e => {
    if (!resizing) return;
    if (anchorDir === "left") {                  // grow leftward, keep right edge put
      const w = setWidth(right0 - e.clientX);
      panel.style.left = (right0 - w) + "px";
    } else if (anchorDir === "bottom") {         // grow downward, keep top edge put
      setWidth(widthForHeight(e.clientY - top0));
    } else {
      setWidth(e.clientX - left0);
    }
  });
  function end(e) {
    if (!resizing) return;
    resizing = false; panel.style.cursor = "";
    try { panel.releasePointerCapture(e.pointerId); } catch (_) {}
    try {                                        // persist the (possibly shifted) position
      const r = panel.getBoundingClientRect();
      localStorage.setItem("mapPos", JSON.stringify({ left: r.left, top: r.top }));
    } catch (_) {}
  }
  panel.addEventListener("pointerup", end);
  panel.addEventListener("pointercancel", end);
})();

// ---- dismissible data-quality warning (remembers the dismissal) ----
(function initDataWarning() {
  const banner = document.getElementById("data-warning");
  if (!banner) return;
  try { if (localStorage.getItem("dataWarnDismissed") === "1") banner.hidden = true; } catch (_) {}
  document.getElementById("dw-close").addEventListener("click", () => {
    banner.hidden = true;
    try { localStorage.setItem("dataWarnDismissed", "1"); } catch (_) {}
  });
})();

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
    return { left, top };
  }

  // restore a remembered position (desktop only; clamped on next move/resize)
  if (!isMobile) try {
    const saved = JSON.parse(localStorage.getItem("mapPos") || "null");
    if (saved && typeof saved.left === "number" && typeof saved.top === "number")
      place(saved.left, saved.top);
  } catch (_) {}

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
    if (moved) try {
      const r = panel.getBoundingClientRect();
      localStorage.setItem("mapPos", JSON.stringify({ left: r.left, top: r.top }));
    } catch (_) {}
  }
  head.addEventListener("pointerup", endDrag);
  head.addEventListener("pointercancel", endDrag);
})();

function syncYearButtons() {
  document.getElementById("btn-heb").classList.toggle("active", mode === "heb");
  document.getElementById("btn-sec").classList.toggle("active", mode === "sec");
}
function setMode(m) {
  mode = m;
  localStorage.setItem("yearMode", m); // remember the explicit choice
  syncYearButtons();
  renderAll();
}

// ---------- UI language ----------
function setText(id, str) { const el = document.getElementById(id); if (el) el.textContent = str; }
function setTitle(id, str) { const el = document.getElementById(id); if (el) el.title = str; }

function applyLang() {
  const html = document.documentElement;
  html.lang = lang;
  html.dir = isRTL() ? "rtl" : "ltr";
  document.title = t("title");

  setText("app-title", t("h1"));
  setText("app-subtitle", t("subtitle"));
  setText("btn-heb", t("yearHeb"));
  setText("btn-sec", t("yearSec"));
  setText("evt-label", t("events"));
  setText("hint", t("hint"));
  setText("map-title", t("mapTitle"));
  setText("map-hint", t("mapHint"));
  setText("dw-text", t("warn"));
  setTitle("map-toggle", t("mapToggle"));
  setTitle("d-mobile", t("dMobile"));
  setTitle("d-open", t("dOpen"));
  setTitle("d-close", t("dClose"));
  setText("about-btn", t("aboutBtn"));
  setText("legend-cap", t("legendCap"));
  const sb = document.getElementById("search");
  if (sb) { sb.placeholder = t("search"); sb.setAttribute("aria-label", t("search")); }
  setText("about-title", t("aboutTitle"));
  setTitle("about-close", t("aboutClose"));
  const acl = document.getElementById("about-close"); if (acl) acl.setAttribute("aria-label", t("aboutClose"));
  const abody = document.getElementById("about-body"); if (abody) abody.innerHTML = t("aboutBody");

  const lg = document.getElementById("lang-group"); if (lg) lg.setAttribute("aria-label", t("langGroup"));
  const yg = document.getElementById("year-group"); if (yg) yg.setAttribute("aria-label", t("yearGroup"));
  const dw = document.getElementById("dw-close"); if (dw) dw.setAttribute("aria-label", t("warnClose"));

  document.getElementById("btn-lang-he").classList.toggle("active", isRTL());
  document.getElementById("btn-lang-en").classList.toggle("active", !isRTL());

  buildLegend();
  buildMap();
  repaintBorders();   // resting/active border labels follow the UI language
  renderAll();
}

function setLang(l) {
  if (l === lang) return;
  lang = l;
  localStorage.setItem("lang", l);
  // follow the new language's year default, unless the user chose one explicitly
  if (!localStorage.getItem("yearMode")) {
    mode = isRTL() ? "heb" : "sec";
    syncYearButtons();
  }
  applyLang();
}

// on phones the map and events rail would crowd the timeline; start them out of
// the way — map collapsed (header only) and the events rail off by default.
if (isMobile) {
  document.getElementById("map-panel").classList.add("collapsed");
  document.getElementById("show-events").checked = false;
}
// (desktop map width is restored by makeMapResizable from the saved mapWidth)

// `mode` is already resolved (saved choice, else language default); reflect it
syncYearButtons();
applyLang();   // sets dir/lang, translates the chrome, and renders everything
