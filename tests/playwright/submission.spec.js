import { test, expect } from "@playwright/test";
import { selectGeneAndOpenForm } from "./utils/navigation.js";

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

/**
 * Fills every answer input of the work form.
 * @param {import('@playwright/test').Page} page - Page showing the work form
 * @param {object} inputs - Values keyed by input id, as in scoreTestCases
 */
async function fillAnswers(page, inputs) {
	await page.fill("#sequence_input", inputs.sequence_input);
	await page.selectOption("#strand_input", inputs.strand_input);
	await page.fill("#pam_input", inputs.pam_input);
	await page.fill("#position_input", inputs.position_input);
	await page.fill("#offtarget_input", inputs.offtarget_input);
	await page.fill("#f1_input", inputs.f1_input);
	await page.fill("#r1_input", inputs.r1_input);
}

test.describe("SciGrade Submission Flow", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the application page
		await page.goto("http://localhost:3000/core/systemrun.html");

		// Wait for the gene list to load, then load eBFP (default test gene) and
		// render the work form (#sequence_input).
		await selectGeneAndOpenForm(page, "eBFP");

		// Wait for form to be fully rendered and interactive: submit button present and enabled
		await page.waitForFunction(() => {
			const btn = document.getElementById("assignmentSubmitButton");
			return !!btn && !btn.disabled;
		});
	});

	// Data-driven tests using test case table
	for (const testCase of scoreTestCases) {
		test(`should submit ${testCase.name}`, async ({ page }) => {
			await fillAnswers(page, testCase.inputs);

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

		// Return to the gene selection screen to start another attempt
		await page.click("button:has-text('Back to Gene Selection')");

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

		// The second attempt is all wrong, so no marks may carry over from the first
		await expect(page.locator("body")).toContainText("Mark: 0/10");
	});

	test("should release every feedback card, including one mid-animation, when returning to gene selection", async ({
		page,
	}) => {
		const pageErrors = [];
		page.on("pageerror", (error) => pageErrors.push(error.message));

		await fillAnswers(page, scoreTestCases[0].inputs);
		await page.click("#assignmentSubmitButton");
		await expect(page.locator("#mainContainer .card-header button")).toHaveCount(5);

		// Open the first card and let it finish, then open the second and leave in the same task, so the second
		// is still animating (Bootstrap swaps its "collapse" class for "collapsing") when the screen is rebuilt.
		await page.evaluate(() => {
			window.feedbackCards = [...document.querySelectorAll("#mainContainer .collapse")];
			document.querySelector("#mainContainer .card-header button").click();
		});
		await expect(page.locator("#gRNAOutput")).toHaveClass(/\bshow\b/);
		const animatingWhenLeft = await page.evaluate(() => {
			document.querySelectorAll("#mainContainer .card-header button")[1].click();
			const animating = document.querySelectorAll("#mainContainer .collapsing").length;
			[...document.querySelectorAll("button")]
				.find((b) => b.textContent.includes("Back to Gene Selection"))
				.click();
			return animating;
		});
		expect(animatingWhenLeft).toBe(1);

		// The second card keeps "collapsing" until Bootstrap's transition callback has run against the removed card
		await expect
			.poll(() => page.evaluate(() => window.feedbackCards[1].classList.contains("collapsing")))
			.toBe(false);

		expect(
			await page.evaluate(() => window.feedbackCards.map((card) => bootstrap.Collapse.getInstance(card))),
		).toEqual([null, null, null, null, null]);
		expect(pageErrors).toEqual([]);
	});

	test("should show markup characters in submitted answers as text", async ({ page }) => {
		const sequence = `<b>&"'</b>`;
		const pam = "<&>";
		const f1Primer = '<img src=x onerror="window.__xss=1">';

		await page.fill("#sequence_input", sequence);
		await page.fill("#pam_input", pam);
		await page.fill("#position_input", "381");
		await page.fill("#offtarget_input", "87");
		await page.fill("#f1_input", f1Primer);
		await page.fill("#r1_input", "TTCTAGCTCTAAAACACCCACGGCGTGCAGTGCT");

		await page.click("#assignmentSubmitButton");
		await expect(page.locator("body")).toContainText(/Mark:/, { timeout: 15000 });

		const feedback = page.locator("#mainContainer");
		await expect(feedback).toContainText(`you put down "${sequence}"`);
		await expect(feedback).toContainText(`you put down "${pam}"`);
		await expect(feedback).toContainText(`you put down "${f1Primer}"`);
		await expect(feedback.locator("img, b")).toHaveCount(0);
		expect(await page.evaluate(() => window.__xss)).toBeUndefined();
	});
});
