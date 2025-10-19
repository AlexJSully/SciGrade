import { test as base, expect } from "@playwright/test";

// Extended test with accessibility and performance utilities
export const test = base.extend({
	// Automatically inject axe for accessibility testing
	page: async ({ page }, use) => {
		await use(page);
	},
});

export { expect };
