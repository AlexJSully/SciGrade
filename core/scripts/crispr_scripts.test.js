/**
 * Unit tests for crispr_scripts.js
 * Tests isolated utility functions and logic
 */

describe("crispr_scripts.js - Utility Functions", () => {
	// Test the isNumberOrDashKey function without DOM dependencies
	describe("isNumberOrDashKey()", () => {
		// Define the function for testing
		const isNumberOrDashKey = (evt) => {
			const charCode = evt.which ? evt.which : evt.keyCode;
			return !(charCode !== 46 && charCode !== 45 && charCode > 31 && (charCode < 48 || charCode > 57));
		};

		it("should return true for number keys", () => {
			const event1 = { which: 48 }; // '0'
			const event2 = { which: 57 }; // '9'
			const event3 = { keyCode: 53 }; // '5'

			expect(isNumberOrDashKey(event1)).toBe(true);
			expect(isNumberOrDashKey(event2)).toBe(true);
			expect(isNumberOrDashKey(event3)).toBe(true);
		});

		it("should return true for dash key", () => {
			const event = { which: 45 }; // '-'
			expect(isNumberOrDashKey(event)).toBe(true);
		});

		it("should return true for period key", () => {
			const event = { which: 46 }; // '.'
			expect(isNumberOrDashKey(event)).toBe(true);
		});

		it("should return false for letter keys", () => {
			const event1 = { which: 65 }; // 'A'
			const event2 = { which: 90 }; // 'Z'
			const event3 = { which: 97 }; // 'a'

			expect(isNumberOrDashKey(event1)).toBe(false);
			expect(isNumberOrDashKey(event2)).toBe(false);
			expect(isNumberOrDashKey(event3)).toBe(false);
		});

		it("should return false for special characters", () => {
			const event1 = { which: 33 }; // '!'
			const event2 = { which: 64 }; // '@'

			expect(isNumberOrDashKey(event1)).toBe(false);
			expect(isNumberOrDashKey(event2)).toBe(false);
		});
	});

	// Test the createComplementarySeq function
	describe("createComplementarySeq()", () => {
		const complementary_nt_dict = {
			A: "T",
			T: "A",
			C: "G",
			G: "C",
		};

		const createComplementarySeq = (seq) => {
			let comp_seq = "";
			for (const element of seq) {
				comp_seq = complementary_nt_dict[element] + comp_seq;
			}
			return comp_seq;
		};

		it("should create correct complementary sequence", () => {
			const sequence = "ATCG";
			const result = createComplementarySeq(sequence);
			expect(result).toBe("CGAT");
		});

		it("should handle longer sequences", () => {
			const sequence = "GCTCGTGACCACCCTGACCT";
			const result = createComplementarySeq(sequence);
			expect(result).toBe("AGGTCAGGGTGGTCACGAGC");
		});

		it("should handle empty sequence", () => {
			const sequence = "";
			const result = createComplementarySeq(sequence);
			expect(result).toBe("");
		});

		it("should handle single nucleotide", () => {
			expect(createComplementarySeq("A")).toBe("T");
			expect(createComplementarySeq("T")).toBe("A");
			expect(createComplementarySeq("C")).toBe("G");
			expect(createComplementarySeq("G")).toBe("C");
		});
	});

	// Test marking logic without DOM dependencies
	describe("markAnswers() logic", () => {
		const calculateMarks = (answers) => {
			let studentMark = 0;
			const {
				MARgRNAseq,
				MARgRNAseq_degree,
				MARPAMseq,
				MAROffTarget,
				MAROffTarget_degree,
				MARF1primers,
				MARR1primers,
			} = answers;

			if (MARgRNAseq) {
				if (MARgRNAseq_degree === 1) {
					studentMark += 2;
				} else if (MARgRNAseq_degree === 2) {
					studentMark += 1;
				} else if (MARgRNAseq_degree === 3) {
					studentMark += 0.5;
				}
			}
			if (MARPAMseq) {
				studentMark += 2;
			}
			if (MAROffTarget) {
				if (MAROffTarget_degree === 1) {
					studentMark += 2;
				} else if (MAROffTarget_degree === 2) {
					studentMark += 1;
				} else if (MAROffTarget_degree === 3) {
					studentMark += 0.5;
				}
			}
			if (MARF1primers) {
				studentMark += 2;
			}
			if (MARR1primers) {
				studentMark += 2;
			}

			const studentMarkPercentage = ((studentMark / 10) * 100).toFixed(2);
			return { studentMark, studentMarkPercentage };
		};

		it("should calculate full marks correctly", () => {
			const answers = {
				MARgRNAseq: true,
				MARgRNAseq_degree: 1,
				MARPAMseq: true,
				MAROffTarget: true,
				MAROffTarget_degree: 1,
				MARF1primers: true,
				MARR1primers: true,
			};

			const result = calculateMarks(answers);
			expect(result.studentMark).toBe(10);
			expect(parseFloat(result.studentMarkPercentage)).toBe(100);
		});

		it("should calculate partial marks correctly", () => {
			const answers = {
				MARgRNAseq: true,
				MARgRNAseq_degree: 2, // 1 mark
				MARPAMseq: true, // 2 marks
				MAROffTarget: false, // 0 marks
				MAROffTarget_degree: 0,
				MARF1primers: true, // 2 marks
				MARR1primers: false, // 0 marks
			};

			const result = calculateMarks(answers);
			expect(result.studentMark).toBe(5);
			expect(parseFloat(result.studentMarkPercentage)).toBe(50);
		});

		it("should handle zero marks", () => {
			const answers = {
				MARgRNAseq: false,
				MARgRNAseq_degree: 0,
				MARPAMseq: false,
				MAROffTarget: false,
				MAROffTarget_degree: 0,
				MARF1primers: false,
				MARR1primers: false,
			};

			const result = calculateMarks(answers);
			expect(result.studentMark).toBe(0);
			expect(parseFloat(result.studentMarkPercentage)).toBe(0);
		});

		it("should handle fractional marks", () => {
			const answers = {
				MARgRNAseq: true,
				MARgRNAseq_degree: 3, // 0.5 marks
				MARPAMseq: false,
				MAROffTarget: true,
				MAROffTarget_degree: 3, // 0.5 marks
				MARF1primers: false,
				MARR1primers: false,
			};

			const result = calculateMarks(answers);
			expect(result.studentMark).toBe(1);
			expect(parseFloat(result.studentMarkPercentage)).toBe(10);
		});
	});

	// Test off-target scoring logic
	describe("checkOffTarget() logic", () => {
		const checkOffTargetScore = (score, inputValue, prerequisites) => {
			const { correctNucleotideIncluded, MARgRNAseq } = prerequisites;
			let MAROffTarget = false;
			let MAROffTarget_degree = 0;
			let MAROffTarget_aboveOpt = false;
			let MAROffTarget_above35 = false;
			let MAROffTarget_onlyOption = false;

			const OffTargetValue_down = Math.floor(score);
			const OffTargetValue_up = Math.ceil(score);

			if (correctNucleotideIncluded && MARgRNAseq) {
				if (inputValue >= OffTargetValue_down && inputValue <= OffTargetValue_up) {
					MAROffTarget = true;
					if (score >= 75) {
						MAROffTarget_degree = 1;
						MAROffTarget_aboveOpt = true;
					} else if (score >= 35) {
						MAROffTarget_degree = 2;
						MAROffTarget_above35 = true;
					} else {
						MAROffTarget_degree = 3;
						MAROffTarget_onlyOption = true;
					}
				}
			}

			return {
				MAROffTarget,
				MAROffTarget_degree,
				MAROffTarget_aboveOpt,
				MAROffTarget_above35,
				MAROffTarget_onlyOption,
			};
		};

		it("should set correct off-target marking for high score", () => {
			const result = checkOffTargetScore(85, 85, {
				correctNucleotideIncluded: true,
				MARgRNAseq: true,
			});

			expect(result.MAROffTarget).toBe(true);
			expect(result.MAROffTarget_degree).toBe(1);
			expect(result.MAROffTarget_aboveOpt).toBe(true);
		});

		it("should set correct off-target marking for medium score", () => {
			const result = checkOffTargetScore(50, 50, {
				correctNucleotideIncluded: true,
				MARgRNAseq: true,
			});

			expect(result.MAROffTarget).toBe(true);
			expect(result.MAROffTarget_degree).toBe(2);
			expect(result.MAROffTarget_above35).toBe(true);
		});

		it("should set correct off-target marking for low score", () => {
			const result = checkOffTargetScore(25, 25, {
				correctNucleotideIncluded: true,
				MARgRNAseq: true,
			});

			expect(result.MAROffTarget).toBe(true);
			expect(result.MAROffTarget_degree).toBe(3);
			expect(result.MAROffTarget_onlyOption).toBe(true);
		});

		it("should not set off-target marking when prerequisites not met", () => {
			const result = checkOffTargetScore(85, 85, {
				correctNucleotideIncluded: false,
				MARgRNAseq: false,
			});

			expect(result.MAROffTarget).toBe(false);
			expect(result.MAROffTarget_degree).toBe(0);
		});

		it("should handle decimal scores correctly", () => {
			const result = checkOffTargetScore(85.7, 85, {
				correctNucleotideIncluded: true,
				MARgRNAseq: true,
			});

			expect(result.MAROffTarget).toBe(true);
			expect(result.MAROffTarget_degree).toBe(1);
		});
	});

	// Test primer generation logic
	describe("F1 Primer generation logic", () => {
		const generateF1Primers = (seq) => {
			const possible_F1_primers = [];
			const begin_F1 = "TAATACGACTCACTATAG";
			let count_First = true;
			if (seq[0] === "G") {
				count_First = false;
			}
			for (let i = 16; i <= 20; i += 1) {
				possible_F1_primers.push(begin_F1 + seq.slice(0, i));
			}
			if (!count_First) {
				for (let i = 16; i <= 20; i += 1) {
					possible_F1_primers.push(begin_F1 + seq.slice(1, i));
				}
			}
			return possible_F1_primers;
		};

		const validateF1Primer = (seq, inputPrimer) => {
			const possiblePrimers = generateF1Primers(seq);
			return possiblePrimers.includes(inputPrimer);
		};

		it("should generate correct F1 primers for sequence starting with G", () => {
			const sequence = "GCTCGTGACCACCCTGACCT";
			const primers = generateF1Primers(sequence);

			expect(primers.length).toBeGreaterThan(5);
			expect(primers[0]).toBe("TAATACGACTCACTATAGGCTCGTGACCACCCTG");
		});

		it("should validate correct F1 primer", () => {
			const sequence = "GCTCGTGACCACCCTGACCT";
			const primer = "TAATACGACTCACTATAGCTCGTGACCACCCTGA";

			expect(validateF1Primer(sequence, primer)).toBe(true);
		});

		it("should reject incorrect F1 primer", () => {
			const sequence = "GCTCGTGACCACCCTGACCT";
			const primer = "WRONGPRIMER";

			expect(validateF1Primer(sequence, primer)).toBe(false);
		});
	});

	// Test gene list functionality
	describe("Gene list functionality", () => {
		const fillGeneList = (gene_backgroundInfo) => {
			if (gene_backgroundInfo?.gene_list) {
				return Object.keys(gene_backgroundInfo.gene_list);
			}
			return [];
		};

		it("should return gene list when background info exists", () => {
			const backgroundInfo = {
				gene_list: {
					eBFP: { "Target position": 100 },
					ACTN3: { "Target position": 200 },
				},
			};

			const result = fillGeneList(backgroundInfo);
			expect(result).toEqual(["eBFP", "ACTN3"]);
		});

		it("should return empty array when no background info", () => {
			const result = fillGeneList(null);
			expect(result).toEqual([]);
		});

		it("should return empty array when gene_list is undefined", () => {
			const backgroundInfo = {};
			const result = fillGeneList(backgroundInfo);
			expect(result).toEqual([]);
		});
	});
});
