//= ================================ SciGrade ==================================
//
// Purpose: General script for SciGrade
//
//= ============================================================================

let selection_inMode = "practice";

let possible_gene = "eBFP";
let current_gene = "empty";

/** Purpose of this is to assign the current gene and check for errors */
function select_Gene() {
	// Valid only when a non-empty gene is selected AND it exists in the loaded
	// background data (the dropdown is populated from gene_backgroundInfo.gene_list,
	// so that is the authoritative source of valid genes).
	if (possible_gene && gene_backgroundInfo?.gene_list?.[possible_gene]) {
		current_gene = possible_gene;
		loadWork();
		checkAnswers_executed = false;
	} else {
		current_gene = "empty";
		alert("Error code sG34-42 occurred. Please report this on our GitHub issue tracker.");
	}
}

let gene_backgroundInfo;
let benchling_gRNA_outputs;
/**
 * Load JSON files
 */
async function loadCRISPRJSON_Files() {
	try {
		// Fetch Benchling_gRNA_Outputs.json
		const responseBenchling = await fetch("./data/Benchling_gRNA_Outputs.json");
		benchling_gRNA_outputs = await responseBenchling.json();

		// Fetch gene_background_info.json
		const responseGeneBackground = await fetch("data/Background_info/gene_background_info.json");
		gene_backgroundInfo = await responseGeneBackground.json();
	} catch (err) {
		console.error("Error fetching file:", err);
	}
}

/**
 * Fill in and create a list of genes
 */
function fillGeneList() {
	if (gene_backgroundInfo?.gene_list) {
		const dropdown = $("#gene_dropdown_selection");
		dropdown.empty();

		for (const gene of Object.keys(gene_backgroundInfo.gene_list)) {
			dropdown.append($("<option></option>").attr({ value: gene, id: gene, tag: "practice" }).text(gene));
		}

		// Gene data is loaded and the dropdown is populated, so it is now safe to
		// load a gene. Enabling the button here (rather than at render time) prevents
		// a click before the async JSON load finishes, which would otherwise hit the
		// "Error code sG34-42" dead-end and never build the work form.
		$("#load_gene_button").prop("disabled", false);
	}
}

let loadedMode = "practice";
/**
 * Dynamically creates the work page for SciGrade
 */
function loadWork() {
	if (!gene_backgroundInfo?.gene_list?.[current_gene]) {
		alert("Error code lFS50-66 occurred. Please report this on our GitHub issue tracker.");
		return;
	}

	$("#work").empty();
	loadedMode = selection_inMode;
	checkAnswers_executed = false;
	let append_str;

	// Begin background information
	append_str = '<div class="work_background" style="margin-top:2%;">';

	// CRISPR header information
	append_str +=
		'<div id="crispr_header">\n<p>Please refer to your dry lab protocol for full instructions on how and what to do. Below is a brief reminder of what you are supposed to do with each gene: \n <b>Your objective is to find these mutations, design a gRNA and its corresponding F1/R1 primers</b></p> \n</div>\n';

	// Gene information, filled in as text after the markup is appended
	append_str += '<div id="gene_info"></div>';

	// End background information
	append_str += "</div>";

	// Begin gene work form
	append_str += '<div id="work_section">';

	// Gene work form inputs
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
	append_str += `
			<div class="form-group">
				<label for="strand_input">gRNA Strand:</label>

				<select
					aria-label="Select gRNA strand"
					class="form-control"
					id="strand_input"
					required
					style="border: 1px solid #28a745;"
				>
					<option>Antisense (-)</option>
					<option>Sense (+)</option>
				</select>
			</div>
		`;

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

	// End gene work form
	append_str += "</div>";

	$("#work").append(append_str);

	const gene = gene_backgroundInfo.gene_list[current_gene];
	$("#gene_info").append(
		$("<p></p>").text(`Here is some background information about your gene: ${gene.name} (${current_gene})`),
		$("<p></p>").text(` Background information: ${gene.Background}`),
		$("<p></p>").text(` Target site: ${gene["Target site"]}`),
		$('<p style="word-wrap:break-word;"></p>').text(` Modified genetic sequence: ${gene.Sequence}`),
	);
}

// Global marking variables:
let MARgRNAseq = false;
let MARgRNAseq_degree = 0; // 0 wrong, 1 correct, 2 partial of <20bp, 3 technically correct of <30bp
let MARPAMseq = false;
let MARCutPos = false;
let MARstrand = false;
let MAROffTarget = false;
let MAROffTarget_degree = 0; // 0 wrong, 1 optimal or >=35 with max < 80, 2 >=35 with max >= 80, 3 only option
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
 * Clears the answer-check flags, counters, and primer candidate lists that {@link checkAnswers} fills,
 * so an attempt starts with no marks.
 */
function resetMarkingState() {
	MARgRNAseq = false;
	MARgRNAseq_degree = 0;
	MARPAMseq = false;
	MARCutPos = false;
	MARstrand = false;
	MAROffTarget = false;
	MAROffTarget_degree = 0;
	MAROffTarget_aboveOpt = false;
	MAROffTarget_above35 = false;
	MAROffTarget_onlyOption = false;
	MARF1primers = false;
	MARR1primers = false;
	possible_F1_primers = [];
	possible_R1_primers = [];
	correctNucleotideIncluded = false;
	true_counts = 0;
}

/**
 * Checks the answer in the submission form and determines if they are correct or not
 */
function checkAnswers() {
	// Reset answers:
	resetMarkingState();

	// Verify answers
	const correctNucleotidePosition = gene_backgroundInfo.gene_list[current_gene]["Target position"] - 1;

	// Check gRNA Sequence:
	const inputtedSeq = document?.getElementById("sequence_input")?.value?.trim() || undefined;
	// Check if gRNA sequence is in against listed
	possible_comparable_answers = [];
	if (inputtedSeq) {
		for (const answer of benchling_gRNA_outputs.gene_list[current_gene]) {
			if (answer.Sequence === inputtedSeq) {
				possible_comparable_answers.push(answer);
			}
		}
	}

	// Mark each matching entry from a clean state and keep the entry worth the most marks,
	// so results from two entries never combine into one mark.
	let bestAnswer;
	let bestMark = -1;
	for (const possibleAnswer of possible_comparable_answers) {
		resetMarkingState();
		checkCandidateAnswer(possibleAnswer, correctNucleotidePosition);

		const candidateMark = calculateMark();
		if (candidateMark > bestMark) {
			bestMark = candidateMark;
			bestAnswer = possibleAnswer;
		}
	}

	// The loop leaves the last entry's results in place, so an earlier best entry is checked again
	if (bestAnswer && bestAnswer !== possible_comparable_answers[possible_comparable_answers.length - 1]) {
		resetMarkingState();
		checkCandidateAnswer(bestAnswer, correctNucleotidePosition);
	}

	checkAnswers_executed = true;
}

/**
 * Checks one reference gRNA entry that matches the submitted sequence against every submitted answer,
 * setting the marking flags for that entry.
 * @param {object} possibleAnswer - Benchling gRNA output entry whose Sequence equals the submitted gRNA
 * @param {number} correctNucleotidePosition - Zero-based position of the gene's target nucleotide
 */
function checkCandidateAnswer(possibleAnswer, correctNucleotidePosition) {
	// Checking if the gene's target position is within correct nucleotide range
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
			(correctNucleotidePosition >= possibleAnswer.Position - 1 + 1 &&
				correctNucleotidePosition <= possibleAnswer.Position - 1 + 10) ||
			(correctNucleotidePosition <= possibleAnswer.Position - 1 - 1 &&
				correctNucleotidePosition >= possibleAnswer.Position - 1 - 10)
		) {
			MARgRNAseq = true;
			MARgRNAseq_degree = 1;
			true_counts += 1;
		} else if (
			(correctNucleotidePosition >= possibleAnswer.Position - 1 &&
				correctNucleotidePosition <= possibleAnswer.Position - 1 + 20) ||
			(correctNucleotidePosition <= possibleAnswer.Position - 1 &&
				correctNucleotidePosition >= possibleAnswer.Position - 1 - 20)
		) {
			MARgRNAseq = true;
			MARgRNAseq_degree = 2;
			true_counts += 1;
		} else if (
			(correctNucleotidePosition >= possibleAnswer.Position - 1 &&
				correctNucleotidePosition <= possibleAnswer.Position - 1 + 30) ||
			(correctNucleotidePosition <= possibleAnswer.Position - 1 &&
				correctNucleotidePosition >= possibleAnswer.Position - 1 - 30)
		) {
			MARgRNAseq = true;
			MARgRNAseq_degree = 3;
			true_counts += 1;
		}

		// If the sequence if correct, check all other results:
		if (MARgRNAseq) {
			const temp_answer = possibleAnswer;
			// Check if the cut position matches the answer's input
			if (
				temp_answer.Position &&
				parseInt(temp_answer.Position, 10) === parseInt(document.getElementById("position_input").value, 10)
			) {
				MARCutPos = true;
				true_counts += 1;
			} else if (temp_answer.Position === null || temp_answer.Position === undefined) {
				alert(
					"Error code cA302-307: the reference data has no 'Position' value for this gRNA. Please report this on our GitHub issue tracker.",
				);
			}

			// Check if the PAM matches the answer's input
			if (temp_answer.PAM && temp_answer.PAM === document.getElementById("pam_input").value.trim()) {
				MARPAMseq = true;
				true_counts += 1;
			} else if (temp_answer.PAM === null || temp_answer.PAM === undefined) {
				alert(
					"Error code cA311-317: the reference data has no 'PAM' value for this gRNA. Please report this on our GitHub issue tracker.",
				);
			}

			// Check if the Off-target matches the answer's input
			if (temp_answer["Specificity Score"]) {
				checkOffTarget(temp_answer["Specificity Score"]);
			} else if (temp_answer["Specificity Score"] === null || temp_answer["Specificity Score"] === undefined) {
				alert(
					"Error code cA342-348: the reference data has no 'Specificity Score' value for this gRNA. Please report this on our GitHub issue tracker.",
				);
			}

			// Check if the F1 primer matches the answer's input
			checkF1Primers(document?.getElementById("sequence_input")?.value?.trim() || "");

			// Check if the R1 primer matches the answer's input
			checkR1Primers(document?.getElementById("sequence_input")?.value?.trim() || "");
		}
	}
}

let offtarget_List = [];
let offtarget_dict = {};
let offtarget_dictParse = [];
let offtarget_Use = [];
/**
 * Checks whether the submitted off-target score matches the reference scoring rules.
 * @param {number} score - Reference specificity score from the matched gRNA entry
 */
function checkOffTarget(score) {
	// Reset variables:
	MAROffTarget = false;
	MAROffTarget_degree = 0; // 0 wrong, 1 optimal or >=35 with max < 80, 2 >=35 with max >= 80, 3 only option
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
		for (let i = 0; i < benchling_gRNA_outputs.gene_list[current_gene].length; i += 1) {
			if (
				benchling_gRNA_outputs.gene_list[current_gene][i].Position >= rangeStarter_lower &&
				benchling_gRNA_outputs.gene_list[current_gene][i].Position <= rangeStarter_upper
			) {
				if (benchling_gRNA_outputs.gene_list[current_gene][i]["Specificity Score"]) {
					offtarget_List.push(benchling_gRNA_outputs.gene_list[current_gene][i]["Specificity Score"]);
					offtarget_dict[i] = benchling_gRNA_outputs.gene_list[current_gene][i]["Specificity Score"];
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
		const optimalValue = getOffTargetOptimalValue(Max_range);
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

/**
 * Determine the default optimal off-target threshold for practice mode.
 * @param {number} maxRange Maximum specificity score in the local window
 */
function getOffTargetOptimalValue(maxRange) {
	const minOptimal = maxRange - maxRange * 0.2;
	if (minOptimal > 80 || minOptimal < 35) {
		return 80;
	}
	return minOptimal;
}

let possible_F1_primers = [];
/**
 * Checks whether the F1 primer matches one of the generated candidates.
 * @param {string} seq - The gRNA sequence
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
 * Checks whether the R1 primer matches one of the generated candidates.
 * @param {string} seq - The gRNA sequence
 */
function checkR1Primers(seq) {
	// Reset variables:
	MARR1primers = false;
	// Verify primers:
	possible_R1_primers = [];
	const begin_R1 = "TTCTAGCTCTAAAAC";
	const complementary_seq = createComplementarySeq(seq);
	for (let i = 19; i <= 20; i += 1) {
		possible_R1_primers.push(begin_R1 + complementary_seq.slice(0, i));
	}
	if (possible_R1_primers.includes(document.getElementById("r1_input").value.trim())) {
		MARR1primers = true;
	}
}

/**
 * Builds the reverse complement of the provided nucleotide sequence.
 * Each nucleotide is complemented and prepended, so the result reads in the
 * reverse direction relative to the input.
 * @param {string} seq - Nucleotide sequence to reverse-complement
 * @returns {string} The reverse-complement sequence
 */
function createComplementarySeq(seq) {
	let comp_seq = "";
	for (const element of seq) {
		comp_seq = complementary_nt_dict[element] + comp_seq;
	}
	return comp_seq;
}

let studentMark = 0;
let studentMarkPercentage = 0;
const markTotal = 10;

/**
 * Returns the marks out of {@link markTotal} that the current marking flags are worth.
 * @returns {number} The mark, from 0 to 10 in steps of 0.5
 */
function calculateMark() {
	let mark = 0;
	if (MARgRNAseq) {
		if (MARgRNAseq_degree === 1) {
			mark += 2;
		} else if (MARgRNAseq_degree === 2) {
			mark += 1;
		} else if (MARgRNAseq_degree === 3) {
			mark += 0.5;
		}
	}
	if (MARPAMseq) {
		mark += 2;
	}
	if (MAROffTarget) {
		if (MAROffTarget_degree === 1) {
			mark += 2;
		} else if (MAROffTarget_degree === 2) {
			mark += 1;
		} else if (MAROffTarget_degree === 3) {
			mark += 0.5;
		}
	}
	if (MARF1primers) {
		mark += 2;
	}
	if (MARR1primers) {
		mark += 2;
	}

	return mark;
}

/**
 * Calculates the student's mark and percentage based on the current marking state.
 */
function markAnswers() {
	studentMark = 0;
	if (!checkAnswers_executed) {
		checkAnswers();
	}
	if (checkAnswers_executed) {
		studentMark = calculateMark();
		studentMarkPercentage = ((studentMark / markTotal) * 100).toFixed(2);
		if (studentMarkPercentage > 100) {
			studentMarkPercentage = 100;
		} else if (studentMarkPercentage < 0) {
			studentMarkPercentage = 0;
		}
	}
}

/**
 * Explains why a primer answer received no marks, listing the candidates generated from the submitted gRNA.
 * The list is empty only when {@link checkF1Primers} or {@link checkR1Primers} never ran, because
 * {@link checkAnswers} checks primers only for an accepted gRNA sequence.
 * @param {string} label - Primer name shown in the sentence, such as "F1"
 * @param {string[]} primers - Candidate primers generated from the submitted gRNA
 * @returns {string} The feedback sentence for an incorrect primer
 */
function explainIncorrectPrimer(label, primers) {
	if (primers.length === 0) {
		return `No ${label} primer candidates were generated because primers are only checked once your gRNA sequence is accepted.`;
	}

	return `Your ${label} primer sequence was incorrectly matched to one of the following sequences generated based on your gRNA sequence inputted: ${primers.join(", ")}.`;
}

/**
 * Appends one collapsible feedback card to #mainContainer. Every value is written as text,
 * so markup characters in a student's answer show literally instead of being parsed as HTML.
 * @param {object} card - The card's content
 * @param {string} card.id - Element-id prefix, so "gRNA" gives the ids gRNACard and gRNAOutput
 * @param {string} card.title - Field name shown in the header and in the answer sentence
 * @param {number} card.mark - Marks awarded out of 2
 * @param {string} card.answer - The student's submitted value
 * @param {string} card.explanation - Why the mark was given
 */
function appendFeedbackCard({ id, title, mark, answer, explanation }) {
	const headerId = `${id}Card`;
	const outputId = `${id}Output`;

	const toggle = $("<button class='btn btn-link' data-bs-toggle='collapse' aria-expanded='false'></button>")
		.attr({ "data-bs-target": `#${outputId}`, "aria-controls": outputId })
		.text(`${title}: ${mark}/2`);
	const header = $("<div class='card-header'></div>")
		.attr("id", headerId)
		.append($("<h5 class='mb-0'></h5>").append(toggle));

	const body = $("<div class='card-body'></div>").append(
		$("<p></p>").text(` For ${title}, you put down "${answer}" which gave you the mark ${mark}.`),
		document.createTextNode(explanation),
	);
	const output = $("<div class='collapse'></div>").attr({ id: outputId, "aria-labelledby": headerId }).append(body);

	$("#mainContainer").append($("<div class='card about'></div>").append(header, output));
}

/**
 * Show feedback for students
 */
function showFeedback() {
	$("#mainContainer").empty();
	let append_str = "<p style='font-weight:bold;'> Here is the feedback for your practice attempt.</p>";
	append_str +=
		"<p> Your attempt is marked out of 10 marks with 2 marks for each input excluding gRNA strand direction, cut position and target region range (these three values are used to calculate if you have the right answer or not which means they are still crucial that they are still correct).</p>";
	append_str += "<p> The following is the breakdown of your marks and why you received them: </p>";
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
				"This means your sequence was not wrong (therefore was still correct) but there were better options out there. I recommend you try this gene again. Still worth some marks though (half a mark).";
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
	let MARF1primers_explain = explainIncorrectPrimer("F1", possible_F1_primers);
	if (MARF1primers) {
		MARF1primers_display = 2;
		MARF1primers_explain = "This means your answer was correct and you received full marks.";
	}
	/// R1 Primer:
	let MARR1primers_display = 0;
	let MARR1primers_explain = explainIncorrectPrimer("R1", possible_R1_primers);
	if (MARR1primers) {
		MARR1primers_display = 2;
		MARR1primers_explain = "This means your answer was correct and you received full marks.";
	}

	$("#mainContainer").append(append_str);

	appendFeedbackCard({
		id: "gRNA",
		title: "gRNA Strand Sequence",
		mark: MARgRNAseq_degree_display,
		answer: all_answers[0],
		explanation: MARgRNAseq_degree_explain,
	});
	appendFeedbackCard({
		id: "PAM",
		title: "gRNA PAM Sequence",
		mark: MARPAMseq_display,
		answer: all_answers[1],
		explanation: MARPAMseq_explain,
	});
	appendFeedbackCard({
		id: "OffTarget",
		title: "Off-target Score",
		mark: MAROffTarget_degree_display,
		answer: all_answers[4],
		explanation: MAROffTarget_degree_explain,
	});
	appendFeedbackCard({
		id: "F1Primer",
		title: "F1 Primer",
		mark: MARF1primers_display,
		answer: all_answers[5],
		explanation: MARF1primers_explain,
	});
	appendFeedbackCard({
		id: "R1Primer",
		title: "R1 Primer",
		mark: MARR1primers_display,
		answer: all_answers[6],
		explanation: MARR1primers_explain,
	});

	append_str = "<br>";
	append_str +=
		'<p> <button type="button" class="btn btn-primary" onclick="redirectCRISPR();"> Back to Gene Selection </button> </p>';

	$("#mainContainer").append(append_str);
}

let all_answers = [];
let all_marks = [];
/**
 * Collects the student's answers, calculates marks, and triggers feedback display.
 */
function submitAnswers() {
	all_marks = [];
	// The answers are read in the same task as checkAnswers(), so the feedback shows the values that were graded
	all_answers = [
		document?.getElementById("sequence_input")?.value?.trim() || "",
		document.getElementById("pam_input").value.trim(),
		document.getElementById("position_input").value,
		document.getElementById("strand_input").value,
		document.getElementById("offtarget_input").value,
		document.getElementById("f1_input").value.trim(),
		document.getElementById("r1_input").value.trim(),
	];
	checkAnswers();
	setTimeout(() => {
		markAnswers();
		all_marks.push(studentMark, studentMarkPercentage);

		showFeedback();
	}, 750);
}

// Block submit calls on keypress
$(() => {
	$("form").submit(() => false);
});

// Export for testing
if (typeof module !== "undefined" && module.exports) {
	module.exports = {
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
		// Export getters for testing
		get MAROffTarget() {
			return MAROffTarget;
		},
		get MAROffTarget_degree() {
			return MAROffTarget_degree;
		},
		get MARF1primers() {
			return MARF1primers;
		},
		get MARR1primers() {
			return MARR1primers;
		},
		get current_gene() {
			return current_gene;
		},
		get possible_F1_primers() {
			return possible_F1_primers;
		},
		get possible_R1_primers() {
			return possible_R1_primers;
		},
		// Export setters for test setup
		__setTestState(state = {}) {
			if (state.correctNucleotideIncluded !== undefined)
				correctNucleotideIncluded = state.correctNucleotideIncluded;
			if (state.MARgRNAseq !== undefined) MARgRNAseq = state.MARgRNAseq;
			if (state.benchling_gRNA_outputs !== undefined) benchling_gRNA_outputs = state.benchling_gRNA_outputs;
			if (state.current_gene !== undefined) current_gene = state.current_gene;
			if (state.gene_backgroundInfo !== undefined) gene_backgroundInfo = state.gene_backgroundInfo;
			if (state.possible_gene !== undefined) possible_gene = state.possible_gene;
			if (state.MAROffTarget !== undefined) MAROffTarget = state.MAROffTarget;
			if (state.MAROffTarget_degree !== undefined) MAROffTarget_degree = state.MAROffTarget_degree;
			if (state.MARF1primers !== undefined) MARF1primers = state.MARF1primers;
			if (state.MARR1primers !== undefined) MARR1primers = state.MARR1primers;
			if (state.possible_F1_primers !== undefined) possible_F1_primers = state.possible_F1_primers;
			if (state.possible_R1_primers !== undefined) possible_R1_primers = state.possible_R1_primers;
			if (state.all_answers !== undefined) all_answers = state.all_answers;
			if (state.all_marks !== undefined) all_marks = state.all_marks;
		},
		// Reset state for clean tests
		__resetState() {
			resetMarkingState();
			all_answers = [];
			all_marks = [];
		},
	};
}
