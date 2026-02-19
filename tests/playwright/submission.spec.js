import { test, expect } from "@playwright/test";

// Test case table for score-based E2E tests
const scoreTestCases = [
	{
		name: "seq input a bit off - partial credit",
		inputs: {
			sequence_input: "AAGCACTGCACGCCGTGGGT",
			strand_input: "Antisense (-)",
			pam_input: "CAG",
			position_input: "381",
			offtarget_input: "87",
			f1_input: "TAATACGACTCACTATAGAAGCACTGCACGCCGT",
			r1_input: "TTCTAGCTCTAAAACACCCACGGCGTGCAGTGCT",
		},
		expectedScore: 9,
	},
	{
		name: "failing gRNA and primers - zero score",
		inputs: {
			sequence_input: "AAAAAAAAAAAAAAAAAAAA",
			strand_input: "Sense (+)",
			pam_input: "AAA",
			position_input: "999",
			offtarget_input: "1",
			f1_input: "AAAAAAAAAAAAAAAAAAAA",
			r1_input: "TTTTTTTTTTTTTTTTTTTT",
		},
		expectedScore: 0,
	},
];

test.describe("SciGrade Submission Flow", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the application page
		await page.goto("http://localhost:3000/core/systemrun.html");

		// Wait for the page to fully load (redirectCRISPR builds the UI)
		await page.waitForSelector("#gene_dropdown_selection");

		// Wait for gene list to be populated (fillGeneList runs after JSON load)
		await page.waitForFunction(() => {
			const sel = document.getElementById("gene_dropdown_selection");
			return sel && sel.options.length > 0;
		});

		// Select eBFP gene (default test gene)
		await page.selectOption("#gene_dropdown_selection", "eBFP");

		// Click Load Gene button
		await page.getByRole("button", { name: "Load Gene" }).click();

		// Wait for the form to be generated (loadWork appends form inputs into #work)
		await page.waitForSelector("#sequence_input", { state: "visible" });

		// Wait for form to be fully rendered and interactive: submit button present and enabled
		await page.waitForFunction(() => {
			const btn = document.getElementById("assignmentSubmitButton");
			return !!btn && !btn.disabled;
		});
	});

	// Data-driven tests using test case table
	for (const testCase of scoreTestCases) {
		test(`should submit ${testCase.name}`, async ({ page }) => {
			// Fill in all form inputs from test case
			await page.fill("#sequence_input", testCase.inputs.sequence_input);
			await page.selectOption("#strand_input", testCase.inputs.strand_input);
			await page.fill("#pam_input", testCase.inputs.pam_input);
			await page.fill("#position_input", testCase.inputs.position_input);
			await page.fill("#offtarget_input", testCase.inputs.offtarget_input);
			await page.fill("#f1_input", testCase.inputs.f1_input);
			await page.fill("#r1_input", testCase.inputs.r1_input);

			// Click Submit button
			await page.click("#assignmentSubmitButton");

			// Wait for feedback to render
			await expect(page.locator("body")).toContainText(/Mark:/, { timeout: 15000 });

			// Verify expected score
			await expect(page.locator("body")).toContainText(`Mark: ${testCase.expectedScore}/10`);

			// Verify feedback sections are present
			await expect(page.locator("body")).toContainText(/gRNA Strand Sequence/);
			await expect(page.locator("body")).toContainText(/gRNA PAM Sequence/);
		});
	}

	// Test for double submission in the same session
	test("should allow submitting twice in the same session", async ({ page }) => {
		// First submission
		await page.fill("#sequence_input", "AAGCACTGCACGCCGTGGGT");
		await page.selectOption("#strand_input", "Antisense (-)");
		await page.fill("#pam_input", "CAG");
		await page.fill("#position_input", "381");
		await page.fill("#offtarget_input", "87");
		await page.fill("#f1_input", "TAATACGACTCACTATAGAAGCACTGCACGCCGT");
		await page.fill("#r1_input", "TTCTAGCTCTAAAACACCCACGGCGTGCAGTGCT");

		// Click Submit button
		await page.click("#assignmentSubmitButton");

		// Wait for feedback to render
		await expect(page.locator("body")).toContainText(/Mark:/, { timeout: 15000 });

		// Return to assignments (simulates selecting a new assignment)
		await page.click("button:has-text('Back to Assignments')");

		// Wait for the form to be reset and visible again
		await page.waitForSelector("#gene_dropdown_selection");

		// Select gene again
		await page.selectOption("#gene_dropdown_selection", "eBFP");
		await page.getByRole("button", { name: "Load Gene" }).click();

		// Wait for form to be ready
		await page.waitForFunction(() => {
			const btn = document.getElementById("assignmentSubmitButton");
			return !!btn && !btn.disabled;
		});

		// Second submission with different values
		await page.fill("#sequence_input", "AAAAAAAAAAAAAAAAAAAA");
		await page.selectOption("#strand_input", "Sense (+)");
		await page.fill("#pam_input", "AAA");
		await page.fill("#position_input", "999");
		await page.fill("#offtarget_input", "1");
		await page.fill("#f1_input", "AAAAAAAAAAAAAAAAAAAA");
		await page.fill("#r1_input", "TTTTTTTTTTTTTTTTTTTT");

		// Click Submit button again
		await page.click("#assignmentSubmitButton");

		// Wait for feedback to render again
		await expect(page.locator("body")).toContainText(/Mark:/, { timeout: 15000 });

		// Verify feedback is displayed correctly
		await expect(page.locator("body")).toContainText(/gRNA Strand Sequence/);
	});
});
