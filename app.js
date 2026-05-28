"use strict";

const PREVIEW_LINES = [
  { label: "Smart quotes & contractions (wptexturize)",
    text: '“Hello,” she said. It’s Mary’s book — don’t lose it…' },
  { label: "Western European diacritics",
    text: 'Über uns. café, naïve, façade, jalapeño, smörgåsbord.' },
  { label: "Central / Eastern European diacritics",
    text: 'Łódź, Praha, Kraków, Bucureşti, İstanbul, Reykjavík.' },
  { label: "Punctuation & symbols",
    text: 'em — dash, en – dash, ellipsis… © ® ™ ¶ § † ‡ ↗' },
  { label: "Numerals & ASCII Latin",
    text: 'The quick brown fox jumps over the lazy dog. 0123456789 !?@#$%&*()[]{}' },
];

const WPTEXTURIZE_CODEPOINTS = [
  { cp: 0x2018, name: "U+2018 LEFT SINGLE QUOTATION MARK",   from: "wptexturize converts opening '" },
  { cp: 0x2019, name: "U+2019 RIGHT SINGLE QUOTATION MARK",  from: "wptexturize converts apostrophe ' — every contraction hits this" },
  { cp: 0x201C, name: "U+201C LEFT DOUBLE QUOTATION MARK",   from: 'wptexturize converts opening "' },
  { cp: 0x201D, name: "U+201D RIGHT DOUBLE QUOTATION MARK",  from: 'wptexturize converts closing "' },
  { cp: 0x2013, name: "U+2013 EN DASH",                       from: "wptexturize converts --" },
  { cp: 0x2014, name: "U+2014 EM DASH",                       from: "wptexturize converts ---" },
  { cp: 0x2026, name: "U+2026 HORIZONTAL ELLIPSIS",           from: "wptexturize converts ..." },
];

const COMMON_DIACRITICS = {
  "Western European (DE/FR/ES/IT/PT)":
    [0xC4, 0xD6, 0xDC, 0xDF, 0xE4, 0xF6, 0xFC, 0xC9, 0xE9, 0xE8, 0xEA, 0xEB, 0xF1, 0xE7, 0xE0, 0xE1],
  "Polish":
    [0x0104, 0x0105, 0x0118, 0x0119, 0x0141, 0x0142, 0x015A, 0x015B, 0x0179, 0x017A, 0x017B, 0x017C, 0x0143, 0x0144, 0x00D3, 0x00F3],
  "Czech / Slovak":
    [0x010C, 0x010D, 0x010E, 0x010F, 0x011A, 0x011B, 0x0147, 0x0148, 0x0158, 0x0159, 0x0160, 0x0161, 0x0164, 0x0165, 0x017D, 0x017E, 0x016E, 0x016F],
  "Hungarian":
    [0x0150, 0x0151, 0x0170, 0x0171, 0x00D6, 0x00F6, 0x00DC, 0x00FC],
  "Romanian":
    [0x0218, 0x0219, 0x021A, 0x021B, 0x0102, 0x0103, 0x00C2, 0x00E2, 0x00CE, 0x00EE],
  "Turkish":
    [0x0130, 0x0131, 0x015E, 0x015F, 0x011E, 0x011F, 0x00D6, 0x00F6, 0x00DC, 0x00FC],
  "Scandinavian (DA/NO/SV/IS)":
    [0x00C5, 0x00E5, 0x00C6, 0x00E6, 0x00D8, 0x00F8, 0x00D0, 0x00F0, 0x00DE, 0x00FE],
  "Cyrillic (basic, RU/UA/BG)":
    [0x0410, 0x0411, 0x0412, 0x0413, 0x0414, 0x0415, 0x0416, 0x0417, 0x0418, 0x041A, 0x041B,
     0x0430, 0x0431, 0x0432, 0x0433, 0x0434, 0x0435, 0x0436, 0x0437, 0x0438, 0x043A, 0x043B],
  "Greek (basic)":
    [0x0391, 0x0392, 0x0393, 0x0394, 0x0395, 0x0396,
     0x03B1, 0x03B2, 0x03B3, 0x03B4, 0x03B5, 0x03B6],
};

const UNICODE_BLOCKS = [
  { name: "Basic Latin",                  start: 0x0020, end: 0x007E },
  { name: "Latin-1 Supplement",           start: 0x00A0, end: 0x00FF },
  { name: "Latin Extended-A",             start: 0x0100, end: 0x017F },
  { name: "Latin Extended-B",             start: 0x0180, end: 0x024F },
  { name: "IPA Extensions",               start: 0x0250, end: 0x02AF },
  { name: "Spacing Modifier Letters",     start: 0x02B0, end: 0x02FF },
  { name: "Combining Diacritical Marks",  start: 0x0300, end: 0x036F },
  { name: "Greek and Coptic",             start: 0x0370, end: 0x03FF },
  { name: "Cyrillic",                     start: 0x0400, end: 0x04FF },
  { name: "Cyrillic Supplement",          start: 0x0500, end: 0x052F },
  { name: "Armenian",                     start: 0x0530, end: 0x058F },
  { name: "Hebrew",                       start: 0x0590, end: 0x05FF },
  { name: "Arabic",                       start: 0x0600, end: 0x06FF },
  { name: "Devanagari",                   start: 0x0900, end: 0x097F },
  { name: "Bengali",                      start: 0x0980, end: 0x09FF },
  { name: "Thai",                         start: 0x0E00, end: 0x0E7F },
  { name: "Latin Extended Additional",    start: 0x1E00, end: 0x1EFF },
  { name: "Greek Extended",               start: 0x1F00, end: 0x1FFF },
  { name: "General Punctuation",          start: 0x2000, end: 0x206F },
  { name: "Superscripts and Subscripts",  start: 0x2070, end: 0x209F },
  { name: "Currency Symbols",             start: 0x20A0, end: 0x20CF },
  { name: "Letterlike Symbols",           start: 0x2100, end: 0x214F },
  { name: "Number Forms",                 start: 0x2150, end: 0x218F },
  { name: "Arrows",                       start: 0x2190, end: 0x21FF },
  { name: "Mathematical Operators",       start: 0x2200, end: 0x22FF },
  { name: "Box Drawing",                  start: 0x2500, end: 0x257F },
  { name: "Geometric Shapes",             start: 0x25A0, end: 0x25FF },
  { name: "Miscellaneous Symbols",        start: 0x2600, end: 0x26FF },
  { name: "Dingbats",                     start: 0x2700, end: 0x27BF },
  { name: "CJK Symbols and Punctuation",  start: 0x3000, end: 0x303F },
  { name: "Hiragana",                     start: 0x3040, end: 0x309F },
  { name: "Katakana",                     start: 0x30A0, end: 0x30FF },
  { name: "Hangul Syllables",             start: 0xAC00, end: 0xD7AF },
  { name: "CJK Unified Ideographs",       start: 0x4E00, end: 0x9FFF },
];

const INTENTIONALLY_EMPTY = new Set([
  0x09, 0x0A, 0x0D,
  0x20, 0xA0, 0xAD,
  0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007,
  0x2008, 0x2009, 0x200A,
  0x200B, 0x200C, 0x200D, 0x200E, 0x200F,
  0x2028, 0x2029,
  0x202A, 0x202B, 0x202C, 0x202D, 0x202E,
  0x202F, 0x205F, 0x2060,
  0xFEFF, 0x3000,
]);

let currentFontFace = null;
const drop = document.getElementById('drop');
const fileInput = drop.querySelector('input');
const report = document.getElementById('report');
const errBox = document.getElementById('error');

drop.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
});
['dragenter', 'dragover'].forEach(ev => {
  drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); });
});
['dragleave', 'drop'].forEach(ev => {
  drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); });
});
drop.addEventListener('drop', (e) => {
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});
document.querySelector('button.reset').addEventListener('click', reset);

let woff2DecoderPromise = null;
function loadWoff2Decoder() {
  if (!woff2DecoderPromise) {
    woff2DecoderPromise = import('https://esm.sh/wawoff2@2.0.1');
  }
  return woff2DecoderPromise;
}

async function handleFile(file) {
  errBox.hidden = true;
  let bytes = await file.arrayBuffer();

  const fmt = detectFormat(bytes);
  if (fmt === 'WOFF2') {
    const bigLabel = drop.querySelector('.big');
    const originalLabel = bigLabel.textContent;
    bigLabel.textContent = 'Decompressing WOFF2…';
    try {
      const mod = await loadWoff2Decoder();
      const decompress = mod.decompress || (mod.default && mod.default.decompress);
      if (!decompress) throw new Error('wawoff2 decompress function not found in module');
      const decompressed = await decompress(new Uint8Array(bytes));
      bytes = decompressed.buffer.slice(
        decompressed.byteOffset,
        decompressed.byteOffset + decompressed.byteLength
      );
    } catch (err) {
      bigLabel.textContent = originalLabel;
      showError('Failed to decompress WOFF2: ' + escapeHtml(err.message || String(err)));
      return;
    }
    bigLabel.textContent = originalLabel;
  }

  let font;
  try {
    font = opentype.parse(bytes);
  } catch (err) {
    showError('Could not parse font: ' + escapeHtml(err.message || String(err)));
    return;
  }

  if (currentFontFace) {
    document.fonts.delete(currentFontFace);
    currentFontFace = null;
  }
  try {
    const ff = new FontFace('audit-font', bytes);
    await ff.load();
    document.fonts.add(ff);
    currentFontFace = ff;
  } catch (err) {
    showError('Font parsed but failed to load for rendering: ' + escapeHtml(err.message || String(err)));
    return;
  }

  audit(font, file, bytes);
}

function audit(font, file, bytes) {
  drop.hidden = true;
  report.hidden = false;

  const fontName = font.names.fullName && font.names.fullName.en
    ? font.names.fullName.en
    : (font.names.fontFamily && font.names.fontFamily.en ? font.names.fontFamily.en : file.name);
  document.getElementById('font-name').textContent = fontName;

  const format = detectFormat(bytes);
  const sizeKB = (file.size / 1024).toFixed(1);
  document.getElementById('font-meta-line').textContent =
    `${format} · ${sizeKB} KB · ${font.glyphs.length} glyphs`;

  const legend = `<div class="cov-legend">
    <span class="cov-legend-item"><span class="cov-swatch ok"></span>has outline</span>
    <span class="cov-legend-item"><span class="cov-swatch empty"></span>claimed by cmap but empty (the bug)</span>
    <span class="cov-legend-item"><span class="cov-swatch missing"></span>not in font — falls back</span>
  </div>`;
  const customText = localStorage.getItem('font-audit-custom-text') || '';
  const customLine = `<div class="preview-line custom">
       <span class="label">Your own text</span>
       <input class="custom-input" type="text" autocomplete="off" spellcheck="false"
              placeholder="Type or paste here to test specific characters…"
              value="${escapeHtml(customText)}">
       <div class="coverage" id="custom-coverage">${customText ? buildCoverageStrip(font, customText) : ''}</div>
     </div>`;
  document.getElementById('preview').innerHTML = legend + PREVIEW_LINES.map(line =>
    `<div class="preview-line">
       <span class="label">${escapeHtml(line.label)}</span>
       <div class="text">${escapeHtml(line.text)}</div>
       <div class="coverage">${buildCoverageStrip(font, line.text)}</div>
     </div>`
  ).join('') + customLine;

  const customInput = document.querySelector('.custom-input');
  const customCov = document.getElementById('custom-coverage');
  customInput.addEventListener('input', () => {
    const val = customInput.value;
    localStorage.setItem('font-audit-custom-text', val);
    customCov.innerHTML = val ? buildCoverageStrip(font, val) : '';
  });

  const issues = [];

  const emptyClaimed = findEmptyClaimedGlyphs(font);
  if (emptyClaimed.length > 0) {
    const wpHit = emptyClaimed.filter(g => WPTEXTURIZE_CODEPOINTS.some(w => w.cp === g.cp));
    issues.push({
      level: wpHit.length > 0 ? 'critical' : 'warning',
      title: `${emptyClaimed.length} codepoint${emptyClaimed.length === 1 ? '' : 's'} claimed by cmap but rendered as empty glyph${emptyClaimed.length === 1 ? '' : 's'}`,
      detail: `The font’s <code>cmap</code> table advertises these codepoints, but the glyph data is empty. Browsers reserve advance width and draw nothing — and CSS fallback won’t kick in because the font claims the glyph exists.` +
        (wpHit.length > 0
          ? ` <span style="color:var(--critical)"><strong>${wpHit.length} of these are wptexturize codepoints — WordPress will synthesize them from ASCII customer content, so the bug will hit posts even if the customer never typed those characters.</strong></span>`
          : ''),
      list: formatCodepointList(emptyClaimed, 80),
    });
  }

  const wptexMissing = WPTEXTURIZE_CODEPOINTS.filter(w => !hasUsableGlyph(font, w.cp));
  if (wptexMissing.length > 0) {
    issues.push({
      level: 'critical',
      title: `Missing or empty glyph${wptexMissing.length === 1 ? '' : 's'} for ${wptexMissing.length} wptexturize codepoint${wptexMissing.length === 1 ? '' : 's'}`,
      detail: `WordPress’s <code>wptexturize()</code> rewrites ASCII punctuation to typographic punctuation on every front-end render. Any missing entry here means customer content with apostrophes, smart quotes, dashes, or ellipses will break.`,
      list: wptexMissing.map(w => `${w.name} — ${w.from}`).join('<br>'),
    });
  }

  const missingByLocale = {};
  for (const [locale, cps] of Object.entries(COMMON_DIACRITICS)) {
    const missing = cps.filter(cp => !hasUsableGlyph(font, cp));
    if (missing.length > 0) missingByLocale[locale] = { total: cps.length, missing };
  }
  const partial = Object.entries(missingByLocale).filter(([, v]) => v.missing.length < v.total);
  const none = Object.entries(missingByLocale).filter(([, v]) => v.missing.length === v.total);
  if (partial.length > 0) {
    issues.push({
      level: 'warning',
      title: `Partial diacritic coverage in ${partial.length} language group${partial.length === 1 ? '' : 's'}`,
      detail: `The font covers <em>some</em> diacritics for these languages but not all. Customer content in these languages will mix the bundled font with system fallback letter-by-letter — usually visually jarring.`,
      list: partial.map(([loc, v]) => `${loc}: missing ${v.missing.length} of ${v.total} sampled glyphs`).join('<br>'),
    });
  }
  if (none.length > 0) {
    issues.push({
      level: 'info',
      title: `No coverage for ${none.length} language group${none.length === 1 ? '' : 's'}`,
      detail: `These languages render entirely in the fallback font. Acceptable if the theme isn’t targeting those audiences, but worth knowing.`,
      list: none.map(([loc]) => loc).join(' · '),
    });
  }

  const cmapClaimed = countCmapClaimed(font);
  if (cmapClaimed > 0) {
    const ratio = emptyClaimed.length / cmapClaimed;
    if (ratio > 0.3) {
      issues.push({
        level: 'critical',
        title: `${Math.round(ratio * 100)}% of cmap-claimed codepoints are empty glyphs`,
        detail: `The font claims ${cmapClaimed} codepoints but ${emptyClaimed.length} of them are unrenderable. Strong signal the font is fundamentally incomplete — its specimen sheet probably only shows the working glyphs. Treat with extreme caution.`,
      });
    }
  }

  const tables = Object.keys(font.tables || {});
  if (!tables.includes('kern') && !tables.includes('gpos')) {
    issues.push({
      level: 'warning',
      title: 'No kerning data (no GPOS or kern table)',
      detail: 'Text renders with default advance widths only. Body text may look loose; headlines may look uneven — noticeable at large display sizes.',
    });
  }

  const license = (font.names.license && font.names.license.en) || '';
  const licenseURL = (font.names.licenseURL && font.names.licenseURL.en) || '';
  if (license || licenseURL) {
    issues.push({
      level: 'info',
      title: 'License metadata in font file',
      detail: (license ? escapeHtml(license) : '') +
        (licenseURL ? `<br><a href="${escapeHtml(licenseURL)}" target="_blank" rel="noopener">${escapeHtml(licenseURL)}</a>` : '') +
        '<br><em style="font-size:13px">Confirm the license permits both redistribution <strong>and</strong> modification before bundling — the Elite Math New patch was only possible because GPL-3.0 allows modification.</em>',
    });
  } else {
    issues.push({
      level: 'warning',
      title: 'No license metadata embedded in font',
      detail: 'The font file doesn’t declare a license in its <code>name</code> table. Track down the upstream license separately before bundling — you need redistribution rights and, ideally, modification rights.',
    });
  }

  const critical = issues.filter(i => i.level === 'critical').length;
  const warning = issues.filter(i => i.level === 'warning').length;
  const info = issues.filter(i => i.level === 'info').length;
  if (critical === 0 && warning === 0) {
    issues.unshift({
      level: 'ok',
      title: 'No critical or warning issues detected',
      detail: 'No empty cmap-claimed glyphs, full wptexturize coverage, and at least partial diacritic coverage for the sampled languages. Still eyeball the rendered preview above for hinting, kerning, and weight quirks.',
    });
  }

  document.getElementById('findings-summary').innerHTML =
    `<span class="badge critical">${critical} critical</span>` +
    `<span class="badge warning">${warning} warning</span>` +
    `<span class="badge info">${info} info</span>`;

  const LEVEL_ORDER = { ok: 0, critical: 1, warning: 2, info: 3 };
  issues.sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
  document.getElementById('issues').innerHTML = issues.map(renderIssue).join('');

  const outlined = countOutlinedGlyphs(font);
  const meta = {
    'File name': file.name,
    'Format': format,
    'File size': sizeKB + ' KB',
    'Family': (font.names.fontFamily && font.names.fontFamily.en) || '—',
    'Subfamily': (font.names.fontSubfamily && font.names.fontSubfamily.en) || '—',
    'Version': (font.names.version && font.names.version.en) || '—',
    'Designer': (font.names.designer && font.names.designer.en) || '—',
    'Manufacturer': (font.names.manufacturer && font.names.manufacturer.en) || '—',
    'Total glyphs': font.glyphs.length,
    'Glyphs with outlines': `${outlined} (${Math.round(outlined / font.glyphs.length * 100)}%)`,
    'Codepoints in cmap': cmapClaimed,
    'Empty cmap-claimed glyphs': emptyClaimed.length,
    'Tables present': tables.sort().join(', ') || '—',
    'Copyright': (font.names.copyright && font.names.copyright.en) || '—',
  };
  document.getElementById('meta').innerHTML = Object.entries(meta).map(([k, v]) =>
    `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(String(v))}</dd>`
  ).join('');

  document.getElementById('heatmap').innerHTML = renderHeatmap(computeBlockCoverage(font));

  const browser = buildGlyphBrowser(font);
  document.getElementById('glyph-grid').innerHTML = browser.html;
  document.getElementById('glyph-summary').innerHTML =
    `<strong>${font.glyphs.length}</strong> total glyphs — ` +
    `<strong>${browser.outlined}</strong> outlined, ` +
    `<strong>${browser.empty}</strong> claimed-but-empty, ` +
    `<strong>${browser.unmapped}</strong> unmapped (reachable only via OpenType features).`;

  const glyphDetails = document.querySelector('.glyph-details');
  const glyphSummaryToggle = document.getElementById('glyph-summary-toggle');
  const updateGlyphToggleLabel = () => {
    glyphSummaryToggle.textContent =
      `${glyphDetails.open ? 'Hide' : 'Show'} all ${font.glyphs.length} glyphs`;
  };
  updateGlyphToggleLabel();
  glyphDetails.ontoggle = updateGlyphToggleLabel;
}

function computeBlockCoverage(font) {
  const tierRank = r => r >= 0.9 ? 0 : r >= 0.5 ? 1 : r >= 0.1 ? 2 : 3;
  return UNICODE_BLOCKS.map(block => {
    let outlined = 0;
    const total = block.end - block.start + 1;
    for (let cp = block.start; cp <= block.end; cp++) {
      if (INTENTIONALLY_EMPTY.has(cp)) continue;
      if (hasUsableGlyph(font, cp)) outlined++;
    }
    return { ...block, outlined, total, ratio: outlined / total };
  })
  .filter(b => b.outlined >= 3)
  .sort((a, b) => {
    const ra = tierRank(a.ratio), rb = tierRank(b.ratio);
    return ra !== rb ? ra - rb : a.start - b.start;
  });
}

function renderHeatmap(blocks) {
  if (blocks.length === 0) {
    return '<div style="color:var(--muted);font-size:14px">No Unicode blocks reached the 3-glyph threshold — this font has effectively no script coverage.</div>';
  }
  return blocks.map(b => {
    const pct = Math.round(b.ratio * 100);
    let tier = 'sparse';
    if (b.ratio >= 0.9) tier = 'full';
    else if (b.ratio >= 0.5) tier = 'most';
    else if (b.ratio >= 0.1) tier = 'partial';
    const range = `U+${b.start.toString(16).toUpperCase().padStart(4, '0')}–U+${b.end.toString(16).toUpperCase().padStart(4, '0')}`;
    return `<div class="heat-tile heat-${tier}">
      <div class="heat-name">${escapeHtml(b.name)}</div>
      <div class="heat-meta">${range}</div>
      <div class="heat-stats"><span class="heat-pct">${pct}%</span> · ${b.outlined} / ${b.total} glyphs</div>
    </div>`;
  }).join('');
}

function renderGlyphSvg(glyph, font, size) {
  if (isEmptyGlyph(glyph)) return '';
  try {
    const scale = size / font.unitsPerEm;
    const path = glyph.getPath(0, 0, size);
    const pathData = path.toPathData(2);
    if (!pathData) return '';
    const ascender = font.ascender * scale;
    const descender = font.descender * scale;
    const advance = (glyph.advanceWidth || font.unitsPerEm) * scale;
    const h = ascender - descender;
    return `<svg viewBox="0 ${-ascender} ${advance} ${h}" preserveAspectRatio="xMidYMid meet" width="100%" height="100%"><path d="${pathData}" fill="currentColor"/></svg>`;
  } catch (e) {
    return '';
  }
}

function buildGlyphBrowser(font) {
  const giToCp = new Map();
  for (let cp = 0x20; cp <= 0xFFFF; cp++) {
    const gi = font.charToGlyphIndex(String.fromCodePoint(cp));
    if (gi !== 0 && !giToCp.has(gi)) giToCp.set(gi, cp);
  }

  let outlined = 0, empty = 0, unmapped = 0;
  const tiles = [];
  for (let i = 0; i < font.glyphs.length; i++) {
    const glyph = font.glyphs.get(i);
    const cp = giToCp.get(i);
    const hasCmap = cp !== undefined;
    const empty_ = isEmptyGlyph(glyph);

    let status;
    if (i === 0) status = 'notdef';
    else if (!hasCmap) { status = 'unmapped'; unmapped++; }
    else if (empty_)   { status = 'empty';    empty++; }
    else               { status = 'ok';       outlined++; }

    const cpLabel = hasCmap ? 'U+' + cp.toString(16).toUpperCase().padStart(4, '0')
                            : `GID ${i}`;
    const name = glyph.name && !/^uni[0-9A-Fa-f]+$/.test(glyph.name) ? glyph.name : '';
    const tipParts = [cpLabel];
    if (name) tipParts.push(name);
    if (status === 'empty') tipParts.push('claimed but empty');
    else if (status === 'unmapped') tipParts.push('not in cmap');
    else if (status === 'notdef') tipParts.push('.notdef (fallback glyph)');
    const tip = tipParts.join(' · ');

    tiles.push(`<div class="glyph-tile glyph-${status}" data-tip="${escapeHtml(tip)}">
      <div class="glyph-render">${renderGlyphSvg(glyph, font, 32)}</div>
      <div class="glyph-cp">${cpLabel}</div>
    </div>`);
  }

  return { html: tiles.join(''), outlined, empty, unmapped };
}

function buildCoverageStrip(font, text) {
  return [...text].map(ch => {
    const cp = ch.codePointAt(0);
    if (ch === ' ') return '<span class="cov-char space" data-tip="space"></span>';
    const hex = 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
    const gi = font.charToGlyphIndex(ch);
    let status;
    let tip;
    if (gi === 0) {
      status = 'missing';
      tip = `${hex} · not in font`;
    } else {
      const g = font.glyphs.get(gi);
      if (isEmptyGlyph(g)) {
        status = 'empty';
        tip = `${hex} · claimed but empty`;
      } else {
        status = 'ok';
        tip = `${hex} · has outline`;
      }
    }
    return `<span class="cov-char ${status}" data-tip="${escapeHtml(tip)}">${escapeHtml(ch)}</span>`;
  }).join('');
}

function findEmptyClaimedGlyphs(font) {
  const result = [];
  const seenGlyph = new Set();
  for (let cp = 0x20; cp <= 0xFFFF; cp++) {
    if (INTENTIONALLY_EMPTY.has(cp)) continue;
    const gi = font.charToGlyphIndex(String.fromCodePoint(cp));
    if (gi === 0) continue;
    if (seenGlyph.has(gi)) continue;
    seenGlyph.add(gi);
    const g = font.glyphs.get(gi);
    if (isEmptyGlyph(g)) {
      result.push({ cp, name: g.name || '' });
    }
  }
  return result;
}

function isEmptyGlyph(glyph) {
  if (!glyph) return true;
  try {
    const path = glyph.path;
    if (!path) return true;
    if (path.commands && path.commands.length === 0) return true;
  } catch (e) { return true; }
  return false;
}

function hasUsableGlyph(font, cp) {
  const gi = font.charToGlyphIndex(String.fromCodePoint(cp));
  if (gi === 0) return false;
  return !isEmptyGlyph(font.glyphs.get(gi));
}

function countCmapClaimed(font) {
  let n = 0;
  for (let cp = 0x20; cp <= 0xFFFF; cp++) {
    if (INTENTIONALLY_EMPTY.has(cp)) continue;
    if (font.charToGlyphIndex(String.fromCodePoint(cp)) !== 0) n++;
  }
  return n;
}

function countOutlinedGlyphs(font) {
  let n = 0;
  for (let i = 0; i < font.glyphs.length; i++) {
    if (!isEmptyGlyph(font.glyphs.get(i))) n++;
  }
  return n;
}

function detectFormat(bytes) {
  const sig = new DataView(bytes).getUint32(0);
  if (sig === 0x00010000) return 'TTF';
  if (sig === 0x4F54544F) return 'OTF (CFF)';
  if (sig === 0x74727565) return 'TTF (Apple)';
  if (sig === 0x774F4646) return 'WOFF';
  if (sig === 0x774F4632) return 'WOFF2';
  if (sig === 0x74746366) return 'TTC (collection)';
  return 'Unknown';
}

function formatCodepointList(list, limit) {
  const head = list.slice(0, limit).map(g => {
    const hex = 'U+' + g.cp.toString(16).toUpperCase().padStart(4, '0');
    const ch = String.fromCodePoint(g.cp);
    const meaningfulName = g.name && !/^uni[0-9A-Fa-f]+$/.test(g.name) ? ` (${g.name})` : '';
    return `<span class="cp-chip"><span class="cp-glyph">${escapeHtml(ch)}</span>${hex}${meaningfulName}</span>`;
  }).join(' ');
  const rest = list.length > limit ? ` <span class="cp-more">…and ${list.length - limit} more</span>` : '';
  return head + rest;
}

function renderIssue(i) {
  return `<div class="issue ${i.level}">
    <div class="title">
      <span class="badge ${i.level}">${i.level}</span>
      <span>${escapeHtml(i.title)}</span>
    </div>
    <div class="detail">${i.detail}</div>
    ${i.list ? `<details><summary>Show details</summary><div class="codepoint-list">${i.list}</div></details>` : ''}
  </div>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function showError(msg) {
  errBox.innerHTML = msg;
  errBox.className = 'err';
  errBox.hidden = false;
}

function reset() {
  if (currentFontFace) {
    document.fonts.delete(currentFontFace);
    currentFontFace = null;
  }
  drop.hidden = false;
  report.hidden = true;
  errBox.hidden = true;
  document.getElementById('preview').innerHTML = '';
  document.getElementById('issues').innerHTML = '';
  document.getElementById('meta').innerHTML = '';
  document.getElementById('findings-summary').innerHTML = '';
  fileInput.value = '';
}
