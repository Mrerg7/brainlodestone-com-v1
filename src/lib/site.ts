export const SITE = {
	name: 'brainlodestone.com',
	domain: 'brainlodestone.com',
	url: 'https://brainlodestone.com',
	tagline: 'The definitive digital address for the future of brain stimulation.',
	description:
		'Acquire brainlodestone.com — the perfect premium .com domain for Transcranial Magnetic Stimulation (TMS), neurotechnology, mental health clinics, and brain stimulation innovation. Instant brand authority in a rapidly growing market.',
	locale: 'en_US',
	year: 2026,
} as const;

export const SALES_EMAIL = 'sales@desertrich.com';

export const CF_IMAGES = {
	hero: 'https://imagedelivery.net/-sPAUAWeA405NiWJ0SNIQA/668523b4-17ba-495b-cb9b-a6dce4cc8600/public',
	science: 'https://imagedelivery.net/-sPAUAWeA405NiWJ0SNIQA/0ca3d9f3-d275-4cb1-f2ab-7e9f52ca1500/public',
	brand: 'https://imagedelivery.net/-sPAUAWeA405NiWJ0SNIQA/83be0a60-8638-45d7-125c-d95aa4503200/public',
	accountHash: '-sPAUAWeA405NiWJ0SNIQA',
} as const;

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
