import { test, expect } from "@playwright/test";
import { testAccessibility } from "./utils/accessibility.js";
import { measureGlyphEdgeContrast } from "./utils/contrast.js";
import { selectGeneAndOpenForm } from "./utils/navigation.js";

const HOME_URL = "http://localhost:3000/";
const APP_URL = "http://localhost:3000/core/systemrun.html";

/**
 * Opens the application page and waits for the gene dropdown to be filled.
 * @param {import('@playwright/test').Page} page - Page to navigate
 */
async function openSelectionView(page) {
	await page.goto(APP_URL);
	await page.waitForFunction(() => document.getElementById("gene_dropdown_selection")?.options.length > 0);
}

/**
 * Opens the work form, submits a fully wrong attempt, and waits for the feedback cards.
 * @param {import('@playwright/test').Page} page - Page to navigate
 */
async function openFeedbackView(page) {
	await openSelectionView(page);
	await selectGeneAndOpenForm(page, "eBFP");
	await page.fill("#sequence_input", "AAAAAAAAAAAAAAAAAAAA");
	await page.fill("#pam_input", "AAA");
	await page.fill("#position_input", "999");
	await page.fill("#offtarget_input", "1");
	await page.fill("#f1_input", "A".repeat(120));
	await page.fill("#r1_input", "T");
	await page.click("#assignmentSubmitButton");
	await expect(page.locator("#feedback_heading")).toBeVisible();
}

/**
 * Lists the heading levels and texts in document order.
 * @param {import('@playwright/test').Page} page - Page to read
 * @returns {Promise<string[]>} Entries such as "H2:Feedback"
 */
function headingOutline(page) {
	return page.evaluate(() =>
		[...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) => `${h.tagName}:${h.textContent.trim()}`),
	);
}

/**
 * Focuses a control after a key press, so the browser treats the focus as keyboard focus and :focus-visible
 * applies, then reads the outline it draws.
 * @param {import('@playwright/test').Page} page - Page holding the control
 * @param {import('@playwright/test').Locator} locator - Control to focus
 * @returns {Promise<{focusVisible: boolean, style: string, width: number}>} Outline style and width in CSS pixels
 */
async function keyboardFocusOutline(page, locator) {
	// Firefox and WebKit ignore a modifier key alone when deciding whether focus came from the keyboard
	await page.keyboard.press("Tab");
	await locator.focus();
	return locator.evaluate((el) => {
		const style = getComputedStyle(el);
		return {
			focusVisible: el.matches(":focus-visible"),
			style: style.outlineStyle,
			width: parseFloat(style.outlineWidth),
		};
	});
}

test.describe("Visual guards: home heading", () => {
	test("has no box behind it", async ({ page }) => {
		await page.goto(HOME_URL);

		const style = await page.locator("h1").evaluate((h1) => {
			const computed = getComputedStyle(h1);
			return {
				backgroundColor: computed.backgroundColor,
				backgroundImage: computed.backgroundImage,
				borderWidth: computed.borderTopWidth,
				paddingTop: computed.paddingTop,
			};
		});

		expect(style).toEqual({
			backgroundColor: "rgba(0, 0, 0, 0)",
			backgroundImage: "none",
			borderWidth: "0px",
			paddingTop: "0px",
		});
	});

	test("keeps 3:1 contrast against the photo right around every letter (WCAG 1.4.3, large text)", async ({
		page,
	}) => {
		await page.goto(HOME_URL, { waitUntil: "load" });
		await page.evaluate(() => document.fonts.ready);

		const { min, samples } = await measureGlyphEdgeContrast(page, page.locator("h1"));

		expect(samples).toBeGreaterThan(1000);
		expect(min).toBeGreaterThanOrEqual(3);
	});
});

test.describe("Visual guards: form card", () => {
	for (const width of [320, 375, 540]) {
		test(`keeps at least 8px from both screen edges at ${width}px wide`, async ({ page }) => {
			await page.setViewportSize({ width, height: 800 });
			await openSelectionView(page);

			const gaps = await page.locator("#mainContainer").evaluate((card) => {
				const box = card.getBoundingClientRect();
				return { left: box.left, right: document.documentElement.clientWidth - box.right };
			});

			expect(gaps.left).toBeGreaterThanOrEqual(8);
			expect(gaps.right).toBeGreaterThanOrEqual(8);
		});
	}

	test("resizes smoothly across Bootstrap's breakpoints instead of jumping", async ({ page }) => {
		await openSelectionView(page);
		const widths = async (width) => {
			await page.setViewportSize({ width, height: 800 });
			return page.evaluate(() => ({
				card: document.getElementById("mainContainer").getBoundingClientRect().width,
				content: document.getElementById("content_body").getBoundingClientRect().width,
			}));
		};

		for (const breakpoint of [576, 768, 992, 1200, 1400]) {
			const below = await widths(breakpoint - 1);
			const at = await widths(breakpoint);

			expect(Math.abs(at.card - below.card), `card at ${breakpoint}px`).toBeLessThanOrEqual(2);
			expect(Math.abs(at.content - below.content), `content at ${breakpoint}px`).toBeLessThanOrEqual(2);
		}
	});
});

test.describe("Accessibility: WCAG 2.2 AA", () => {
	test("home page offers Start as one link, with no button nested in it", async ({ page }) => {
		await page.goto(HOME_URL);

		await expect(page.getByRole("link", { name: "Start" })).toHaveAttribute("href", "core/systemrun.html");
		await expect(page.getByRole("button")).toHaveCount(0);
		expect(await page.evaluate(() => document.querySelectorAll("a[href] a, a[href] button").length)).toBe(0);
		await expect(page.getByRole("img", { name: "SciGrade" })).toBeVisible();
		expect(await headingOutline(page)).toEqual(["H1:An online way to practice gRNA and primer design"]);
		await expect(page.getByRole("main")).toHaveCount(1);
		await testAccessibility(page);
	});

	test("selection view passes axe, has its own title, and names the dropdown by its label", async ({ page }) => {
		await openSelectionView(page);

		await testAccessibility(page);
		await expect(page).toHaveTitle("Practice | SciGrade");
		expect(await headingOutline(page)).toEqual(["H1:Practice gRNA and primer design"]);
		await expect(page.getByRole("combobox", { name: "Please select your gene:" })).toBeVisible();
		await expect(page.getByRole("navigation")).toHaveCount(1);
		await expect(page.getByRole("main")).toHaveCount(1);
		await expect(page.getByRole("link", { name: "SciGrade home page" })).toHaveAttribute("href", "../");
		await expect(page.getByRole("link", { name: "Application" })).toHaveAttribute("aria-current", "page");
	});

	test("work form passes axe and names and describes every field", async ({ page }) => {
		await openSelectionView(page);
		await selectGeneAndOpenForm(page, "eBFP");

		await testAccessibility(page);
		for (const name of ["gRNA Sequence:", "PAM Sequence:", "F1 Primers:", "R1 Primers:"]) {
			await expect(page.getByRole("textbox", { name, exact: true })).toHaveCount(1);
		}
		for (const name of ["Cut position:", "Off-target score:"]) {
			await expect(page.getByRole("spinbutton", { name, exact: true })).toHaveCount(1);
		}
		await expect(page.getByRole("combobox", { name: "gRNA Strand:", exact: true })).toHaveCount(1);
		await expect(page.getByLabel("gRNA Sequence:")).toHaveAccessibleDescription(/maxed out at 20 characters/);
		await expect(page.getByLabel("Cut position:")).toHaveAccessibleDescription(/only takes numbers/);
	});

	test("feedback view passes axe, takes focus on its heading, and keeps heading levels in order", async ({
		page,
	}) => {
		await openFeedbackView(page);

		await expect(page.locator("#feedback_heading")).toBeFocused();
		await page.evaluate(() =>
			document.querySelectorAll("#mainContainer .card-header button").forEach((b) => b.click()),
		);
		await expect(page.locator("#R1PrimerOutput")).toHaveClass(/\bshow\b/);
		await testAccessibility(page);
		expect((await headingOutline(page)).map((h) => h.split(":")[0])).toEqual([
			"H1",
			"H2",
			"H3",
			"H3",
			"H3",
			"H3",
			"H3",
		]);
	});

	test("Back to Gene Selection moves focus to the gene dropdown", async ({ page }) => {
		await openFeedbackView(page);

		await page.getByRole("button", { name: "Back to Gene Selection" }).click();

		await expect(page.locator("#gene_dropdown_selection")).toBeFocused();
	});

	test("page load leaves focus where it is", async ({ page }) => {
		await openSelectionView(page);

		await expect(page.locator("#gene_dropdown_selection")).not.toBeFocused();
	});

	for (const forcedColors of ["none", "active"]) {
		test(`keyboard focus shows an outline of at least 2px on every kind of control (forced colors: ${forcedColors})`, async ({
			page,
		}) => {
			await page.emulateMedia({ forcedColors });
			await page.goto(HOME_URL);
			const targets = [["Start link", page.getByRole("link", { name: "Start" })]];

			for (const [label, locator] of targets) {
				const outline = await keyboardFocusOutline(page, locator);
				expect(outline, label).toEqual(expect.objectContaining({ focusVisible: true, style: "solid" }));
				expect(outline.width, label).toBeGreaterThanOrEqual(2);
			}

			await openSelectionView(page);
			await selectGeneAndOpenForm(page, "eBFP");
			for (const [label, locator] of [
				["nav link", page.getByRole("link", { name: "Application" })],
				["select", page.locator("#gene_dropdown_selection")],
				["button", page.locator("#load_gene_button")],
				["input", page.locator("#sequence_input")],
			]) {
				const outline = await keyboardFocusOutline(page, locator);
				expect(outline, label).toEqual(expect.objectContaining({ focusVisible: true, style: "solid" }));
				expect(outline.width, label).toBeGreaterThanOrEqual(2);
			}
		});
	}

	test("feedback cards open without animation when the user prefers reduced motion", async ({ page }) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await openFeedbackView(page);

		const duration = await page.evaluate(() => {
			document.querySelector("#mainContainer .card-header button").click();
			return getComputedStyle(document.querySelector("#mainContainer .collapsing, #mainContainer .collapse.show"))
				.transitionDuration;
		});

		expect(duration).toBe("0s");
	});
});
