import globals from "globals";

export default [
	{
		ignores: [
			"**/*.min.js",
			"**/playwright-report/**/*",
			"**/test-results/**/*",
			"core/scripts/APIandLibraries/**/*",
			"core/scripts/serviceWorker/**",
			"node_modules/**/*",
		],
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
