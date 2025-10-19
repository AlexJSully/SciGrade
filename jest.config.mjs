/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
	coverageProvider: "v8",
	setupFilesAfterEnv: ["<rootDir>/tests/jest/setupTest.js"],
	testEnvironment: "jsdom",
	testMatch: ["**/__tests__/**/*.?([mc])[jt]s?(x)", "**/?(*.)+(test).?([mc])[jt]s?(x)"],
	testPathIgnorePatterns: ["/node_modules/", "/core/scripts/APIandLibraries/", "\\.min\\.js$"],
	verbose: true,
};

export default config;
