const CANONICAL_HOST = 'brainlodestone.com';

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		let shouldRedirect = false;

		if (url.hostname !== CANONICAL_HOST) {
			url.hostname = CANONICAL_HOST;
			shouldRedirect = true;
		}

		if (url.protocol === 'http:') {
			url.protocol = 'https:';
			shouldRedirect = true;
		}

		const { pathname } = url;
		if (
			pathname !== '/' &&
			!pathname.endsWith('/') &&
			!pathname.includes('.')
		) {
			url.pathname = `${pathname}/`;
			shouldRedirect = true;
		}

		if (shouldRedirect) {
			return Response.redirect(url.toString(), 301);
		}

		const response = await env.ASSETS.fetch(request);

		if (response.status === 404) {
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

interface Env {
	ASSETS: Fetcher;
}
