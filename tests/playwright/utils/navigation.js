/**
 * Shared navigation helpers for the Playwright e2e suite.
 */

/**
 * Waits until fillGeneList() has filled the gene dropdown, which it does after the async JSON load completes.
 * @param {import('@playwright/test').Page} page - Page showing core/systemrun.html
 */
export async function waitForGeneList(page) {
	await page.waitForFunction(() => document.getElementById("gene_dropdown_selection")?.options.length > 0);
}

/**
 * From the runtime page (core/systemrun.html, however it was reached), wait for the
 * gene dropdown to be populated, select a gene, load it, and wait for the work form
 * to render.
 *
 * The wait on `options.length > 0` is the key to avoiding the historical flake: the
 * dropdown is filled by fillGeneList() only after an async JSON load, and clicking
 * "Load Gene" before that resolves is a wasted one-shot click that never builds the
 * form (see core/scripts/runtime.js / crispr_scripts.js).
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} [gene="eBFP"] - value of the gene to select from the dropdown
 */
export async function selectGeneAndOpenForm(page, gene = "eBFP") {
	await waitForGeneList(page);

	await page.selectOption("#gene_dropdown_selection", gene);

	// The button is disabled until the gene list is populated; clicking now is safe
	await page.getByRole("button", { name: "Load Gene" }).click();

	// loadWork() appends the form (including #sequence_input) into #work
	await page.waitForSelector("#sequence_input", { state: "visible" });
}
