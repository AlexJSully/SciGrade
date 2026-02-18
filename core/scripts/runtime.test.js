describe("runtime.js - Practice flow defaults", () => {
	const getOffTargetOptimalValue = (maxRange) => {
		const minOptimal = maxRange - maxRange * 0.2;
		if (minOptimal > 80 || minOptimal < 35) {
			return 80;
		}
		return minOptimal;
	};

	it("returns 80 when min optimal is out of range", () => {
		expect(getOffTargetOptimalValue(30)).toBe(80);
		expect(getOffTargetOptimalValue(500)).toBe(80);
	});

	it("returns min optimal for typical ranges", () => {
		expect(getOffTargetOptimalValue(90)).toBe(72);
		expect(getOffTargetOptimalValue(60)).toBe(48);
	});
});
