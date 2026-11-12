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

	// Both functions live in crispr_scripts.min.js; if that script failed to load,
	// calling them would reject this async function with an unhandled ReferenceError.
	if (typeof loadCRISPRJSON_Files !== "function" || typeof fillGeneList !== "function") {
		console.error("SciGrade could not load crispr_scripts.min.js; gene data is unavailable.");
		$("#selection_process").append(
			"<div class='alert alert-danger' role='alert' id='load_error'>SciGrade could not finish loading. Please reload the page.</div>",
		);
		return;
	}

	await loadCRISPRJSON_Files();

	fillGeneList();
}

// Export for testing
if (typeof module !== "undefined" && module.exports) {
	module.exports = { loadGeneContent, redirectCRISPR };
}
