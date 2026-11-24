import { test, expect } from "@playwright/test";
import { testAccessibility } from "./utils/accessibility.js";
import { selectGeneAndOpenForm } from "./utils/navigation.js";

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

	test("should not load jQuery or Bootstrap JavaScript, which only the application page uses", async ({ page }) => {
		const requested = [];
		page.on("request", (request) => requested.push(new URL(request.url()).pathname));

		await page.goto("http://localhost:3000/", { waitUntil: "load" });

		expect(requested.filter((path) => /\/(jquery|bootstrap)[^/]*\.js$/.test(path))).toEqual([]);
		await expect(page.getByRole("button", { name: "Start" })).toBeVisible();
	});

	test("should display the gRNA sequence input page", async ({ page }) => {
		await page.goto("http://localhost:3000/");

		// Navigate through the initial UI steps
		await page.getByRole("button", { name: "Start" }).click();

		// Wait for the gene list to load, then load a gene and render the form.
		// (Waiting before clicking "Load Gene" is what fixes the historical flake.)
		await selectGeneAndOpenForm(page);

		// Ensure that the sequence input element is present
		await expect(page.locator("#sequence_input")).toHaveCount(1);
	});
});
