/* eslint-disable indent */
//= ================================ SciGrade ==================================
//
// Purpose: General script for SciGrade
//
//= ============================================================================

let selection_inMode = "practice";

const listOfGenes = ["eBFP", "ACTN3", "HBB", "CCR5", "ANKK1", "APOE"];
let possible_gene = "eBFP";
let current_gene = "empty";

/**
 * Purpose of this is to assign the current gene and check for errors
 */
function select_Gene() {
	if (possible_gene !== "" || possible_gene) {
		current_gene = possible_gene;
		loadWork();
		checkAnswers_executed = false;
	} else {
		if (
			current_gene !== "empty" ||
			current_gene !== "eBFP" ||
			current_gene !== "ACTN3" ||
			current_gene !== "HBB" ||
			current_gene !== "CCR5" ||
			current_gene !== "ANKK1" ||
			current_gene !== "APOE"
		) {
			current_gene = "empty";
		}
		alert("Error code sG34-42 occurred. Please contact admin or TA!");
	}
}

let gene_backgroundInfo;
let benchling_grna_outputs;
/**
 * Load JSON files
 */
async function loadCRISPRJSON_Files() {
	try {
		// Fetch Benchling_gRNA_Ouputs.json
		const responseBenchling = await fetch("data/Benchling_gRNA_Outputs.json");
		benchling_grna_outputs = await responseBenchling.json();

		// Fetch gene_background_info.json
		const responseGeneBackground = await fetch("data/Background_info/gene_background_info.json");
		gene_backgroundInfo = await responseGeneBackground.json();
	} catch (err) {
		console.error("Error fetching file:", err);
	}
}

let list_of_practice = ["eBFP"];
/**
 * Fill in and create a list of genes
 */
function fillGeneList() {
	if (gene_backgroundInfo?.gene_list) {
		$("#gene_dropdown_selection").empty();
		list_of_practice = [];

		let append_str;

		const listOfGenes = Object.keys(gene_backgroundInfo.gene_list);

		for (const gene of listOfGenes) {
			list_of_practice.push(gene);
			append_str += `
				<option value="${gene}" id="${gene}" tag="practice">${gene}</option>
			`;
		}

		$("#gene_dropdown_selection").append(append_str);
	}
}

let loadedMode = "practice";
/**
 * Dynamically creates the work page for SciGrade
 */
function loadWork() {
	if (gene_backgroundInfo || gene_backgroundInfo !== "" || backgroundInfo?.[0].gene_list[current_gene]) {
		$("#work").empty();
		loadedMode = selection_inMode;
		checkAnswers_executed = false;
		let append_str;

		// Begin background information
		append_str = '<div class="work_background" style="margin-top:2%;">';

		// CRISPR header information
		append_str +=
			'<div id="crispr_header">\n<p>Please refer to your dry lab protocol for full instructions on how and what to do. Below is a brief reminder of what you are supposed to do with each gene: \n <b>Your objective is to find these mutations, design a gRNA and its corresponding F1/R1 primers</b></p> \n</div>\n';

		// Gene information
		append_str += `<div id="gene_info"><p>Here is some background information about your gene: ${gene_backgroundInfo?.gene_list[current_gene].name} (${current_gene})</p>\n`;
		append_str += `<p> Background information: ${gene_backgroundInfo?.gene_list[current_gene].Background}</p>\n`;
		append_str += `<p> Target site: ${gene_backgroundInfo?.gene_list[current_gene]["Target site"]}</p>\n`;
		append_str += `<p style="word-wrap:break-word;"> Modified genetic sequence: ${gene_backgroundInfo?.gene_list[current_gene].Sequence}</p>\n`;
		append_str += "</div>";

		// End background information
		append_str += "</div>";

		// Begin gene assignment work
		append_str += '<div id="work_section">';

		// Gene assignment form inputs
		append_str += "<p> Please input the following information for your gRNA for your selected gene.</p>\n";
		append_str += "<form>";

		// gRNA sequence
		append_str += '<div class="form-group">';
		append_str += '<label for="sequence_input">gRNA Sequence:</label>';
		append_str +=
			'<input class="form-control" id="sequence_input" placeholder="CTCGTGACCACCCTGACCCA" maxlength="20" required>';
		append_str +=
			'<small id="sequence_inputSmall" class="form-text text-muted">This would be your gRNA sequence 5\' to 3\'. NOTE: This is maxed out at 20 characters long</small>';
		append_str += "</div>";

		// PAM sequence
		append_str += '<div class="form-group">';
		append_str += '<label for="pam_input">PAM Sequence:</label>';
		append_str += '<input class="form-control" id="pam_input" placeholder="CGG" maxlength="3" required>';
		append_str +=
			'<small id="pam_inputSmall" class="form-text text-muted">This would be your PAM sequence 5\' to 3\'. NOTE: This is maxed out at 3 characters long</small>';
		append_str += "</div>";

		// Position
		append_str += '<div class="form-group">';
		append_str += '<label for="position_input">Cut position:</label>';
		append_str += '<input class="form-control" id="position_input" placeholder="380" type="number" required>';
		append_str +=
			'<small id="position_inputSmall" class="form-text text-muted">This would be your cut position for your gRNA. NOTE: This input only takes numbers</small>';
		append_str += "</div>";

		// Strand
		append_str += '<div class="form-group">';
		append_str += '<label for="strand_input">gRNA Strand:</label>';
		append_str +=
			'<select class="form-control" id="strand_input"><option>Antisense (-)</option><option>Sense (+)</option></select>';
		append_str +=
			'<small id="strand_inputSmall" class="form-text text-muted">This would be for which strand your gRNA is on.</small>';
		append_str += "</div>";

		// Off-target score
		append_str += '<div class="form-group">';
		append_str += '<label for="offtarget_input">Off-target score:</label>';
		append_str +=
			'<input class="form-control" id="offtarget_input" placeholder="60.7" step="0.01" type="number" required>';
		append_str +=
			'<small id="position_inputSmall" class="form-text text-muted">This would be your off-target score for your gRNA. NOTE: This input only takes numbers</small>';
		append_str += "</div>";

		// F1 Primers
		append_str += '<div class="form-group">';
		append_str += '<label for="f1_input">F1 Primers:</label>';
		append_str +=
			'<input class="form-control" id="f1_input" placeholder="TAATACGACTCACTATAGCTCGTGACCACCCTGA" required>';
		append_str +=
			'<small id="f1_inputSmall" class="form-text text-muted">This would be your forward primer (F1) for your gRNA</small>';
		append_str += "</div>";

		// R1 Primers
		append_str += '<div class="form-group">';
		append_str += '<label for="r1_input">R1 Primers:</label>';
		append_str +=
			'<input class="form-control" id="r1_input" placeholder="TTCTAGCTCTAAAACTGGGTCAGGGTGGTCACGAG" required>';
		append_str +=
			'<small id="r1_inputSmall" class="form-text text-muted">This would be your reverse primer (R1) for your gRNA</small>';
		append_str += "</div>";

		// Buttons
		append_str += '<button type="button" class="btn btn-success" style="margin:1%;" hidden>Save</button>';
		append_str +=
			'<button id="assignmentSubmitButton" type="button" class="btn btn-primary" style="margin:1%;" onclick="submitAnswers();">Submit</button>';

		// End form
		append_str += "</form>";

		// End gene assignment work
		append_str += "</div>";

		$("#work").append(append_str);
	} else if (gene_backgroundInfo === "" || !gene_backgroundInfo || !backgroundInfo?.[0].gene_list[current_gene]) {
		alert("Error code lFS50-66 occurred. Please contact admin or TA!");
	}
}

/**
 * @param {event} evt - Character key press
 * @return {bool} - Returns true if number or dash, else false
 * Determine if a number or dash key is pressed
 */
function isNumberOrDashKey(evt) {
	const charCode = evt.which ? evt.which : evt.keyCode;
	return !(charCode !== 46 && charCode !== 45 && charCode > 31 && (charCode < 48 || charCode > 57));
}

// Global marking variables:
let MARgRNAseq = false;
let MARgRNAseq_degree = 0; // 0 wrong, 1 correct, 2 partial of <20bp, 3 technically correct of <30bp
let MARPAMseq = false;
let MARCutPos = false;
let MARstrand = false;
let MAROffTarget = false;
let MAROffTarget_degree = 0; // 0 wrong, 1 above 75, 2 above 35, 3 only option
let MAROffTarget_aboveOpt = false;
let MAROffTarget_above35 = false;
let MAROffTarget_onlyOption = false;
let MARF1primers = false;
let MARR1primers = false;

let possible_comparable_answers = [];
let correctNucleotideIncluded = false;
let true_counts = 0; // This exists for the instance that there is more than one match for inputtedSeq

let checkAnswers_executed = false;
/**
 * Checks the answer in the submission form and determines if they are correct or not
 */
function checkAnswers() {
	// Reset answers:
	MARgRNAseq = false;
	MARgRNAseq_degree = 0;
	MARPAMseq = false;
	MARCutPos = false;
	MARstrand = false;
	correctNucleotideIncluded = false;
	true_counts = 0;

	// Verify answers
	const correctNucleotidePosition = gene_backgroundInfo.gene_list[current_gene]["Target position"] - 1;

	// Check gRNA Sequence:
	const inputtedSeq = document.getElementById("sequence_input").value.trim();
	// Check if gRNA sequence is in against listed
	possible_comparable_answers = [];
	for (const answer of benchling_grna_outputs.gene_list[current_gene]) {
		if (answer.Sequence === inputtedSeq) {
			possible_comparable_answers.push(answer);
		}
	}

	// Check against existing:
	if (possible_comparable_answers.length > 0) {
		for (const possibleAnswer of possible_comparable_answers) {
			true_counts = 0;
			// Checking if the gene's target position is within correct nucleotide range
			correctNucleotideIncluded = false;
			if (possibleAnswer.Strand === 1) {
				const nucleotideIncludedRange_top = possibleAnswer.Position - 1 - 1 + 3;
				const nucleotideIncludedRange_bot = possibleAnswer.Position - 1 - 17;
				if (
					correctNucleotidePosition >= nucleotideIncludedRange_bot &&
					correctNucleotidePosition <= nucleotideIncludedRange_top
				) {
					correctNucleotideIncluded = true;
				}
			} else if (possibleAnswer.Strand === -1) {
				const nucleotideIncludedRange_top = possibleAnswer.Position - 1 + 17;
				const nucleotideIncludedRange_bot = possibleAnswer.Position - 1 - 3;
				if (
					correctNucleotidePosition >= nucleotideIncludedRange_bot &&
					correctNucleotidePosition <= nucleotideIncludedRange_top
				) {
					correctNucleotideIncluded = true;
				}
			}
			// If in correct nucleotide range, check if nucleotide is included in cut site
			if (correctNucleotideIncluded) {
				// Determine where PAM site would be and if PAM site matches inputted value
				let pamFirst;
				let pamSecond;
				// Sense is 1
				if (possibleAnswer.Strand === 1) {
					pamFirst = possibleAnswer.Position - 1 + 2;
					pamSecond = possibleAnswer.Position - 1 + 4;
					// If the sequence matches to be true, check other answers:
					if (document.getElementById("strand_input").value === "Sense (+)") {
						MARstrand = true;
						true_counts += 1;
					}
				}
				// Antisense is -1
				else if (possibleAnswer.Strand === -1) {
					pamFirst = possibleAnswer.Position - 1 - 2;
					pamSecond = possibleAnswer.Position - 1 - 4;
					// If the sequence matches to be true, check other answers:
					if (document.getElementById("strand_input").value === "Antisense (-)") {
						MARstrand = true;
						true_counts += 1;
					}
				}

				// Determining how right the sequence is
				if (correctNucleotidePosition >= pamFirst && correctNucleotidePosition <= pamSecond) {
					// within PAM site
					MARgRNAseq = false;
					MARgRNAseq_degree = 0;
				} else if (
					(correctNucleotidePosition >= possible_comparable_answers[i].Position - 1 + 1 &&
						correctNucleotidePosition <= possible_comparable_answers[i].Position - 1 + 10) ||
					(correctNucleotidePosition <= possible_comparable_answers[i].Position - 1 - 1 &&
						correctNucleotidePosition >= possible_comparable_answers[i].Position - 1 - 10)
				) {
					MARgRNAseq = true;
					MARgRNAseq_degree = 1;
					true_counts += 1;
				} else if (
					(correctNucleotidePosition >= possible_comparable_answers[i].Position - 1 &&
						correctNucleotidePosition <= possible_comparable_answers[i].Position - 1 + 20) ||
					(correctNucleotidePosition <= possible_comparable_answers[i].Position - 1 &&
						correctNucleotidePosition >= possible_comparable_answers[i].Position - 1 - 20)
				) {
					MARgRNAseq = true;
					MARgRNAseq_degree = 2;
					true_counts += 1;
				} else if (
					(correctNucleotidePosition >= possible_comparable_answers[i].Position - 1 &&
						correctNucleotidePosition <= possible_comparable_answers[i].Position - 1 + 30) ||
					(correctNucleotidePosition <= possible_comparable_answers[i].Position - 1 &&
						correctNucleotidePosition >= possible_comparable_answers[i].Position - 1 - 30)
				) {
					MARgRNAseq = true;
					MARgRNAseq_degree = 3;
					true_counts += 1;
				}

				// If the sequence if correct, check all other results:
				if (MARgRNAseq) {
					const temp_answer = element;
					// Check if the cut position matches the answer's input
					if (
						temp_answer.Position &&
						parseInt(temp_answer.Position, 10) ===
							parseInt(document.getElementById("position_input").value, 10)
					) {
						MARCutPos = true;
						true_counts += 1;
					} else if (temp_answer.Position === null || temp_answer.Position === undefined) {
						alert(
							"Error code cA302-307: retrieving server information on 'Position' answers occurred. Please contact admin or TA!",
						);
					}

					// Check if the PAM matches the answer's input
					if (
						(temp_answer.PAM || temp_answer.PAM) &&
						temp_answer.PAM === document.getElementById("pam_input").value.trim()
					) {
						MARPAMseq = true;
						true_counts += 1;
					} else if (temp_answer.PAM === null || temp_answer.PAM === undefined) {
						alert(
							"Error code cA311-317: retrieving server information on 'PAM' answers occurred. Please contact admin or TA!",
						);
					}

					// Check if the Off-target matches the answer's input
					if (temp_answer["Specificity Score"] || temp_answer["Specificity Score"]) {
						checkOffTarget(temp_answer["Specificity Score"]);
					} else if (
						temp_answer["Specificity Score"] === null ||
						temp_answer["Specificity Score"] === undefined
					) {
						alert(
							"Error code cA342-348: retrieving server information on 'Specificity Score' answers occurred. Please contact admin or TA!",
						);
					}

					// Check if the F1 primer matches the answer's input
					checkF1Primers(document.getElementById("sequence_input").value.trim());

					// Check if the F1 primer matches the answer's input
					checkR1Primers(document.getElementById("sequence_input").value.trim());
				}
			}
		}
	}
	checkAnswers_executed = true;
}

let offtarget_List = [];
let offtarget_dict = {};
let offtarget_dictParse = [];
let offtarget_Use = [];
/**
 * Checks the off-target score if it is correct
 * @param {int} score - The specificity score from possible_comparable_answers
 * @return {bool} - Returns true if MAROffTarget is correct
 */
function checkOffTarget(score) {
	// Reset variables:
	MAROffTarget = false;
	MAROffTarget_degree = 0; // 0 wrong, 1 above 75, 2 above 35, 3 only option
	MAROffTarget_aboveOpt = false;
	MAROffTarget_above35 = false;
	MAROffTarget_onlyOption = false;
	// Create off-target variables
	const OffTargetValue_down = Math.floor(score);
	const OffTargetValue_up = Math.ceil(score);
	const InputOffTargetValue = parseInt(document.getElementById("offtarget_input").value, 10);
	// See if off-target value matches input value
	if (correctNucleotideIncluded && MARgRNAseq) {
		if (InputOffTargetValue >= OffTargetValue_down && InputOffTargetValue <= OffTargetValue_up) {
			MAROffTarget = true;
			true_counts += 1;
		}
	}
	// Determine how write it is based on its range
	if (MAROffTarget) {
		// Check for last-resort regions:
		const rangeStarter_upper = parseInt(document.getElementById("position_input").value, 10) + 35;
		const rangeStarter_lower = parseInt(document.getElementById("position_input").value, 10) - 35;
		// Check if gRNA sequence is in against listed
		offtarget_List = [];
		offtarget_dict = {};
		offtarget_dictParse = [];
		offtarget_Use = [];
		for (let i = 0; i < benchling_grna_outputs.gene_list[current_gene].length; i += 1) {
			if (
				benchling_grna_outputs.gene_list[current_gene][i].Position >= rangeStarter_lower &&
				benchling_grna_outputs.gene_list[current_gene][i].Position <= rangeStarter_upper
			) {
				if (benchling_grna_outputs.gene_list[current_gene][i]["Specificity Score"]) {
					offtarget_List.push(benchling_grna_outputs.gene_list[current_gene][i]["Specificity Score"]);
					offtarget_dict[i] = benchling_grna_outputs.gene_list[current_gene][i]["Specificity Score"];
					offtarget_dictParse.push(i);
				}
			}
		}
		let last_resort_okay = true;
		if (Math.max.apply(null, offtarget_List) < 35) {
			last_resort_okay = false;
		}

		// Is it within the optimal range?
		const Max_range = Math.max.apply(null, offtarget_List);
		const Min_optimal = Max_range - Max_range * 0.2;
		let optimalValue = Min_optimal;
		const { studentClass } = student_reg_information[0].student_list[studentParseNum];
		// Change optimal range based on custom input
		if (student_reg_information[0].classMarkingMod[studentClass][0] === "Optimal") {
			if (Min_optimal > 80 || Min_optimal < 35) {
				optimalValue = 80;
			}
		} else {
			optimalValue = student_reg_information[0].classMarkingMod[studentClass][0];
		}
		// Determine if off-target is optimal or not
		if (InputOffTargetValue >= optimalValue) {
			MAROffTarget_aboveOpt = true;
			MAROffTarget_above35 = true;
			MAROffTarget_degree = 1;
		} else if (InputOffTargetValue >= 35) {
			MAROffTarget_above35 = true;
			if (Math.max.apply(null, offtarget_List) < 80) {
				MAROffTarget_degree = 1;
			} else {
				MAROffTarget_degree = 2;
			}
		} else if (!last_resort_okay) {
			MAROffTarget_onlyOption = true;
			MAROffTarget_degree = 3;
		}
	}
}

let possible_F1_primers = [];
/**
 * Checks if the F1 primer is correct or not
 * @param {String} seq - The gRNA sequence
 * @return {bool} - Returns true if MARF1primers is correct
 */
function checkF1Primers(seq) {
	// Reset variables:
	MARF1primers = false;
	// Verify primers:
	possible_F1_primers = [];
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
	if (possible_F1_primers.includes(document.getElementById("f1_input").value.trim())) {
		MARF1primers = true;
	}
}

let possible_R1_primers = [];
const complementary_nt_dict = {
	A: "T",
	T: "A",
	C: "G",
	G: "C",
};
/**
 * Checks if the R1 primer is correct or not
 * @param {String} seq - The gRNA sequence
 * @return {bool} - Returns true if MARR1primers is correct
 */
function checkR1Primers(seq) {
	// Reset variables:
	MARR1primers = false;
	// Verify primers:
	possible_R1_primers = [];
	const begin_R1 = "TTCTAGCTCTAAAAC";
	let complementary_seq = "";
	for (const sequence of seq) {
		complementary_seq = complementary_nt_dict[sequence] + complementary_seq;
	}
	for (let i = 19; i <= 20; i += 1) {
		possible_R1_primers.push(begin_R1 + complementary_seq.slice(0, i));
	}
	if (possible_R1_primers.includes(document.getElementById("r1_input").value.trim())) {
		MARR1primers = true;
	}
}

/**
 * Creates a complementary sequence of the nucleotides
 */
function createComplementarySeq(seq) {
	let comp_seq = "";
	for (const element of seq) {
		comp_seq = complementary_nt_dict[element] + comp_seq;
	}
}

let studentMark = 0;
let studentMarkPercentage = 0;
const markTotal = 10;
/**
 * Based on checkAnswers(), returns a float of a mark
 */
function markAnswers() {
	studentMark = 0;
	if (!checkAnswers_executed) {
		checkAnswers();
	}
	if (checkAnswers_executed) {
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
		studentMarkPercentage = ((studentMark / markTotal) * 100).toFixed(2);
		if (studentMarkPercentage > 100) {
			studentMarkPercentage = 100;
		} else if (studentMarkPercentage < 0) {
			studentMarkPercentage = 0;
		}
	}
}

/**
 * Show feedback for students
 */
function showFeedback() {
	$("#mainContainer").empty();
	let append_str =
		"<p style='font-weight:bold;'> You would only receive feedback on your practice attempts and not your final assignments.</p>";
	append_str +=
		"<p> The assignment itself is marked out of 10 marks with 2 marks for each input excluding gRNA strand direction, cut position and target region range (these three values are used to calculate if you have the right answer or not which means they are still crucial that they are still correct).</p>";
	append_str +=
		"<p> The following is the breakdown of what marks you would have received and why you would have gotten them: </p>";
	append_str += `<p style='font-weight:bold;'>Mark: ${all_marks[0]}/10 (${all_marks[1]})</p>`;

	// Calculate all conditions:
	/// gRNA:
	let MARgRNAseq_degree_display = 0;
	let MARgRNAseq_degree_explain =
		"Your gRNA sequence was wrong and not found in the Benchling gRNA outputs. Either you made a typo or this answer was not correct and did not contain the target cut site within an acceptable range.";
	if (MARgRNAseq) {
		if (MARgRNAseq_degree === 1) {
			MARgRNAseq_degree_display = 2;
			MARgRNAseq_degree_explain = "This means your answer was correct and you received full marks.";
		} else if (MARgRNAseq_degree === 2) {
			MARgRNAseq_degree_display = 1;
			MARgRNAseq_degree_explain =
				"This means your sequence was partially correct as it contains the target sequence within a 20bp range but was not optimal. One mark.";
		} else if (MARgRNAseq_degree === 3) {
			MARgRNAseq_degree_display = 0.5;
			MARgRNAseq_degree_explain =
				"This means your sequence was not wrong (therefore was still correct) but there were better options out there. I recommend you try this practice assignment again. Still worth some marks though (half a mark).";
		}
	}
	/// PAM:
	let MARPAMseq_display = 0;
	let MARPAMseq_explain =
		"Your PAM sequence was wrong and not found relative to your gRNA sequence. Either you made a typo or this answer was not correct. Either it contained the cut site within the PAM site or it was not an NGG or NAG PAM site (SciGrade only accepts either of those two PAM sites).";
	if (MARPAMseq) {
		MARPAMseq_display = 2;
		MARPAMseq_explain = "This means your answer was correct and you received full marks.";
	}
	/// Off-target:
	let MAROffTarget_degree_display = 0;
	let MAROffTarget_degree_explain =
		"Your off-target score was wrong. Either it was not above/within the optimal range (or above 35) or the last-resort option.";
	if (MAROffTarget) {
		if (MAROffTarget_degree === 1) {
			MAROffTarget_degree_display = 2;
			MAROffTarget_degree_explain =
				"This means your answer was correct while above/within the optimal and you received full marks.";
		} else if (MAROffTarget_degree === 2) {
			MAROffTarget_degree_display = 1;
			MAROffTarget_degree_explain =
				"This means your answer was technically correct as its on-target value was above 35.";
		} else if (MAROffTarget_degree === 3) {
			MAROffTarget_degree_display = 0.5;
			MAROffTarget_degree_explain =
				"This means your answer was partially correct as it was found to be your only option is solely based on the target region range you selected.";
		}
	}
	/// F1 Primer:
	let MARF1primers_display = 0;
	let f1Options = "";
	for (let i = 0; i < possible_F1_primers.length; i += 1) {
		f1Options += possible_F1_primers[i];
		if (i === possible_F1_primers.length - 1) {
			f1Options += ".";
		} else {
			f1Options += ", ";
		}
	}
	let MARF1primers_explain = `Your F1 primer sequence was incorrectly matched to one of the following sequences generated based on your gRNA sequence inputted: ${f1Options}`;
	if (MARF1primers) {
		MARF1primers_display = 2;
		MARF1primers_explain = "This means your answer was correct and you received full marks.";
	}
	/// R1 Primer:
	let MARR1primers_display = 0;
	let r1Options = "";
	for (let i = 0; i < possible_R1_primers.length; i += 1) {
		r1Options += possible_F1_primers[i];
		if (i === possible_R1_primers.length - 1) {
			r1Options += ".";
		} else {
			r1Options += ", ";
		}
	}
	let MARR1primers_explain = `Your R1 primer sequence was incorrectly matched to one of the following sequences generated based on your gRNA sequence inputted: ${r1Options}`;
	if (MARR1primers) {
		MARR1primers_display = 2;
		MARR1primers_explain = "This means your answer was correct and you received full marks.";
	}

	// gRNA:
	append_str += "<div class='card about'>";
	append_str += "<div class='card-header' id='gRNACard'>";
	append_str += "<h5 class='mb-0'>";
	append_str +=
		"<button class='btn btn-link' data-toggle='collapse' data-target='#gRNAOutput' aria-expanded='false' aria-controls='gRNAOutput'>";
	append_str += `gRNA Strand Sequence: ${MARgRNAseq_degree_display}/2`;
	append_str += "</button>";
	append_str += "</h5>";
	append_str += "</div>";
	append_str += "<div id='gRNAOutput' class='collapse' aria-labelledby='headingOne' data-parent='#accordion'>";
	append_str += "<div class='card-body'>";
	// Content
	append_str += `<p> For gRNA Strand Sequence, you put down "${all_answers[0]}" which gave you the mark ${MARgRNAseq_degree_display}.</p>`;
	append_str += MARgRNAseq_degree_explain;
	// Close gRNA card
	append_str += "</div>";
	append_str += "</div>";
	append_str += "</div>";
	$("#mainContainer").append(append_str);

	// PAM:
	append_str = "<div class='card about'>";
	append_str += "<div class='card-header' id='PAMCard'>";
	append_str += "<h5 class='mb-0'>";
	append_str +=
		"<button class='btn btn-link' data-toggle='collapse' data-target='#PAMOutput' aria-expanded='false' aria-controls='PAMOutput'>";
	append_str += `gRNA PAM Sequence: ${MARPAMseq_display}/2`;
	append_str += "</button>";
	append_str += "</h5>";
	append_str += "</div>";
	append_str += "<div id='PAMOutput' class='collapse' aria-labelledby='headingOne' data-parent='#accordion'>";
	append_str += "<div class='card-body'>";
	// Content
	append_str += `<p> For gRNA PAM Sequence, you put down "${all_answers[1]}" which gave you the mark ${MARPAMseq_display}.</p>`;
	append_str += MARPAMseq_explain;
	// Close PAM card
	append_str += "</div>";
	append_str += "</div>";
	append_str += "</div>";
	$("#mainContainer").append(append_str);

	// Off-target Score:
	append_str = "<div class='card about'>";
	append_str += "<div class='card-header' id='OffTargetCard'>";
	append_str += "<h5 class='mb-0'>";
	append_str +=
		"<button class='btn btn-link' data-toggle='collapse' data-target='#OffTargetOutput' aria-expanded='false' aria-controls='OffTargetOutput'>";
	append_str += `Off-target Score: ${MAROffTarget_degree_display}/2`;
	append_str += "</button>";
	append_str += "</h5>";
	append_str += "</div>";
	append_str += "<div id='OffTargetOutput' class='collapse' aria-labelledby='headingOne' data-parent='#accordion'>";
	append_str += "<div class='card-body'>";
	// Content
	append_str += `<p> For Off-Target Score, you put down "${all_answers[4]}" which gave you the mark ${MAROffTarget_degree_display}.</p>`;
	append_str += MAROffTarget_degree_explain;
	// Close Off-target Score card
	append_str += "</div>";
	append_str += "</div>";
	append_str += "</div>";
	$("#mainContainer").append(append_str);

	// F1 Primer:
	append_str = "<div class='card about'>";
	append_str += "<div class='card-header' id='F1PrimerCard'>";
	append_str += "<h5 class='mb-0'>";
	append_str +=
		"<button class='btn btn-link' data-toggle='collapse' data-target='#F1PrimerOutput' aria-expanded='false' aria-controls='F1PrimerOutput'>";
	append_str += `F1 Primer: ${MARF1primers_display}/2`;
	append_str += "</button>";
	append_str += "</h5>";
	append_str += "</div>";
	append_str += "<div id='F1PrimerOutput' class='collapse' aria-labelledby='headingOne' data-parent='#accordion'>";
	append_str += "<div class='card-body'>";
	// Content
	append_str += `<p> For F1 Primer, you put down "${all_answers[5]}" which gave you the mark ${MARF1primers_display}.</p>`;
	append_str += MARF1primers_explain;
	// Close F1 Primer card
	append_str += "</div>";
	append_str += "</div>";
	append_str += "</div>";
	$("#mainContainer").append(append_str);

	// F1 Primer:
	append_str = "<div class='card about'>";
	append_str += "<div class='card-header' id='R1PrimerCard'>";
	append_str += "<h5 class='mb-0'>";
	append_str +=
		"<button class='btn btn-link' data-toggle='collapse' data-target='#R1PrimerOutput' aria-expanded='false' aria-controls='R1PrimerOutput'>";
	append_str += `R1 Primer: ${MARR1primers_display}/2`;
	append_str += "</button>";
	append_str += "</h5>";
	append_str += "</div>";
	append_str += "<div id='R1PrimerOutput' class='collapse' aria-labelledby='headingOne' data-parent='#accordion'>";
	append_str += "<div class='card-body'>";
	// Content
	append_str += `<p> For R1 Primer, you put down "${all_answers[6]}" which gave you the mark ${MARR1primers_display}.</p>`;
	append_str += MARR1primers_explain;
	// Close F1 Primer card
	append_str += "</div>";
	append_str += "</div>";
	append_str += "</div>";
	$("#mainContainer").append(append_str);

	append_str = "<br>";
	append_str +=
		"<p> If at any point you wish to dispute marks, please contact your TA or professor once you completed your assignment. If you have found a bug in our SciGrade marking system, please contact your professor or our admin. </p>";
	append_str += "<br>";

	append_str +=
		'<p> <button type="button" class="btn btn-primary" onclick="backToAssignments();"> Back to Assignments </button> </p>';

	$("#mainContainer").append(append_str);
}

/**
 * Determine whether an input form will be displayed or not
 * @param {String} docCheck The DOM being checked against
 * @param {String} checkFor The value of the DOM being used to check for
 * @param {String} docDisplay The DOM what will toggle hidden visibility for
 */
function showNewInput(docCheck, checkFor, docDisplay) {
	if (document.getElementById(String(docCheck)).value === String(checkFor)) {
		document.getElementById(String(docDisplay)).removeAttribute("hidden");
	} else {
		document.getElementById(String(docDisplay)).setAttribute("hidden", true);
	}
}

let completed_assignments = [];
/**
 * Generates a list of completed_assignments
 */
function generateCompletedAssignmentList() {
	completed_assignments = [];
	// Assignments
	if (student_reg_information[0].student_list[studentParseNum]["assignment-HBB-Marks"]) {
		if (!completed_assignments.includes("HBB")) {
			completed_assignments.push("HBB");
		}
	}
	if (student_reg_information[0].student_list[studentParseNum]["assignment-CCR5-Marks"]) {
		if (!completed_assignments.includes("CCR5")) {
			completed_assignments.push("CCR5");
		}
	}
	if (student_reg_information[0].student_list[studentParseNum]["assignment-ANKK1-Marks"]) {
		if (!completed_assignments.includes("ANKK1")) {
			completed_assignments.push("ANKK1");
		}
	}
	if (student_reg_information[0].student_list[studentParseNum]["assignment-APOE-Marks"]) {
		if (!completed_assignments.includes("APOE")) {
			completed_assignments.push("APOE");
		}
	}
}

/**
 * Account management functions. This function depends on login.js, without that, this will not run!
 */
function openAccountManagement() {
	generateCompletedAssignmentList();
	$("#accountManagementBody").empty();
	let append_str = `
		<div id='accordion'>
			<p>
				Hello ${student_reg_information[0].student_list[studentParseNum].name.split(" ")[0]}!
			</p>
		</div>
		`;
	$("#accountManagementBody").append(append_str);

	// Create assignments card
	append_str = `
		<div class='card about'>
			<div class='card-header' id='assignmentCard'>
				<h5 class='mb-0'>
					<button class='btn btn-link' data-toggle='collapse' data-target='#completedAssignments' aria-expanded='true' aria-controls='completedAssignments'>
						Completed assignments:
					</button>
				</h5>
			</div>

			<div id='completedAssignments' class='collapse show' aria-labelledby='headingOne' data-parent='#accordion'>
				<div class='card-body'>
					${
						completed_assignments.length > 0
							? `
							<p>You have completed the following assignments: <p>
							<ul>
								${completed_assignments.map((assignment) => `<li>${assignment}</li>`).join("")}
							</ul>
							`
							: `
							<p> You have not completed any assignments yet. </p>
							`
					}
				</div>
			</div>
		</div>
	`;

	$("#accountManagementBody").append(append_str);

	const classList = student_reg_information[0].class_list;
	// Obtain student marks
	if (["admin", "TA"].includes(student_reg_information[0].student_list[studentParseNum].type)) {
		append_str = `<br>
			<p>
				<b> Oh wait! </b> Hello ${student_reg_information[0].student_list[studentParseNum].type}! Would you like to download student marks?
			</p>`;
		append_str += '<label for="DownloadClass">Choose class: </label>';
		append_str += '<select id="DownloadClass" class="form-control" style="margin-bottom: 1%">';
		for (const key in classList) {
			if (key) {
				append_str += `<option value="${key}" id="${key}" tag="assignment">${key}</option>\n`;
			}
		}
		append_str += "</select>";
		append_str +=
			'<p style="text-align: center;"> <button type="button" class="btn btn-primary" onclick="generateHiddenStudentDownload(document.getElementById(\'DownloadClass\').value, true);"> Download Marks </button>';
		append_str +=
			'<button type="button" class="btn btn-primary" onclick="generateHiddenStudentDownload(document.getElementById(\'DownloadClass\').value, false);" style="margin-left: 2%;"> Download Raw Marks </button> </p>';
		$("#accountManagementBody").append(append_str);
	}

	// TA access to add new students:
	if (
		student_reg_information[0].student_list[studentParseNum].type === "TA" ||
		student_reg_information[0].student_list[studentParseNum].type === "admin"
	) {
		append_str = "<p> <b> ADMIN POWER! </b> <p>";

		// Create student card
		append_str += "<div class='card about'>";
		append_str += "<div class='card-header' id='studentCard'>";
		append_str += "<h5 class='mb-0'>";
		append_str +=
			"<button class='btn btn-link' data-toggle='collapse' data-target='#addStudents' aria-expanded='false' aria-controls='addStudents' onclick='showNewInput(\"InputClassMultiple\", \"newClass\", \"InputNewClassMultiple\")'>";
		append_str += "Create new class: ";
		append_str += "</button>";
		append_str += "</h5>";
		append_str += "</div>";
		append_str += "<div id='addStudents' class='collapse' aria-labelledby='headingOne' data-parent='#accordion'>";
		append_str += "<div class='card-body'>";

		// Append all students at once:
		append_str +=
			"<p style='font-weight: bold;'> If you would like to create a  new class, just fill the form below: ";
		// Form opening
		append_str += "<form>";

		// Class choice:
		append_str += '<div class="form-group">';
		append_str += '<label for="InputClassMultiple" style="font-weight: bold;">Create class name: </label>';
		append_str += '<select id="InputClassMultiple" class="form-control" style="margin-bottom: 1%" disabled>';
		append_str += '<option value="newClass" id="newClassMultiple" tag="assignment" >New Class</option>\n';
		append_str += "</select>";
		append_str +=
			'<input class="form-control" id="InputNewClassMultiple" placeholder="HMB396 - Winter (NOTE: Spaces will be deleted once you submit so use capital letters to separate words)" hidden>';
		append_str +=
			'<small id="InputClassHelp" class="form-text text-muted">Choose class students will be added to or create a new class. Example of a new class: HMB396 - Winter - 2019 (NOTE: Spaces will be deleted once you submit so use capital letters to separate words)</small>';
		append_str += "</div>";

		// User number
		append_str += '<div class="form-group">';
		append_str += '<label for="InputStudentNumber" style="font-weight: bold;">Input student numbers: </label>';
		append_str +=
			'<textarea class="form-control" id="StudentNumbers" rows="4" placeholder="1234567890, 1003817535, 1113315545"></textarea>';
		append_str +=
			'<small id="InputStudentNumberHelp" class="form-text text-muted">Input student numbers, separated by commas, new lines and/or tab indentation (BEWARE OF TYPOS!)</small>';
		append_str += "</div>";

		// User uMail
		append_str += '<div class="form-group">';
		append_str +=
			'<label for="InputStudentUmail" style="font-weight: bold;">Input student University email: </label>';
		append_str +=
			'<textarea class="form-control" id="StudentUmails" rows="4" placeholder="john.doe@mail.utoronto.ca, sarah.cat@.mail.utoronto.ca, alexander.macadonia@utoronto.ca"></textarea>';
		append_str +=
			'<small id="InputStudentUmailUmail" class="form-text text-muted">Input student University associated email in the same order of the student numbers, separated by commas, new lines and/or tab indentation (BEWARE OF TYPOS!)</small>';
		append_str += "</div>";

		// Close form
		append_str += "</form>";

		// Close card
		append_str += "</div>";
		append_str += "</div>";
		append_str += "</div>";
		$("#accountManagementBody").append(append_str);

		// Create single card
		append_str = "<div class='card about'>";
		append_str += "<div class='card-header' id='addTACard'>";
		append_str += "<h5 class='mb-0'>";
		append_str +=
			"<button class='btn btn-link' data-toggle='collapse' data-target='#addTA' aria-expanded='true' aria-controls='addTA'>";
		append_str += "Add single user: ";
		append_str += "</button>";
		append_str += "</h5>";
		append_str += "</div>";
		append_str += "<div id='addTA' class='collapse' aria-labelledby='headingOne' data-parent='#accordion'>";
		append_str += "<div class='card-body'>";

		// Append TAs or Admins:
		append_str +=
			"<p style='font-weight: bold;'>If you would like to add a single user (students, TAs or admins), please fill in the form below. Please note, this will default the user as a student. Only admins will be able to create new TAs or admins</p>";
		// Form opening
		append_str += "<form>";

		// Class choice:
		append_str += '<div class="form-group">';
		append_str += '<label for="InputClassSingle" style="font-weight: bold;">Choose class: </label>';
		append_str += '<select id="InputClassSingle" class="form-control" style="margin-bottom: 1%;">';
		for (const key in classList) {
			if (key) {
				append_str += `<option value="${key}" id="${key}" tag="assignment">${key}</option>\n`;
			}
		}
		append_str += "</select>";
		append_str +=
			'<small id="InputClassSingleHelp" class="form-text text-muted">Choose class TA will be added.</small>';
		append_str += "</div>";

		// User number
		append_str += '<div class="form-group">';
		append_str += '<label for="InputStudentNumber" style="font-weight: bold;">User\'s number</label>';
		append_str += '<input class="form-control" id="StudentNumber" placeholder="1234567890" maxlength="10">';
		append_str +=
			'<small id="InputStudentNumberHelp" class="form-text text-muted">The user\'s access number (like a student or employee number)</small>';
		append_str += "</div>";

		// User umail
		append_str += '<div class="form-group">';
		append_str += '<label for="InputStudentUmail" style="font-weight: bold;">User\'s umail</label>';
		append_str +=
			'<input type="email" class="form-control" id="StudentUmail" placeholder="first.last@mail.utoronto.ca">';
		append_str +=
			'<small id="InputStudentNumberHelp" class="form-text text-muted">The user\'s University associated email</small>';
		append_str += "</div>";

		// Form closing
		append_str += "</form>";

		// Close card
		append_str += "</div>";
		append_str += "</div>";
		append_str += "</div>";
		$("#accountManagementBody").append(append_str);
	}

	// Admin controls:
	if (student_reg_information[0].student_list[studentParseNum].type === "admin") {
		// Create modifying controls card
		append_str = "<div class='card about'>";
		append_str += "<div class='card-header' id='modifyCard'>";
		append_str += "<h5 class='mb-0'>";
		append_str +=
			"<button class='btn btn-link' data-toggle='collapse' data-target='#modifyControls' aria-expanded='true' aria-controls='modifyControls' onclick='ChangeDOMInnerhtml(\"CurrentOffTarget\", \"Current off-target marking is set to: \" + student_reg_information[0][\"classMarkingMod\"][document.getElementById(\"ClassModChange\").value][0])'>";
		append_str += "Modify marking controls: ";
		append_str += "</button>";
		append_str += "</h5>";
		append_str += "</div>";
		append_str +=
			"<div id='modifyControls' class='collapse' aria-labelledby='headingOne' data-parent='#accordion'>";
		append_str += "<div class='card-body'>";

		// Info:
		append_str +=
			"<p style='font-weight: bold;'>If you would like to change a class's off-target optimal goal, you can do that here</p>";

		// Choose class:
		append_str += '<div class="form-group">';
		append_str += '<label for="ClassModChange" style="font-weight: bold;">Choose class: </label>';
		append_str +=
			"<select id=\"ClassModChange\" class=\"form-control\" style=\"margin-bottom: 1%;\" onchange=\"ChangeDOMInnerhtml('CurrentOffTarget', 'Current off-target marking is set to: ' + student_reg_information[0]['classMarkingMod'][document.getElementById('ClassModChange').value][0])\">";
		for (const key in classList) {
			if (key) {
				append_str += `<option value="${key}" id="${key}" tag="assignment">${key}</option>\n`;
			}
		}
		append_str += "</select>";
		append_str +=
			'<small id="ClassModChangeHelp" class="form-text text-muted">Choose the class for which you are modifying marking scheme for.</small>';
		append_str += "</div>";

		// Modify controls:
		append_str += '<div class="form-group">';
		append_str += '<p style="font-weight: bold;">Modify controls for: </p>';
		append_str += '<label for="SelectModifyControls">Off-Target Marking: </label>';

		append_str += '<p id="CurrentOffTarget">Current off-target marking is set to: </p>';
		append_str +=
			'<select id="SelectModifyControls" class="form-control" onchange="showNewInput(\'SelectModifyControls\', \'Custom\', \'InputModifyControls\')" style="margin-bottom: 1%">';
		append_str += '<option value="Optimal" id="Optimal" tag="assignment">Optimal</option>\n';
		append_str += '<option value="Custom" id="CustomOffTarget" tag="assignment">Custom</option>\n';
		append_str += "</select>";
		append_str +=
			'<input class="form-control" id="InputModifyControls" type="number" step="0.01" min="0.01" max="100" placeholder="Insert number between 0.01 and 100" hidden>';
		append_str +=
			'<small id="InputModifyControlsHelp" class="form-text text-muted">Choose how you want the off-target score to be marked. Optimal is Min_optimal = Max_range - (Max_range * 0.2) if below 80 (if below, optimal = 80). Custom value can be any number between 0.01 and 100 which will be the new custom "optimal" value for your class.</small>';
		append_str += "</div>";

		// Close card
		append_str += "</div>";
		append_str += "</div>";
		append_str += "</div>";
		$("#accountManagementBody").append(append_str);

		// Modify user's type card
		append_str = "<div class='card about'>";
		append_str += "<div class='card-header' id='typeCard'>";
		append_str += "<h5 class='mb-0'>";
		append_str +=
			"<button class='btn btn-link' data-toggle='collapse' data-target='#typeControl' aria-expanded='true' aria-controls='typeControl' onclick=\"UpdateStudentList(document.getElementById('ClassChange').value); UpdateChooseUser('ClassUserChange');\">";
		append_str += "Change a user's account type: ";
		append_str += "</button>";
		append_str += "</h5>";
		append_str += "</div>";
		append_str += "<div id='typeControl' class='collapse' aria-labelledby='headingOne' data-parent='#accordion'>";
		append_str += "<div class='card-body'>";

		// Info:
		append_str +=
			"<p style='font-weight: bold;'>If you would like to change a user's account type (to TA or admin or back to student), you can do that below</p>";

		// Choose class:
		append_str += '<div class="form-group">';
		append_str += '<label for="ClassChange" style="font-weight: bold;">Choose class: </label>';
		append_str +=
			'<select id="ClassChange" class="form-control" style="margin-bottom: 1%;" onchange="UpdateStudentList(document.getElementById(\'ClassChange\').value); UpdateChooseUser(\'ClassUserChange\');">';
		for (const key in classList) {
			if (key) {
				append_str += `<option value="${key}" id="${key}" tag="assignment">${key}</option>\n`;
			}
		}
		append_str += "</select>";
		append_str +=
			'<small id="ClassChangeHelp" class="form-text text-muted">Choose the class for which the user belongs to.</small>';
		append_str += "</div>";

		// Choose user:
		append_str += '<div class="form-group">';
		append_str += '<label for="ClassUserChange" style="font-weight: bold;">Choose user: </label>';
		append_str += '<select id="ClassUserChange" class="form-control" style="margin-bottom: 1%;" onchange="">';
		append_str += "</select>";
		append_str +=
			'<small id="ClassUserChangeHelp" class="form-text text-muted">Choose the user for which you change their account type for.</small>';
		append_str += "</div>";

		// Choose type:
		append_str += '<div class="form-group">';
		append_str += '<label for="ClassTypeChange" style="font-weight: bold;">Choose type: </label>';
		append_str += '<select id="ClassTypeChange" class="form-control" style="margin-bottom: 1%;" onchange="">';
		append_str += '<option value="Student" id="Student" tag="userType">Student</option>\n';
		append_str += '<option value="TA" id="TA" tag="userType">TA</option>\n';
		append_str += '<option value="admin" id="admin" tag="userType">admin</option>\n';
		append_str += "</select>";
		append_str +=
			'<small id="ClassTypeChangeHelp" class="form-text text-muted">Choose the type for which you want the user to become.</small>';
		append_str += "</div>";

		// Submit button
		append_str += "<br>";

		// Close card
		append_str += "</div>";
		append_str += "</div>";
		append_str += "</div>";
		$("#accountManagementBody").append(append_str);
	}

	// Close account management
	append_str = "</div>";
	$("#accountManagementBody").append(append_str);

	// Open the Bootstrap modal
	$("#accountModal").modal("show");
}

/**
 * Update the choose user's options in the account management's change user type
 * @param {String} domUser
 */
function UpdateChooseUser(domUser) {
	ClearSelectOptions(domUser);
	for (const key in updatedListOfStudents) {
		if (updatedListOfStudents[key]) {
			AddToOptions(domUser, key, updatedListOfStudents[key]);
		}
	}
}

/**
 * Add more options to a select
 * @param {String} domID The DOM ID in the HTML file for the select
 * @param {String} optionsValue The value and ID for the options being added
 * @param {String} optionsInner The InnerHTML for the options being added
 */
function AddToOptions(domID, optionsValue, optionsInner) {
	const dom = document.getElementById(domID);
	const option = document.createElement("option");
	option.value = optionsValue;
	option.innerHTML = optionsInner;
	dom.appendChild(option);
}

/**
 * Clear an select's options
 * @param {String} domID The DOM ID in the HTML for the select
 */
function ClearSelectOptions(domID) {
	const dom = document.getElementById(domID);
	while (dom.options.length > 0) {
		dom.options.remove(0);
	}
}

let updatedListOfStudents = {};
/**
 * Update the list of students available for a class
 * @param {String} className The class for which the students belong to
 */
function UpdateStudentList(className) {
	updatedListOfStudents = {};
	const studentList = student_reg_information[0].student_list;
	for (const student of studentList) {
		if (student.studentClass === className) {
			updatedListOfStudents[student.name] = `${student.name} - ${student.type}`;
		}
	}
}

/**
 * Change a DOM's innerHTML
 * @param {String} domID DOM's ID that is being modified
 * @param {String} changeTo The content of the innerHTML
 */
function ChangeDOMInnerhtml(domID, changeTo) {
	document.getElementById(domID).innerHTML = changeTo;
}

const downloadIndexTable_start = "\t\t<tr>\n\t\t\t<th>Student Number</th>\n\t\t\t<th>Name</th>";
const downloadIndexTable_end = "\n\t\t</tr>\n";
let downloadIndexTable_fill = "";
/**
 * Generated the base IndexTable for downloading JSON as CSV
 * @param {String} whichIndexTable The string of which the index table start as, defaults as downloadIndexTable_start
 * @param {boolean} SimpleComplex True is simple, false is complex
 */
function generateRestOfIndexTable(whichIndexTable, SimpleComplex) {
	whichIndexTable = downloadIndexTable_start;
	whichIndexTable += downloadIndexTable_end;
	return whichIndexTable;
}

/**
 * Generated a download button from JSON to CSV
 * @param {String} whichClass Which class is being downloaded
 * @param {boolean} whichType True is simple, false is complex
 */
function generateHiddenStudentDownload(whichClass, whichType) {
	// Check if TA/Admin
	if (
		student_reg_information[0].student_list[studentParseNum].type === "TA" ||
		student_reg_information[0].student_list[studentParseNum].type === "admin"
	) {
		downloadIndexTable_fill = generateRestOfIndexTable(downloadIndexTable_fill, whichType);
		$("#hiddenDownloadModal_table").empty(); // reset
		const d = new Date();
		let downloadIndexTable_str = "<table id='downloadIndexTable'>\n\t<tbody>\n";
		let captionTitleBegin = "SciGrade_studentMark_";
		if (!whichType) {
			captionTitleBegin = "SciGrade_studentMarkRaw_";
		}
		downloadIndexTable_str += `\t\t<caption>${captionTitleBegin}${student_reg_information[0].student_list[
			studentParseNum
		].name.replace(/\s/g, "")}_${d.getFullYear()}-${d.getMonth()}_${d.getDate()}</caption>\n`;
		downloadIndexTable_str += downloadIndexTable_fill;
		// Looping through each row of the table
		const studentRegList = student_reg_information[0].student_list;
		for (const student of studentRegList) {
			if (student.type === "Student" && student.studentClass === whichClass) {
				downloadIndexTable_str += "\t\t<tr>\n";
				downloadIndexTable_str += `\t\t\t<td>${student.student_number}</td>\n`;
				downloadIndexTable_str += `\t\t\t<td>${student.name}</td>\n`;
				downloadIndexTable_str += "\t\t</tr>\n";
			}
		}
		downloadIndexTable_str += "\t</tbody>\n</table>"; // Closing
		document.getElementById("hiddenDownloadModal_table").innerHTML += downloadIndexTable_str;
		$("#hiddenDownloadModal_table").tableToCSV();
	} else {
		showRegError(7);
	}
}

/**
 * Changes the input class value to new input
 * @param {String} docCheck The DOM being checked against
 * @param {String} checkFor The value of the DOM being used to check for
 * @param {String} docChange The DOM what will have its value changed
 * @param {String} trueChangeValueTo What to change value to
 */
function changeInputClass(docCheck, checkFor, docChange, trueChangeValueTo) {
	if (trueChangeValueTo === "" || trueChangeValueTo === undefined) {
		trueChangeValueTo = "undefined Class";
	}
	trueChangeValueTo = trueChangeValueTo.replace(/\s/g, "");
	if (document.getElementById(docCheck).value === checkFor) {
		document.getElementById(docChange).value = trueChangeValueTo;
	}
}

let all_answers = [];
let all_outputs = [];
let all_marks = [];
let studentAnswers = `student_list.${studentParseNum}.${loadedMode}-${current_gene}-Answers`;
let studentOutputs = `student_list.${studentParseNum}.${loadedMode}-${current_gene}-Outputs`;
let studentMarks = `student_list.${studentParseNum}.${loadedMode}-${current_gene}-Marks`;
/**
 * Submit and sends the student's answers to the server
 */
function submitAnswers() {
	all_answers = [];
	all_outputs = [];
	all_marks = [];
	checkAnswers();
	setTimeout(() => {
		markAnswers();
		studentAnswers = `student_list.${studentParseNum}.${loadedMode}-${current_gene}-Answers`;
		studentOutputs = `student_list.${studentParseNum}.${loadedMode}-${current_gene}-Outputs`;
		studentMarks = `student_list.${studentParseNum}.${loadedMode}-${current_gene}-Marks`;
		all_answers.push(
			document.getElementById("sequence_input").value.trim(),
			document.getElementById("pam_input").value.trim(),
			document.getElementById("position_input").value,
			document.getElementById("strand_input").value,
			document.getElementById("offtarget_input").value,
			document.getElementById("f1_input").value.trim(),
			document.getElementById("r1_input").value.trim(),
		);
		all_outputs.push(
			MARstrand,
			MARgRNAseq,
			MARgRNAseq_degree,
			MARCutPos,
			MARPAMseq,
			MAROffTarget,
			MAROffTarget_degree,
			MAROffTarget_aboveOpt,
			MAROffTarget_above35,
			MAROffTarget_onlyOption,
			MARF1primers,
			MARR1primers,
		);
		all_marks.push(studentMark, studentMarkPercentage);

		document.getElementById("options_label").innerHTML =
			"Would you like to see feedback on your answers or start a new assignment?";
		document.getElementById("seeFeedback").removeAttribute("hidden");

		showFeedback();

		$("#feedbackButton").click();
	}, 750);
}

/**
 * Determine if a enter was pressed and if so, click a button
 * @param {Event} event The key press
 * @param {String} toClickButton Which button to click
 */
function IfPressEnter(event, toClickButton) {
	if (event.which === 13 || event.keyCode === 13) {
		$(`#${toClickButton}`).click();
	}
}

/**
 * Resets the assignment section page
 */
function backToAssignments() {
	redirectCRISPR();
	$("#practice").click();
}

// Block submit calls on keypress
$(() => {
	$("form").submit(() => false);
});
