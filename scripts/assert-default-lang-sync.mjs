#!/usr/bin/env node
/**
 * The default language is declared TWICE and the two must agree:
 *
 *   src/index.production.html   an inline <head> script, so <html lang/dir> is set
 *                               before first paint and there is no flash of the
 *                               wrong direction
 *   language.service.ts         DEFAULT_LANG, used once Angular has booted
 *
 * If they disagree, the page paints in one direction and then flips — a bug no
 * test would otherwise catch, because each file is internally consistent.
 *
 * Also checks the static <html lang/dir> attributes match, since those are what a
 * crawler and a no-JS reader see.
 */
import fs from 'node:fs';

const HTML = 'src/index.production.html';
const SERVICE = 'src/app/common/services/language.service.ts';
const DIR = { ar: 'rtl', en: 'ltr', de: 'ltr' };

const html = fs.readFileSync(HTML, 'utf8');
const service = fs.readFileSync(SERVICE, 'utf8');

const inline = html.match(/if \(!DIR\[l\]\) l = "([a-z-]+)"; \/\* WISSAM-DEFAULT-LANG \*\//);
const constant = service.match(/export const DEFAULT_LANG = '([a-z-]+)';/);
const attrs = html.match(/<html lang="([a-z-]+)" dir="(rtl|ltr)">/);

const fail = (msg) => {
	console.error(`default-lang: ${msg}`);
	process.exit(1);
};

if (!inline) fail(`could not find the WISSAM-DEFAULT-LANG line in ${HTML}`);
if (!constant) fail(`could not find DEFAULT_LANG in ${SERVICE}`);
if (!attrs) fail(`could not find the <html lang=… dir=…> attributes in ${HTML}`);

if (inline[1] !== constant[1])
	fail(`inline script says "${inline[1]}" but DEFAULT_LANG is "${constant[1]}" — the page would flip direction after boot`);

if (attrs[1] !== inline[1])
	fail(`<html lang="${attrs[1]}"> does not match the default "${inline[1]}"`);

if (attrs[2] !== DIR[inline[1]])
	fail(`<html dir="${attrs[2]}"> is wrong for "${inline[1]}" — expected "${DIR[inline[1]]}"`);

console.log(`default-lang OK — "${inline[1]}" (dir="${attrs[2]}") declared consistently in both places`);
