//=============================================================================
//
// Purpose: Code for the function and marking of the dry lab CRISPR assignment
//
//=============================================================================

var selection_inMode = "practice";
var possible_gene = "eBFP";
var current_gene = "empty";

/**
* Adds the genes to the Gene's dropdown menu
* @param {String} mode - The CRISPR dry lab's mode ("practice" or "assignment")
*/
function ModeSelectionAdd(mode) {
  $("#gene_dropdown_selection").empty();
  document.getElementById("load_button").disabled;
  var append_str;
  if (mode == "practice") {
    append_str = '<option value="eBFP" id="eBFP" tag="practice">eBFP</option>\n';
    append_str += '<option value="ACTN3" id="ACTN3" tag="practice">ACTN3</option>\n';
    // TODO: Add completed assignment genes into practice mode
    $("#gene_dropdown_selection").append(append_str);
  }
  else if (mode == "assignment") {
    append_str = '<option value="HBB" id="HBB" tag="assignment">HBB</option>\n';
    append_str += '<option value="CCR5" id="CCR5" tag="assignment">CCR5</option>\n';
    append_str += '<option value="ANKK1" id="ANKK1" tag="assignment">ANKK1</option>\n';
    append_str += '<option value="APOE" id="APOE" tag="assignment">APOE</option>\n';
    $("#gene_dropdown_selection").append(append_str);
  }
}

/**
* Purpose of this is to assign the current gene and check for errors
*/
function select_Gene() {
  if (possible_gene != null || possible_gene != "" || possible_gene != undefined) {
    current_gene = possible_gene;
    loadWork();
  }
  else {
    if (current_gene != "empty" || current_gene != "eBFP" || current_gene != "ACTN3" || current_gene != "HBB" || current_gene != "CCR5" || current_gene != "ANKK1" || current_gene != "APOE") {
      current_gene == "empty";
    }
    alert("Error code sG34-42 occured. Please contact admin or TA!");
    console.log("Error code sG34-42 occured. Please contact admin or TA!");
  }
}

var gene_backgroundInfo;
var benchling_grna_ouputs;
/**
* Load JSON files
*/
function loadJSON_Files() {
  const client = new stitch.StitchClient('almark-wvohf');
  const db = client.service('mongodb', 'mongodb-atlas').db('AlMark');
  // Gene background information
  client.login().then(() =>
    db.collection('Gene_Information').updateOne({owner_id: client.authedId()}, {$set:{number:42}}, {upsert:true})
  ).then(()=>
    db.collection('Gene_Information').find({owner_id: client.authedId()}).limit(100).execute()
  ).then(docs => {
    gene_backgroundInfo = docs;
  }).catch(err => {
    console.error(err)
  });
  // Benchling gRNA outputs
  client.login().then(() =>
    db.collection('Benchling_gRNA_Outputs').updateOne({owner_id: client.authedId()}, {$set:{number:42}}, {upsert:true})
  ).then(()=>
    db.collection('Benchling_gRNA_Outputs').find({owner_id: client.authedId()}).limit(100).execute()
  ).then(docs => {
    benchling_grna_ouputs = docs;
  }).catch(err => {
    console.error(err)
  });
}

/**
* Dynamically creates the work page for AlMark
*/
function loadWork() {
  if (gene_backgroundInfo != null || gene_backgroundInfo != "" || gene_backgroundInfo != undefined || backgroundInfo[0]["gene_list"][current_gene] != undefined) {
    $("#work").empty();
    var append_str;

    // Begin background information
    append_str = '<div class="work_background" style="margin-top:2%;">'

    // CRISPR header information
    append_str += '<div id="crispr_header">\n<p>Please refer to your dry lab protocol for full instructions on how and what to do. Below is a brief reminder of what you are suppose to do with each gene: \n <b>Your objective is to find these mutations, design a gRNA and its corresponding F1/R1 primers</b></p> \n</div>\n';

    // Gene information
    append_str += '<div id="gene_info"><p>Here is some background information about your gene: ' + gene_backgroundInfo[0]["gene_list"][current_gene]["name"] + " (" + current_gene + ')</p>\n';
    append_str += '<p> Background information: ' + gene_backgroundInfo[0]["gene_list"][current_gene]["Background"] + '</p>\n';
    append_str += '<p> Target site: ' + gene_backgroundInfo[0]["gene_list"][current_gene]["Target site"] + '</p>\n';
    append_str += '<p style="word-wrap:break-word;"> Modified genetic sequence: ' + gene_backgroundInfo[0]["gene_list"][current_gene]["Sequence"] + '</p>\n';
    append_str += '</div>';

    // End background information
    append_str += '</div>';

    // Begin gene assignment work
    append_str += '<div id="work_section">';

    // Gene assignment form inputs
    append_str += '<p> Please input the following information for your gRNA for your selected gene.</p>\n';
    append_str += '<form>';

    // gRNA sequence
    append_str += '<div class="form-group">';
    append_str += '<label for="sequence_input">gRNA Sequence:</label>';
    append_str += '<input class="form-control" id="sequence_input" placeholder="CTCGTGACCACCCTGACCCA" maxlength="20" required>';
    append_str += '<small id="sequence_inputSmall" class="form-text text-muted">This would be your gRNA sequence 5\' to 3\'. NOTE: This is maxed out at 20 characters long</small>';
    append_str += '</div>';

    // PAM sequence
    append_str += '<div class="form-group">';
    append_str += '<label for="pam_input">PAM Sequence:</label>';
    append_str += '<input class="form-control" id="pam_input" placeholder="CGG" maxlength="3" required>';
    append_str += '<small id="pam_inputSmall" class="form-text text-muted">This would be your PAM sequence 5\' to 3\'. NOTE: This is maxed out at 3 characters long</small>';
    append_str += '</div>';

    // Position
    append_str += '<div class="form-group">';
    append_str += '<label for="position_input">Cut position:</label>';
    append_str += '<input class="form-control" id="position_input" placeholder="380" type="number" required>';
    append_str += '<small id="position_inputSmall" class="form-text text-muted">This would be your cut position for your gRNA. NOTE: This input only takes numbers</small>';
    append_str += '</div>';

    // Strand
    append_str += '<div class="form-group">';
    append_str += '<label for="strand_input">gRNA Strand:</label>';
    append_str += '<select class="form-control" id="strand_input"><option>Antisense (-)</option><option>Sense (+)</option></select>';
    append_str += '<small id="strand_inputSmall" class="form-text text-muted">This would be for which strand your gRNA is on.</small>';
    append_str += '</div>';

    // On-target score
    append_str += '<div class="form-row">'
    append_str += '<div class="form-group col-md-8">';
    append_str += '<label for="ontarget_input">On-target score:</label>';
    append_str += '<input class="form-control" id="ontarget_input" placeholder="60.5" type="number" step="0.01" required>'
    append_str += '</div>';
    append_str += '<div class="form-group col-md-4">';
    append_str += '<label for="targetregion_input">Target Region Range:</label>';
    append_str += '<input class="form-control" id="targetregion_input" placeholder="183-976" type="text" onkeypress="return isNumberOrDashKey(event);" required>'
    append_str += '</div>';
    append_str += '<small id="ontarget_inputSmall" class="form-text text-muted">The first input box would be your on-target score for your gRNA. The second input box would be the target region range that you used in Benchling to find/search for gRNAs, this is required for evaluating your inputs. NOTE: These input only takes numbers</small><br>';
    append_str += '</div>';

    // Off-target score
    append_str += '<div class="form-group">';
    append_str += '<label for="offtarget_input">Off-target score:</label>';
    append_str += '<input class="form-control" id="offtarget_input" placeholder="60.7" step="0.01" type="number" required>';
    append_str += '<small id="position_inputSmall" class="form-text text-muted">This would be your of-target score for your gRNA. NOTE: This input only takes numbers</small>';
    append_str += '</div>';

    // F1 Primers
    append_str += '<div class="form-group">';
    append_str += '<label for="f1_input">f1 Primers:</label>';
    append_str += '<input class="form-control" id="f1_input" placeholder="TAATACGACTCACTATAGCTCGTGACCACCCTGA" required>';
    append_str += '<small id="f1_inputSmall" class="form-text text-muted">This would be your forward primer (F1) for your gRNA</small>';
    append_str += '</div>';

    // R1 Primers
    append_str += '<div class="form-group">';
    append_str += '<label for="r1_input">R1 Primers:</label>';
    append_str += '<input class="form-control" id="r1_input" placeholder="TTCTAGCTCTAAAACTGGGTCAGGGTGGTCACGAG" required>';
    append_str += '<small id="r1_inputSmall" class="form-text text-muted">This would be your reverse primer (R1) for your gRNA</small>';
    append_str += '</div>';

    // Buttons
    append_str += '<button class="btn btn-success" style="margin:1%;">Save</button>';
    append_str += '<button class="btn btn-primary" style="margin:1%;">Submit</button>';
    append_str += '<button class="btn btn-warning" style="margin:1%;" onclick="checkAnswers();">Check (Temp button)</button>';

    // End form
    append_str += '</form>';

    // End gene assignment work
    append_str += '</div>';

    $("#work").append(append_str);
  }
  else if (gene_backgroundInfo == null || gene_backgroundInfo == "" || gene_backgroundInfo == undefined || backgroundInfo[0]["gene_list"][current_gene] == undefined) {
    alert("Error code lFS50-66 occured. Please contact admin or TA!");
    console.log("Error code lFS50-66 occured. Please contact admin or TA!");
  }
}

/**
* @param {event} evt - Character key press
* @return {bool} - Returns true if number or dash, false elsewords
* Determine if a number or dash key is pressed
*/
function isNumberOrDashKey(evt) {
  var charCode = (evt.which) ? evt.which : event.keyCode;
  if (charCode != 46 && charCode != 45 && charCode > 31 && (charCode < 48 || charCode > 57)) {
    return false;
  }
  return true;
}

var possible_comparable_answers = [];
var correctNucleotideIncluded = false;
var correctCutSiteRange = false;
function checkAnswers() {
  var correctNucleotide = gene_backgroundInfo[0]["gene_list"][current_gene]["Sequence"].charAt(gene_backgroundInfo[0]["gene_list"][current_gene]["Target position"]);
  var correctNucleotidePosition = gene_backgroundInfo[0]["gene_list"][current_gene]["Target position"];

  // Check gRNA Sequence:
  var inputedSeq = document.getElementById("sequence_input").value;
  // Check if gRNA sequence is in against listed
  possible_comparable_answers = [];
  for (i=0; i<benchling_grna_ouputs[0]["gene_list"][current_gene].length; i++) {
    if (benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Sequence"] == inputedSeq) {
      possible_comparable_answers.push(benchling_grna_ouputs[0]["gene_list"][current_gene][i]);
    }
  }

  // Check against existing:
  var possible_right_answers = [];
  if (possible_comparable_answers.length > 0) {
    for (i = 0; i < possible_comparable_answers.length; i++) {
      correctNucleotideIncluded = false;
      if (possible_comparable_answers[i]["Strand"] == 1) {
        var nucleotideIncludedRange_top = possible_comparable_answers[i]["Position"] + 3;
        var nucleotideIncludedRange_bot = possible_comparable_answers[i]["Position"] - 17;
        if (correctNucleotidePosition >= nucleotideIncludedRange_bot && correctNucleotidePosition <= nucleotideIncludedRange_top) {
          correctNucleotideIncluded = true;
        }
      }
      else if (possible_comparable_answers[i]["Strand"] == -1) {
        var nucleotideIncludedRange_top = possible_comparable_answers[i]["Position"] + 17;
        var nucleotideIncludedRange_bot = possible_comparable_answers[i]["Position"] - 3;
        if (correctNucleotidePosition >= nucleotideIncludedRange_bot && correctNucleotidePosition <= nucleotideIncludedRange_top) {
          correctNucleotideIncluded = true;
        }
      }
      // If in correct nucleotide range, check if nucleotide is included in cut site
      correctCutSiteRange = false;
      if (correctNucleotideIncluded == true) {
        if (possible_comparable_answers[i]["Strand"] == 1) {
          var cutSiteBot = possible_comparable_answers[i]["Position"] - 17;
          if (correctNucleotidePosition >= cutSiteBot && correctNucleotidePosition <= possible_comparable_answers[i]["Position"]) {
            correctCutSiteRange = true;
          }
        }
        else if (possible_comparable_answers[i]["Strand"] == -1) {
          var cutSiteBot = possible_comparable_answers[i]["Position"] + 17;
          if (correctNucleotidePosition >= cutSiteBot && correctNucleotidePosition <= possible_comparable_answers[i]["Position"]) {
            correctCutSiteRange = true;
          }
        }
      }
    }
  }
}

$(document).ready(function() {
  // On load, make sure gene select is not empty:
  ModeSelectionAdd(selection_inMode);

  loadJSON_Files();
})
