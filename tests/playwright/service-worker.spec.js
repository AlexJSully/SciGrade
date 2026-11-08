import { test, expect } from "@playwright/test";

test.describe("Service Worker Registration and Failure Tolerance", () => {
	// Enable service workers to test real registration and fetch interception
	test.use({ serviceWorkers: "allow" });

	test("successfully registers service worker on homepage under healthy network conditions", async ({ page }) => {
		const pageErrors = [];
		page.on("pageerror", (err) => pageErrors.push(err));

		await page.goto("http://localhost:3000/");
		await expect(page).toHaveTitle(/SciGrade/i);

		// Wait for the service worker registration to complete
		await expect
			.poll(async () => {
				return await page.evaluate(async () => {
					if (!("serviceWorker" in navigator)) return false;
					const regs = await navigator.serviceWorker.getRegistrations();
					return regs.length > 0;
				});
			})
			.toBe(true);

		expect(pageErrors).toHaveLength(0);
	});

	test("successfully registers service worker on systemrun page under healthy network conditions", async ({
		page,
	}) => {
		const pageErrors = [];
		page.on("pageerror", (err) => pageErrors.push(err));

		await page.goto("http://localhost:3000/core/systemrun.html");
		await expect(page).toHaveTitle(/SciGrade/i);

		// Wait for the service worker registration to complete
		await expect
			.poll(async () => {
				return await page.evaluate(async () => {
					if (!("serviceWorker" in navigator)) return false;
					const regs = await navigator.serviceWorker.getRegistrations();
					return regs.length > 0;
				});
			})
			.toBe(true);

		expect(pageErrors).toHaveLength(0);
	});

	test("gracefully handles service worker fetch abortion without unhandled rejections (Issue #91)", async ({
		context,
		page,
	}) => {
		const pageErrors = [];
		page.on("pageerror", (err) => pageErrors.push(err));

		// Intercept and abort the service worker script request (simulating transient network drops or ad-blockers)
		await context.route("**/sw.js", (route) => route.abort());

		await page.goto("http://localhost:3000/");
		await expect(page).toHaveTitle(/SciGrade/i);

		// Allow async events to settle
		await page.waitForTimeout(500);

		// Verify no unhandledrejection or TypeError was thrown to the page
		const swErrors = pageErrors.filter((err) => err.message.includes("ServiceWorker"));
		expect(swErrors).toHaveLength(0);
		expect(pageErrors).toHaveLength(0);

		// Core functionality remains intact
		await page.getByRole("button", { name: "Start" }).click();
		await expect(page).toHaveURL(/systemrun\.html/);
	});

	test("gracefully handles HTTP 500 error when fetching service worker script (Issue #77)", async ({
		context,
		page,
	}) => {
		const pageErrors = [];
		page.on("pageerror", (err) => pageErrors.push(err));

		// Intercept and return HTTP 500 for the service worker script
		await context.route("**/sw.js", (route) =>
			route.fulfill({
				status: 500,
				contentType: "text/plain",
				body: "Internal Server Error",
			}),
		);

		await page.goto("http://localhost:3000/core/systemrun.html");
		await expect(page).toHaveTitle(/SciGrade/i);

		// Allow async events to settle
		await page.waitForTimeout(500);

		// Verify no unhandledrejection or TypeError was thrown to the page
		const swErrors = pageErrors.filter((err) => err.message.includes("ServiceWorker"));
		expect(swErrors).toHaveLength(0);
		expect(pageErrors).toHaveLength(0);
	});
});
