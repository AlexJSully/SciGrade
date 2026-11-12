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

	test("removes the legacy /core/scripts/serviceWorker/ worker and its precache", async ({
		context,
		page,
		browserName,
	}) => {
		test.skip(
			browserName === "firefox",
			"Playwright's Firefox build does not route service worker scripts, so the legacy stand-in below cannot be served.",
		);

		const legacyScope = "http://localhost:3000/core/scripts/serviceWorker/";
		const legacyCache = `workbox-precache-v2-${legacyScope}`;

		// The legacy worker file no longer exists, so serve a stand-in at its old path. It caches
		// nothing itself, so only the test below creates the legacy precache.
		await context.route("**/core/scripts/serviceWorker/sw.js", (route) =>
			route.fulfill({ status: 200, contentType: "application/javascript", body: "// legacy stand-in" }),
		);

		// Build the returning-visitor state on a same-origin page that does not run the registration
		// helper: an activated legacy worker and its precache.
		await page.goto("http://localhost:3000/robots.txt");
		await page.evaluate(async (cacheName) => {
			const registration = await navigator.serviceWorker.register("/core/scripts/serviceWorker/sw.js");
			const worker = registration.installing || registration.waiting || registration.active;
			if (worker.state !== "activated") {
				await new Promise((resolve) => {
					worker.addEventListener("statechange", () => worker.state === "activated" && resolve());
				});
			}
			await (await caches.open(cacheName)).put("/legacy-entry", new Response("legacy"));
		}, legacyCache);

		// Open the homepage and await one full pass of its registration helper, cleanup included.
		await page.goto("http://localhost:3000/");
		const state = await page.evaluate(async (cacheName) => {
			await window.registerServiceWorker("/sw.js");
			const regs = await navigator.serviceWorker.getRegistrations();
			return { scopes: regs.map((reg) => reg.scope).sort(), legacyCacheExists: await caches.has(cacheName) };
		}, legacyCache);

		expect(state).toEqual({ scopes: ["http://localhost:3000/"], legacyCacheExists: false });
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
