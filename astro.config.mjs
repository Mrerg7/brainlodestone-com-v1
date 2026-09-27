import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

const site = 'https://brainlodestone.com';

export default defineConfig({
	site,
	// Canonical URLs, the sitemap and the Worker's redirect policy all agree on
	// the apex host with no trailing slash (except the bare root path, which the
	// HTTP spec requires to be "/"). `never` is what makes @astrojs/sitemap strip
	// the trailing slash from <loc> — see write-sitemap.js.
	trailingSlash: 'never',
	image: {
		domains: ['imagedelivery.net'],
	},
	vite: {
		plugins: [tailwindcss()],
	},
	integrations: [
		sitemap({
			filter: (page) => !page.includes('404'),
			serialize(item) {
				item.url = item.url.replace(/\/$/, '');
				return item;
			},
		}),
	],
});
