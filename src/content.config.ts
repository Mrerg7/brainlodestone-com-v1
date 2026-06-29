import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const useCases = defineCollection({
	loader: glob({ pattern: '**/*.json', base: './src/content/use-cases' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		icon: z.enum(['magnet', 'search', 'globe', 'handshake', 'shield', 'rocket']),
		order: z.number(),
	}),
});

const marketStats = defineCollection({
	loader: glob({ pattern: '**/*.json', base: './src/content/market-stats' }),
	schema: z.object({
		value: z.string(),
		label: z.string(),
		order: z.number(),
	}),
});

const trustPoints = defineCollection({
	loader: glob({ pattern: '**/*.json', base: './src/content/trust-points' }),
	schema: z.object({
		text: z.string(),
		order: z.number(),
	}),
});

const valuePillars = defineCollection({
	loader: glob({ pattern: '**/*.json', base: './src/content/value-pillars' }),
	schema: z.object({
		number: z.string(),
		title: z.string(),
		description: z.string(),
		icon: z.enum(['magnet', 'search', 'globe', 'handshake', 'shield', 'rocket']),
		order: z.number(),
	}),
});

export const collections = { useCases, marketStats, trustPoints, valuePillars };
