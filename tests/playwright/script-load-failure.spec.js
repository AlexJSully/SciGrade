import { test, expect } from "@playwright/test";

/**
 * Regression guard for Issue #77: when a script or data file the runtime page needs fails to load,
 * the page used to throw an unhandled `ReferenceError` (for example
 * `loadCRISPRJSON_Files is not defined`) or leave the user with an empty, disabled selection form.
 */
test.describe("Application script load failure", () => {
	// Block the service worker so its cache cannot serve the file and bypass the route below.
	test.use({ serviceWorkers: "block" });

	const cases = [
		{ file: "runtime.min.js", route: "**/core/scripts/runtime.min.js", selectionFormBuilt: false },
		{ file: "crispr_scripts.min.js", route: "**/core/scripts/crispr_scripts.min.js", selectionFormBuilt: true },
		{ file: "gene_background_info.json", route: "**/gene_background_info.json", selectionFormBuilt: true },
	];

	for (const { file, route, selectionFormBuilt } of cases) {
		test(`shows a reload alert without a page error when ${file} returns HTTP 500`, async ({ page }) => {
			const pageErrors = [];
			page.on("pageerror", (err) => pageErrors.push(err));

			await page.route(route, (request) =>
				request.fulfill({ status: 500, contentType: "text/plain", body: "Internal Server Error" }),
			);

			await page.goto("http://localhost:3000/core/systemrun.html");

			await expect(page.getByRole("alert")).toHaveText(
				"SciGrade could not finish loading. Please reload the page.",
			);
			if (selectionFormBuilt) {
				await expect(page.getByRole("button", { name: "Load Gene" })).toBeDisabled();
			}
			expect(pageErrors).toHaveLength(0);
		});
	}
});
