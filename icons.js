// ---------- inline icon set ----------
// Vendored line icons from Lucide (https://lucide.dev, ISC license) plus one
// custom glyph (star-of-david) for the Jewish-history marker, which Lucide has
// no equivalent for. No build step, no CDN: each icon is a raw 24×24 SVG body
// rendered with currentColor so it inherits the surrounding text color/size.
//
// Usage:
//   icon("x")                    → SVG string, drop into any innerHTML
//   <button data-icon="x">       → filled in on load by fillStaticIcons()
// Sizing is em-based (.ic { width:1em; height:1em }) so an icon picks up the
// font-size of whatever context it lands in — matching the glyphs it replaced.

const ICONS = {
  // status / structure
  "alert-triangle": '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  "x": '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  // links / devices
  "arrow-up-right": '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  "arrow-left": '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  "smartphone": '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  // content markers
  "book-open": '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  "map-pin": '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  // pushpin: toggle to keep a sage's location/borders on the map
  "pin": '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
  // custom: two overlapping equilateral triangles → Star of David (filled)
  "star-of-david": '<path d="M12 2.5 3.8 16.75 20.2 16.75Z"/><path d="M12 21.5 20.2 7.25 3.8 7.25Z"/>',
};

// icons drawn as a solid shape rather than a stroked outline
const ICONS_FILLED = new Set(["star-of-david"]);

// Build an <svg> string for `name`. `cls` adds extra classes onto the base `ic`.
function icon(name, cls) {
  const body = ICONS[name];
  if (!body) return "";
  const paint = ICONS_FILLED.has(name)
    ? 'fill="currentColor" stroke="none"'
    : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  return `<svg class="ic${cls ? " " + cls : ""}" viewBox="0 0 24 24" ${paint} aria-hidden="true">${body}</svg>`;
}

// Replace any element carrying data-icon="<name>" with its SVG (optional
// data-icon-cls for extra classes). Runs once at load for static markup; the
// dynamic renderers in app.js call icon() directly.
function fillStaticIcons(root) {
  (root || document).querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML = icon(el.getAttribute("data-icon"), el.getAttribute("data-icon-cls"));
  });
}

window.icon = icon;
window.fillStaticIcons = fillStaticIcons;
fillStaticIcons();
