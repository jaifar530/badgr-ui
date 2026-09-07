import { Component, Injector, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { preloadImageURL } from '../../../common/util/file-util';
import { PublicApiService } from '../../services/public-api.service';
import { LoadedRouteParam } from '../../../common/util/loaded-route-param';
import {
	OB3EvidenceItem,
	PublicApiBadgeAssertion,
	PublicApiBadgeAssertionWithBadgeClass,
	PublicApiBadgeClass,
	PublicApiIssuer,
} from '../../models/public-api.model';
import { EmbedService } from '../../../common/services/embed.service';
import { routerLinkForUrl } from '../public/public.component';
import { QueryParametersService } from '../../../common/services/query-parameters.service';
import { MessageService } from '../../../common/services/message.service';
import { AppConfigService } from '../../../common/app-config.service';
import { saveAs } from 'file-saver';
import { SafeResourceUrl, Title } from '@angular/platform-browser';
import { PageConfig } from '../../../common/components/badge-detail/badge-detail.component.types';
import { TranslateService } from '@ngx-translate/core';
import { BgBadgeDetail } from '../../../common/components/badge-detail/badge-detail.component';
import { PdfService } from '../../../common/services/pdf.service';
import { SessionService } from '~/common/services/session.service';
import { IssuerManager } from '~/issuer/services/issuer-manager.service';
import { Issuer } from '~/issuer/models/issuer.model';
import {
	getAssertionCourseUrl,
	getAssertionExpiration,
	getAssertionIssuedDate,
	isOB2Assertion,
	isOB3Assertion,
} from '~/common/util/assertion-helper';
import { ApiBadgeInstanceEvidenceItem } from '~/issuer/models/badgeinstance-api.model';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
	template: `
		<!-- ===== Verification banner (Wissam) =====
		     The recipient's name was previously visible only as small breadcrumb text.
		     This states the verification verdict up front and gives the award a moment. -->
		@if (verifyState === 'notfound') {
			<div class="page-padding oeb">
				<div class="wsm-enter tw-mx-auto tw-my-10 tw-max-w-2xl tw-rounded-2xl tw-border-2 tw-border-solid tw-border-[#d6371a]/30 tw-bg-[#d6371a]/[0.04] tw-p-8 tw-text-center">
					<svg class="tw-mx-auto tw-mb-4 tw-h-16 tw-w-16" viewBox="0 0 52 52" aria-hidden="true">
						<circle class="wsm-ring" cx="26" cy="26" r="23" fill="none" stroke="#d6371a" stroke-width="2.5" />
						<path class="wsm-mark" d="M18 18 L34 34 M34 18 L18 34" fill="none" stroke="#d6371a" stroke-width="3.5" stroke-linecap="round" />
					</svg>
					<h1 class="tw-text-2xl tw-font-extrabold tw-text-oebblack md:tw-text-3xl">
						{{ 'Verify.notFoundTitle' | translate }}
					</h1>
					<p class="tw-mx-auto tw-mt-3 tw-max-w-lg tw-text-oebblack/70">
						{{ 'Verify.notFoundBody' | translate }}
					</p>
					<a
						class="tw-mt-6 tw-inline-block tw-rounded-full tw-bg-purple tw-px-6 tw-py-2.5 tw-text-sm tw-font-bold tw-text-white hover:tw-bg-buttonhover"
						href="/catalog/badges"
						>{{ 'Verify.browseBadges' | translate }}</a
					>
				</div>
			</div>
		} @else if (verifyState) {
			<div class="page-padding oeb">
				<div
					class="wsm-enter tw-mt-6 tw-rounded-2xl tw-p-6 md:tw-p-8"
					[class]="
						verifyState === 'valid'
							? 'tw-bg-gradient-to-br tw-from-[#0e9f6e]/10 tw-to-[#652673]/[0.06] tw-border tw-border-solid tw-border-[#0e9f6e]/25'
							: 'tw-bg-[#d6371a]/[0.05] tw-border tw-border-solid tw-border-[#d6371a]/25'
					"
				>
					<div class="tw-flex tw-flex-col tw-items-center tw-gap-4 sm:tw-flex-row sm:tw-items-center">
						<svg class="wsm-seal tw-h-14 tw-w-14 tw-shrink-0 sm:tw-h-16 sm:tw-w-16" viewBox="0 0 52 52" aria-hidden="true">
							<circle
								class="wsm-ring"
								cx="26"
								cy="26"
								r="23"
								fill="none"
								[attr.stroke]="verifyState === 'valid' ? '#0e9f6e' : '#d6371a'"
								stroke-width="2.5"
							/>
							@if (verifyState === 'valid') {
								<path class="wsm-mark" d="M15 27 l7.5 7.5 L38 19" fill="none" stroke="#0e9f6e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
							} @else {
								<path class="wsm-mark" d="M18 18 L34 34 M34 18 L18 34" fill="none" stroke="#d6371a" stroke-width="3.5" stroke-linecap="round" />
							}
						</svg>

						<div class="tw-text-center sm:tw-text-start">
							<p
								class="tw-text-[11px] tw-font-bold tw-uppercase tw-tracking-[0.14em]"
								[class]="verifyState === 'valid' ? 'tw-text-[#0b7d56]' : 'tw-text-[#b02d15]'"
							>
								{{ (verifyState === 'valid' ? 'Verify.verified' : verifyState === 'revoked' ? 'Verify.revoked' : 'Verify.expired') | translate }}
							</p>
							<p class="tw-mt-1 tw-text-sm tw-text-oebblack/70">{{ 'Verify.awardedTo' | translate }}</p>
							<h1 class="wsm-name tw-text-3xl tw-font-extrabold tw-leading-tight tw-text-purple md:tw-text-[2.75rem]">
								{{ awardedToDisplayName || ('Badge.unknownRecipient' | translate) }}
							</h1>
						</div>
					</div>
				</div>
			</div>
		}

		<bg-badgedetail [config]="config" [awaitPromises]="[assertionIdParam.loadedPromise]"></bg-badgedetail>
	`,
	styles: [
		`
			/* entrance: the award should feel like it lands, not just appear */
			.wsm-enter {
				animation: wsm-rise 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
			}
			@keyframes wsm-rise {
				from {
					opacity: 0;
					transform: translateY(14px);
				}
				to {
					opacity: 1;
					transform: none;
				}
			}
			/* seal: ring draws, then the mark strikes through it */
			.wsm-ring {
				stroke-dasharray: 145;
				stroke-dashoffset: 145;
				animation: wsm-draw 0.7s ease-out 0.1s forwards;
			}
			.wsm-mark {
				stroke-dasharray: 60;
				stroke-dashoffset: 60;
				animation: wsm-draw 0.4s ease-out 0.6s forwards;
			}
			@keyframes wsm-draw {
				to {
					stroke-dashoffset: 0;
				}
			}
			.wsm-seal {
				animation: wsm-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
			}
			@keyframes wsm-pop {
				from {
					transform: scale(0.82);
				}
				to {
					transform: none;
				}
			}
			.wsm-name {
				animation: wsm-rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both;
			}
			/* respect the visitor's motion preference */
			@media (prefers-reduced-motion: reduce) {
				.wsm-enter,
				.wsm-name,
				.wsm-seal,
				.wsm-ring,
				.wsm-mark {
					animation: none !important;
					stroke-dashoffset: 0 !important;
					opacity: 1 !important;
					transform: none !important;
				}
			}
		`,
	],
	imports: [BgBadgeDetail, TranslatePipe],
})
export class PublicBadgeAssertionComponent {
	private injector = inject(Injector);
	embedService = inject(EmbedService);
	messageService = inject(MessageService);
	configService = inject(AppConfigService);
	queryParametersService = inject(QueryParametersService);
	private title = inject(Title);
	private translate = inject(TranslateService);
	private pdfService = inject(PdfService);
	private sessionService = inject(SessionService);
	private issuerManager = inject(IssuerManager);
	private publicApiService = inject(PublicApiService);
	protected route = inject(ActivatedRoute);

	constructor() {
		const title = this.title;

		title.setTitle(`Assertion - ${this.configService.theme['serviceName'] || 'Badgr'}`);
		this.assertionIdParam = this.createLoadedRouteParam();
	}

	get assertionSlug() {
		return this.route.snapshot.params['assertionId'];
	}

	readonly issuerImagePlacholderUrl = preloadImageURL(
		'../../../../breakdown/static/images/placeholderavatar-issuer.svg',
	);

	readonly badgeLoadingImageUrl = '../../../../breakdown/static/images/badge-loading.svg';

	readonly badgeFailedImageUrl = '../../../../breakdown/static/images/badge-failed.svg';

	assertionIdParam: LoadedRouteParam<PublicApiBadgeAssertionWithBadgeClass>;

	assertionId: string;

	awardingIssuers: Issuer[] = null;

	awardedToDisplayName: string;

	/** Verification verdict shown in the banner. null while loading. */
	verifyState: 'valid' | 'revoked' | 'expired' | 'notfound' | null = null;

	config: PageConfig;

	pdfSrc: SafeResourceUrl;

	routerLinkForUrl = routerLinkForUrl;

	tense = {
		expires: {
			'=1': 'Expired',
			'=0': 'Expires',
		},
	};

	get showDownload() {
		return this.queryParametersService.queryStringValue('action') === 'download';
	}

	get assertion(): PublicApiBadgeAssertionWithBadgeClass {
		return this.assertionIdParam.value;
	}

	get badgeClass(): PublicApiBadgeClass {
		return this.assertion.badge;
	}

	get issuer(): PublicApiIssuer {
		return this.assertion.badge.issuer;
	}

	private get rawUrl() {
		return `${this.configService.apiConfig.baseUrl}/public/assertions/${this.assertionId}`;
	}

	private get rawJsonUrl() {
		return `${this.rawUrl}.json`;
	}

	get rawBakedUrl() {
		return `${this.rawUrl}/baked`;
	}

	get verifyUrl() {
		let url = `${this.configService.assertionVerifyUrl}?url=${this.rawJsonUrl}`;

		for (const IDENTITY_TYPE of ['identity__email', 'identity__url', 'identity__telephone']) {
			const identity = this.queryParametersService.queryStringValue(IDENTITY_TYPE);
			if (identity) {
				url = `${url}&${IDENTITY_TYPE}=${identity}`;
			}
		}
		return url;
	}

	verifyBadge() {
		if (this.config.version == '3.0') {
			// v1: open ui for manual upload
			// window.open('https://verifybadge.org/upload?validatorId=OB30Inspector');

			// v2: post request using the assertion public url
			const form = document.createElement('form');
			form.target = '_blank';
			form.method = 'POST';
			form.action = 'https://verifybadge.org/uploaduri';
			form.style.display = 'none';

			[
				['uri', this.assertion.id],
				['validatorId', 'OB30Inspector'],
			].forEach(([key, value]) => {
				const input = document.createElement('input');
				input.type = 'hidden';
				input.name = key;
				input.value = value;
				form.appendChild(input);
			});

			document.body.appendChild(form);
			form.submit();
			document.body.removeChild(form);
		} else {
			window.open(this.verifyUrl, '_blank');
		}
	}

	generateFileName(assertion, fileExtension): string {
		return `${assertion.badge.name} - ${assertion.recipient.identity}${fileExtension}`;
	}

	openSaveDialog(assertion): void {
		const xhr = new XMLHttpRequest();
		xhr.open('GET', assertion.image, true);
		xhr.responseType = 'blob';
		xhr.onload = (e) => {
			if (xhr.status === 200) {
				const fileExtension = this.mimeToExtension(xhr.response.type);
				const name = this.generateFileName(assertion, fileExtension);
				saveAs(xhr.response, name);
			}
		};
		xhr.send();
	}

	mimeToExtension(mimeType: string): string {
		if (mimeType.indexOf('svg') !== -1) return '.svg';
		if (mimeType.indexOf('png') !== -1) return '.png';
		return '';
	}

	private createLoadedRouteParam() {
		return new LoadedRouteParam(this.injector.get(ActivatedRoute), 'assertionId', async (paramValue) => {
			try {
				this.assertionId = paramValue;
				const assertion = await this.publicApiService.getBadgeAssertion(paramValue);
				if (isOB2Assertion(assertion) && assertion.revoked) {
					if (assertion.revocationReason) {
						this.messageService.reportFatalError('Assertion has been revoked:', assertion.revocationReason);
					} else {
						this.messageService.reportFatalError('Assertion has been revoked.', '');
					}
				} else if (this.showDownload) {
					this.openSaveDialog(assertion);
				}
				if (this.sessionService.isLoggedIn) {
					const issuer = await this.issuerManager.issuerBySlug(assertion.badge.issuer.slug);
					this.awardingIssuers = [issuer];
				}
				const lps = await this.publicApiService.getLearningPathsForBadgeClass(assertion.badge.slug);

				const assertionVersion =
					Array.isArray(assertion['@context']) &&
					assertion['@context'].some((c) => c.indexOf('purl.imsglobal.org/spec/ob/v3p0') != -1)
						? '3.0'
						: '2.0';

				this.config = {
					badgeTitle: assertion.badge.name,
					headerButton: {
						title: 'RecBadgeDetail.verifyBadge',
						action: () => this.verifyBadge(),
					},
					qrCodeButton: {
						show: false,
					},
					menuitems: [
						{
							title:
								assertionVersion == '3.0'
									? 'RecBadgeDetail.downloadImage30'
									: 'RecBadgeDetail.downloadImage20',
							icon: 'lucideImage',
							action: () => this.exportPng(),
						},
						{
							title:
								assertionVersion == '3.0'
									? 'RecBadgeDetail.downloadJson30'
									: 'RecBadgeDetail.downloadJson20',
							icon: '	lucideFileCode',
							action: () => this.exportJson(),
						},
						{
							title: 'RecBadgeDetail.downloadPDF',
							icon: 'lucideFileText',
							action: () => this.downloadCertificate(),
						},
						// Disabled for now
						// {
						// 	title: 'View Badge',
						// 	icon: 'lucideBadge',
						// 	routerLink: routerLinkForUrl(assertion.badge.hostedUrl || assertion.badge.id),
						// },
					],
					badgeDescription: assertion.badge.description,
					awardCriteria: assertion.badge.criteria['narrative'],
					// criteria:
					// 	typeof assertion.badge.criteria != 'string' ? assertion.badge.criteria.narrative : null,
					issuerSlug: assertion.badge.issuer['slug'],
					slug: assertion.badge.id,
					category: assertion.badge['extensions:CategoryExtension'].Category,
					tags: assertion.badge.tags,
					issuerName: assertion.badge.issuer.name,
					issuerImagePlacholderUrl: this.issuerImagePlacholderUrl,
					issuerImage: assertion.badge.issuer.image,
					badgeLoadingImageUrl: this.badgeLoadingImageUrl,
					badgeFailedImageUrl: this.badgeFailedImageUrl,
					badgeImage: assertion.image,
					evidence_items: this.normalizeEvidence(assertion, assertionVersion),
					competencies: assertion.badge['extensions:CompetencyExtension'],
					license: assertion.badge['extensions:LicenseExtension'] ? true : false,
					courseUrl: getAssertionCourseUrl(assertion),
					duration: assertion.badge['extensions:StudyLoadExtension'].StudyLoad,
					learningPaths: lps,
					version: assertionVersion,
					issuedOn: getAssertionIssuedDate(assertion) ? new Date(getAssertionIssuedDate(assertion)) : null,
					validUntil: getAssertionExpiration(assertion) ? new Date(getAssertionExpiration(assertion)) : null,
					activity_start_date:
						isOB3Assertion(assertion) && assertion.credentialSubject.activityStartDate
							? new Date(assertion.credentialSubject.activityStartDate)
							: null,
					activity_end_date:
						isOB3Assertion(assertion) && assertion.credentialSubject.activityEndDate
							? new Date(assertion.credentialSubject.activityEndDate)
							: null,
					networkBadge: assertion.badge.isNetworkBadge,
					networkImage: assertion.badge.networkImage,
					networkName: assertion.badge.networkName,
					sharedOnNetwork: assertion.badge.sharedOnNetwork,
					awardingIssuers: this.awardingIssuers,
					crumbs: [
						{ title: 'Badges' },
						{
							title:
								assertion['extensions:recipientProfile'] &&
								assertion['extensions:recipientProfile'].name
									? assertion['extensions:recipientProfile'].name
									: this.translate.instant('Badge.unknownRecipient'),
						},
						{ title: assertion.badge.name },
					],
				};
				if (assertion['extensions:recipientProfile'] && assertion['extensions:recipientProfile'].name) {
					this.awardedToDisplayName = assertion['extensions:recipientProfile'].name;
				}

				// verdict for the banner: revoked beats expired beats valid
				const revoked = isOB2Assertion(assertion) && assertion.revoked;
				const expiry = getAssertionExpiration(assertion);
				const expired = expiry ? new Date(expiry).getTime() < Date.now() : false;
				this.verifyState = revoked ? 'revoked' : expired ? 'expired' : 'valid';

				return assertion;
			} catch (err) {
				// Previously this only logged and returned undefined, so an unknown or
				// mistyped assertion id rendered a completely blank page. Now the
				// template shows an explicit "could not be verified" state.
				console.error('Failed to fetch assertion data', err);
				this.verifyState = 'notfound';
				return null;
			}
		});
	}

	normalizeEvidence(
		assertion: PublicApiBadgeAssertion,
		version: '2.0' | '3.0',
	): (OB3EvidenceItem | ApiBadgeInstanceEvidenceItem)[] {
		if (version === '3.0') {
			if (Array.isArray(assertion.evidence)) {
				return assertion.evidence;
			}
			return [];
		} else {
			if (Array.isArray(assertion.evidence)) {
				return assertion.evidence;
			} else if (typeof assertion.evidence === 'object' && assertion.evidence !== null) {
				return [assertion.evidence];
			} else {
				return [];
			}
		}
	}

	exportPng() {
		fetch(this.rawBakedUrl)
			.then((response) => response.blob())
			.then((blob) => {
				const link = document.createElement('a');
				const url = URL.createObjectURL(blob);
				const urlParts = this.rawBakedUrl.split('/');
				link.href = url;
				link.download = `${new Date(getAssertionIssuedDate(this.assertion)).toISOString().split('T')[0]}-${this.assertion.badge.name.trim().replace(' ', '_')}.png`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
			})
			.catch((error) => console.error('Download failed:', error));
	}

	exportJson() {
		fetch(this.rawJsonUrl)
			.then((response) => response.blob())
			.then((blob) => {
				const link = document.createElement('a');
				const url = URL.createObjectURL(blob);
				link.href = url;
				link.download = `${new Date(getAssertionIssuedDate(this.assertion)).toISOString().split('T')[0]}-${this.assertion.badge.name.trim().replace(' ', '_')}.json`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
			})
			.catch((error) => console.error('Download failed:', error));
	}

	downloadCertificate() {
		this.publicApiService.downloadPublicAssertionPdf(
			this.assertionId,
			this.assertion.badge.name,
			new Date(getAssertionIssuedDate(this.assertion)),
		);
	}
}
