import { injectAxe, checkA11y, getViolations } from "axe-playwright";

// Accessibility Testing Helper
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
