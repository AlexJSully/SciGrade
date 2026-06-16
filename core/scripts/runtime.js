//= ================================ SciGrade ==================================
//
// Purpose: Runtime flow helpers for the practice experience
//
//= ============================================================================

/**
 * Load the content fill section for a gene.
 * @example <caption>Use this function to call and load the gene in the gene dropdown</caption>
 * loadGeneContent()
 * // returns null (does not return anything but loads the gene content on the web app)
 */
function loadGeneContent() {
	checkAnswers_executed = false;
	possible_gene = document.getElementById("gene_dropdown_selection").value;
	select_Gene();
}

/** Builds the selection UI and loads the reference data for the runtime page. */
async function redirectCRISPR() {
	$("#mainContainer").empty();
	let append_str;
	append_str = `
		<div class='row'>
			<div class='col-sm-1'></div>
				<div class='col-sm-10' id='content_body'>
					<div id='selection_process'>
					<div id='mode_selection' style='margin-top: 2%;'>
						<p>Please select the dry lab mode you would like to use: </p>
					</div>

					<div id='gene_selection'>
						Please select your gene:
						<div class='btn-group'>
							<select
								class='form-select'
								id='gene_dropdown_selection'
								onchange='possible_gene=(document.getElementById("gene_dropdown_selection").value);'
								aria-label='Select gene for CRISPR analysis'
							>
							</select>
						</div>
					</div>

					<div id='load_button'>
						<button
							type='button'
							id='load_gene_button'
							class='btn btn-success'
							style='margin-top: 2%;'
							onClick='loadGeneContent()'
							disabled
						>
							Load Gene
						</button>
					</div>
				</div>

				<div id='work'>
				</div>
			</div>

			<div class='col-sm-1'></div>
		</div>
	`;

	$("#mainContainer").append(append_str);

	await loadCRISPRJSON_Files();

	fillGeneList();
}

// Export for testing
if (typeof module !== "undefined" && module.exports) {
	module.exports = { loadGeneContent, redirectCRISPR };
}
