/** @type {import('next').NextConfig} */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
	webpack: (config) => {
		config.resolve.alias = {
			...(config.resolve.alias || {}),
			'@repo/forms': path.resolve(__dirname, 'forms'),
		};
		return config;
	},
};

export default nextConfig;
