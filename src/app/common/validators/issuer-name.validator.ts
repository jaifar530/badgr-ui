import { AbstractControl } from '@angular/forms';

/**
 * Wissam: the upstream character class was /[^\x00-\x7FäöüßÄÖÜ]/ — ASCII plus German
 * umlauts. Every Arabic letter failed it, so an Omani institution could not enter its
 * own name at all, and the rejection message was in German. Arabic ranges added:
 * Arabic (0600-06FF, includes tatweel 0640), Supplement (0750-077F),
 * Extended-A (08A0-08FF) and the Presentation Forms (FB50-FDFF, FE70-FEFF).
 */
const ALLOWED =
	'\x00-\x7F' + 'äöüßÄÖÜ' + '\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF';

export class IssuerNameValidator {
	static validIssuerName(control: AbstractControl): { [errorName: string]: string } {
		const nonAllowedRegex = new RegExp(`[^${ALLOWED}]`);

		const atIndex = control.value.indexOf('@');
		const nonAllowedMatch = control.value.match(nonAllowedRegex);

		if (atIndex !== -1) {
			return { invalidCharacter: 'Please remove the @ character.' };
		} else if (nonAllowedMatch) {
			return { invalidCharacter: `Please remove the character: ${nonAllowedMatch[0]}.` };
		}
		return null;
	}
}
