export const SITE = {
	name: 'brainlodestone.com',
	domain: 'brainlodestone.com',
	url: 'https://brainlodestone.com',
	title: 'brainlodestone.com — Premium TMS & Neurotech Domain For Sale',
	tagline: 'The definitive digital address for the future of brain stimulation.',
	description:
		'brainlodestone.com is a premium .com domain for sale — built for TMS clinics, neurotech and brain-stimulation brands. Escrow-protected transfer, flexible terms.',
	locale: 'en_US',
	year: 2026,
} as const;

export const SALES_EMAIL = 'sales@desertrich.com';

export const PRICE = {
	amount: 100000,
	currency: 'USD',
	display: '$100,000',
} as const;

export const INQUIRY_ENDPOINT = '/api/inquiry';

export const CF_IMAGES = {
	hero: 'https://imagedelivery.net/-sPAUAWeA405NiWJ0SNIQA/49cd825d-d533-4755-1f24-9c1fd2786f00/public',
	science: 'https://imagedelivery.net/-sPAUAWeA405NiWJ0SNIQA/0ca3d9f3-d275-4cb1-f2ab-7e9f52ca1500/public',
	accountHash: '-sPAUAWeA405NiWJ0SNIQA',
} as const;

/**
 * Normalize any path to the site's canonical absolute URL.
 *
 * The site canonicalizes to the apex host with **no trailing slash**
 * (`https://brainlodestone.com`), and the sitemap + Worker redirects follow
 * the same rule so Google never sees a canonical/redirect disagreement.
 */
export function getCanonicalUrl(pathname: string): string {
	const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
	const withoutTrailingSlash =
		normalized.length > 1 && normalized.endsWith('/')
			? normalized.slice(0, -1)
			: normalized;
	const origin = SITE.url.replace(/\/$/, '');
	return `${origin}${withoutTrailingSlash === '/' ? '' : withoutTrailingSlash}`;
}

export function acquisitionMailto(subject?: string, body?: string): string {
	const params = new URLSearchParams();
	if (subject) params.set('subject', subject);
	if (body) params.set('body', body);
	const query = params.toString();
	return `mailto:${SALES_EMAIL}${query ? `?${query}` : ''}`;
}

export const DEFAULT_MAIL_SUBJECT = 'brainlodestone.com — Domain Acquisition Inquiry';

export const DEFAULT_MAIL_BODY = `Hello,

I am interested in acquiring the domain brainlodestone.com.

Intended use:
Budget range:
Timeline:

Best regards,
`;
