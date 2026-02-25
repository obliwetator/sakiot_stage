// import react from '@vitejs/plugin-react';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		port: 8081,
		allowedHosts: ['staging.patrykstyla.com', 'dev.patrykstyla.com', 'patrykstyla.com'],
	},
});
