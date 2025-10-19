import { test, expect } from "@playwright/test";
import { testAccessibility } from "./utils/accessibility.js";

test.describe("SciGrade Homepage", () => {
	test.afterEach(async ({ page }) => {
		// Test accessibility on every page after each test
		await testAccessibility(page);
	});

	test("should load and display the main title", async ({ page }) => {
		await page.goto("http://localhost:3000");
		await expect(page).toHaveTitle(/SciGrade/i);
		await expect(page.locator("body")).toContainText(/SciGrade|gRNA|Primer|bioinformatics/i);
	});

	test("should display the gRNA sequence input page", async ({ page }) => {
		await page.goto("http://localhost:3000/");

		// Navigate through the initial UI steps
		await page.getByRole("button", { name: "Start" }).click();

		// Click on the 'Load Gene' button
		await page.getByRole("button", { name: "Load Gene" }).click();

		// Ensure that the sequence input element is present
		await expect(page.locator("#sequence_input")).toHaveCount(1);
	});
});
