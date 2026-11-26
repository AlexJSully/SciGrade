const crispr = require("./crispr_scripts");
const {
	getOffTargetOptimalValue,
	createComplementarySeq,
	checkOffTarget,
	checkF1Primers,
	checkR1Primers,
	fillGeneList,
	select_Gene,
	loadWork,
	checkAnswers,
	showFeedback,
	submitAnswers,
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
	});

	afterEach(() => {
		jest.clearAllMocks();
		delete global.document;
	});

	describe("createComplementarySeq()", () => {
		const cases = [
			{ name: "short sequence ATCG", input: "ATCG", want: "CGAT" },
			{ name: "longer sequence", input: "GCTCGTGACCACCCTGACCT", want: "AGGTCAGGGTGGTCACGAGC" },
			{
				name: "gRNA sequence from eBFP marking tests",
				input: "AAGCACTGCACGCCGTGGGT",
				want: "ACCCACGGCGTGCAGTGCTT",
			},
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

		/**
		 * Points the off-target and cut-position inputs at the given off-target value and position 100.
		 * @param {string} offtarget - Value of the off-target input
		 */
		function mockInputs(offtarget) {
			global.document.getElementById = jest.fn((id) => {
				if (id === "offtarget_input") return { value: offtarget };
				if (id === "position_input") return { value: "100" };
				return { value: "" };
			});
		}

		it("sets MAROffTarget true when score matches input within bounds", () => {
			mockInputs("75");

			checkOffTarget(75);

			expect(crispr.MAROffTarget).toBe(true);
		});

		it("sets MAROffTarget degree 1 for score >= 75", () => {
			mockInputs("85");

			checkOffTarget(85);

			expect(crispr.MAROffTarget).toBe(true);
			expect(crispr.MAROffTarget_degree).toBe(1);
		});

		it("sets MAROffTarget degree 2 for score 35-75", () => {
			mockInputs("50");

			checkOffTarget(50);

			expect(crispr.MAROffTarget).toBe(true);
			expect(crispr.MAROffTarget_degree).toBe(2);
		});

		it.each([
			{ correctNucleotideIncluded: false, MARgRNAseq: true },
			{ correctNucleotideIncluded: true, MARgRNAseq: false },
		])(
			"does not set MAROffTarget when correctNucleotideIncluded is $correctNucleotideIncluded and MARgRNAseq is $MARgRNAseq",
			(prerequisites) => {
				setTestState(prerequisites);
				mockInputs("75");

				checkOffTarget(75);

				expect(crispr.MAROffTarget).toBe(false);
				expect(crispr.MAROffTarget_degree).toBe(0);
			},
		);

		it.each([
			{
				name: "marks degree 3 when no score in the window reaches 35",
				entries: [
					{ Position: 100, "Specificity Score": 20 },
					{ Position: 110, "Specificity Score": 30 },
					{ Position: 500, "Specificity Score": 90 },
				],
				score: 20,
				degree: 3,
			},
			{
				name: "marks degree 2 for a score of at least 35 when the window holds a score of at least 80",
				entries: [
					{ Position: 100, "Specificity Score": 50 },
					{ Position: 110, "Specificity Score": 100 },
				],
				score: 50,
				degree: 2,
			},
			{
				name: "includes an entry 35 above the cut position",
				entries: [
					{ Position: 100, "Specificity Score": 50 },
					{ Position: 135, "Specificity Score": 100 },
				],
				score: 50,
				degree: 2,
			},
			{
				name: "includes an entry 35 below the cut position",
				entries: [
					{ Position: 100, "Specificity Score": 50 },
					{ Position: 65, "Specificity Score": 100 },
				],
				score: 50,
				degree: 2,
			},
			{
				name: "ignores entries 36 away from the cut position",
				entries: [
					{ Position: 100, "Specificity Score": 50 },
					{ Position: 136, "Specificity Score": 100 },
					{ Position: 64, "Specificity Score": 100 },
				],
				score: 50,
				degree: 1,
			},
			{
				name: "ignores entries outside the window and entries without a score",
				entries: [
					{ Position: 100, "Specificity Score": 50 },
					{ Position: 101 },
					{ Position: 500, "Specificity Score": 100 },
				],
				score: 50,
				degree: 1,
			},
			{
				name: "grades a matching score against an empty window as degree 1 when it is at least 35",
				entries: [{ Position: 500, "Specificity Score": 90 }],
				score: 50,
				degree: 1,
			},
			{
				name: "grades a matching score below 35 against an empty window as degree 3",
				entries: [{ Position: 500, "Specificity Score": 90 }],
				score: 20,
				degree: 3,
			},
		])("$name (window of 35 around cut position 100)", ({ entries, score, degree }) => {
			setTestState({ benchling_gRNA_outputs: { gene_list: { test_gene: entries } } });
			mockInputs(String(score));

			checkOffTarget(score);

			expect(crispr.MAROffTarget).toBe(true);
			expect(crispr.MAROffTarget_degree).toBe(degree);
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

	describe("checkAnswers()", () => {
		beforeEach(() => {
			resetState();
		});

		it("clears the off-target and primer results of an earlier attempt when the gRNA has no match", () => {
			setTestState({
				MAROffTarget: true,
				MAROffTarget_degree: 1,
				MARF1primers: true,
				MARR1primers: true,
				possible_F1_primers: ["TAATACGACTCACTATAGAAGCACTGCACGCCGT"],
				possible_R1_primers: ["TTCTAGCTCTAAAACACCCACGGCGTGCAGTGCT"],
				gene_backgroundInfo: { gene_list: { test_gene: { "Target position": 100 } } },
				benchling_gRNA_outputs: { gene_list: { test_gene: [{ Sequence: "AAGCACTGCACGCCGTGGGT" }] } },
				current_gene: "test_gene",
			});
			global.document.getElementById = jest.fn((id) => ({
				value: id === "sequence_input" ? "AAAAAAAAAAAAAAAAAAAA" : "",
			}));

			checkAnswers();

			expect(crispr.MAROffTarget).toBe(false);
			expect(crispr.MAROffTarget_degree).toBe(0);
			expect(crispr.MARF1primers).toBe(false);
			expect(crispr.MARR1primers).toBe(false);
			expect(crispr.possible_F1_primers).toEqual([]);
			expect(crispr.possible_R1_primers).toEqual([]);
		});
	});

	describe("fillGeneList()", () => {
		useRealDom(
			'<select id="gene_dropdown_selection"><option>stale</option></select><button id="load_gene_button" disabled></button>',
		);

		beforeEach(() => {
			delete window.__xss;
		});

		it("replaces the dropdown options with one option per gene", () => {
			setTestState({
				gene_backgroundInfo: {
					gene_list: {
						eBFP: { "Target position": 100 },
						ACTN3: { "Target position": 200 },
					},
				},
			});

			fillGeneList();

			const options = document.querySelectorAll("#gene_dropdown_selection option");
			expect([...options].map((option) => option.textContent)).toEqual(["eBFP", "ACTN3"]);
			expect([...options].map((option) => option.value)).toEqual(["eBFP", "ACTN3"]);
		});

		it("renders markup characters in a gene name as text", () => {
			const markupGene = `<img src=x onerror="window.__xss=1">&"'`;
			setTestState({ gene_backgroundInfo: { gene_list: { [markupGene]: { "Target position": 100 } } } });

			fillGeneList();

			const dropdown = document.getElementById("gene_dropdown_selection");
			const option = dropdown.querySelector("option");
			expect(option.textContent).toBe(markupGene);
			expect(option.value).toBe(markupGene);
			expect(option.hasAttribute("tag")).toBe(false);
			expect(dropdown.querySelectorAll("img")).toHaveLength(0);
			expect(window.__xss).toBeUndefined();
		});

		it("enables the Load Gene button once the dropdown is populated", () => {
			setTestState({ gene_backgroundInfo: { gene_list: { eBFP: { "Target position": 100 } } } });

			fillGeneList();

			expect(document.getElementById("load_gene_button").disabled).toBe(false);
		});

		it.each([
			["no background info", null],
			["gene_list is undefined", {}],
		])("does nothing when %s", (_name, gene_backgroundInfo) => {
			setTestState({ gene_backgroundInfo });

			fillGeneList();

			expect(document.getElementById("gene_dropdown_selection").textContent).toBe("stale");
			expect(document.getElementById("load_gene_button").disabled).toBe(true);
		});
	});

	describe("select_Gene()", () => {
		const backgroundInfo = {
			gene_list: {
				eBFP: {
					name: "Enhanced blue fluorescence protein",
					Background: "bg",
					"Target site": "ts",
					Sequence: "ACGT",
				},
				ACTN3: { name: "ACTN3", Background: "bg", "Target site": "ts", Sequence: "ACGT" },
			},
		};

		useRealDom('<div id="work"></div>');

		beforeEach(() => {
			global.alert = jest.fn();
		});

		afterEach(() => {
			delete global.alert;
		});

		it("selects a valid gene and renders the work page without alerting", () => {
			setTestState({ gene_backgroundInfo: backgroundInfo, possible_gene: "eBFP", current_gene: "empty" });

			select_Gene();

			expect(global.alert).not.toHaveBeenCalled();
			expect(document.getElementById("sequence_input")).not.toBeNull();
		});

		it("alerts sG34-42 and resets current_gene when possible_gene is empty", () => {
			setTestState({ gene_backgroundInfo: backgroundInfo, possible_gene: "", current_gene: "eBFP" });

			select_Gene();

			expect(global.alert).toHaveBeenCalledWith(expect.stringContaining("sG34-42"));
			expect(crispr.current_gene).toBe("empty");
		});

		it("alerts sG34-42 for an unknown gene not present in gene_list (e.g. ANKK1)", () => {
			setTestState({ gene_backgroundInfo: backgroundInfo, possible_gene: "ANKK1", current_gene: "eBFP" });

			select_Gene();

			expect(global.alert).toHaveBeenCalledWith(expect.stringContaining("sG34-42"));
			expect(document.getElementById("work").childElementCount).toBe(0);
		});

		it("alerts sG34-42 and does not throw when background data is not loaded", () => {
			setTestState({ gene_backgroundInfo: null, possible_gene: "eBFP", current_gene: "empty" });

			expect(() => select_Gene()).not.toThrow();
			expect(global.alert).toHaveBeenCalledWith(expect.stringContaining("sG34-42"));
		});
	});

	describe("loadWork()", () => {
		const backgroundInfo = {
			gene_list: {
				eBFP: {
					name: "Enhanced blue fluorescence protein",
					Background: "bg",
					"Target site": "ts",
					Sequence: "ACGT",
				},
			},
		};

		useRealDom('<div id="work"></div>');

		beforeEach(() => {
			global.alert = jest.fn();
			delete window.__xss;
		});

		afterEach(() => {
			delete global.alert;
		});

		it("renders the work page with the current gene's background information", () => {
			setTestState({ gene_backgroundInfo: backgroundInfo, current_gene: "eBFP" });

			loadWork();

			expect(global.alert).not.toHaveBeenCalled();
			const paragraphs = [...document.querySelectorAll("#gene_info p")].map((p) => p.textContent);
			expect(paragraphs).toEqual([
				"Here is some background information about your gene: Enhanced blue fluorescence protein (eBFP)",
				"Background information: bg",
				"Target site: ts",
				"Modified genetic sequence: ACGT",
			]);
			expect(document.getElementById("sequence_input")).not.toBeNull();
		});

		it("renders markup characters in the gene data as text", () => {
			const gene = {
				name: `<b>&"'</b>`,
				Background: '<img src=x onerror="window.__xss=1">',
				"Target site": "<i>ts</i>",
				Sequence: "<script>window.__xss=1</script>",
			};
			setTestState({ gene_backgroundInfo: { gene_list: { eBFP: gene } }, current_gene: "eBFP" });

			loadWork();

			const geneInfo = document.getElementById("gene_info");
			for (const value of Object.values(gene)) {
				expect(geneInfo.textContent).toContain(value);
			}
			expect(geneInfo.querySelectorAll("img, b, i, script")).toHaveLength(0);
			expect(window.__xss).toBeUndefined();
		});

		it("names every field by its label and describes each input with its hint", () => {
			setTestState({ gene_backgroundInfo: backgroundInfo, current_gene: "eBFP" });

			loadWork();

			for (const control of document.querySelectorAll("#work input, #work select")) {
				expect(control.hasAttribute("aria-label")).toBe(false);
				expect(document.querySelector(`label[for="${control.id}"]`)).not.toBeNull();
			}
			const inputs = document.querySelectorAll("#work input");
			expect(inputs).toHaveLength(6);
			for (const input of inputs) {
				const hint = document.getElementById(input.getAttribute("aria-describedby"));
				expect(hint.tagName).toBe("SMALL");
				expect(hint.id).toBe(`${input.id}Small`);
			}
		});

		it("alerts lFS50-66 and does not render when current_gene is missing from gene_list", () => {
			setTestState({ gene_backgroundInfo: backgroundInfo, current_gene: "empty" });

			loadWork();

			expect(global.alert).toHaveBeenCalledWith(expect.stringContaining("lFS50-66"));
			expect(document.getElementById("work").childElementCount).toBe(0);
		});

		it("alerts lFS50-66 without throwing a ReferenceError when background data is null", () => {
			setTestState({ gene_backgroundInfo: null, current_gene: "eBFP" });

			expect(() => loadWork()).not.toThrow();
			expect(global.alert).toHaveBeenCalledWith(expect.stringContaining("lFS50-66"));
		});

		it("alerts lFS50-66 when gene_backgroundInfo is an empty string", () => {
			setTestState({ gene_backgroundInfo: "", current_gene: "eBFP" });

			expect(() => loadWork()).not.toThrow();
			expect(global.alert).toHaveBeenCalledWith(expect.stringContaining("lFS50-66"));
		});
	});
});

describe("crispr_scripts.js - fillGeneList() then loadWork()", () => {
	// Gene keys that match ids in the work form. The dropdown sits before #work, as in runtime.js, so an option
	// carrying its gene key as an id would be found by an id lookup first.
	useRealDom(
		'<select id="gene_dropdown_selection"></select><button id="load_gene_button" disabled></button><div id="work"></div>',
	);

	beforeEach(() => {
		global.alert = jest.fn();
	});

	afterEach(() => {
		delete global.alert;
	});

	it.each(["gene_info", "work"])("renders the background into the work form for a gene named %s", (geneKey) => {
		setTestState({
			gene_backgroundInfo: {
				gene_list: { [geneKey]: { name: "Name", Background: "bg", "Target site": "ts", Sequence: "ACGT" } },
			},
			current_gene: geneKey,
		});

		fillGeneList();
		loadWork();

		const option = document.querySelector("#gene_dropdown_selection option");
		expect(option.value).toBe(geneKey);
		expect(option.childElementCount).toBe(0);
		expect(option.hasAttribute("id")).toBe(false);
		const work = document.querySelector("div#work");
		expect(work.querySelectorAll('[id="gene_info"] p')).toHaveLength(4);
		expect(work.querySelector("#sequence_input")).not.toBeNull();
	});
});
/**
 * Registers hooks that give each test in the enclosing suite the real jsdom document and the real jQuery.
 * @param {string} bodyHtml - Markup placed in document.body before each test
 */
function useRealDom(bodyHtml) {
	const replacedDocumentMethods = ["getElementById", "querySelector", "querySelectorAll", "createElement"];

	beforeEach(() => {
		resetState();

		// tests/jest/setupTest.js and the suite above replace these methods on the real jsdom
		// document; deleting the own properties exposes the real ones on Document.prototype.
		for (const methodName of replacedDocumentMethods) {
			delete document[methodName];
		}

		document.body.innerHTML = bodyHtml;
		global.$ = require("./APIandLibraries/jQuery/jquery.min.js");
	});

	afterEach(() => {
		document.body.innerHTML = "";
		delete global.$;
	});
}

describe("crispr_scripts.js - showFeedback()", () => {
	useRealDom('<div id="mainContainer"></div>');

	beforeEach(() => {
		delete window.__xss;
	});

	it("renders markup characters in answers and primer candidates as text", () => {
		const answers = [
			'<img src=x onerror="window.__xss=1">',
			`<b>&"'</b>`,
			"380",
			"Sense (+)",
			"<i>60</i>",
			"<script>window.__xss=1</script>",
			"&amp;",
		];
		const markupPrimer = "TAATACGACTCACTATAG<img src=y>";
		setTestState({
			all_answers: answers,
			all_marks: [0, "0.00"],
			possible_F1_primers: [markupPrimer],
		});

		showFeedback();

		const container = document.getElementById("mainContainer");
		for (const answer of [answers[0], answers[1], answers[4], answers[5], answers[6]]) {
			expect(container.textContent).toContain(`you put down "${answer}"`);
		}
		expect(container.textContent).toContain(`${markupPrimer}.`);
		expect(container.querySelectorAll("img, b, i, script")).toHaveLength(0);
		expect(window.__xss).toBeUndefined();
	});

	it("links each card's toggle button to its own collapsible body", () => {
		setTestState({ all_answers: ["", "", "", "", "", "", ""], all_marks: [0, "0.00"] });

		showFeedback();

		const cards = document.querySelectorAll("#mainContainer .card.about");
		expect(cards).toHaveLength(5);
		for (const card of cards) {
			const header = card.querySelector(".card-header");
			const toggle = header.querySelector("h3.h5.mb-0 > button.btn.btn-link");
			const output = card.querySelector(".collapse > .card-body").parentElement;

			expect(toggle.getAttribute("data-bs-toggle")).toBe("collapse");
			expect(toggle.getAttribute("data-bs-target")).toBe(`#${output.id}`);
			expect(toggle.getAttribute("aria-controls")).toBe(output.id);
			expect(output.getAttribute("aria-labelledby")).toBe(header.id);
		}
		expect(cards[0].querySelector("button").textContent).toBe("gRNA Strand Sequence: 0/2");
	});

	it("titles the feedback with an h2 over h3 cards and moves focus to that h2", () => {
		setTestState({ all_answers: ["", "", "", "", "", "", ""], all_marks: [0, "0.00"] });

		showFeedback();

		const headings = [...document.querySelectorAll("#mainContainer :is(h1, h2, h3, h4, h5, h6)")];
		expect(headings.map((h) => h.tagName)).toEqual(["H2", "H3", "H3", "H3", "H3", "H3"]);
		expect(document.activeElement).toBe(document.getElementById("feedback_heading"));
		expect(document.activeElement.textContent).toBe("Here is the feedback for your practice attempt.");
		expect(document.querySelector("#mainContainer button[onclick]").getAttribute("onclick")).toBe(
			"returnToGeneSelection();",
		);
	});

	it("says no primer candidates were generated when the gRNA was not accepted", () => {
		setTestState({ all_answers: ["", "", "", "", "", "", ""], all_marks: [0, "0.00"] });

		showFeedback();

		for (const label of ["F1", "R1"]) {
			const cardText = document.getElementById(`${label}PrimerOutput`).textContent;

			expect(cardText).toContain(
				`No ${label} primer candidates were generated because primers are only checked once your gRNA sequence is accepted.`,
			);
			expect(cardText).not.toContain("inputted:");
		}
	});
});

describe("crispr_scripts.js - submitAnswers()", () => {
	const inputIds = [
		"sequence_input",
		"pam_input",
		"position_input",
		"strand_input",
		"offtarget_input",
		"f1_input",
		"r1_input",
	];
	const gRNA = "ACGTACGTACGTACGTACGT";

	useRealDom(`${inputIds.map((id) => `<input id="${id}">`).join("")}<div id="mainContainer"></div>`);

	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	/**
	 * Loads one gene whose target nucleotide sits at zero-based position 95, with the given reference entries.
	 * @param {object[]} entries - Benchling gRNA output entries for the gene
	 */
	function loadGene(entries) {
		setTestState({
			gene_backgroundInfo: { gene_list: { test_gene: { "Target position": 96 } } },
			benchling_gRNA_outputs: { gene_list: { test_gene: entries } },
			current_gene: "test_gene",
		});
	}

	/**
	 * Fills the submission form, leaving both primer inputs empty.
	 * @param {object} answers - Values for the gRNA, PAM, cut position and off-target score inputs
	 */
	function fillForm({ sequence, pam, position, offTarget }) {
		const values = [sequence, pam, position, "Sense (+)", offTarget, "", ""];
		inputIds.forEach((id, index) => {
			document.getElementById(id).value = values[index];
		});
	}

	it("shows the answers that were graded when an input changes before the feedback renders", () => {
		loadGene([{ Sequence: gRNA, Strand: 1, Position: 100, PAM: "AGG", "Specificity Score": 90 }]);
		fillForm({ sequence: gRNA, pam: "AGG", position: "100", offTarget: "90" });

		submitAnswers();
		document.getElementById("sequence_input").value = "TTTTTTTTTTTTTTTTTTTT";
		jest.advanceTimersByTime(750);

		const feedbackText = document.getElementById("mainContainer").textContent;
		expect(feedbackText).toContain(`you put down "${gRNA}"`);
		expect(feedbackText).not.toContain("TTTTTTTTTTTTTTTTTTTT");
	});

	it("marks a gRNA matching two reference entries by the better entry alone", () => {
		// The first entry is worth 5 marks (partial gRNA 1, PAM 2, off-target 2) and the second 4 (gRNA 2,
		// off-target 2); combining the first entry's PAM with the second entry's gRNA would give 6.
		loadGene([
			{ Sequence: gRNA, Strand: 1, Position: 110, PAM: "AGG", "Specificity Score": 90 },
			{ Sequence: gRNA, Strand: 1, Position: 100, PAM: "TGG", "Specificity Score": 90 },
		]);
		fillForm({ sequence: gRNA, pam: "AGG", position: "100", offTarget: "90" });

		submitAnswers();
		jest.advanceTimersByTime(750);

		expect(document.getElementById("mainContainer").textContent).toContain("Mark: 5/10");
	});
});

describe("crispr_scripts.js - loadCRISPRJSON_Files()", () => {
	const { loadCRISPRJSON_Files } = crispr;
	const benchling = { gene_list: { eBFP: [] } };
	const background = { gene_list: { eBFP: { name: "eBFP" } } };

	beforeEach(() => {
		setTestState({ benchling_gRNA_outputs: null, gene_backgroundInfo: null });
		fetch.mockReset();
	});

	it("starts both fetches before either response is read", async () => {
		const first = Promise.withResolvers();
		const second = Promise.withResolvers();
		fetch
			.mockResolvedValueOnce({ ok: true, json: () => first.promise })
			.mockResolvedValueOnce({ ok: true, json: () => second.promise });

		const loading = loadCRISPRJSON_Files();
		await Promise.resolve();

		expect(fetch.mock.calls.map(([url]) => url)).toEqual([
			"./data/Benchling_gRNA_Outputs.json",
			"data/Background_info/gene_background_info.json",
		]);
		first.resolve(benchling);
		second.resolve(background);
		await loading;
		expect(crispr.benchling_gRNA_outputs).toBe(benchling);
		expect(crispr.gene_backgroundInfo).toBe(background);
	});

	it("does not fetch again once both files are loaded", async () => {
		fetch
			.mockResolvedValueOnce(createMockJsonResponse(benchling))
			.mockResolvedValueOnce(createMockJsonResponse(background));

		await loadCRISPRJSON_Files();
		await loadCRISPRJSON_Files();

		expect(fetch).toHaveBeenCalledTimes(2);
		expect(crispr.gene_backgroundInfo).toBe(background);
	});

	it("rejects with the fetch error, keeps neither file, and retries on the next call", async () => {
		const failure = new Error("offline");
		fetch.mockResolvedValueOnce(createMockJsonResponse(benchling)).mockRejectedValueOnce(failure);

		await expect(loadCRISPRJSON_Files()).rejects.toBe(failure);

		expect(crispr.benchling_gRNA_outputs).toBeFalsy();
		expect(crispr.gene_backgroundInfo).toBeFalsy();

		fetch
			.mockResolvedValueOnce(createMockJsonResponse(benchling))
			.mockResolvedValueOnce(createMockJsonResponse(background));
		await loadCRISPRJSON_Files();

		expect(fetch).toHaveBeenCalledTimes(4);
		expect(crispr.benchling_gRNA_outputs).toBe(benchling);
		expect(crispr.gene_backgroundInfo).toBe(background);
	});

	it("rejects without reading the body when a file responds with a non-OK status", async () => {
		const notFound = { ok: false, status: 404, json: jest.fn() };
		fetch.mockResolvedValueOnce(createMockJsonResponse(benchling)).mockResolvedValueOnce(notFound);

		await expect(loadCRISPRJSON_Files()).rejects.toThrow(
			"data/Background_info/gene_background_info.json returned HTTP 404",
		);

		expect(notFound.json).not.toHaveBeenCalled();
		expect(crispr.benchling_gRNA_outputs).toBeFalsy();
		expect(crispr.gene_backgroundInfo).toBeFalsy();
	});
});
