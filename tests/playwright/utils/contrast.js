/**
 * Measures the contrast between a text element's colour and the pixels drawn right around its glyphs, so text over
 * a photo can be checked against WCAG 1.4.3 without a stored screenshot. Three captures of the element's box are
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

	await page.addStyleTag({
		content: "html, body { background: #fff !important } body > :not(main) { display: none !important }",
	});
	await locator.evaluate((el) => {
		el.style.setProperty("color", "#000", "important");
		el.style.setProperty("text-shadow", "none", "important");
	});
	await page.evaluate(() => {
		for (const el of document.querySelectorAll("main *")) {
			if (!el.contains(document.querySelector("h1")) && !document.querySelector("h1").contains(el)) {
				el.style.setProperty("visibility", "hidden", "important");
			}
		}
	});
	const mask = await page.screenshot({ clip, animations: "disabled" });

	return page.evaluate(
		async ({ backgroundPng, maskPng, color }) => {
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
			const channel = (value) => {
				const v = value / 255;
				return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
			};
			const luminance = (r, g, b) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

			const back = await decode(backgroundPng);
			const glyphs = await decode(maskPng);
			const [r, g, b] = color.match(/\d+/g).map(Number);
			const text = luminance(r, g, b);
			const isGlyph = (x, y) => glyphs.data[(y * glyphs.width + x) * 4] < 128;
			const radius = Math.max(1, Math.round(2 * window.devicePixelRatio));

			let min = Infinity;
			let samples = 0;
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
					const around = luminance(back.data[i], back.data[i + 1], back.data[i + 2]);
					min = Math.min(min, (Math.max(around, text) + 0.05) / (Math.min(around, text) + 0.05));
					samples++;
				}
			}
			return { min, samples };
		},
		{ backgroundPng: background.toString("base64"), maskPng: mask.toString("base64"), color: textColor },
	);
}
