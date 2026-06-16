import { injectAxe, checkA11y, getViolations } from "axe-playwright";

/**
 * Run an axe accessibility check against a page, throwing on violations.
 * @param {import("@playwright/test").Page} page - Playwright page to audit
 * @param {string} [url] - Optional URL to navigate to before auditing
 * @returns {Promise<void>}
 */
export async function testAccessibility(page, url) {
	if (url) {
		await page.goto(url);
	}

	await injectAxe(page);

	try {
		await checkA11y(page, undefined, {
			detailedReport: true,
			detailedReportOptions: {
				html: true,
			},
			verbose: false,
			axeOptions: {
				rules: {
					"page-has-heading-one": { enabled: false },
					region: { enabled: false },
				},
			},
		});
	} catch (e) {
		const violations = await getViolations(page);
		console.error("Accessibility violations found:", violations);
		throw e;
	}
}
