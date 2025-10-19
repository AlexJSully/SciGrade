import eslintPluginPrettier from "eslint-plugin-prettier";
import globals from "globals";

export default [
	{
		ignores: ["node_modules/**/*", "core/scripts/APIandLibraries/**/*", "**/*.min.js"],
	},
	{
		languageOptions: {
			ecmaVersion: 2021,
			sourceType: "module",
			globals: {
				...globals.browser,
				...globals.jest,
				...globals.node,
			},
		},
		plugins: {
			eslintPluginPrettier,
		},
		rules: {
			camelcase: "off",
			indent: ["error", "tab"],
			"no-alert": "off",
			"no-console": "off",
			"no-continue": "off",
			"no-param-reassign": "off",
			"no-restricted-syntax": "off",
			"no-undef": "off",
			"no-unused-vars": "off",
			"no-use-before-define": "off",
			"eslintPluginPrettier/prettier": "error",
			semi: ["error", "always"],
		},
	},
	// Jest-specific configuration for test files
	{
		files: ["**/*.test.js", "**/test/**/*.js"],
		languageOptions: {
			globals: {
				...globals.jest,
			},
		},
	},
	// Playwright-specific configuration for e2e test files
	{
		files: ["**/playwright/**/*.js", "**/*.spec.js"],
		languageOptions: {
			globals: {
				...globals.node,
				// Playwright test runner globals
				test: true,
				expect: true,
				beforeAll: true,
				afterAll: true,
				beforeEach: true,
				afterEach: true,
			},
		},
	},
];
