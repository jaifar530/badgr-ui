#!/usr/bin/env node
/**
 * Generate the RTL mirror of the legacy badgr-style stylesheet.
 *
 *   node scripts/build-rtl-css.mjs           write src/styles/generated/screen.rtl.css
 *   node scripts/build-rtl-css.mjs --check   fail if that file is stale (CI gate)
 *
 * screen.css is *compiled* vendor output (~18.6k lines, ~1000 physical direction
 * declarations) that gets replaced wholesale whenever @concentricsky/badgr-style is
 * bumped. Hand-editing it would rot on the next bump, so it is mirrored mechanically
 * instead, and the result is written outside the vendored directory so that directory
 * stays byte-identical to upstream.
 *
 * Two things keep the cost down:
 *  - rules whose mirrored form is identical to the source are dropped, so we ship only
 *    the direction-bearing subset rather than a second full copy of the stylesheet;
 *  - everything is scoped under [dir="rtl"], so the file is inert for English users.
 *
 * The output is committed (not gitignored): angular.json resolves its styles array at
 * config-parse time, so a file generated only by a prebuild hook would break `ng serve`
 * and a fresh clone's first build.
 */
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import rtlcss from 'rtlcss';
import prefixer from 'postcss-prefix-selector';

const SRC = 'src/assets/@concentricsky/badgr-style/dist/css/screen.css';
const OUT = 'src/styles/generated/screen.rtl.css';
const BANNER =
	`/* GENERATED — DO NOT EDIT.\n` +
	` * Source: ${SRC}\n` +
	` * Regenerate: npm run build:rtl-css   (CI fails if this file is stale)\n` +
	` * Only rules whose mirrored form differs from the source are kept, all scoped\n` +
	` * under [dir="rtl"] so this file does nothing in English. */\n`;

const src = fs.readFileSync(SRC, 'utf8');

// 1. Mirror. processUrls stays off: the url() references point at ../images/, not at
//    direction-specific assets, so rewriting them would break them.
const mirrored = postcss([rtlcss({ processUrls: false, useCalc: true, autoRename: false })]).process(src, {
	from: SRC,
	to: OUT,
}).css;

// 2. Drop everything rtlcss left untouched.
const key = (rule) => {
	const parents = [];
	for (let p = rule.parent; p && p.type !== 'root'; p = p.parent) parents.unshift(`${p.name} ${p.params}`);
	return parents.join('||') + '::' + rule.selector;
};
const srcRules = new Map();
const srcDecls = new Map();
postcss.parse(src).walkRules((r) => {
	srcRules.set(key(r), r.toString());
	// A selector can appear several times in the source (.loaderdots:before x4), so
	// merge rather than overwrite — otherwise an earlier rule's sided property is
	// invisible to the reset pass below and survives to double up under dir=rtl.
	const props = srcDecls.get(key(r)) ?? new Map();
	r.walkDecls((d) => props.set(d.prop.toLowerCase(), d.value));
	srcDecls.set(key(r), props);
});

/**
 * Properties whose NAME flips side, and the value that neutralises the side we leave.
 * Value-only flips (float, text-align, transform) need nothing: the mirrored
 * declaration reuses the same property name and simply overrides.
 */
const SIDE_RESET = new Map([
	['margin-left', '0'], ['margin-right', '0'],
	['padding-left', '0'], ['padding-right', '0'],
	['left', 'auto'], ['right', 'auto'],
	['border-left', '0'], ['border-right', '0'],
	['border-left-width', '0'], ['border-right-width', '0'],
	['border-left-style', 'none'], ['border-right-style', 'none'],
	['border-left-color', 'currentColor'], ['border-right-color', 'currentColor'],
	['border-top-left-radius', '0'], ['border-top-right-radius', '0'],
	['border-bottom-left-radius', '0'], ['border-bottom-right-radius', '0'],
	['scroll-margin-left', '0'], ['scroll-margin-right', '0'],
	['scroll-padding-left', '0'], ['scroll-padding-right', '0'],
]);

const out = postcss.parse(mirrored);
out.walkRules((r) => {
	if (srcRules.get(key(r)) === r.toString()) return r.remove();

	// The source rule still applies under dir=rtl (it is unscoped), so any sided
	// property it sets that this mirrored rule no longer sets would survive and
	// double up — e.g. source margin-left:2px + mirror margin-right:2px = both sides.
	const fromSrc = srcDecls.get(key(r));
	if (!fromSrc) return;
	const here = new Set();
	r.walkDecls((d) => here.add(d.prop.toLowerCase()));
	for (const prop of fromSrc.keys()) {
		if (!SIDE_RESET.has(prop) || here.has(prop)) continue;
		r.append({ prop, value: SIDE_RESET.get(prop) });
	}
});
// @keyframes cannot be scoped by a selector: a mirrored copy keeps the original's
// name and, loading after it, would override the animation for EVERY user including
// LTR. The per-rule dedupe above also strips unchanged steps, which leaves a partial
// keyframe (e.g. confetti-slow lost its 0% step) — broken for everyone. Decorative
// animations do not need mirroring, so drop them entirely.
out.walkAtRules(/^(-\w+-)?keyframes$/, (a) => a.remove());
out.walkAtRules((a) => {
	if (a.nodes && a.nodes.length === 0) a.remove();
});

// 3. Scope under [dir="rtl"] so the file is inert in LTR.
const scoped = postcss([
	prefixer({
		prefix: '[dir="rtl"]',
		transform: (prefix, selector, prefixed) =>
			selector.startsWith('html') ? selector.replace(/^html/, `html${prefix}`) : prefixed,
	}),
]).process(out.toString(), { from: undefined }).css;

// 4. The mirror lives in src/styles/generated/, not beside screen.css, so every
//    relative url() has to be re-anchored or the Angular CSS resource plugin cannot
//    resolve the images (rtlcss leaves them alone because processUrls is off).
const srcDir = path.dirname(SRC);
const outDir = path.dirname(OUT);
const rebased = scoped.replace(/url\(([^)]+)\)/g, (m, raw) => {
	const quoted = /^\s*(['"])/.exec(raw);
	const q = quoted ? quoted[1] : '';
	const ref = raw.trim().replace(/^['"]|['"]$/g, '');
	if (/^(data:|https?:|\/|#)/.test(ref)) return m;
	const rel = path.relative(outDir, path.resolve(srcDir, ref)).split(path.sep).join('/');
	return `url(${q}${rel}${q})`;
});

const result = BANNER + rebased;

if (process.argv.includes('--check')) {
	const existing = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
	if (existing !== result) {
		console.error(`${OUT} is stale — run: npm run build:rtl-css`);
		process.exit(1);
	}
	console.log(`${OUT} is up to date`);
	process.exit(0);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, result);
const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log(`wrote ${OUT} — ${kb(result.length)} (source ${kb(src.length)})`);
