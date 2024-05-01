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
];
