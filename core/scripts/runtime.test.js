const { loadGeneContent, redirectCRISPR } = require("./runtime");

describe("runtime.js - Runtime Flow Helpers", () => {
	let mockDocument;
	let mockElement;
	let mockJQuery;
	let jQueryMock;

	beforeEach(() => {
		// Clear any existing mocks
		jest.clearAllMocks();

		// Mock DOM elements
		mockElement = {
			value: "",
			id: "gene_dropdown_selection",
		};

		mockDocument = {
			getElementById: jest.fn(() => mockElement),
		};

		mockJQuery = {
			empty: jest.fn(function () {
				return this;
			}),
			append: jest.fn(function () {
				return this;
			}),
		};

		// Create jQuery mock function
		jQueryMock = jest.fn(() => mockJQuery);
		jQueryMock.mockClear = jest.fn();

		// Set up globals
		global.document = mockDocument;
		global.$ = jQueryMock;
		global.checkAnswers_executed = true;
		global.possible_gene = "";
		global.select_Gene = jest.fn();
		global.loadCRISPRJSON_Files = jest.fn(async () => {});
		global.fillGeneList = jest.fn();
	});

	afterEach(() => {
		jest.clearAllMocks();
		delete global.document;
		delete global.$;
		delete global.checkAnswers_executed;
		delete global.possible_gene;
		delete global.select_Gene;
		delete global.loadCRISPRJSON_Files;
		delete global.fillGeneList;
	});

	describe("loadGeneContent()", () => {
		const cases = [
			{
				name: "loads eBFP gene and resets flags",
				geneValue: "eBFP",
				expectedGeneValue: "eBFP",
				expectedReset: true,
			},
			{
				name: "loads ACTN3 gene and resets flags",
				geneValue: "ACTN3",
				expectedGeneValue: "ACTN3",
				expectedReset: true,
			},
			{
				name: "loads CCR5 gene and resets flags",
				geneValue: "CCR5",
				expectedGeneValue: "CCR5",
				expectedReset: true,
			},
			{
				name: "handles empty selection gracefully",
				geneValue: "",
				expectedGeneValue: "",
				expectedReset: true,
			},
		];

		it.each(cases)("$name", async ({ geneValue, expectedGeneValue, expectedReset }) => {
			// Setup
			mockElement.value = geneValue;
			global.checkAnswers_executed = true;
			global.document.getElementById.mockReturnValue(mockElement);

			// Execute the ACTUAL imported function
			await loadGeneContent();

			// Verify
			expect(global.possible_gene).toBe(expectedGeneValue);
			if (expectedReset) {
				expect(global.checkAnswers_executed).toBe(false);
			}
			expect(global.select_Gene).toHaveBeenCalled();
			expect(global.document.getElementById).toHaveBeenCalledWith("gene_dropdown_selection");
		});

		it("triggers select_Gene callback with correct context", () => {
			mockElement.value = "HBB";
			global.document.getElementById.mockReturnValue(mockElement);

			// Execute the ACTUAL imported function
			loadGeneContent();

			expect(global.select_Gene).toHaveBeenCalledTimes(1);
			expect(global.possible_gene).toBe("HBB");
		});
	});

	describe("redirectCRISPR()", () => {
		it("ensures DOM elements are properly cleared before population", async () => {
			// Execute the ACTUAL imported function
			await redirectCRISPR();

			expect(mockJQuery.empty).toHaveBeenCalled();
			expect(mockJQuery.append).toHaveBeenCalled();
		});

		it("handles asynchronous JSON loading completion", async () => {
			let jsonLoaded = false;
			global.loadCRISPRJSON_Files = jest.fn(async () => {
				jsonLoaded = true;
			});

			expect(jsonLoaded).toBe(false);
			await redirectCRISPR();
			expect(jsonLoaded).toBe(true);
		});

		it("executes jQuery operations in correct sequence", async () => {
			const executionSequence = [];

			mockJQuery.empty = jest.fn(() => {
				executionSequence.push("empty");
				return mockJQuery;
			});

			mockJQuery.append = jest.fn(() => {
				executionSequence.push("append");
				return mockJQuery;
			});

			global.loadCRISPRJSON_Files = jest.fn(async () => {
				executionSequence.push("loadCRISPRJSON_Files");
			});

			global.fillGeneList = jest.fn(() => {
				executionSequence.push("fillGeneList");
			});

			await redirectCRISPR();

			expect(executionSequence).toEqual(["empty", "append", "loadCRISPRJSON_Files", "fillGeneList"]);
		});
	});
});
