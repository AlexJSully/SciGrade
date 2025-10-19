// @ts-check
import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/** Android Devices to test on */
const androidDeviceList = [
	"Galaxy A55",
	"Galaxy A55 landscape",
	"Nexus 6",
	"Nexus 6 landscape",
	"Nexus 6P",
	"Nexus 6P landscape",
	"Pixel 3",
	"Pixel 3 landscape",
	"Pixel 7",
	"Pixel 7 landscape",
];

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	testDir: "./tests/playwright/",
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [["list"], ["html"], ["json", { outputFile: "test-results/results.json" }]],
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('')`. */
		// baseURL: 'http://localhost:3000',

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: "on-first-retry",
		screenshot: "only-on-failure",
		video: "retain-on-failure",
	},

	/* Configure projects for major browsers */
	projects: [
		// Desktop Browsers - Chromium
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
			},
		},
		{
			name: "chromium:hiDPI",
			use: {
				...devices["Desktop Chrome HiDPI"],
			},
		},

		// Desktop Browsers - Firefox
		{
			name: "firefox",
			use: {
				...devices["Desktop Firefox"],
			},
		},
		{
			name: "firefox:hiDPI",
			use: {
				...devices["Desktop Firefox HiDPI"],
			},
		},

		// Desktop Browsers - WebKit (Safari)
		{
			name: "webkit",
			use: { ...devices["Desktop Safari"] },
		},

		// Microsoft Edge
		{
			name: "edge",
			use: {
				...devices["Desktop Edge"],
			},
		},
		{
			name: "edge:hiDPI",
			use: {
				...devices["Desktop Edge HiDPI"],
			},
		},

		// iOS
		{
			name: "iOS:iPhone 14 Pro",
			use: {
				...devices["iPhone 14 Pro"],
			},
		},
		{
			name: "iOS:iPad Pro 11",
			use: {
				...devices["iPad Pro 11"],
			},
		},
		{
			name: "iOS:iPad Pro 11 landscape",
			use: {
				...devices["iPad Pro 11 landscape"],
			},
		},

		// Android
		...androidDeviceList.map((deviceName) => ({
			name: `Android:${deviceName}`,
			use: {
				...devices[deviceName],
			},
		})),
	],

	/* Run your local dev server before starting the tests */
	webServer: {
		command: "npm run start",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
});
