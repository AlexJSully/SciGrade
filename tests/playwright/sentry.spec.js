import { test, expect } from "@playwright/test";

test.describe("Sentry SDK Initialization and Failure Tolerance", () => {
	// Block service worker to ensure network route interceptors take effect
	test.use({ serviceWorkers: "block" });

	test("loads homepage without uncaught Sentry page errors", async ({ page }) => {
		const pageErrors = [];
		page.on("pageerror", (err) => pageErrors.push(err));

		await page.goto("http://localhost:3000/");
		await expect(page).toHaveTitle(/SciGrade/i);

		expect(pageErrors).toHaveLength(0);
	});

	test("loads systemrun page without uncaught Sentry page errors", async ({ page }) => {
		const pageErrors = [];
		page.on("pageerror", (err) => pageErrors.push(err));

		await page.goto("http://localhost:3000/core/systemrun.html");
		await expect(page).toHaveTitle(/SciGrade/i);

		expect(pageErrors).toHaveLength(0);
	});

	test("gracefully handles captureconsole.min.js load failure without throwing TypeError (Regression 7771953909)", async ({
		page,
	}) => {
		const pageErrors = [];
		page.on("pageerror", (err) => pageErrors.push(err));

		// Simulate captureconsole.min.js failing to load (e.g., ad blocker, network drop, or CDN outage)
		await page.route("**/captureconsole.min.js", (route) => route.abort());

		await page.goto("http://localhost:3000/");
		await expect(page).toHaveTitle(/SciGrade/i);

		// Verify no TypeError: Sentry.captureConsoleIntegration is not a function was thrown
		const captureErrors = pageErrors.filter((err) => err.message.includes("captureConsoleIntegration"));
		expect(captureErrors).toHaveLength(0);
		expect(pageErrors).toHaveLength(0);
	});

	test("gracefully handles total Sentry CDN blockage without breaking application", async ({ page }) => {
		const pageErrors = [];
		page.on("pageerror", (err) => pageErrors.push(err));

		// Simulate client ad blocker blocking all Sentry domains
		await page.route("**/*sentry*/**", (route) => route.abort());

		await page.goto("http://localhost:3000/");
		await expect(page).toHaveTitle(/SciGrade/i);

		// Core application navigation should still work even if Sentry is blocked
		await page.getByRole("button", { name: "Start" }).click();
		await expect(page).toHaveURL(/systemrun\.html/);

		expect(pageErrors).toHaveLength(0);
	});
});
