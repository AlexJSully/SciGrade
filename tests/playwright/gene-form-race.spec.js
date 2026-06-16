import { test, expect } from "@playwright/test";

/**
 * Regression guard for the historical flake where clicking "Load Gene" before the
 * async gene-data fetch resolved produced a wasted one-shot click and #sequence_input
 * never rendered.
 *
 * This test deliberately does NOT use the selectGeneAndOpenForm() helper: it relies on
 * the app-level gating (the button is disabled until the gene list loads) plus
 * Playwright's actionability auto-wait. So it fails if either the app gate is removed
 * or the form stops rendering under a slow fetch.
 */
test.describe("Gene form race hardening", () => {
	// Block the service worker so its cache cannot serve the JSON and bypass the
	// route delay below — we need the delay to actually apply.
	test.use({ serviceWorkers: "block" });

	test("Load Gene is gated until gene data finishes loading", async ({ page }) => {
		// Force the race: delay the gene-data fetch so the dropdown populates late.
		await page.route("**/gene_background_info.json", async (route) => {
			await new Promise((resolve) => setTimeout(resolve, 2000));
			await route.continue();
		});

		await page.goto("http://localhost:3000/core/systemrun.html");

		// App gating: the button must be disabled while data is still loading.
		// (Catches removal of the gate — without it, this assertion fails.)
		await expect(page.getByRole("button", { name: "Load Gene" })).toBeDisabled();

		// Once the fetch resolves, the button enables; the click auto-waits for that,
		// then the work form must render — proving the click is never wasted.
		await page.getByRole("button", { name: "Load Gene" }).click();
		await expect(page.locator("#sequence_input")).toHaveCount(1);
	});
});
