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

		return env.ASSETS.fetch(request);
	},
} satisfies ExportedHandler<Env>;

interface Env {
	ASSETS: Fetcher;
}
