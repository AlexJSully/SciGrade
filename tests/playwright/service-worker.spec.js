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

	test("controls the systemrun page from the site root scope after a reload", async ({ page, browserName }) => {
		test.skip(
			browserName === "firefox",
			"Playwright's Firefox build hangs navigating a service-worker-controlled page; stock Firefox 160 does not.",
		);

		await page.goto("http://localhost:3000/core/systemrun.html");

		const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
		expect(scope).toBe("http://localhost:3000/");

		await page.reload();
		const controllerUrl = await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL ?? null);
		expect(controllerUrl).toBe("http://localhost:3000/sw.js");
	});

	test("removes the legacy /core/scripts/serviceWorker/ worker and its precache", async ({ page, browserName }) => {
		test.skip(
			browserName === "firefox",
			"Playwright's Firefox build hangs evaluating in a page while a service worker installs; stock Firefox 160 does not.",
		);

		const legacyScope = "http://localhost:3000/core/scripts/serviceWorker/";
		const legacyCache = `workbox-precache-v2-${legacyScope}`;

		// Build the returning-visitor state on a same-origin page that does not run the registration
		// helper, so no cleanup races the setup. The legacy worker file no longer exists, and cleanup
		// identifies the legacy worker by its scope, so register the current script with that scope.
		await page.goto("http://localhost:3000/robots.txt");
		await page.evaluate(
			async ({ scope, cacheName }) => {
				await navigator.serviceWorker.register("/sw.js", { scope });
				await (await caches.open(cacheName)).put("/legacy-entry", new Response("legacy"));
			},
			{ scope: legacyScope, cacheName: legacyCache },
		);

		// Open the homepage and await one full pass of its registration helper, cleanup included.
		// caches.delete is observed rather than caches.has: the stand-in worker may still be
		// installing and rewrite its precache after cleanup, which an activated legacy worker cannot.
		await page.goto("http://localhost:3000/");
		const state = await page.evaluate(async () => {
			const deletedCaches = [];
			const deleteCache = caches.delete.bind(caches);
			caches.delete = (name) => {
				deletedCaches.push(name);
				return deleteCache(name);
			};
			await window.registerServiceWorker("/sw.js");
			const regs = await navigator.serviceWorker.getRegistrations();
			// The load-time registration also runs cleanup, so a cache can be deleted twice.
			return { scopes: regs.map((reg) => reg.scope).sort(), deletedCaches: [...new Set(deletedCaches)] };
		});

		expect(state).toEqual({ scopes: ["http://localhost:3000/"], deletedCaches: [legacyCache] });
	});

	test("gracefully handles service worker fetch abortion without unhandled rejections (Issue #91)", async ({
		context,
		page,
	}) => {
		const pageErrors = [];
		page.on("pageerror", (err) => pageErrors.push(err));

		// Intercept and abort the service worker fetch before navigation
		await context.route("**/sw.js", async (route, request) => {
			await route.abort("failed");
		});

		await page.goto("http://localhost:3000/");
		await expect(page).toHaveTitle(/SciGrade/i);

		// Wait for window load event (triggers SW registration via registerServiceWorker)
		await page.waitForLoadState("load");

		// Wait for any async service worker registration to settle
		await page.waitForTimeout(2000);

		// Verify no unhandledrejection or TypeError was thrown to the page
		const swErrors = pageErrors.filter((err) => err.message.includes("ServiceWorker"));
		expect(swErrors).toHaveLength(0);
		expect(pageErrors).toHaveLength(0);

		// Core functionality remains intact - app should work even without SW
		await page.getByRole("button", { name: "Start" }).click();
		await expect(page).toHaveURL(/systemrun\.html/);
	});

	test("gracefully handles HTTP 500 error when fetching service worker script (Issue #77)", async ({
		context,
		page,
	}) => {
		const pageErrors = [];
		page.on("pageerror", (err) => pageErrors.push(err));

		// Intercept and fulfill the service worker fetch with a 500 error before navigation
		await context.route("**/sw.js", async (route, request) => {
			return route.fulfill({
				status: 500,
				contentType: "text/plain",
				body: "Internal Server Error",
			});
		});

		await page.goto("http://localhost:3000/core/systemrun.html");
		await expect(page).toHaveTitle(/SciGrade/i);

		// Wait for window load event (triggers SW registration via registerServiceWorker)
		await page.waitForLoadState("load");

		// Wait for any async service worker registration to settle
		await page.waitForTimeout(2000);

		// Verify no unhandledrejection or TypeError was thrown to the page
		const swErrors = pageErrors.filter((err) => err.message.includes("ServiceWorker"));
		expect(swErrors).toHaveLength(0);
		expect(pageErrors).toHaveLength(0);
	});
});
