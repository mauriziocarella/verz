import {defineConfig, globalIgnores} from 'eslint/config';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default defineConfig([
	globalIgnores(['**/node_modules/', '**/dist/', '**/.next/']),
	js.configs.recommended,
	ts.configs.recommended,
	{
		plugins: {
			prettier: prettierPlugin,
		},
		rules: {
			'prettier/prettier': 'error',
			'@typescript-eslint/no-this-alias': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
		},
	},
	prettier,
]);
