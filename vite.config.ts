import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
	// https://vitejs.dev/guide/static-deploy.html#github-pages
	base: '/Reversi/',
	plugins: [svelte()],
	build: {
		terserOptions: {
			compress: {
				global_defs: {
					DEBUG: false,
				},
			},
		},
	},
})
