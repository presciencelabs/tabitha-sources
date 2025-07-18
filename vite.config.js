import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
	],

	server: {
		host: 'localhost.tbta.bible',
		port: 8789,
	},
})
