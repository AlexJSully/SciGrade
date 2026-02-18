const { getOffTargetOptimalValue } = require("./crispr_scripts");

describe("runtime.js - Practice flow defaults", () => {
	it("returns 80 when min optimal is out of range", () => {
		expect(getOffTargetOptimalValue(30)).toBe(80);
		expect(getOffTargetOptimalValue(500)).toBe(80);
	});

	it("returns min optimal for typical ranges", () => {
		expect(getOffTargetOptimalValue(90)).toBe(72);
		expect(getOffTargetOptimalValue(60)).toBe(48);
	});
});
