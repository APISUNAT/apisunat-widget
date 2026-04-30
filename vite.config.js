import { sveltekit } from '@sveltejs/kit/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
	if (mode === 'element') {
		return {
			define: {
				'process.env.NODE_ENV': JSON.stringify('production')
			},
			plugins: [
				svelte({
					compilerOptions: {
						customElement: true,
						runes: true
					}
				})
			],
			build: {
				cssCodeSplit: false,
				lib: {
					entry: 'src/lib/buildeador.svelte',
					formats: ['es'],
					fileName: () => 'sunat-invoice.js'
				},
				rollupOptions: {
					output: {
						assetFileNames: 'assets/[name][extname]'
					}
				}
			}
		};
	}

	return {
		plugins: [sveltekit()]
	};
});
