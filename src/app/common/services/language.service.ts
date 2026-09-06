import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT, Injectable, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

/**
 * Languages offered in the UI. 'de' is deliberately absent: the German catalogue
 * still ships (upstream owns de.json) but Wissam does not offer it.
 */
export const lngs = ['ar', 'en'];

/**
 * WISSAM-DEFAULT-LANG — must stay identical to the default in the inline <script>
 * in src/index*.html. A mismatch produces a first-paint direction flip.
 */
export const DEFAULT_LANG = 'en';

const DIR: Record<string, 'rtl' | 'ltr'> = { ar: 'rtl', en: 'ltr', de: 'ltr' };

export function dirFor(lng: string | null | undefined): 'rtl' | 'ltr' {
	return DIR[(lng ?? '').toLowerCase()] ?? 'ltr';
}

@Injectable({
	providedIn: 'root',
})
export class LanguageService {
	private translate = inject(TranslateService);
	private document = inject(DOCUMENT);

	private selected_lng$: BehaviorSubject<string>;

	constructor() {
		this.selected_lng$ = new BehaviorSubject(null);
	}

	/**
	 * Awaited by provideAppInitializer in main.ts, so the catalogue is loaded before the
	 * first render. Without this the ~480 translate.instant() call sites that run in
	 * constructors race the async HTTP load and render raw keys.
	 */
	async initialize(): Promise<void> {
		const lng = this.resolveInitialLanguage();
		this.applyLocale(lng);
		try {
			await firstValueFrom(this.translate.use(lng));
		} catch {
			// A missing/404 ar.json must not brick the app.
			await firstValueFrom(this.translate.use(DEFAULT_LANG));
			this.applyLocale(DEFAULT_LANG);
		}
		this.setSelectedLngValue(this.translate.currentLang);
	}

	private resolveInitialLanguage(): string {
		// ?lang=xx wins, then the stored preference. Mirrors the inline <head> script.
		const fromQuery = /[?&]lang=([a-zA-Z-]+)/.exec(window.location.search);
		let lng = (fromQuery ? fromQuery[1] : this.read() ?? '').toLowerCase();
		if (!lngs.includes(lng)) lng = DEFAULT_LANG;
		this.write(lng);
		return lng;
	}

	/**
	 * Sets lang+dir on <html>. The inline <head> script has normally done this already;
	 * repeating it keeps the invariant true when translate.use() is called directly and
	 * makes the service testable on its own.
	 *
	 * CDK Directionality reads documentElement.dir once, lazily, at first injection, so
	 * setting it here (and in the inline script, before Angular boots) is what makes
	 * overlays, menus and the wizard steppers mirror. There is no [dir] binding to add.
	 */
	private applyLocale(lng: string): void {
		const html = this.document.documentElement;
		html.lang = lng;
		html.dir = dirFor(lng);
	}

	/**
	 * Persist, then hard reload. Deliberate: ~480 .instant() call sites, the datatable
	 * column builders and 54 page titles resolve once at construction, so a live switch
	 * would leave stale strings. See docs/08 section 1.
	 */
	setLanguage(lng: string) {
		if (!lngs.includes(lng) || this.read() === lng) return;
		this.write(lng);
		window.location.reload();
	}

	/** Retained for existing callers; initialize() (APP_INITIALIZER) does the work now. */
	setInitialAppLanguage() {
		/* no-op */
	}

	// selected language observer, getter ans setter
	getSelectedLngObs() {
		return this.selected_lng$.asObservable();
	}
	getSelectedLngValue() {
		return this.selected_lng$.getValue();
	}
	setSelectedLngValue(sel_lng: string) {
		return this.selected_lng$.next(sel_lng);
	}

	private read(): string | null {
		try {
			return window.localStorage.getItem('lang');
		} catch {
			return null;
		}
	}
	private write(v: string): void {
		try {
			window.localStorage.setItem('lang', v);
		} catch {
			/* storage blocked */
		}
	}
}
