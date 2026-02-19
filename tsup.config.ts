import { defineConfig, type Options } from 'tsup';
import pkg from './package.json';

const bannerComment = `/*
 * 📦 ${pkg.name}
 *
 * 🏷️ Version:    ${pkg.version}
 * 📄 License:    ${pkg.license}
 * 🕒 Build:      ${new Date().toISOString()}
 * 🔗 Repository: ${pkg.repository}
 * 👤 Author:     ${pkg.author}
 * 👤 Maintainer: Julian Wowra <development@julianwowra.de>
 */\n`;

const sharedConfig: Options = {
	tsconfig: './tsconfig.json',
	entry: ['src/index.ts'],
	outDir: 'dist',
	target: 'es2024',
	sourcemap: true,

	clean: true,
	minify: true,
	treeshake: true,
	skipNodeModulesBundle: true,
	banner: {
		js: bannerComment
	}
};

export default defineConfig([
	// ESM
	{
		...sharedConfig,
		format: 'esm',
		platform: 'neutral',
		outDir: sharedConfig.outDir + '/esm',
		splitting: true,
		dts: false,
		outExtension: () => ({ js: '.mjs' })
	},

	// CommonJS
	{
		...sharedConfig,
		format: 'cjs',
		platform: 'node',
		outDir: sharedConfig.outDir + '/cjs',
		splitting: false,
		dts: false,
		outExtension: () => ({ js: '.cjs' })
	},

	// Types
	{
		...sharedConfig,
		outDir: sharedConfig.outDir + '/types',
		splitting: false,
		dts: {
			banner: bannerComment,
			only: true
		},
		outExtension: () => ({ dts: '.d.ts' })
	}
]);
