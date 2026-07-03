# Theme Font Auditor

A single-file browser tool for catching the kinds of font problems that bite WordPress themes: fonts that *claim* coverage they don't actually deliver, missing punctuation that `wptexturize()` will synthesize anyway, and patchy diacritic support for the languages your theme is supposed to serve.

Drop a `.ttf`, `.otf`, `.woff`, or `.woff2` file in. Get a visual preview and a checklist of findings.

## Why this exists

A font's `cmap` table can claim to support a codepoint while the actual glyph outline is empty. Browsers reserve the advance width and draw nothing — and CSS fallback won't kick in, because the font *says* it has the glyph. Result: blank gaps in customer content where apostrophes, accents, or curly quotes should be.

CSS fallback only triggers when a font says "I don't have this codepoint." A font that lies in `cmap` defeats the entire fallback mechanism. The only reliable test is to render real text and look at the result.

## Usage

1. Open `index.html` in any modern browser (double-click or `open index.html`).
2. Drop a font file onto the page, or click to pick one.
3. Read the report.

No server, no install. Works offline once the upstream libraries are in the browser cache.

## What it checks

- **Empty cmap-claimed glyphs.** Walks the font's `cmap` and reports every codepoint that's claimed but has no outline. The big one.
- **Degenerate outlines.** A glyph can have outline data and still be broken — a corrupted outline reduced to a stray fragment a fraction of the character's proper size. For every claimed letter and decimal digit, the ink bounding box is compared against the em size and advance width; glyphs whose drawing is implausibly small are flagged (critical if ASCII letters or digits are affected, since dates, prices, and phone numbers hit those constantly). Punctuation, combining marks, and modifier letters are exempt — they're legitimately small.
- **`wptexturize()` codepoints.** Explicitly tests U+2018 / U+2019 / U+201C / U+201D / U+2013 / U+2014 / U+2026. WordPress synthesizes these from ASCII on every front-end render, so missing any one of them breaks customer content even when the customer never typed the character.
- **Diacritic coverage by language group.** Samples representative codepoints for Western European, Polish, Czech / Slovak, Hungarian, Romanian, Turkish, Scandinavian, basic Cyrillic, and basic Greek. Reports partial vs. fully missing per group.
- **Glyph integrity ratio.** Total glyphs vs. glyphs with outlines vs. cmap-claimed-but-empty. A font claiming hundreds of codepoints with only a handful actually drawn is a strong smell.
- **Kerning data.** Flags absence of `GPOS` and `kern` tables.
- **License metadata.** Pulls the embedded license string from the `name` table and reminds you to confirm modification rights.

## Visual preview

Five baked-in test lines (smart quotes & contractions, Western European diacritics, Central / Eastern European diacritics, punctuation & symbols, numerals & ASCII Latin) plus a sixth **custom-text** field where you can type or paste your own content. Each line is rendered in the loaded font with a serif fallback, and a per-character coverage strip beneath color-codes every character:

- 🟢 green — character has an outline
- 🔴 red — character is claimed by `cmap` but renders empty (the trap)
- 🟠 orange — character has an outline but it's degenerate (renders as a speck)
- 🟡 yellow — character isn't in the font and will fall back

Hover any tile for its codepoint. The custom-text input persists in `localStorage`, so the same test string carries across font reloads — useful when comparing candidate fonts against a single piece of client copy.

## Coverage by Unicode block

A heatmap of the 34 theme-relevant Unicode blocks the font touches — Latin variants, IPA, combining marks, Greek, Cyrillic, Armenian, Hebrew, Arabic, Devanagari, Bengali, Thai, Latin Extended Additional (where Vietnamese lives), Greek Extended, punctuation, currency, symbols, CJK ideographs, hiragana, katakana, hangul, and others.

Each block the font covers becomes a tile colored by coverage percentage (90%+ full, 50–89% most, 10–49% partial, under 10% sparse). Tiles are grouped by tier so strengths surface first, with Unicode order preserved inside each tier to keep related scripts clustered. Blocks with fewer than three outlined glyphs are filtered out to suppress accidental single-codepoint hits.

The heatmap answers the question a designer is usually actually asking: *what is this font good at, and where does it stop?*

## Limitations

- **BMP only** (codepoints U+0000–U+FFFF). Supplementary planes aren't scanned — fine for theme font auditing, not for emoji-only fonts.
- **Upstream libraries load from jsDelivr** on first open: `opentype.js` for parsing, and `wawoff2` (a WASM Brotli decoder) lazily when a WOFF2 file is dropped. Both cache after the first load.

## Credits

Built with [opentype.js](https://github.com/opentypejs/opentype.js) and [wawoff2](https://github.com/fontello/wawoff2).

## License

GPL v2 or later — same license as WordPress, so this tool is safe to use, modify, and redistribute inside the WordPress ecosystem. See [`LICENSE`](./LICENSE) for the full text.

Bundled dependencies remain under their own licenses (opentype.js: MIT, wawoff2: MIT), both of which are GPL-compatible.
