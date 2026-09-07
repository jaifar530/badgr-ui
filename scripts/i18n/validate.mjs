#!/usr/bin/env node
/**
 * Wissam i18n gate for src/assets/i18n/ar.json.
 *
 * Arabic is being translated in waves, so only the namespaces listed in SHIPPED are
 * held to full parity; everything else is reported and ignored. ngx-translate is
 * configured with `defaultLanguage: 'en'`, which means an untranslated key renders the
 * English string rather than the raw key — that is what makes partial shipping safe.
 *
 * Usage: node scripts/i18n/validate.mjs
 */
import fs from 'node:fs';

const EN = 'src/assets/i18n/en.json';
const AR = 'src/assets/i18n/ar.json';

/** Namespaces whose Arabic is complete and must stay complete. Grow this per wave. */
const SHIPPED = ['General', 'NavItems', 'Login', 'Theqa', 'Verify', 'Signup', 'Captcha', 'Welcome', 'Start', 'BadgeFilter', 'RequestBadge', 'Badge', 'RecBadge'];

/** Keys whose Arabic is legitimately identical to English (brand names, codes). */
const SAME_AS_EN_OK = new Set(['Login.loginBildungsraum']);

/** Keys that may carry no Arabic characters at all. */
const NO_ARABIC_OK = new Set([]);

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const flat = (o, prefix = '', out = {}) => {
	for (const [k, v] of Object.entries(o)) {
		const key = prefix ? `${prefix}.${k}` : k;
		if (v && typeof v === 'object' && !Array.isArray(v)) flat(v, key, out);
		else out[key] = String(v);
	}
	return out;
};

const en = flat(read(EN));
const ar = flat(read(AR));

const fail = [];
const warn = [];
const F = (code, key, msg) => fail.push(`[${code}] ${key} — ${msg}`);
const W = (code, key, msg) => warn.push(`[${code}] ${key} — ${msg}`);

/** ngx-translate placeholders, whitespace-normalised so {{ a }} == {{a}}. */
const placeholders = (s) => (s.match(/\{\{.*?\}\}/g) ?? []).map((p) => p.replace(/\s+/g, '')).sort();
/** Tag name + attributes, normalised, order preserved. */
const tags = (s) => (s.match(/<[^>]+>/g) ?? []).map((t) => t.replace(/\s*\/?>$/, '>').replace(/\s+/g, ' '));

const shipped = (key) => SHIPPED.includes(key.split('.')[0]);

for (const [key, e] of Object.entries(en)) {
	const a = ar[key];

	if (a === undefined) {
		if (shipped(key)) F('parity', key, 'missing from ar.json');
		continue;
	}

	if (!a.trim()) F('empty', key, 'empty value');
	if (a === e && !SAME_AS_EN_OK.has(key)) F('untranslated', key, 'identical to English');

	const pe = placeholders(e).join('|');
	const pa = placeholders(a).join('|');
	if (pe !== pa) F('placeholder', key, `en=[${pe}] ar=[${pa}]`);

	const te = tags(e).join('');
	const ta = tags(a).join('');
	if (te !== ta) F('html', key, `tag/attribute sequence differs\n    en: ${tags(e).join(' ')}\n    ar: ${tags(a).join(' ')}`);

	// Binding house style: tanween sits on the preceding letter (قريبًا), never on alef (قريباً).
	if (/اً/.test(a)) F('tanween', key, 'contains اً — move the fathatan onto the preceding letter');

	// Western digits only: credential IDs must read identically in both languages.
	if (/[٠-٩۰-۹]/.test(a)) F('digits', key, 'Eastern-Arabic digits');

	if (!/[؀-ۿ]/.test(a) && !NO_ARABIC_OK.has(key) && !SAME_AS_EN_OK.has(key))
		W('script', key, 'no Arabic characters — is this translated?');

	if (e.length <= 30 && a.length > e.length * 1.8)
		W('length', key, `${e.length}→${a.length} chars: check the control does not clip`);
}

for (const key of Object.keys(ar)) {
	if (!(key in en)) F('ar-only', key, 'exists in ar.json but not en.json (typo?)');
}

const arCount = Object.keys(ar).length;
const enCount = Object.keys(en).length;
const shippedCount = Object.keys(en).filter(shipped).length;

if (warn.length) console.log(warn.join('\n') + '\n');
if (fail.length) {
	console.error(fail.join('\n'));
	console.error(`\n${fail.length} failure(s)`);
	process.exit(1);
}
console.log(
	`i18n OK — ${arCount}/${enCount} keys translated; ` +
		`${SHIPPED.length} shipped namespace(s) at full parity (${shippedCount} keys); ${warn.length} warning(s)`,
);
