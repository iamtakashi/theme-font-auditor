# Theme Font Auditor

A single-file browser tool for catching the kinds of font problems that bite WordPress themes: fonts that *claim* coverage they don't actually deliver, missing punctuation that `wptexturize()` will synthesize anyway, and patchy diacritic support for the languages your theme is supposed to serve.

Drop a `.ttf`, `.otf`, or `.woff` file in. Get a visual preview and a checklist of findings.

## Why this exists

A font's `cmap` table can claim to support a codepoint while the actual glyph outline is empty. Browsers reserve the advance width and draw nothing — and CSS fallback won't kick in, because the font *says* it has the glyph. Result: blank gaps in customer content where apostrophes, accents, or curly quotes should be.

CSS fallback only triggers when a font says "I don't have this codepoint." A font that lies in `cmap` defeats the entire fallback mechanism. The only reliable test is to render real text and look at the result.

## Usage

1. Open `font-audit.html` in any modern browser (double-click or `open font-audit.html`).
2. Drop a font file onto the page, or click to pick one.
3. Read the report.

No server, no install. Works offline once `opentype.js` is in the browser cache.

## What it checks

- **Empty cmap-claimed glyphs.** Walks the font's `cmap` and reports every codepoint that's claimed but has no outline. The big one.
- **`wptexturize()` codepoints.** Explicitly tests U+2018 / U+2019 / U+201C / U+201D / U+2013 / U+2014 / U+2026. WordPress synthesizes these from ASCII on every front-end render, so missing any one of them breaks customer content even when the customer never typed the character.
- **Diacritic coverage by language group.** Samples representative codepoints for Western European, Polish, Czech / Slovak, Hungarian, Romanian, Turkish, Scandinavian, basic Cyrillic, and basic Greek. Reports partial vs. fully missing per group.
- **Glyph integrity ratio.** Total glyphs vs. glyphs with outlines vs. cmap-claimed-but-empty. A font claiming hundreds of codepoints with only a handful actually drawn is a strong smell.
- **Kerning data.** Flags absence of `GPOS` and `kern` tables.
- **License metadata.** Pulls the embedded license string from the `name` table and reminds you to confirm modification rights.

## Visual preview

Five test lines, rendered in the loaded font with a serif fallback, plus a per-character coverage strip under each line:

- 🟢 green — character has an outline
- 🔴 red — character is claimed by `cmap` but renders empty (the trap)
- 🟡 yellow — character isn't in the font and will fall back

Hover any tile to see its codepoint.

## Limitations

- **WOFF2 isn't supported.** The in-browser parser can't decompress WOFF2. Convert to TTF or OTF first (e.g. with `woff2_decompress` from [google/woff2](https://github.com/google/woff2), or any online converter).
- **BMP only** (codepoints U+0000–U+FFFF). Supplementary planes aren't scanned — fine for theme font auditing, not for emoji-only fonts.
- **`opentype.js` loads from jsDelivr** on first open. Cached afterward.

## Credits

Built with [opentype.js](https://github.com/opentypejs/opentype.js).
