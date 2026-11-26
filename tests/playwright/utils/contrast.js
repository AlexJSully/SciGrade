/**
 * WCAG relative luminance of one sRGB channel value from 0 to 255.
 * @param {number} value - Channel value
 * @returns {number} Linear channel value from 0 to 1
 */
function linearChannel(value) {
	const v = value / 255;
	return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/**
 * WCAG contrast ratio between two opaque CSS colours as getComputedStyle reports them.
 * @param {string} first - Colour such as "rgb(48, 51, 141)"
 * @param {string} second - Colour such as "rgb(221, 221, 221)"
 * @returns {number} Ratio from 1 to 21
 */
export function contrastRatio(first, second) {
	const luminance = (color) => {
		const [r, g, b] = color
			.match(/\d+(\.\d+)?/g)
			.slice(0, 3)
			.map((value) => linearChannel(Number(value)));
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	};
	const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
	return (light + 0.05) / (dark + 0.05);
}

/**
 * Measures the contrast between a text element's colour and the pixels drawn right around its glyphs, so text over
 * a photo can be checked against WCAG 1.4.3 without a stored screenshot. Two captures of the element's box are
 * compared in the page: the page as shown with the text made transparent (the background plus any text-shadow
 * halo), and the glyphs alone in black on white (the mask that says which pixels are text).
 *
 * The page's styles are changed to take the captures, so call this last in a test.
 * @param {import("@playwright/test").Page} page - Page showing the element
 * @param {import("@playwright/test").Locator} locator - Text element to measure
 * @returns {Promise<{min: number, samples: number}>} Lowest ratio among the pixels next to a glyph, and how many were read
 */
export async function measureGlyphEdgeContrast(page, locator) {
	const textColor = await locator.evaluate((el) => getComputedStyle(el).color);
	// A screenshot clip stops at the viewport, so an element below the fold would be measured only in part
	await locator.scrollIntoViewIfNeeded();
	const box = await locator.boundingBox();
	const pad = 12;
	const clip = {
		x: Math.max(0, box.x - pad),
		y: Math.max(0, box.y - pad),
		width: box.width + 2 * pad,
		height: box.height + 2 * pad,
	};

	await locator.evaluate((el) => el.style.setProperty("color", "transparent", "important"));
	const background = await page.screenshot({ clip, animations: "disabled" });

	await page.addStyleTag({ content: "html, body { background: #fff !important }" });
	await locator.evaluate((target) => {
		target.style.setProperty("color", "#000", "important");
		target.style.setProperty("text-shadow", "none", "important");
		for (const el of document.body.querySelectorAll("*")) {
			if (!el.contains(target) && !target.contains(el)) {
				el.style.setProperty("visibility", "hidden", "important");
			}
		}
	});
	const maskBox = await locator.boundingBox();
	if (maskBox.x !== box.x || maskBox.y !== box.y) {
		throw new Error(
			`The element moved while the glyph mask was prepared (${box.x},${box.y} to ${maskBox.x},${maskBox.y}), so the mask would not line up with the background`,
		);
	}
	const mask = await page.screenshot({ clip, animations: "disabled" });

	// The page decodes the PNGs and returns the distinct background colours next to a glyph; the ratio is computed here
	const { colors, samples } = await page.evaluate(
		async ({ backgroundPng, maskPng }) => {
			const decode = async (base64) => {
				const image = new Image();
				image.src = `data:image/png;base64,${base64}`;
				await image.decode();
				const canvas = document.createElement("canvas");
				canvas.width = image.width;
				canvas.height = image.height;
				const context = canvas.getContext("2d");
				context.drawImage(image, 0, 0);
				return {
					data: context.getImageData(0, 0, canvas.width, canvas.height).data,
					width: canvas.width,
					height: canvas.height,
				};
			};

			const back = await decode(backgroundPng);
			const glyphs = await decode(maskPng);
			const isGlyph = (x, y) => glyphs.data[(y * glyphs.width + x) * 4] < 128;
			const radius = Math.max(1, Math.round(2 * window.devicePixelRatio));

			const seen = new Set();
			let count = 0;
			for (let y = radius; y < glyphs.height - radius; y++) {
				for (let x = radius; x < glyphs.width - radius; x++) {
					if (isGlyph(x, y)) {
						continue;
					}
					let nearGlyph = false;
					for (let dy = -radius; dy <= radius && !nearGlyph; dy++) {
						for (let dx = -radius; dx <= radius && !nearGlyph; dx++) {
							nearGlyph = isGlyph(x + dx, y + dy);
						}
					}
					if (!nearGlyph) {
						continue;
					}
					const i = (y * back.width + x) * 4;
					seen.add(`rgb(${back.data[i]}, ${back.data[i + 1]}, ${back.data[i + 2]})`);
					count++;
				}
			}

			return { colors: [...seen], samples: count };
		},
		{ backgroundPng: background.toString("base64"), maskPng: mask.toString("base64") },
	);

	const min = colors.reduce((lowest, color) => Math.min(lowest, contrastRatio(textColor, color)), Infinity);

	return { min, samples };
}
