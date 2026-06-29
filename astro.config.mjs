import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

const site = 'https://brainlodestone.com';

export default defineConfig({
	site,
	output: 'static',
	trailingSlash: 'always',
	image: {
		domains: ['imagedelivery.net'],
	},
	vite: {
		plugins: [tailwindcss()],
	},
	integrations: [
		sitemap({
			filter: (page) => !page.includes('404'),
		}),
	],
});
