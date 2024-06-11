import { defineConfig } from 'vite'

export default defineConfig({
	// https://vitejs.dev/guide/static-deploy.html#github-pages
	base: '/Reversi/',
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
