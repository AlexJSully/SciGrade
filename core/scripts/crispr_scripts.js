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
  removeCompletedAssignments();
}

/**
* Purpose of this is to assign the current gene and check for errors
*/
function select_Gene() {
  if (possible_gene != null || possible_gene != "" || possible_gene != undefined) {
    current_gene = possible_gene;
    loadWork();
    checkAnswers_executed = false;
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
function loadCRISPRJSON_Files() {
  const client = new stitch.StitchClient('almark-wvohf');
  const db = client.service('mongodb', 'mongodb-atlas').db('AlMark');
  // Gene background information
  client.login().then(() =>
    db.collection('Gene_Information').find({version: "0.3"}).limit(100).execute()
  ).then(docs => {
    gene_backgroundInfo = docs;
  }).catch(err => {
    console.error(err)
  });
  // Benchling gRNA outputs
  client.login().then(()=>
    db.collection('Benchling_gRNA_Outputs').find({version: "0.2"}).limit(100).execute()
  ).then(docs => {
    benchling_grna_ouputs = docs;
  }).catch(err => {
    console.error(err)
  });
}

var loadedMoad = "practice";
/**
* Dynamically creates the work page for AlMark
*/
function loadWork() {
  if (gene_backgroundInfo != null || gene_backgroundInfo != "" || gene_backgroundInfo != undefined || backgroundInfo[0]["gene_list"][current_gene] != undefined) {
    $("#work").empty();
    loadedMoad = selection_inMode;
    checkAnswers_executed = false;
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
    append_str += '<label for="f1_input">F1 Primers:</label>';
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
    append_str += '<button type="button" class="btn btn-success" style="margin:1%;" hidden>Save</button>';
    append_str += '<button type="button" class="btn btn-primary" style="margin:1%;" onclick="submitAnswers();">Submit</button>';

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

/**
* Global marking variables
*/
var MARgRNAseq = false;
var MARgRNAseq_degree = 0; // 0 wrong, 1 correct, 2 partial of <20bp, 3 technically correct of <30bp
var MARPAMseq = false;
var MARCutPos = false;
var MARstrand = false;
var MAROnTarget = false;
var MAROnTarget_degree = 0; // 0 wrong, 1 within range, 2 above 40, 3 only option
var MAROnTarget_aboveOpt = false;
var MAROnTarget_above40 = false;
var MAROnTarget_onlyOption = false;
var MAROffTarget = false;
var MAROffTarget_degree = 0; // 0 wrong, 1 above 75, 2 above 35, 3 only option
var MAROffTarget_aboveOpt = false;
var MAROffTarget_above35 = false;
var MAROffTarget_onlyOption = false;
var MARF1primers = false;
var MARR1primers = false;

var possible_comparable_answers = [];
var possible_outputs = [];
var correctNucleotideIncluded = false;
var true_counts = 0; // This exists for the instance that there is more than one match for inputedSeq

var checkAnswers_executed = false;
function checkAnswers() {
  var correctNucleotide = gene_backgroundInfo[0]["gene_list"][current_gene]["Sequence"].charAt(gene_backgroundInfo[0]["gene_list"][current_gene]["Target position"]);
  var correctNucleotidePosition = gene_backgroundInfo[0]["gene_list"][current_gene]["Target position"] - 1;

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
      true_counts = 0;
      // Checking if the gene's target position is within correct nucleotide range
      correctNucleotideIncluded = false;
      if (possible_comparable_answers[i]["Strand"] == 1) {
        var nucleotideIncludedRange_top = ((possible_comparable_answers[i]["Position"] - 1) - 1) + 3;
        var nucleotideIncludedRange_bot = (possible_comparable_answers[i]["Position"] - 1) - 17;
        if (correctNucleotidePosition >= nucleotideIncludedRange_bot && correctNucleotidePosition <= nucleotideIncludedRange_top) {
          correctNucleotideIncluded = true;
        }
      }
      else if (possible_comparable_answers[i]["Strand"] == -1) {
        var nucleotideIncludedRange_top = (possible_comparable_answers[i]["Position"] - 1) + 17;
        var nucleotideIncludedRange_bot = (possible_comparable_answers[i]["Position"] - 1) - 3;
        if (correctNucleotidePosition >= nucleotideIncludedRange_bot && correctNucleotidePosition <= nucleotideIncludedRange_top) {
          correctNucleotideIncluded = true;
        }
      }
      // If in correct nucleotide range, check if nucleotide is included in cut site
      if (correctNucleotideIncluded == true) {
        // Determine where PAM site would be and if PAM site matches inputted value
        var pamFirst;
        var pamSecond;
        // Sense is 1
        if (possible_comparable_answers[i]["Strand"] == 1) {
          pamFirst = (possible_comparable_answers[i]["Position"] - 1) + 2;
          pamSecond = (possible_comparable_answers[i]["Position"] - 1) + 4;
          // If the sequence matches to be true, check other answers:
          if (document.getElementById("strand_input").value == "Sense (+)") {
            MARstrand = true;
            true_counts++;
          }
        }
        // Antisense is -1
        else if (possible_comparable_answers[i]["Strand"] == -1) {
          pamFirst = (possible_comparable_answers[i]["Position"] - 1) - 2;
          pamSecond = (possible_comparable_answers[i]["Position"] - 1) - 4;
          // If the sequence matches to be true, check other answers:
          if (document.getElementById("strand_input").value == "Antisense (-)") {
            MARstrand = true;
            true_counts++;
          }
        }

        // Determining how right the seqence is
        if (correctNucleotidePosition >= (pamFirst) && correctNucleotidePosition <= (pamSecond)) { // within PAM site
          MARgRNAseq = false;
          MARgRNAseq_degree = 0;
        }
        else if (
          (correctNucleotidePosition >= ((possible_comparable_answers[i]["Position"] - 1) + 1) && correctNucleotidePosition <= ((possible_comparable_answers[i]["Position"] - 1) + 10)) || (correctNucleotidePosition >= ((possible_comparable_answers[i]["Position"] - 1) - 1) && correctNucleotidePosition <= ((possible_comparable_answers[i]["Position"] - 1) - 10))
        ) {
          MARgRNAseq = true;
          MARgRNAseq_degree = 1;
          true_counts++;
        }
        else if (
          (correctNucleotidePosition >= ((possible_comparable_answers[i]["Position"] - 1)) && correctNucleotidePosition <= ((possible_comparable_answers[i]["Position"] - 1) + 20)) || (correctNucleotidePosition >= ((possible_comparable_answers[i]["Position"] - 1)) && correctNucleotidePosition <= ((possible_comparable_answers[i]["Position"] - 1) - 20))
        ) {
          MARgRNAseq = true;
          MARgRNAseq_degree = 2;
          true_counts++;
        }
        else if (
          (correctNucleotidePosition >= ((possible_comparable_answers[i]["Position"] - 1)) && correctNucleotidePosition <= ((possible_comparable_answers[i]["Position"] - 1) + 30)) || (correctNucleotidePosition >= ((possible_comparable_answers[i]["Position"] - 1)) && correctNucleotidePosition <= ((possible_comparable_answers[i]["Position"] - 1) - 30))
        ) {
          MARgRNAseq = true;
          MARgRNAseq_degree = 3;
          true_counts++;
        }

        // If the sequence if correct, check all other results:
        if (MARgRNAseq == true) {
          var temp_answer = possible_comparable_answers[i];
          // Check if the cut position matches the answer's input
          if ((temp_answer["Position"] != null || temp_answer["Position"] != undefined) && parseInt(temp_answer["Position"]) == parseInt(document.getElementById("position_input").value)) {
            MARCutPos = true;
            true_counts++;
          }
          else if (temp_answer["Position"] == null || temp_answer["Position"] == undefined) {
            alert("Error code cA302-307: retrieving server information on 'Position' answers occured. Please contact admin or TA!");
            console.log("Error code cA302-307: retrieving server information on 'Position' answers occured. Please contact admin or TA!");
          }

          // Check if the PAM matches the answer's input
          if ((temp_answer["PAM"] != null || temp_answer["PAM"] != undefined) && temp_answer["PAM"] == document.getElementById("pam_input").value) {
            MARPAMseq = true;
            true_counts++;
          }
          else if (temp_answer["PAM"] == null || temp_answer["PAM"] == undefined) {
            alert("Error code cA311-317: retrieving server information on 'PAM' answers occured. Please contact admin or TA!");
            console.log("Error code cA311-317: retrieving server information on 'PAM' answers occured. Please contact admin or TA!");
          }

          // Check if the On-target matches the answer's input
          if (temp_answer["Efficiency Score"] != null || temp_answer["Efficiency Score"] != undefined) {
            checkOnTargetRange(i);
          }
          else if (temp_answer["Efficiency Score"] == null || temp_answer["Efficiency Score"] == undefined) {
            alert("Error code cA333-340: retrieving server information on 'Efficiency Score' answers occured. Please contact admin or TA!");
            console.log("Error code cA333-340: retrieving server information on 'Efficiency Score' answers occured. Please contact admin or TA!");
          }

          // Check if the Off-target matches the answer's input
          if (temp_answer["Specificity Score"] != null || temp_answer["Specificity Score"] != undefined) {
            checkOffTarget(temp_answer["Specificity Score"]);
          }
          else if (temp_answer["Specificity Score"] == null || temp_answer["Specificity Score"] == undefined) {
            alert("Error code cA342-348: retrieving server information on 'Specificity Score' answers occured. Please contact admin or TA!");
            console.log("Error code cA342-348: retrieving server information on 'Specificity Score' answers occured. Please contact admin or TA!");
          }

          // Check if the F1 primer matches the answer's input
          checkF1Primers(document.getElementById("sequence_input").value);

          // Check if the F1 primer matches the answer's input
          checkR1Primers(document.getElementById("sequence_input").value);
        }
      }
    }
  }
  checkAnswers_executed = true;
}

/**
* Checks the on-target score if it is correct based on the target region range
* @param {int} parseNum - Integer for possible_comparable_answers parse
* @return {bool} - Returns true if MAROnTarget is correct
*/
var ontarget_geneParse = [];
var ontarget_lastResort = [];
function checkOnTargetRange(parseNum) {
  // Create on-target variables
  var OnTargetValue_down = Math.floor(possible_comparable_answers[parseNum]["Efficiency Score"]);
  var OnTargetValue_up = Math.ceil(possible_comparable_answers[parseNum]["Efficiency Score"]);
  var InputOnTargetValue = parseInt(document.getElementById("ontarget_input").value);
  // See if on-target value matches input value
  if (correctNucleotideIncluded == true && MARgRNAseq == true) {
    if (InputOnTargetValue >= OnTargetValue_down && InputOnTargetValue <= OnTargetValue_up) {
      MAROnTarget = true;
      true_counts++;
    }
  }
  // Determine how write it is based on its range
  if (MAROnTarget == true) {
    // Target region range:
    document.getElementById("targetregion_input").value.replace(/./g,'');
    var Range_upper = document.getElementById("targetregion_input").value.split("-")[1];
    var Range_lower = document.getElementById("targetregion_input").value.split("-")[0];
    // Check if gRNA sequence is in against listed
    for (i=0; i<benchling_grna_ouputs[0]["gene_list"][current_gene].length; i++) {
      if (benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Position"] >= Range_lower && benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Position"] <= Range_upper) {
        if (benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Efficiency Score"] != null || benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Efficiency Score"] != undefined) {
          ontarget_geneParse.push(benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Efficiency Score"]);
        };
      }
    }
    // Check for last-resort regions:
    var rangeStarter_upper = parseInt(document.getElementById("position_input").value) + 35;
    var rangeStarter_lower = parseInt(document.getElementById("position_input").value) - 35;
    // Check if gRNA sequence is in against listed
    ontarget_lastResort = [];
    for (i=0; i<benchling_grna_ouputs[0]["gene_list"][current_gene].length; i++) {
      if (benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Position"] >= rangeStarter_lower && benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Position"] <= rangeStarter_upper) {
        if (benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Efficiency Score"] != null || benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Efficiency Score"] != undefined) {
          ontarget_lastResort.push(benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Efficiency Score"]);
        };
      }
    }
    var last_resort_okay = true;
    if (Math.max.apply(null, ontarget_geneParse) < 40) {
      last_resort_okay = false;
    }

    // Is it within the optimal range?
    var Max_range = Math.max.apply(null, ontarget_geneParse);
    var Min_optiomal = Max_range - (Max_range * 0.2);
    if (InputOnTargetValue >= Min_optiomal) {
      MAROnTarget_aboveOpt = true;
      MAROnTarget_above40 = true;
      MAROnTarget_degree = 1;
    }
    else if (InputOnTargetValue >= 40) {
      MAROnTarget_above40 = true;
      MAROnTarget_degree = 2
    }
    else if (last_resort_okay == false) {
      MAROnTarget_onlyOption = true;
      MAROnTarget_degree = 3;
    }
  }
}

/**
* Checks the off-target score if it is correct
* @param {int} score - The specificity score from possible_comparable_answers
* @return {bool} - Returns true if MAROffTarget is correct
*/
var offtarget_List = [];
var offtarget_dict = {};
var offtarget_dictParse = [];
var offtarget_Use = [];
function checkOffTarget(score) {
  // Create off-target variables
  var OffTargetValue_down = Math.floor(score);
  var OffTargetValue_up = Math.ceil(score);
  var InputOffTargetValue = parseInt(document.getElementById("offtarget_input").value);
  // See if off-target value matches input value
  if (correctNucleotideIncluded == true && MARgRNAseq == true) {
    if (InputOffTargetValue >= OffTargetValue_down && InputOffTargetValue <= OffTargetValue_up) {
      MAROffTarget = true;
      true_counts++;
    }
  }
  // Determine how write it is based on its range
  if (MAROffTarget == true) {
    // Check for last-resort regions:
    var rangeStarter_upper = parseInt(document.getElementById("position_input").value) + 35;
    var rangeStarter_lower = parseInt(document.getElementById("position_input").value) - 35;
    // Check if gRNA sequence is in against listed
    offtarget_List = [];
    offtarget_dict = {};
    offtarget_dictParse = [];
    offtarget_Use = [];
    for (i=0; i<benchling_grna_ouputs[0]["gene_list"][current_gene].length; i++) {
      if (benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Position"] >= rangeStarter_lower && benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Position"] <= rangeStarter_upper) {
        if (benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Specificity Score"] != null || benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Specificity Score"] != undefined) {
          offtarget_List.push(benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Specificity Score"])
          offtarget_dict[i] = benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Specificity Score"];
          offtarget_dictParse.push[i];
        };
      }
    }
    var last_resort_okay = true;
    if (Math.max.apply(null, offtarget_List) < 35) {
      last_resort_okay = false;
    }

    // Is it within the optimal range?
    var Max_range = Math.max.apply(null, offtarget_List);
    var Min_optiomal = Max_range - (Max_range * 0.2);
    if (InputOffTargetValue >= 80) {
      MAROffTarget_aboveOpt = true;
      MAROffTarget_above35 = true;
      MAROffTarget_degree = 1;
    }
    else if (InputOffTargetValue >= 35) {
      MAROffTarget_above35 = true;
      if (Math.max.apply(null, offtarget_List) < 80) {
        MAROffTarget_degree = 1;
      }
      else {
        MAROffTarget_degree = 2
      }
    }
    else if (last_resort_okay == false) {
      MAROffTarget_onlyOption = true;
      MAROffTarget_degree = 3;
    }
  }
}

/**
* Checks if the F1 primer is correct or not
* @param {String} seq - The gRNA sequence
* @return {bool} - Returns true if MARF1primers is correct
*/
var possible_F1_primers = [];
function checkF1Primers(seq) {
  possible_F1_primers = [];
  var begin_F1 = "TAATACGACTCACTATAG";
  var count_First = true;
  if (seq[0] == "G") {count_First = false;}
  for (i = 16; i <= 20; i++) {
    possible_F1_primers.push(begin_F1 + seq.slice(0, i));
  }
  if (count_First == false) {
    for (i = 16; i <= 20; i++) {
      possible_F1_primers.push(begin_F1 + seq.slice(1, i));
    }
  }
  if (possible_F1_primers.includes(document.getElementById("f1_input").value)) {
    MARF1primers = true;
  }
}

/**
* Checks if the R1 primer is correct or not
* @param {String} seq - The gRNA sequence
* @return {bool} - Returns true if MARR1primers is correct
*/
var possible_R1_primers = [];
var complementary_nt_dict = {"A":"T", "T":"A", "C":"G", "G":"C"}
function checkR1Primers(seq) {
  possible_R1_primers = [];
  var begin_R1 = "TTCTAGCTCTAAAAC";
  var complemetary_seq = "";
  for (i = 0; i < seq.length; i++) {
  	complemetary_seq = complementary_nt_dict[seq[i]] + complemetary_seq;
  }
  for (i = 19; i <= 20; i++) {
    possible_R1_primers.push(begin_R1 + complemetary_seq.slice(0, i));
  }
  if (possible_R1_primers.includes(document.getElementById("r1_input").value)) {
    MARR1primers = true;
  }
}

/**
* Creates a complementary sequence of the nucleotides
*/
function createComplementarySeq(seq) {
  var comp_seq = "";
  for (i = 0; i < seq.length; i++) {
  	comp_seq = complementary_nt_dict[seq[i]] + comp_seq;
  }
}

var studentMark = 0;
var studentMarkPercentage = 0;
/**
* Based on checkAnswers(), returns a float of a mark
*/
function markAnswers() {
  if (checkAnswers_executed == false) {
    checkAnswers();
  }
  if (checkAnswers_executed == true) {
    if (MARgRNAseq == true) {
      if (MARgRNAseq_degree == 1) {
        studentMark += 2;
      }
      else if (MARgRNAseq_degree == 2) {
        studentMark += 1;
      }
      else if (MARgRNAseq_degree == 3) {
        studentMark += 0.5;
      }
    }
    if (MARPAMseq == true) {
      studentMark += 2;
    }
    if (MAROnTarget == true) {
      if (MAROnTarget_degree == 1) {
        studentMark += 2;
      }
      else if (MAROnTarget_degree == 2) {
        studentMark += 1;
      }
      else if (MAROnTarget_degree == 3) {
        studentMark += 0.5;
      }
    }
    if (MAROffTarget == true) {
      if (MAROffTarget_degree == 1) {
        studentMark += 2;
      }
      else if (MAROffTarget_degree == 2) {
        studentMark += 1;
      }
      else if (MAROffTarget_degree == 3) {
        studentMark += 0.5;
      }
    }
    if (MARF1primers == true) {
      studentMark += 2;
    }
    if (MARR1primers == true) {
      studentMark += 2;
    }
    studentMarkPercentage = ((studentMark/12) * 100).toFixed(2)
  }
}

/**
* Show feedback for students
*/
function showFeedback() {
  $("#mainContainer").empty();
  var append_str = "<p> You would only receive feedback on your practice attempts and not your final assignment.</p>";
  append_str += "<p> The assignment itself is marked out of 12 marks with 2 marks for each input excluding gRNA strand direction, cut position and target region range (these three values are used to calculate if you have the right answer or not which means they are still crucial that they are still correct).</p>";
  append_str += "<br>";
  append_str += "<p> If at any point you wish to dispute marks, please contact your TA or professor once you completed your assignment. If you have found a bug in our SciGrade marking system, please contact your professor or our admin </p>";
  append_str += "<br>";
  append_str += "<p> The following is the breakdown of what marks you would have received and why you would have gotten them: </p>";

  append_str += "<br>";
  append_str += "<p> <b> gRNA Strand Sequence: </b> </p>";
  var MARgRNAseq_degree_display = 0;
  var MARgRNAseq_degree_explain = "Your gRNA sequence was wrong and not found in the Benchling gRNA outputs. Either you made a typo or this answer was not correct and did not contain the target cut site within an acceptable range.";
  if (MARgRNAseq == true) {
    if (MARgRNAseq_degree == 1) {
      MARgRNAseq_degree_display = 2;
      MARgRNAseq_degree_explain = "This means your answer was correct and you recieved full marks.";
    }
    else if (MARgRNAseq_degree == 2) {
      MARgRNAseq_degree_display = 1;
      MARgRNAseq_degree_explain = "This means your sequence was partially correct as it contain the target sequence within a 20bp range but was not optimal. One mark.";
    }
    else if (MARgRNAseq_degree == 3) {
      MARgRNAseq_degree_display = 0.5;
      MARgRNAseq_degree_explain = "This means your sequence was not wrong (therefore was still correct) but there was better options out there. I recommend you try this practice assignment again. Still worth some marks though (half a mark).";
    }
  }
  append_str += '<p> For gRNA Strand Sequence, you put down "' + all_answers[0] + '" which gave you the mark ' + MARgRNAseq_degree_display + '.</p>'
  append_str += MARgRNAseq_degree_explain;
  append_str += "<br>";

  append_str += "<br>";
  append_str += "<p> <b> gRNA PAM Sequence: </b> </p>";
  var MARPAMseq_display = 0;
  var MARPAMseq_explain = "Your PAM sequence was wrong and not found relative to your gRNA sequence. Either you made a typo or this answer was not correct. Either it contained the cutsite within the PAM site or it was not a NGG or NAG PAM site (SciGrade only accepts either of those two PAM sites).";
  if (MARPAMseq == true) {
    MARPAMseq_display = 2;
    MARPAMseq_explain = "This means your answer was correct and you recieved full marks.";
  }
  append_str += '<p> For gRNA PAM Sequence, you put down "' + all_answers[1] + '" which gave you the mark ' + MARPAMseq_display + '.</p>'
  append_str += MARPAMseq_explain;
  append_str += "<br>";

  append_str += "<br>";
  append_str += "<p> <b> On-Target Score: </b> </p>";
  var MAROnTarget_degree_display = 0;
  var MAROnTarget_degree_explain = "Your on-target score was wrong. Either it was not above/within the optimal range (or above 40) or the last-resort option.";
  if (MAROnTarget == true) {
    if (MAROnTarget_degree == 1) {
      MAROnTarget_degree_display = 2;
      MAROnTarget_degree_explain = "This means your answer was correct while above/within the optimal range and you recieved full marks.";
    }
    else if (MAROnTarget_degree == 2) {
      MAROnTarget_degree_display = 1;
      MAROnTarget_degree_explain = "This means your answer was technically correct as its on-target value was above 40.";
    }
    else if (MAROnTarget_degree == 3) {
      MAROnTarget_degree_display = 0.5;
      MAROnTarget_degree_explain = "This means your answer was partially correct as it was found to be your only option is soley based on on-target scoring based on the target region range you selected.";
    }
  }
  append_str += '<p> For On-Target Score, you put down "' + all_answers[4] + '" which gave you the mark ' + MAROnTarget_degree_display + '.</p>'
  append_str += MAROnTarget_degree_explain;
  append_str += "<br>";

  append_str += "<br>";
  append_str += "<p> <b> Off-Target Score: </b> </p>";
  var MAROffTarget_degree_display = 0;
  var MAROffTarget_degree_explain = "Your off-target score was wrong. Either it was not above/within the optimal range (or above 35) or the last-resort option.";
  if (MAROffTarget == true) {
    if (MAROffTarget_degree == 1) {
      MAROffTarget_degree_display = 2;
      MAROffTarget_degree_explain = "This means your answer was correct while above/within the optimal range of 80 and you recieved full marks.";
    }
    else if (MAROffTarget_degree == 2) {
      MAROffTarget_degree_display = 1;
      MAROffTarget_degree_explain = "This means your answer was technically correct as its on-target value was above 35.";
    }
    else if (MAROffTarget_degree == 3) {
      MAROffTarget_degree_display = 0.5;
      MAROffTarget_degree_explain = "This means your answer was partially correct as it was found to be your only option is soley based on on-target scoring based on the target region range you selected.";
    }
  }
  append_str += '<p> For Off-Target Score, you put down "' + all_answers[6] + '" which gave you the mark ' + MAROffTarget_degree_display + '.</p>'
  append_str += MAROffTarget_degree_explain;
  append_str += "<br>";

  append_str += "<br>";
  append_str += "<p> <b> F1 Primer: </b> </p>";
  var MARF1primers_display = 0;
  var f1Options = "";
  for (i = 0; i < possible_F1_primers.length; i++) {
    f1Options += possible_F1_primers[i];
    if (i = (possible_F1_primers.length - 1)) {
      f1Options += ".";
    }
    else {
      f1Options += ", ";
    }
  };
  var MARF1primers_explain = "Your F1 primer sequence was incorrectly matched to one of the following sequences generated based on your gRNA seqeuence inputted: " + f1Options;
  if (MARF1primers == true) {
    MARF1primers_display = 2;
    MARF1primers_explain = "This means your answer was correct and you recieved full marks.";
  }
  append_str += '<p> For F1 Primer, you put down "' + all_answers[7] + '" which gave you the mark ' + MARF1primers_display + '.</p>'
  append_str += MARF1primers_explain;
  append_str += "<br>";

  append_str += "<br>";
  append_str += "<p> <b> R1 Primer: </b> </p>";
  var MARR1primers_display = 0;
  var r1Options = "";
  for (i = 0; i < possible_R1_primers.length; i++) {
    r1Options += possible_F1_primers[i];
    if (i = (possible_R1_primers.length - 1)) {
      r1Options += ".";
    }
    else {
      r1Options += ", ";
    }
  };
  var MARR1primers_explain = "Your R1 primer sequence was incorrectly matched to one of the following sequences generated based on your gRNA seqeuence inputted: " + r1Options;
  if (MARR1primers == true) {
    MARR1primers_display = 2;
    MARR1primers_explain = "This means your answer was correct and you recieved full marks.";
  }
  append_str += '<p> For R1 Primer, you put down "' + all_answers[8] + '" which gave you the mark ' + MARR1primers_display + '.</p>'
  append_str += MARR1primers_explain;
  append_str += "<br>";

  append_str += "<br>";
  append_str += '<p> <button type="button" class="btn btn-primary" onclick="redirectCRISPR(); loadJSON_Files();"> Back to Assignments </button> </p>';

  $("#mainContainer").append(append_str);
}

var completed_assignments = [];
/**
* Account management functions. This function depends on login.js, without that, this will not run!
*/
function openAccountManagement() {
  $("#accountManagementBody").empty();
  var append_str = "<p>Hello " + student_reg_information[0]["student_list"][studentParseNum]["name"].split(' ')[0] + "!</p>";

  // Assignments
  if (student_reg_information[0]["student_list"][studentParseNum]["assignment-HBB-Marks"] != null) {
    completed_assignments.push("HBB");
  }
  if (student_reg_information[0]["student_list"][studentParseNum]["assignment-CCR5-Marks"] != null) {
    completed_assignments.push("CCR5");
  }
  if (student_reg_information[0]["student_list"][studentParseNum]["assignment-ANKK1-Marks"] != null) {
    completed_assignments.push("ANKK1");
  }
  if (student_reg_information[0]["student_list"][studentParseNum]["assignment-APOE-Marks"] != null) {
    completed_assignments.push("APOE");
  }
  if (completed_assignments.length != 0) {
    append_str += "<p>You have completed the following assignments: <p> <ul>";
    for (i=0; i < completed_assignments.length; i++) {
      append_str += "<li>" + completed_assignments[i] + "</li>";
    }
    append_str += "</ul>";
  }
  else if (completed_assignments.length == 0) {
    append_str += "<p>You have not yet completed any assignments. </p>"
  }

  // Obtain student marks
  if (student_reg_information[0]["student_list"][studentParseNum]["type"] == "admin" || student_reg_information[0]["student_list"][studentParseNum]["type"] == "TA") {
    var encodedURI = encodeURIComponent(JSON.stringify(student_reg_information[0]["student_list"]));
    append_str += "<p> Oh wait! Hello " + student_reg_information[0]["student_list"][studentParseNum]["type"] + "! Would you like to download student marks? </p>";
    obtainedMarks = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(student_reg_information[0]["student_list"]));
    append_str += "<a id='hidddenDownloadClick' href='data:text/json;charset=utf-8," + encodedURI + "' download='HMB311_studentMarks_SciGrade.json' hidden> Hidden click </a>"
    append_str += '<p> <button type="button" class="btn btn-primary" onclick="document.getElementById(\'hidddenDownloadClick\').click();"> Download JSON </button> </p>';
    append_str += "<br>"
  }

  // Admin access to add new users
  if (student_reg_information[0]["student_list"][studentParseNum]["type"] == "admin") {
    append_str += "<br> <p> <b> ADMIN POWER! </b> <p>";
    append_str += "<p> If you would like to add new users (students, TAs or admins), please fill in the form below: </p>";
    // Form opening
    append_str += "<form>";

    // User number
    append_str += '<div class="form-group">';
    append_str += '<label for="InputStudentNumber">User number</label>';
    append_str += '<input class="form-control" id="StudentNumber" placeholder="1234567890" maxlength="10">';
    append_str += '</div>';

    // User name
    append_str += '<div class="form-group">';
    append_str += '<label for="InputStudentName">User name</label>';
    append_str += '<input class="form-control" id="StudentName" placeholder="First Last">';
    append_str += '</div>';

    // User umail
    append_str += '<div class="form-group">';
    append_str += '<label for="InputStudentUmail">User umail</label>';
    append_str += '<input type="email" class="form-control" id="StudentUmail" placeholder="first.last@mail.utoronto.ca">';
    append_str += '</div>';

    // User verification ID
    append_str += '<div class="form-group">';
    append_str += '<label for="InputStudentName">User verification ID</label>';
    append_str += '<input class="form-control" id="StudentVerifyID" placeholder="wordWord####">';
    append_str += '<small id="studentEmailHelp" class="form-text text-muted">Please use the following format: word, Word, number (3-5 digits)</small>';
    append_str += '</div>';

    // User type
    append_str += '<div class="form-group">';
    append_str += '<label for="InputStudentType">User type:</label>';
    append_str += '<select class="form-control" id="StudentType"><option>Student</option><option>TA</option><option>admin</option></select>';
    append_str += '</div>';

    // Submit button
    append_str += "<br>";
    append_str += '<p> <button type="button" class="btn btn-primary" onclick="addUserToServer(document.getElementById(\'StudentNumber\').value, document.getElementById(\'StudentName\').value, document.getElementById(\'StudentUmail\').value, document.getElementById(\'StudentVerifyID\').value, document.getElementById(\'StudentType\').value);"> Send to Server </button>';
    append_str += "<br>";

    // Form closing
    append_str += "</form>";
  }

  $("#accountManagementBody").append(append_str);
}

function addUserToServer(number, name, umail, verify, type) {
  var addNum = student_reg_information[0]["student_list"].length;
  var studentNumber = "student_list." + addNum + "." + "student_number";
  var studentName = "student_list." + addNum + "." + "name";
  var studentUmail = "student_list." + addNum + "." + "umail";
  var studentVerify = "student_list." + addNum + "." + "verifyID";
  var studentType = "student_list." + addNum + "." + "type";
  var studentGmail = "student_list." + addNum + "." + "gmail";
  client.login().then(() =>
    db.collection("Student_Information").updateOne({version: "0.3"}, { $set: {[studentNumber]: number, [studentName]: name, [studentUmail]: umail, [studentVerify]: verify, [studentType]: type, [studentGmail]: "unregistered"}}, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
    db.close();
  }));
  $("#adminSendButton").click();
  document.getElementById("StudentNumber").value = "";
  document.getElementById("StudentName").value = "";
  document.getElementById("StudentUmail").value = "";
  document.getElementById("StudentVerifyID").value = "";
}

/**
* Remove completed assignments from the assignment selection option
*/
function removeCompletedAssignments() {
  completed_assignments = [];
  if (completed_assignments.length > 0) {
    for (i = 0; i < completed_assignments.length; i++) {
      $("#" + completed_assignments[i]).remove();
    }
  }
}

var all_answers = [];
var all_outputs = [];
var all_marks = [];
var studentanswers = "student_list." + studentParseNum + "."+ loadedMoad + "-" + current_gene + "-Answers";
var studentoutputs = "student_list." + studentParseNum + "."+ loadedMoad + "-" + current_gene + "-Outputs";
var studentmarks = "student_list." + studentParseNum + "."+ loadedMoad + "-" + current_gene + "-Marks";
function submitAnswers() {
  checkAnswers();
  markAnswers();
  studentanswers = "student_list." + studentParseNum + "."+ loadedMoad + "-" + current_gene + "-Answers";
  studentoutputs = "student_list." + studentParseNum + "."+ loadedMoad + "-" + current_gene + "-Outputs";
  studentmarks = "student_list." + studentParseNum + "."+ loadedMoad + "-" + current_gene + "-Marks";
  all_answers.push(document.getElementById("sequence_input").value, document.getElementById("pam_input").value, document.getElementById("position_input").value, document.getElementById("strand_input").value, document.getElementById("ontarget_input").value, document.getElementById("targetregion_input").value, document.getElementById("offtarget_input").value, document.getElementById("f1_input").value, document.getElementById("r1_input").value);
  all_outputs.push(MARstrand, MARgRNAseq, MARgRNAseq_degree, MARCutPos, MARPAMseq, MAROnTarget, MAROnTarget_aboveOpt, MAROnTarget_above40, MAROnTarget_degree, MAROffTarget, MAROffTarget_degree, MAROffTarget_aboveOpt, MAROffTarget_above35, MAROffTarget_onlyOption, MARF1primers, MARR1primers);
  all_marks.push(studentMark, studentMarkPercentage);
  client.login().then(() =>
    db.collection("Student_Information").updateOne({version: "0.3"}, { $set: {[studentanswers]: all_answers, [studentoutputs]: all_outputs, [studentmarks]: all_marks}}, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
    db.close();
  }));
  $("#feedbackButton").click();
}
