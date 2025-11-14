import adapter from '@sveltejs/adapter-netlify';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter({
			edge: false,
			split: false
		}),
		alias: {
			'@icons': path.resolve('./src/lib/Icons'),
			'@': path.resolve('./src/lib/components')
		},
		output: {
			preloadStrategy: 'preload-js'
		}
	}
};

export default config;
