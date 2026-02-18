const crispr = require("./crispr_scripts");
const {
	getOffTargetOptimalValue,
	isNumberOrDashKey,
	createComplementarySeq,
	checkOffTarget,
	checkF1Primers,
	checkR1Primers,
	fillGeneList,
	__resetState: resetState,
	__setTestState: setTestState,
} = crispr;

describe("crispr_scripts.js - Utility Functions", () => {
	// Setup mocks for DOM-dependent functions
	let mockDocument;
	let mockInput;

	beforeEach(() => {
		jest.clearAllMocks();

		// Mock DOM elements
		mockInput = {
			value: "",
			trim: jest.fn(function () {
				return this.value.trim();
			}),
		};

		mockDocument = {
			getElementById: jest.fn((id) => {
				if (id === "offtarget_input") {
					return { value: "75", trim: jest.fn(() => "75") };
				} else if (id === "position_input") {
					return { value: "100", trim: jest.fn(() => "100") };
				} else if (id === "f1_input") {
					return mockInput;
				} else if (id === "r1_input") {
					return mockInput;
				}
				return mockInput;
			}),
		};

		global.document = mockDocument;
		// Setup global variables used by these functions
		global.MAROffTarget = false;
		global.MAROffTarget_degree = 0;
		global.MAROffTarget_aboveOpt = false;
		global.MAROffTarget_above35 = false;
		global.MAROffTarget_onlyOption = false;
		global.MARF1primers = false;
		global.MARR1primers = false;
		global.benchling_gRNA_outputs = {
			gene_list: {
				test_gene: [
					{ Position: 100, "Specificity Score": 85 },
					{ Position: 120, "Specificity Score": 75 },
				],
			},
		};
		global.current_gene = "test_gene";
		global.correctNucleotideIncluded = true;
		global.MARgRNAseq = true;
	});

	afterEach(() => {
		jest.clearAllMocks();
		delete global.document;
		delete global.MAROffTarget;
		delete global.MAROffTarget_degree;
		delete global.MAROffTarget_aboveOpt;
		delete global.MAROffTarget_above35;
		delete global.MAROffTarget_onlyOption;
		delete global.MARF1primers;
		delete global.MARR1primers;
		delete global.benchling_gRNA_outputs;
		delete global.current_gene;
		delete global.correctNucleotideIncluded;
		delete global.MARgRNAseq;
	});

	describe("isNumberOrDashKey()", () => {
		const cases = [
			{ name: "number key 0", input: { which: 48 }, want: true },
			{ name: "number key 9", input: { which: 57 }, want: true },
			{ name: "number key 5 (keyCode)", input: { keyCode: 53 }, want: true },
			{ name: "dash key", input: { which: 45 }, want: true },
			{ name: "period key", input: { which: 46 }, want: true },
			{ name: "letter A", input: { which: 65 }, want: false },
			{ name: "letter Z", input: { which: 90 }, want: false },
			{ name: "letter a", input: { which: 97 }, want: false },
			{ name: "special ! character", input: { which: 33 }, want: false },
			{ name: "special @ character", input: { which: 64 }, want: false },
		];

		it.each(cases)("$name", ({ input, want }) => {
			expect(isNumberOrDashKey(input)).toBe(want);
		});
	});

	describe("createComplementarySeq()", () => {
		const cases = [
			{ name: "short sequence ATCG", input: "ATCG", want: "CGAT" },
			{ name: "longer sequence", input: "GCTCGTGACCACCCTGACCT", want: "AGGTCAGGGTGGTCACGAGC" },
			{ name: "empty sequence", input: "", want: "" },
			{ name: "single nucleotide A", input: "A", want: "T" },
			{ name: "single nucleotide T", input: "T", want: "A" },
			{ name: "single nucleotide C", input: "C", want: "G" },
			{ name: "single nucleotide G", input: "G", want: "C" },
		];

		it.each(cases)("$name", ({ input, want }) => {
			const result = createComplementarySeq(input);
			expect(result).toBe(want);
		});
	});

	describe("getOffTargetOptimalValue()", () => {
		const cases = [
			{
				name: "returns 80 when min optimal is below 35 threshold (input: 30)",
				input: 30,
				want: 80,
				expectedType: "number",
			},
			{
				name: "returns 80 when min optimal is below 35 threshold (input: 170)",
				input: 170,
				want: 80,
				expectedType: "number",
			},
			{
				name: "returns 80 when min optimal exceeds 80 threshold (input: 500)",
				input: 500,
				want: 80,
				expectedType: "number",
			},
			{
				name: "returns min optimal for typical range (input: 90)",
				input: 90,
				want: 72,
				expectedType: "number",
			},
			{
				name: "returns min optimal for typical range (input: 60)",
				input: 60,
				want: 48,
				expectedType: "number",
			},
			{
				name: "returns min optimal for typical range (input: 75)",
				input: 75,
				want: 60,
				expectedType: "number",
			},
			{
				name: "handles boundary case at 175 (minOptimal = 140, > 80)",
				input: 175,
				want: 80,
				expectedType: "number",
			},
			{
				name: "handles boundary case at 100 (minOptimal = 80, exactly at boundary)",
				input: 100,
				want: 80,
				expectedType: "number",
			},
			{
				name: "handles small positive value (input: 50)",
				input: 50,
				want: 40,
				expectedType: "number",
			},
		];

		it.each(cases)("$name", ({ input, want, expectedType }) => {
			const result = getOffTargetOptimalValue(input);
			expect(result).toEqual(want);
			expect(typeof result).toBe(expectedType);
		});

		it("should not modify input parameter", () => {
			const input = 90;
			const inputCopy = input;
			getOffTargetOptimalValue(input);
			expect(input).toBe(inputCopy);
		});
	});

	describe("checkOffTarget()", () => {
		beforeEach(() => {
			resetState();
			setTestState({
				correctNucleotideIncluded: true,
				MARgRNAseq: true,
				benchling_gRNA_outputs: {
					gene_list: {
						test_gene: [{ Position: 100, "Specificity Score": 85 }],
					},
				},
				current_gene: "test_gene",
			});
		});

		it("sets MAROffTarget true when score matches input within bounds", () => {
			global.document.getElementById = jest.fn((id) => {
				if (id === "offtarget_input") return { value: "75" };
				if (id === "position_input") return { value: "100" };
				return { value: "" };
			});

			checkOffTarget(75);

			expect(crispr.MAROffTarget).toBe(true);
		});

		it("sets MAROffTarget degree 1 for score >= 75", () => {
			global.document.getElementById = jest.fn((id) => {
				if (id === "offtarget_input") return { value: "85" };
				if (id === "position_input") return { value: "100" };
				return { value: "" };
			});

			checkOffTarget(85);

			expect(crispr.MAROffTarget).toBe(true);
			expect(crispr.MAROffTarget_degree).toBe(1);
		});

		it("sets MAROffTarget degree 2 for score 35-75", () => {
			global.document.getElementById = jest.fn((id) => {
				if (id === "offtarget_input") return { value: "50" };
				if (id === "position_input") return { value: "100" };
				return { value: "" };
			});

			checkOffTarget(50);

			expect(crispr.MAROffTarget).toBe(true);
			expect(crispr.MAROffTarget_degree).toBe(2);
		});

		it("should not set MAROffTarget when prerequisites not met", () => {
			global.correctNucleotideIncluded = false;
			global.MARgRNAseq = false;

			checkOffTarget(75);

			expect(global.MAROffTarget).toBe(false);
			expect(global.MAROffTarget_degree).toBe(0);
		});
	});

	describe("checkF1Primers()", () => {
		beforeEach(() => {
			resetState();
		});

		it("validates F1 primer for sequence starting with G", () => {
			const seq = "GCTCGTGACCACCCTGACCT";
			global.document.getElementById = jest.fn((id) => {
				if (id === "f1_input") {
					return {
						value: "TAATACGACTCACTATAGGCTCGTGACCACCCTG",
						trim: jest.fn(function () {
							return this.value;
						}),
					};
				}
				return { value: "", trim: jest.fn(() => "") };
			});

			checkF1Primers(seq);

			expect(crispr.MARF1primers).toBe(true);
		});

		it("rejects incorrect F1 primer", () => {
			const seq = "GCTCGTGACCACCCTGACCT";
			global.document.getElementById = jest.fn((id) => {
				if (id === "f1_input") {
					return {
						value: "WRONGPRIMER",
						trim: jest.fn(function () {
							return this.value;
						}),
					};
				}
				return { value: "", trim: jest.fn(() => "") };
			});

			checkF1Primers(seq);

			expect(crispr.MARF1primers).toBe(false);
		});

		it("accepts valid F1 primer within range", () => {
			const seq = "ATCGATCGATCG";
			global.document.getElementById = jest.fn((id) => {
				if (id === "f1_input") {
					return {
						value: "TAATACGACTCACTATAGATCGATCGATCG",
						trim: jest.fn(function () {
							return this.value;
						}),
					};
				}
				return { value: "", trim: jest.fn(() => "") };
			});

			checkF1Primers(seq);

			expect(crispr.MARF1primers).toBe(true);
		});
	});

	describe("checkR1Primers()", () => {
		beforeEach(() => {
			resetState();
		});

		it("validates R1 primer for complementary sequence", () => {
			const seq = "ATCGATCG";
			global.document.getElementById = jest.fn((id) => {
				if (id === "r1_input") {
					return {
						value: "TTCTAGCTCTAAAACCGATCGAT",
						trim: jest.fn(function () {
							return this.value;
						}),
					};
				}
				return { value: "", trim: jest.fn(() => "") };
			});

			checkR1Primers(seq);

			expect(crispr.MARR1primers).toBe(true);
		});

		it("rejects incorrect R1 primer", () => {
			const seq = "ATCGATCG";
			global.document.getElementById = jest.fn((id) => {
				if (id === "r1_input") {
					return {
						value: "WRONGPRIMER",
						trim: jest.fn(function () {
							return this.value;
						}),
					};
				}
				return { value: "", trim: jest.fn(() => "") };
			});

			checkR1Primers(seq);

			expect(crispr.MARR1primers).toBe(false);
		});
	});

	describe("fillGeneList()", () => {
		beforeEach(() => {
			resetState();
			// Setup jQuery mock
			global.$ = jest.fn((selector) => {
				return {
					empty: jest.fn(() => global.$returnValue),
					append: jest.fn(() => global.$returnValue),
				};
			});
			global.$returnValue = undefined;
		});

		it("populates gene dropdown with genes from background info", () => {
			setTestState({
				gene_backgroundInfo: {
					gene_list: {
						eBFP: { "Target position": 100 },
						ACTN3: { "Target position": 200 },
					},
				},
			});

			fillGeneList();

			expect(global.$).toHaveBeenCalledWith("#gene_dropdown_selection");
			const calls = global.$.mock.results;
			const emptyCall = calls.find((c) => c.value.empty);
			expect(emptyCall).toBeDefined();
		});

		it("does nothing when no background info", () => {
			setTestState({ gene_backgroundInfo: null });
			fillGeneList();
			expect(global.$).not.toHaveBeenCalled();
		});

		it("does nothing when gene_list is undefined", () => {
			setTestState({ gene_backgroundInfo: {} });
			fillGeneList();
			expect(global.$).not.toHaveBeenCalled();
		});
	});
});
