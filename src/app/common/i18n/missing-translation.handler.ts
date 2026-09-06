import { Injectable } from '@angular/core';
import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

const reported = new Set<string>();

/**
 * Fallback itself is handled by TranslateModule's `defaultLanguage: 'en'` — ngx-translate
 * tries the current language, then the default language, and only then calls this handler
 * (see getParsedResultForKey). So this exists purely to make an untranslated key visible
 * while the Arabic waves are in progress; in production it stays quiet.
 */
@Injectable()
export class LoggingMissingTranslationHandler implements MissingTranslationHandler {
	handle(params: MissingTranslationHandlerParams) {
		if (!environment.production && !reported.has(params.key)) {
			reported.add(params.key);
			console.warn(`[i18n] missing key "${params.key}" in "${params.translateService.currentLang}"`);
		}
		return undefined;
	}
}
