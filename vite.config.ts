// import react from '@vitejs/plugin-react';
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react({
			babel: {
				plugins: [["babel-plugin-react-compiler", {}]],
			},
		}),
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
	build: {
		rolldownOptions: {
			output: {
				codeSplitting: {
					groups: [
						{
							name: "react",
							test: /node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//,
						},
						{
							name: "redux",
							test: /node_modules\/(@reduxjs\/toolkit|react-redux|redux|reselect|immer)\//,
						},
						{
							name: "mui",
							test: /node_modules\/(@mui|@emotion)\//,
						},
					],
				},
			},
		},
	},
});
