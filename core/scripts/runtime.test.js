const { loadGeneContent, redirectCRISPR } = require("./runtime");

const LOAD_ERROR_ALERT =
	"<div class='alert alert-danger' role='alert' id='load_error'>SciGrade could not finish loading. Please reload the page.</div>";

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
		global.gene_backgroundInfo = { gene_list: { eBFP: {} } };
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
		delete global.gene_backgroundInfo;
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

		it.each(["loadCRISPRJSON_Files", "fillGeneList"])(
			"shows a reload alert instead of throwing when %s is not defined (Issue #77)",
			async (missingFunction) => {
				const loader = global.loadCRISPRJSON_Files;
				const filler = global.fillGeneList;
				delete global[missingFunction];

				await expect(redirectCRISPR()).resolves.toBeUndefined();

				expect(console.error).toHaveBeenCalledWith(
					"SciGrade could not load crispr_scripts.min.js; gene data is unavailable.",
				);
				expect(loader).not.toHaveBeenCalled();
				expect(filler).not.toHaveBeenCalled();
				expect(global.$).toHaveBeenCalledWith("#selection_process");
				expect(mockJQuery.append).toHaveBeenLastCalledWith(LOAD_ERROR_ALERT);
			},
		);

		it("logs the cause and shows a reload alert when the gene data files fail to load (Issue #77)", async () => {
			const failure = new Error("data/Background_info/gene_background_info.json returned HTTP 500");
			global.loadCRISPRJSON_Files = jest.fn(async () => {
				throw failure;
			});

			await expect(redirectCRISPR()).resolves.toBeUndefined();

			expect(global.fillGeneList).not.toHaveBeenCalled();
			expect(console.error).toHaveBeenCalledWith("SciGrade could not load the gene data files.", failure);
			expect(mockJQuery.append).toHaveBeenLastCalledWith(LOAD_ERROR_ALERT);
		});

		it("shows a reload alert when the loaded gene data has no gene list (Issue #77)", async () => {
			global.gene_backgroundInfo = {};

			await expect(redirectCRISPR()).resolves.toBeUndefined();

			expect(global.loadCRISPRJSON_Files).toHaveBeenCalledTimes(1);
			expect(global.fillGeneList).toHaveBeenCalledTimes(1);
			expect(console.error).toHaveBeenCalledWith("SciGrade could not load the gene data files.");
			expect(mockJQuery.append).toHaveBeenLastCalledWith(LOAD_ERROR_ALERT);
		});

		describe("Bootstrap collapse instances in the feedback cards", () => {
			const replacedDocumentMethods = ["getElementById", "querySelector", "querySelectorAll", "createElement"];

			beforeEach(() => {
				// tests/jest/setupTest.js spies on these methods of the real jsdom document; deleting the own
				// properties exposes the real ones on Document.prototype.
				for (const methodName of replacedDocumentMethods) {
					delete document[methodName];
				}

				document.body.innerHTML = `
					<div id="mainContainer">
						<div id="settled" class="collapse"></div>
						<div id="opening" class="collapse"></div>
						<div id="closing" class="collapse show"></div>
						<div id="untoggled" class="collapse"></div>
					</div>
					<div id="outside" class="collapse"></div>
				`;
				global.$ = require("./APIandLibraries/jQuery/jquery.min.js");
				global.bootstrap = require("./APIandLibraries/Bootstrap/js/bootstrap.bundle.min.js");
			});

			afterEach(() => {
				jest.useRealTimers();
				document.body.innerHTML = "";
				delete global.bootstrap;
				for (const methodName of replacedDocumentMethods) {
					jest.spyOn(document, methodName).mockImplementation(jest.fn());
				}
			});

			/**
			 * Creates a Collapse instance on each element with the given id.
			 * @param {string[]} ids - Ids of the elements to give an instance
			 * @returns {HTMLElement[]} The elements, in the order of the ids
			 */
			function createCollapses(ids) {
				return ids.map((id) => {
					const element = document.getElementById(id);
					new bootstrap.Collapse(element, { toggle: false });
					return element;
				});
			}

			it("disposes settled instances inside #mainContainer before it is emptied, and only those", async () => {
				const [settled, outside] = createCollapses(["settled", "outside"]);

				await redirectCRISPR();

				expect(bootstrap.Collapse.getInstance(settled)).toBeNull();
				expect(bootstrap.Collapse.getInstance(outside)).not.toBeNull();
				expect(document.getElementById("gene_dropdown_selection")).not.toBeNull();
			});

			it("disposes cards that are mid-animation once their transition ends, without an error", async () => {
				jest.useFakeTimers();
				const [opening, closing] = createCollapses(["opening", "closing"]);
				bootstrap.Collapse.getInstance(opening).show();
				bootstrap.Collapse.getInstance(closing).hide();
				expect([opening.className, closing.className]).toEqual(["collapsing", "collapsing"]);

				await redirectCRISPR();

				expect(bootstrap.Collapse.getInstance(opening)).not.toBeNull();
				expect(bootstrap.Collapse.getInstance(closing)).not.toBeNull();
				expect(() => jest.runOnlyPendingTimers()).not.toThrow();
				expect(bootstrap.Collapse.getInstance(opening)).toBeNull();
				expect(bootstrap.Collapse.getInstance(closing)).toBeNull();
			});

			it("still rebuilds the container when Bootstrap did not load", async () => {
				delete global.bootstrap;

				await expect(redirectCRISPR()).resolves.toBeUndefined();

				expect(document.getElementById("settled")).toBeNull();
				expect(document.getElementById("gene_dropdown_selection")).not.toBeNull();
			});
		});

		it("shows no alert when the gene data loads", async () => {
			await redirectCRISPR();

			expect(console.error).not.toHaveBeenCalled();
			expect(global.$).not.toHaveBeenCalledWith("#selection_process");
		});
	});
});
