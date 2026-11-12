import { test, expect } from "@playwright/test";

/**
 * Regression guard for Issue #77: when crispr_scripts.min.js fails to load, redirectCRISPR()
 * used to reject with an unhandled `ReferenceError: loadCRISPRJSON_Files is not defined`
 * and left the user with an empty, disabled selection form.
 */
test.describe("Application script load failure", () => {
	// Block the service worker so its cache cannot serve the script and bypass the route below.
	test.use({ serviceWorkers: "block" });

	test("shows a reload alert without a page error when crispr_scripts.min.js returns HTTP 500", async ({ page }) => {
		const pageErrors = [];
		page.on("pageerror", (err) => pageErrors.push(err));

		await page.route("**/core/scripts/crispr_scripts.min.js", (route) =>
			route.fulfill({ status: 500, contentType: "text/plain", body: "Internal Server Error" }),
		);

		await page.goto("http://localhost:3000/core/systemrun.html");

		await expect(page.getByRole("alert")).toHaveText("SciGrade could not finish loading. Please reload the page.");
		await expect(page.getByRole("button", { name: "Load Gene" })).toBeDisabled();
		expect(pageErrors).toHaveLength(0);
	});
});
