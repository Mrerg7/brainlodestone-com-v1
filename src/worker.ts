const CANONICAL_HOST = 'brainlodestone.com';

/**
 * Canonical URLs on this site use the apex host with no trailing slash
 * (`https://brainlodestone.com`), matching `<link rel="canonical">` and the
 * sitemap. The Worker therefore strips trailing slashes instead of adding
 * them, so a redirect target can never disagree with the declared canonical.
 *
 * Cloudflare's asset layer also canonicalizes the custom 404 page to `/404`
 * (issuing a 307 from `/404.html`), so that spelling is folded onto `/404`.
 */
const NOT_FOUND_PATH = '/404';
const API_PREFIX = '/api/';

const SALES_EMAIL = 'sales@desertrich.com';
const SENDER = {
	email: 'inquiries@brainlodestone.com',
	name: 'brainlodestone.com — Domain Inquiry',
};

const MAX_BODY_BYTES = 10_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

const requestLog = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
	const now = Date.now();
	const hits = (requestLog.get(key) ?? []).filter(
		(t) => now - t < RATE_LIMIT_WINDOW_MS,
	);
	if (hits.length >= RATE_LIMIT_MAX) {
		requestLog.set(key, hits);
		return true;
	}
	hits.push(now);
	requestLog.set(key, hits);
	if (requestLog.size > 5_000) {
		for (const [k, v] of requestLog) {
			if (v.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) requestLog.delete(k);
		}
	}
	return false;
}

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'cache-control': 'no-store',
		},
	});
}

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

interface Inquiry {
	name: string;
	email: string;
	phone?: string;
	use?: string;
	message?: string;
	website?: string;
}

function clean(value: unknown, max: number): string {
	if (typeof value !== 'string') return '';
	return value.replace(/\s+/g, ' ').trim().slice(0, max);
}

function isValidEmail(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 254;
}

async function handleInquiry(
	request: Request,
	env: Env,
	expectedOrigin: string,
): Promise<Response> {
	if (request.method !== 'POST') {
		return json({ ok: false, error: 'Method not allowed' }, 405);
	}

	const origin = request.headers.get('origin');
	if (origin && origin !== expectedOrigin) {
		return json({ ok: false, error: 'Forbidden origin' }, 403);
	}

	const ip =
		request.headers.get('cf-connecting-ip') ??
		request.headers.get('x-forwarded-for') ??
		'unknown';
	if (isRateLimited(ip)) {
		return json(
			{ ok: false, error: 'Too many requests. Please try again shortly.' },
			429,
		);
	}

	const length = Number(request.headers.get('content-length') ?? '0');
	if (length > MAX_BODY_BYTES) {
		return json({ ok: false, error: 'Payload too large' }, 413);
	}

	let body: Inquiry;
	try {
		body = (await request.json()) as Inquiry;
	} catch {
		return json({ ok: false, error: 'Invalid request body' }, 400);
	}

	// Honeypot: silently accept and drop bot submissions.
	if (clean(body.website, 200)) {
		return json({ ok: true });
	}

	const name = clean(body.name, 120);
	const email = clean(body.email, 254);
	const phone = clean(body.phone, 40);
	const use = clean(body.use, 120);
	const message = clean(body.message, 4000);

	if (!name || !isValidEmail(email)) {
		return json({ ok: false, error: 'Please provide your name and a valid email.' }, 400);
	}

	const subject = `brainlodestone.com — Domain inquiry from ${name}`;
	const rows = [
		['Name', name],
		['Email', email],
		['Phone', phone || '—'],
		['Intended use', use || '—'],
	]
		.map(([label, value]) => `<tr><th style="text-align:left;padding:6px 16px 6px 0;color:#64748b;font-weight:600">${label}</th><td style="padding:6px 0">${escapeHtml(value)}</td></tr>`)
		.join('');

	const html = `<!doctype html><html><body style="font-family:system-ui,sans-serif;line-height:1.6;color:#0f172a">
<h2 style="margin:0 0 4px">New domain inquiry — brainlodestone.com</h2>
<p style="margin:0 0 16px;color:#64748b">Submitted ${new Date().toISOString()}</p>
<table style="border-collapse:collapse;width:100%;max-width:560px">${rows}</table>
${message ? `<h3 style="margin:20px 0 6px">Message</h3><p style="white-space:pre-wrap;margin:0">${escapeHtml(message)}</p>` : ''}
<p style="margin:24px 0 0;color:#64748b;font-size:13px">Reply directly to this email to reach ${escapeHtml(name)}.</p>
</body></html>`;

	const text = [
		'New domain inquiry — brainlodestone.com',
		`Submitted ${new Date().toISOString()}`,
		'',
		`Name:         ${name}`,
		`Email:        ${email}`,
		`Phone:        ${phone || '-'}`,
		`Intended use: ${use || '-'}`,
		'',
		message ? `Message:\n${message}` : '(no message)',
	].join('\n');

	try {
		await env.EMAIL.send({
			to: SALES_EMAIL,
			from: SENDER,
			replyTo: { email, name },
			subject,
			html,
			text,
		});
	} catch (error) {
		const code = error instanceof Error ? error.message : 'unknown';
		console.error('inquiry send failed', code);
		return json(
			{ ok: false, error: 'Unable to send right now. Please email us directly.' },
			502,
		);
	}

	return json({ ok: true });
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		let shouldRedirect = false;

		const isLocalhost =
			url.hostname === 'localhost' || url.hostname === '127.0.0.1';

		if (!isLocalhost && url.hostname !== CANONICAL_HOST) {
			url.hostname = CANONICAL_HOST;
			shouldRedirect = true;
		}

		if (!isLocalhost && url.protocol === 'http:') {
			url.protocol = 'https:';
			shouldRedirect = true;
		}

		const { pathname } = url;

		if (pathname === '/404/' || pathname === '/404.html') {
			url.pathname = NOT_FOUND_PATH;
			shouldRedirect = true;
		}
		// Everything else falls through to the asset layer: the canonical spelling
		// is the path itself (no trailing slash), so an unknown path must 404
		// rather than redirect to a trailing-slash twin that also 404s.

		if (shouldRedirect) {
			return Response.redirect(url.toString(), 301);
		}

		if (pathname === '/api/inquiry') {
			return handleInquiry(
				request,
				env,
				`${url.protocol}//${url.host}`,
			);
		}
		if (pathname.startsWith(API_PREFIX)) {
			return json({ ok: false, error: 'Not found' }, 404);
		}

		const response = await env.ASSETS.fetch(request);

		// `/404` can resolve as a normal asset hit; it must always be a real 404.
		const isNotFound =
			response.status === 404 ||
			(pathname === NOT_FOUND_PATH && response.status === 200);

		if (isNotFound) {
			const headers = new Headers(response.headers);
			headers.set('X-Robots-Tag', 'noindex, nofollow');
			return new Response(response.body, {
				status: 404,
				statusText: 'Not Found',
				headers,
			});
		}

		return response;
	},
} satisfies ExportedHandler<Env>;
