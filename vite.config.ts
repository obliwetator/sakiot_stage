// import react from '@vitejs/plugin-react';
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		visualizer({
			filename: "dist/stats.html",
			gzipSize: true,
			brotliSize: true,
		}),
	],
	server: {
		port: 8081,
		allowedHosts: [
			"staging.patrykstyla.com",
			"dev.patrykstyla.com",
			"patrykstyla.com",
		],
	},
});
