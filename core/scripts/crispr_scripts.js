//================================= SciGrade ==================================
//
// Purpose: General script for SciGrade
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
    var useList = removeCompletedAssignments();
    for (i = 0; i < useList.length; i++) {
      if (i == 0) {
        append_str = '<option value="' + useList[i] + '" id="' + useList[i] + '" tag="assignment">' + useList[i] + '</option>\n';
      }
      else {
        append_str += '<option value="' + useList[i] + '" id="' + useList[i] + '" tag="assignment">' + useList[i] + '</option>\n';
      }
    }
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

var list_of_practice = ["eBFP"];
var list_of_assignments = ["CCR5"];
/**
 * Fill in and create a list of genes based on what is available in on the MongoDB server 
 */
function fillGeneList() {
  list_of_practice = [];
  list_of_assignments = [];
  if (gene_backgroundInfo != null || gene_backgroundInfo != "" || gene_backgroundInfo != undefined || Object.keys(gene_backgroundInfo[0]["gene_list"]) != undefined) {
    var list_of_genes = Object.keys(gene_backgroundInfo[0]["gene_list"]);
    for (i = 0; i < list_of_genes.length; i++) {
      if (gene_backgroundInfo[0]["gene_list"][list_of_genes[i]]["base_type"] == "practice") {
        list_of_practice.push(list_of_genes[i]);
      }
      else if (gene_backgroundInfo[0]["gene_list"][list_of_genes[i]]["base_type"] == "assignment") {
        list_of_assignments.push(list_of_genes[i]);
      }
    }
  }
}

var loadedMoad = "practice";
/**
 * Dynamically creates the work page for SciGrade
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

//Global marking variables:
var MARgRNAseq = false;
var MARgRNAseq_degree = 0; // 0 wrong, 1 correct, 2 partial of <20bp, 3 technically correct of <30bp
var MARPAMseq = false;
var MARCutPos = false;
var MARstrand = false;
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
/**
 * Checks the answer in the submission form and determines if they are correct or not
 */
function checkAnswers() {
  var correctNucleotide = gene_backgroundInfo[0]["gene_list"][current_gene]["Sequence"].charAt(gene_backgroundInfo[0]["gene_list"][current_gene]["Target position"]);
  var correctNucleotidePosition = gene_backgroundInfo[0]["gene_list"][current_gene]["Target position"] - 1;

  // Check gRNA Sequence:
  var inputedSeq = document.getElementById("sequence_input").value.trim();
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
          if ((temp_answer["PAM"] != null || temp_answer["PAM"] != undefined) && temp_answer["PAM"] == document.getElementById("pam_input").value.trim()) {
            MARPAMseq = true;
            true_counts++;
          }
          else if (temp_answer["PAM"] == null || temp_answer["PAM"] == undefined) {
            alert("Error code cA311-317: retrieving server information on 'PAM' answers occured. Please contact admin or TA!");
            console.log("Error code cA311-317: retrieving server information on 'PAM' answers occured. Please contact admin or TA!");
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
          checkF1Primers(document.getElementById("sequence_input").value.trim());

          // Check if the F1 primer matches the answer's input
          checkR1Primers(document.getElementById("sequence_input").value.trim());
        }
      }
    }
  }
  checkAnswers_executed = true;
}

var offtarget_List = [];
var offtarget_dict = {};
var offtarget_dictParse = [];
var offtarget_Use = [];
/**
 * Checks the off-target score if it is correct
 * @param {int} score - The specificity score from possible_comparable_answers
 * @return {bool} - Returns true if MAROffTarget is correct
 */
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
    var optimalValue = Min_optiomal;
    var studentClass = student_reg_information[0]["student_list"][studentParseNum]["studentClass"];
    // Change optimal range based on custom input
    if (student_reg_information[0]["classMarkingMod"][studentClass][0] == "Optimal") {
      if (Min_optiomal > 80 || Min_optiomal < 35) {
        optimalValue = 80;
      }
    }
    else {
      optimalValue = student_reg_information[0]["classMarkingMod"][studentClass][0];
    }
    // Determine if off-target is optimal or not
    if (InputOffTargetValue >= optimalValue) {
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

var possible_F1_primers = [];
/**
 * Checks if the F1 primer is correct or not
 * @param {String} seq - The gRNA sequence
 * @return {bool} - Returns true if MARF1primers is correct
 */
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
  if (possible_F1_primers.includes(document.getElementById("f1_input").value.trim())) {
    MARF1primers = true;
  }
}

var possible_R1_primers = [];
var complementary_nt_dict = {"A":"T", "T":"A", "C":"G", "G":"C"};
/**
 * Checks if the R1 primer is correct or not
 * @param {String} seq - The gRNA sequence
 * @return {bool} - Returns true if MARR1primers is correct
 */
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
  if (possible_R1_primers.includes(document.getElementById("r1_input").value.trim())) {
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
    studentMarkPercentage = ((studentMark/10) * 100).toFixed(2)
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
  append_str += "<p> <b> Off-Target Score: </b> </p>";
  var MAROffTarget_degree_display = 0;
  var MAROffTarget_degree_explain = "Your off-target score was wrong. Either it was not above/within the optimal range (or above 35) or the last-resort option.";
  if (MAROffTarget == true) {
    if (MAROffTarget_degree == 1) {
      MAROffTarget_degree_display = 2;
      MAROffTarget_degree_explain = "This means your answer was correct while above/within the optimal and you recieved full marks.";
    }
    else if (MAROffTarget_degree == 2) {
      MAROffTarget_degree_display = 1;
      MAROffTarget_degree_explain = "This means your answer was technically correct as its on-target value was above 35.";
    }
    else if (MAROffTarget_degree == 3) {
      MAROffTarget_degree_display = 0.5;
      MAROffTarget_degree_explain = "This means your answer was partially correct as it was found to be your only option is soley based on the target region range you selected.";
    }
  }
  append_str += '<p> For Off-Target Score, you put down "' + all_answers[4] + '" which gave you the mark ' + MAROffTarget_degree_display + '.</p>'
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
  append_str += '<p> For F1 Primer, you put down "' + all_answers[5] + '" which gave you the mark ' + MARF1primers_display + '.</p>'
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
  append_str += '<p> For R1 Primer, you put down "' + all_answers[6] + '" which gave you the mark ' + MARR1primers_display + '.</p>'
  append_str += MARR1primers_explain;
  append_str += "<br>";

  append_str += "<br>";
  append_str += '<p> <button type="button" class="btn btn-primary" onclick="redirectCRISPR(); loadJSON_Files();"> Back to Assignments </button> </p>';

  $("#mainContainer").append(append_str);
}

/**
 * Determine whether an input form will be displayed or not
 * @param {String} docCheck The DOM being checked against 
 * @param {String} checkFor The value of the DOM being used to check for
 * @param {String} docDisplay The DOM what will toggle hidden visibility for
 */
function showNewInput(docCheck, checkFor, docDisplay) {
  if (document.getElementById(String(docCheck)).value == String(checkFor)) {
    document.getElementById(String(docDisplay)).removeAttribute("hidden");
  }
  else {
    document.getElementById(String(docDisplay)).setAttribute("hidden", true);    
  }
}

var completed_assignments = [];
/**
 * Generates a list of completed_assignments
 */
function generateCompletedAssignmentList() {
  completed_assignments = []
  loadJSON_Files();
  // Assignments
  if (student_reg_information[0]["student_list"][studentParseNum]["assignment-HBB-Marks"] != null) {
    if (!completed_assignments.includes("HBB")) {
      completed_assignments.push("HBB");
    }    
  }
  if (student_reg_information[0]["student_list"][studentParseNum]["assignment-CCR5-Marks"] != null) {
    if (!completed_assignments.includes("CCR5")) {
      completed_assignments.push("CCR5");
    } 
  }
  if (student_reg_information[0]["student_list"][studentParseNum]["assignment-ANKK1-Marks"] != null) {
    if (!completed_assignments.includes("ANKK1")) {
      completed_assignments.push("ANKK1");
    } 
  }
  if (student_reg_information[0]["student_list"][studentParseNum]["assignment-APOE-Marks"] != null) {
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
  var append_str = "<div id='accordion'><p>Hello " + student_reg_information[0]["student_list"][studentParseNum]["name"].split(' ')[0] + "!</p>";
  $("#accountManagementBody").append(append_str);
  
  // Create assignments card
  append_str = "<div class='card about'>";
  append_str += "<div class='card-header' id='assignmentCard'>";
  append_str += "<h5 class='mb-0'>";
  append_str += "<button class='btn btn-link' data-toggle='collapse' data-target='#completedAssignments' aria-expanded='true' aria-controls='completedAssignments'>";
  append_str += "Completed assignments: ";
  append_str += "</button>";
  append_str += "</h5>"
  append_str += "</div>";
  append_str += "<div id='completedAssignments' class='collapse show' aria-labelledby='headingOne' data-parent='#accordion'>";
  append_str += "<div class='card-body'>";

  // Card content
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

  // Close card
  append_str += "</div>";
  append_str += "</div>";
  append_str += "</div>";
  $("#accountManagementBody").append(append_str);

  var classList = student_reg_information[0]["class_list"];
  // Obtain student marks
  if (student_reg_information[0]["student_list"][studentParseNum]["type"] == "admin" || student_reg_information[0]["student_list"][studentParseNum]["type"] == "TA") {
    var encodedURI = encodeURIComponent(JSON.stringify(student_reg_information[0]["student_list"]));
    append_str = "<br> <p> <b> Oh wait! </b> Hello " + student_reg_information[0]["student_list"][studentParseNum]["type"] + "! Would you like to download student marks? </p>";
    append_str += '<label for="DownloadClass">Choose class: </label>';
    append_str += '<select id="DownloadClass" class="form-control" style="margin-bottom: 1%">';
    for (key in classList) {
      append_str += '<option value="' + key + '" id="' + key + '" tag="assignment">' + key + '</option>\n';
    }
    append_str += '</select>';
    append_str += '<p style="text-align: center;"> <button type="button" class="btn btn-primary" onclick="generateHiddenStudentDownload(document.getElementById(\'DownloadClass\').value, true);"> Download Marks </button>';
    append_str += '<button type="button" class="btn btn-primary" onclick="generateHiddenStudentDownload(document.getElementById(\'DownloadClass\').value, false);" style="margin-left: 2%;"> Download Raw Marks </button> </p>';
    $("#accountManagementBody").append(append_str);
  }

  // TA access to add new students:
  if (student_reg_information[0]["student_list"][studentParseNum]["type"] == "TA" || student_reg_information[0]["student_list"][studentParseNum]["type"] == "admin") {
    append_str = "<p> <b> ADMIN POWER! </b> <p>";
    
    // Create student card
    append_str += "<div class='card about'>";
    append_str += "<div class='card-header' id='studentCard'>";
    append_str += "<h5 class='mb-0'>";
    append_str += "<button class='btn btn-link' data-toggle='collapse' data-target='#addStudents' aria-expanded='false' aria-controls='addStudents'>";
    append_str += "Add students: ";
    append_str += "</button>";
    append_str += "</h5>"
    append_str += "</div>";
    append_str += "<div id='addStudents' class='collapse' aria-labelledby='headingOne' data-parent='#accordion'>";
    append_str += "<div class='card-body'>";

    // Append all students at once:
    append_str += "<p style='font-weight: bold;'> If you would to add new students to the class, just fill the form below: "
    // Form opening
    append_str += "<form>"

    // Class choice:
    append_str += '<div class="form-group">';
    append_str += '<label for="InputClassMultiple" style="font-weight: bold;">Choose class: </label>';
    append_str += '<select id="InputClassMultiple" class="form-control" onchange="showNewInput(\'InputClassMultiple\', \'newClass\', \'InputNewClassMultiple\')" style="margin-bottom: 1%">';
    for (key in classList) {
      append_str += '<option value="' + key + '" id="' + key + '" tag="assignment">' + key + '</option>\n';
    }
    append_str += '<option value="newClass" id="newClassMultiple" tag="assignment" >New Class</option>\n';
    append_str += '</select>';
    append_str += '<input class="form-control" id="InputNewClassMultiple" placeholder="HMB396 - Winter (NOTE: Spaces will be deleted once you submit so use capital letters to seperate words)" hidden>';
    append_str += '<small id="InputClassHelp" class="form-text text-muted">Choose class students will be added to or create a new class. Example of new class: HMB396 - Winter - 2019 (NOTE: Spaces will be deleted once you submit so use capital letters to seperate words)</small>'
    append_str += '</div>';

    // User number
    append_str += '<div class="form-group">';
    append_str += '<label for="InputStudentNumber" style="font-weight: bold;">Input student numbers: </label>';
    append_str += '<textarea class="form-control" id="StudentNumbers" rows="4" placeholder="1234567890, 1003817535, 1113315545"></textarea>';
    append_str += '<small id="InputStudentNumberHelp" class="form-text text-muted">Input student numbers, seperated by commas, new lines and/or tab indentation (BEWARE OF TYPOS!)</small>'
    append_str += '</div>';

    // User uMail
    append_str += '<div class="form-group">';
    append_str += '<label for="InputStudentUmail" style="font-weight: bold;">Input student University email: </label>';
    append_str += '<textarea class="form-control" id="StudentUmails" rows="4" placeholder="john.doe@mail.utoronto.ca, sarah.cat@.mail.utoronto.ca, alexander.macadonia@utoronto.ca"></textarea>';
    append_str += '<small id="InputStudentUmailUmail" class="form-text text-muted">Input student University associated email in the same order of the student numbers, seperated by commas, new lines and/or tab indentation (BEWARE OF TYPOS!)</small>'
    append_str += '</div>';

    // Submit button
    append_str += '<p> <button type="button" class="btn btn-primary" onclick="changeInputClass(\'InputClassMultiple\', \'newClass\', \'newClassMultiple\', document.getElementById(\'InputNewClassMultiple\').value), addMultipleUsersToServer(document.getElementById(\'InputClassMultiple\').value, document.getElementById(\'StudentNumbers\'), document.getElementById(\'StudentUmails\'));"> Send multiple students to Server </button>';
    append_str += "<br>";

    // Close form
    append_str += "</form>";

    // Close card
    append_str += "</div>";
    append_str += "</div>";
    append_str += "</div>";
    $("#accountManagementBody").append(append_str);
  }

  // Admin controls:
  if (student_reg_information[0]["student_list"][studentParseNum]["type"] == "admin") {
    // Create single card
    append_str = "<div class='card about'>";
    append_str += "<div class='card-header' id='addTACard'>";
    append_str += "<h5 class='mb-0'>";
    append_str += "<button class='btn btn-link' data-toggle='collapse' data-target='#addTA' aria-expanded='true' aria-controls='addTA'>";
    append_str += "Add TA's: ";
    append_str += "</button>";
    append_str += "</h5>"
    append_str += "</div>";
    append_str += "<div id='addTA' class='collapse' aria-labelledby='headingOne' data-parent='#accordion'>";
    append_str += "<div class='card-body'>";

    //Append TAs or Admins:
    append_str += "<p style='font-weight: bold;'> If you would like to add a single user (students, TAs or admins), please fill in the form below: </p>";
    // Form opening
    append_str += "<form>";

    // Class choice:
    append_str += '<div class="form-group">';
    append_str += '<label for="InputClassSingle" style="font-weight: bold;">Choose class: </label>';
    append_str += '<select id="InputClassSingle" class="form-control" style="margin-bottom: 1%;">';
    for (key in classList) {
      append_str += '<option value="' + key + '" id="' + key + '" tag="assignment">' + key + '</option>\n';
    }
    append_str += '</select>';
    append_str += '<small id="InputClassSingleHelp" class="form-text text-muted">Choose class TA will be added.</small>'
    append_str += '</div>';

    // User number
    append_str += '<div class="form-group">';
    append_str += '<label for="InputStudentNumber" style="font-weight: bold;">User number</label>';
    append_str += '<input class="form-control" id="StudentNumber" placeholder="1234567890" maxlength="10">';
    append_str += '<small id="InputStudentNumberHelp" class="form-text text-muted">The user\'s access number (like a student or employee number)</small>'
    append_str += '</div>';

    // User name
    append_str += '<div class="form-group">';
    append_str += '<label for="InputStudentName" style="font-weight: bold;">User name</label>';
    append_str += '<input class="form-control" id="StudentName" placeholder="First Last">';
    append_str += '<small id="InputStudentNumberHelp" class="form-text text-muted">The user\'s full name</small>'
    append_str += '</div>';

    // User umail
    append_str += '<div class="form-group">';
    append_str += '<label for="InputStudentUmail" style="font-weight: bold;">User umail</label>';
    append_str += '<input type="email" class="form-control" id="StudentUmail" placeholder="first.last@mail.utoronto.ca">';
    append_str += '<small id="InputStudentNumberHelp" class="form-text text-muted">The user\'s University associated email</small>'
    append_str += '</div>';

    // User type
    append_str += '<div class="form-group">';
    append_str += '<label for="InputStudentType" style="font-weight: bold;">User type:</label>';
    append_str += '<select class="form-control" id="StudentType"><option>Student</option><option>TA</option><option>admin</option></select>';
    append_str += '<small id="InputStudentNumberHelp" class="form-text text-muted">The user\'s account type. Student = access to practice and assignments, TA = same as previous plus download student marks and add new students, admin = same as previous plus adding more TA\'s and changing marking scheme for a class.</small>'
    append_str += '</div>';

    // Submit button
    append_str += '<p> <button type="button" class="btn btn-primary" onclick="changeInputClass(\'InputClassSingle\', \'newClass\', \'newClassSingle\', document.getElementById(\'InputNewClassSingle\').value), addUserToServer(document.getElementById(\'StudentNumber\').value, document.getElementById(\'StudentName\').value, document.getElementById(\'StudentUmail\').value, document.getElementById(\'StudentType\').value);"> Send single user to Server </button>';
    append_str += "<br>";

    // Form closing
    append_str += "</form>";

    // Close card
    append_str += "</div>";
    append_str += "</div>";
    append_str += "</div>";
    $("#accountManagementBody").append(append_str);

    // Create modifying controls card
    append_str = "<div class='card about'>";
    append_str += "<div class='card-header' id='modifyCard'>";
    append_str += "<h5 class='mb-0'>";
    append_str += "<button class='btn btn-link' data-toggle='collapse' data-target='#modifyControls' aria-expanded='true' aria-controls='modifyControls' onclick='ChangeDOMInnerhtml(\"CurrentOffTarget\", \"Current off-target marking is set to: \" + student_reg_information[0][\"classMarkingMod\"][document.getElementById(\"ClassModChange\").value][0])'>";
    append_str += "Modify marking controls: ";
    append_str += "</button>";
    append_str += "</h5>"
    append_str += "</div>";
    append_str += "<div id='modifyControls' class='collapse' aria-labelledby='headingOne' data-parent='#accordion'>";
    append_str += "<div class='card-body'>";

    // Choose class:
    append_str += '<div class="form-group">';
    append_str += '<label for="ClassModChange" style="font-weight: bold;">Choose class: </label>';
    append_str += '<select id="ClassModChange" class="form-control" style="margin-bottom: 1%;" onchange="ChangeDOMInnerhtml(\'CurrentOffTarget\', \'Current off-target marking is set to: \' + student_reg_information[0][\'classMarkingMod\'][document.getElementById(\'ClassModChange\').value][0])">';
    for (key in classList) {
      append_str += '<option value="' + key + '" id="' + key + '" tag="assignment">' + key + '</option>\n';
    }
    append_str += '</select>';
    append_str += '<small id="ClassModChangeHelp" class="form-text text-muted">Choose the class for which you are modifying marking scheme for.</small>'
    append_str += '</div>';

    // Modify controls:
    append_str += '<div class="form-group">';
    append_str += '<p style="font-weight: bold;">Modify controls for: </p>';
    append_str += '<label for="SelectModifyControls">Off-Target Marking: </label>';

    append_str += '<p id="CurrentOffTarget">Current off-target marking is set to: </p>';
    append_str += '<select id="SelectModifyControls" class="form-control" onchange="showNewInput(\'SelectModifyControls\', \'Custom\', \'InputModifyControls\')" style="margin-bottom: 1%">';
    append_str += '<option value="Optimal" id="Optimal" tag="assignment">Optimal</option>\n';
    append_str += '<option value="Custom" id="CustomOffTarget" tag="assignment">Custom</option>\n';
    append_str += '</select>';
    append_str += '<input class="form-control" id="InputModifyControls" type="number" step="0.01" min="0.01" max="100" placeholder="Insert number between 0.01 and 100" hidden>';
    append_str += '<small id="InputModifyControlsHelp" class="form-text text-muted">Choose how you want the off-target score to be marked. Optimal is Min_optiomal = Max_range - (Max_range * 0.2) if below 80 (if below, optimal = 80). Custom value can be any number between 0.01 and 100 which will be the new custom "optiomal" value for your class.</small>'
    append_str += '</div>';

    // Submit button
    append_str += '<p> <button type="button" class="btn btn-primary" onclick="changeInputClass(\'SelectModifyControls\', \'Custom\', \'CustomOffTarget\', document.getElementById(\'InputModifyControls\').value), UpdateMarkingControls(document.getElementById(\'ClassModChange\').value, document.getElementById(\'SelectModifyControls\').value)"> Update Marking Scheme </button>';
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
}

/**
 * Change values in the marking controls
 * @param {String} classToMod Class being modified
 * @param {String} offTargetChange The value of the modified control being changed to
 */
function UpdateMarkingControls(classToMod, offTargetChange) {
  var classChange = "classMarkingMod." + classToMod;
  var markingChangeList = [offTargetChange]
  client.login().then(() =>
    db.collection("Student_Information").updateOne({version: "0.3"}, { $set: {[classChange]: markingChangeList}}, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
    db.close();
  }));
  $("#adminSendButton").click();
  document.getElementById("InputModifyControls").value = "";
  document.getElementById("CustomOffTarget").value = "Custom";
}

/**
 * Change a DOM's innerHTML 
 * @param {String} domID DOM's ID that is being modified
 * @param {String} changeTo The content of the innerHTML
 */
function ChangeDOMInnerhtml(domID, changeTo) {
  document.getElementById(domID).innerHTML = changeTo;
}

var downloadIndexTable_start = "\t\t<tr>\n\t\t\t<th>Student Number</th>\n\t\t\t<th>Name</th>";
var downloadIndexTable_end = "\n\t\t</tr>\n";
var downloadIndexTable_fill = "";
/**
 * Generated the base IndexTable for downloading JSON as CSV
 * @param {String} whichIndexTable The string of which the index table start as, defaults as downloadIndexTable_start
 * @param {boolean} SimpleComplex True is simple, false is complex
 */
function generateRestOfIndexTable(whichIndexTable, SimpleComplex) {
  whichIndexTable = downloadIndexTable_start;
  for (i = 0; i < list_of_assignments.length; i++) {
    whichIndexTable += "\n\t\t\t<th>" + list_of_assignments[i] + "</th>";
    if (SimpleComplex == true) {
      whichIndexTable += "\n\t\t\t<th>Percent</th>";
      whichIndexTable += "\n\t\t\t<th>Raw</th>";
    }
    else if (SimpleComplex == false) {
      whichIndexTable += "\n\t\t\t<th>Percent</th>";
      whichIndexTable += "\n\t\t\t<th>Raw</th>";
      whichIndexTable += "\n\t\t\t<th>gRNA</th>";
      whichIndexTable += "\n\t\t\t<th>Mark</th>";
      whichIndexTable += "\n\t\t\t<th>PAM</th>";
      whichIndexTable += "\n\t\t\t<th>Mark</th>";
      whichIndexTable += "\n\t\t\t<th>Off-target score</th>";
      whichIndexTable += "\n\t\t\t<th>Mark</th>";
      whichIndexTable += "\n\t\t\t<th>F1 primers</th>";
      whichIndexTable += "\n\t\t\t<th>Mark</th>";
      whichIndexTable += "\n\t\t\t<th>R1 primers</th>";
      whichIndexTable += "\n\t\t\t<th>Mark</th>";
    }
  }  
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
  if (student_reg_information[0]["student_list"][studentParseNum]["type"] == "TA" || student_reg_information[0]["student_list"][studentParseNum]["type"] == "admin") {
    downloadIndexTable_fill = generateRestOfIndexTable(downloadIndexTable_fill, whichType);
    $("#hiddenDownloadModal_table").empty(); // reset
    var d = new Date();
    var downlodaIndexTable_str = "<table id='downloadIndexTable'>\n\t<tbody>\n";
    var captionTitleBegin = "SciGrade_studentMark_";
    if (whichType == false) {
      captionTitleBegin = "SciGrade_studentMarkRaw_";
    }
    downlodaIndexTable_str += "\t\t<caption>" + captionTitleBegin + student_reg_information[0]["student_list"][studentParseNum]["name"].replace(/\s/g, '') + "_" + d.getFullYear() + "-" + d.getMonth() + "_" + d.getDate() + "</caption>\n";
    downlodaIndexTable_str += downloadIndexTable_fill;
    // Looping through each row of the table
    var studentRegList = student_reg_information[0]["student_list"];
    for (i = 0; i < studentRegList.length; i++) {
      if (studentRegList[i]["type"] == "Student" && studentRegList[i]["studentClass"] == whichClass) {
        downlodaIndexTable_str += "\t\t<tr>\n";
        downlodaIndexTable_str += "\t\t\t<td>" + studentRegList[i]["student_number"] + "</td>\n";
        downlodaIndexTable_str += "\t\t\t<td>" + studentRegList[i]["name"] + "</td>\n";
        if (whichType == true) {
          for (x = 0; x < list_of_assignments.length; x++) {
            if (studentRegList[i]["assignment-" + list_of_assignments[x] + "-Marks"] != null) {
              downlodaIndexTable_str += "\t\t\t<td>" + (list_of_assignments[x]).toString() + "</td>\n";
              downlodaIndexTable_str += "\t\t\t<td>" + (studentRegList[i]["assignment-" + list_of_assignments[x] + "-Marks"][1]).toString() + "</td>\n";
              downlodaIndexTable_str += "\t\t\t<td>" + (studentRegList[i]["assignment-" + list_of_assignments[x] + "-Marks"][0]).toString() + "</td>\n";
            }
            else if (studentRegList[i]["assignment-" + list_of_assignments[x] + "-Marks"] == null) {
              downlodaIndexTable_str += "\t\t\t<td>" + (list_of_assignments[x]).toString() + "</td>\n";
              downlodaIndexTable_str += "\t\t\t<td> Incompleted </td>\n";
              downlodaIndexTable_str += "\t\t\t<td> 0.00 </td>\n";
            }
          }
        }
        if (whichType == false) {
          for (x = 0; x < list_of_assignments.length; x++) {
            if (studentRegList[i]["assignment-" + list_of_assignments[x] + "-Marks"] != null) {
              downlodaIndexTable_str += "\t\t\t<td>" + (list_of_assignments[x]).toString() + "</td>\n";
              var mark = 0;
              // Raw values
              downlodaIndexTable_str += "\t\t\t<td>" + (studentRegList[i]["assignment-" + list_of_assignments[x] + "-Marks"][1]).toString() + "</td>\n";
              downlodaIndexTable_str += "\t\t\t<td>" + (studentRegList[i]["assignment-" + list_of_assignments[x] + "-Marks"][0]).toString() + "</td>\n";
              // gRNA
              downlodaIndexTable_str += "\t\t\t<td>" + (studentRegList[i]["assignment-" + list_of_assignments[x] + "-Answers"][0]).toString() + "</td>\n";
              if (studentRegList[i]["assignment-" + list_of_assignments[x] + "-Outputs"][2] == 1) {
                mark = 2;
              }
              else if (studentRegList[i]["assignment-" + list_of_assignments[x] + "-Outputs"][2] == 2) {
                mark = 1;
              }
              else if (studentRegList[i]["assignment-" + list_of_assignments[x] + "-Outputs"][2] == 3) {
                mark = 0.5;
              }
              downlodaIndexTable_str += "\t\t\t<td>" + (mark).toString() + "</td>\n";
              // PAM
              downlodaIndexTable_str += "\t\t\t<td>" + (studentRegList[i]["assignment-" + list_of_assignments[x] + "-Answers"][1]).toString() + "</td>\n";
              if (studentRegList[i]["assignment-" + list_of_assignments[x] + "-Outputs"][4] == true) {
                mark = 2;
              } 
              else {
                mark = 0;
              }
              downlodaIndexTable_str += "\t\t\t<td>" + (mark).toString() + "</td>\n";
              // Off-target
              downlodaIndexTable_str += "\t\t\t<td>" + (studentRegList[i]["assignment-" + list_of_assignments[x] + "-Answers"][4]).toString() + "</td>\n";
              if (studentRegList[i]["assignment-" + list_of_assignments[x] + "-Outputs"][6] == 1) {
                mark = 2;
              }
              else if (studentRegList[i]["assignment-" + list_of_assignments[x] + "-Outputs"][6] == 2) {
                mark = 1;
              }
              else if (studentRegList[i]["assignment-" + list_of_assignments[x] + "-Outputs"][6] == 3) {
                mark = 0.5;
              }
              downlodaIndexTable_str += "\t\t\t<td>" + (mark).toString() + "</td>\n";
              // F1 Primers
              downlodaIndexTable_str += "\t\t\t<td>" + (studentRegList[i]["assignment-" + list_of_assignments[x] + "-Answers"][5]).toString() + "</td>\n";
              if (studentRegList[i]["assignment-" + list_of_assignments[x] + "-Outputs"][10] == true) {
                mark = 2;
              } 
              else {
                mark = 0;
              }
              downlodaIndexTable_str += "\t\t\t<td>" + (mark).toString() + "</td>\n";
              // R1 primers
              downlodaIndexTable_str += "\t\t\t<td>" + (studentRegList[i]["assignment-" + list_of_assignments[x] + "-Answers"][6]).toString() + "</td>\n";
              if (studentRegList[i]["assignment-" + list_of_assignments[x] + "-Outputs"][11] == true) {
                mark = 2;
              } 
              else {
                mark = 0;
              }
              downlodaIndexTable_str += "\t\t\t<td>" + (mark).toString() + "</td>\n";
            }
            else if (studentRegList[i]["assignment-" + list_of_assignments[x] + "-Marks"] == null) {
              downlodaIndexTable_str += "\t\t\t<td>" + (list_of_assignments[x]).toString() + "</td>\n";
              downlodaIndexTable_str += "\t\t\t<td> Incompleted </td>\n";
              downlodaIndexTable_str += "\t\t\t<td> 0.00 </td>\n";
              downlodaIndexTable_str += "\t\t\t<td> Incompleted </td>\n";
              downlodaIndexTable_str += "\t\t\t<td> 0.00 </td>\n";
              downlodaIndexTable_str += "\t\t\t<td> Incompleted </td>\n";
              downlodaIndexTable_str += "\t\t\t<td> 0.00 </td>\n";
              downlodaIndexTable_str += "\t\t\t<td> Incompleted </td>\n";
              downlodaIndexTable_str += "\t\t\t<td> 0.00 </td>\n";
              downlodaIndexTable_str += "\t\t\t<td> Incompleted </td>\n";
              downlodaIndexTable_str += "\t\t\t<td> 0.00 </td>\n";
              downlodaIndexTable_str += "\t\t\t<td> Incompleted </td>\n";
              downlodaIndexTable_str += "\t\t\t<td> 0.00 </td>\n";
            }
          }
        }
        downlodaIndexTable_str += "\t\t</tr>\n";
      }
    }
    downlodaIndexTable_str += "\t</tbody>\n</table>"; // Closing
    document.getElementById("hiddenDownloadModal_table").innerHTML += downlodaIndexTable_str;
    $("#hiddenDownloadModal_table").tableToCSV();
  }  
  else {
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
  if (trueChangeValueTo == "" || trueChangeValueTo == undefined) {
    trueChangeValueTo = "undefined Class";
  }
  trueChangeValueTo = trueChangeValueTo.replace(/\s/g, '');
  if (document.getElementById(docCheck).value == checkFor) {
    document.getElementById(docChange).value = trueChangeValueTo;
  }
}

/**
 * Adds the user to the MongoDB server
 * @param {String} number User number
 * @param {String} name User' name
 * @param {String} umail User's email
 * @param {String} classInput Class user belongs to
 * @param {String} type Is this user, TA or admin?
 */
function addUserToServer(number, name, umail, classInput, type) {
  var addNum = student_reg_information[0]["student_list"].length;
  var studentNumber = "student_list." + addNum + "." + "student_number";
  var studentName = "student_list." + addNum + "." + "name";
  var studentUmail = "student_list." + addNum + "." + "umail";
  var studentType = "student_list." + addNum + "." + "type";
  var studentGmail = "student_list." + addNum + "." + "gmail";
  var studentClass = "student_list." + addNum + "." + "studentClass";
  client.login().then(() =>
    db.collection("Student_Information").updateOne({version: "0.3"}, { $set: {[studentClass]: classInput, [studentNumber]: number, [studentName]: name, [studentUmail]: umail, [studentType]: type, [studentGmail]: "unregistered"}}, function(err, res) {
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
 * Adds multiple users to the MongoDB server
 * @param {String} inputClass The class the users are being added to
 * @param {String} number The list of student numbers
 * @param {String} umail The list of student uMails
 */
function addMultipleUsersToServer(inputClass, number, umail) {
  // Student information setup
  var studentNumberList = number.value.trim().split(/,|\n|\t/);
  if (studentNumberList[studentNumberList.length - 1].trim() == "") {
    studentNumberList.pop()
  }
  var studentUmailList = umail.value.trim().split(/,|\n|\t/);
  if (studentUmailList[studentUmailList.length - 1].trim() == "") {
    studentUmailList.pop()
  }
  if (studentNumberList.length == studentUmailList.length) {
    var setList = {};
    for (var i = 0; i < studentNumberList.length; i++) {
      var studentAdd = studentNumberList[i];
      var studentUmailAdd = studentUmailList[i];
      setList[studentAdd] = studentUmailAdd;
    }
    classList = "class_list." + inputClass;
    client.login().then(() =>
      db.collection("Student_Information").updateOne({version: "0.3"}, { $set: {[classList]: setList}}, function(err, res) {
      if (err) throw err;
      console.log("1 document updated");
      db.close();
      }));
    $("#adminSendButton").click();
    var classChange = "classMarkingMod." + inputClass;
    var markingChangeList = ["Optimal"]
    client.login().then(() =>
      db.collection("Student_Information").updateOne({version: "0.3"}, { $set: {[classChange]: markingChangeList}}, function(err, res) {
      if (err) throw err;
      console.log("1 document updated");
      db.close();
    }));
    document.getElementById("StudentNumbers").value = "";
    document.getElementById("StudentUmails").value = "";
  }
  else {
    showRegError(8);
  }
}

/**
 * Remove completed assignments from the assignment selection option
 * @returns returnAssignmentList - The list of non-completed assignments
 */
function removeCompletedAssignments() {
  generateCompletedAssignmentList();
  var returnAssignmentList = [];
  if (completed_assignments.length > 0) {
    for (i = 0; i < list_of_assignments.length; i++) {
      if (completed_assignments.includes(list_of_assignments[i]) == false) {
        returnAssignmentList.push(list_of_assignments[i]);
      }
    }
  }
  else if (completed_assignments.length == 0) {
    returnAssignmentList = list_of_assignments;
  }
  return returnAssignmentList;
}

var all_answers = [];
var all_outputs = [];
var all_marks = [];
var studentanswers = "student_list." + studentParseNum + "."+ loadedMoad + "-" + current_gene + "-Answers";
var studentoutputs = "student_list." + studentParseNum + "."+ loadedMoad + "-" + current_gene + "-Outputs";
var studentmarks = "student_list." + studentParseNum + "."+ loadedMoad + "-" + current_gene + "-Marks";
/**
 * Submit and sends the student's answers to the server
 */
function submitAnswers() {
  all_answers = [];
  all_outputs = [];
  all_marks = [];
  checkAnswers();
  markAnswers();
  studentanswers = "student_list." + studentParseNum + "."+ loadedMoad + "-" + current_gene + "-Answers";
  studentoutputs = "student_list." + studentParseNum + "."+ loadedMoad + "-" + current_gene + "-Outputs";
  studentmarks = "student_list." + studentParseNum + "."+ loadedMoad + "-" + current_gene + "-Marks";
  all_answers.push(document.getElementById("sequence_input").value.trim(), document.getElementById("pam_input").value.trim(), document.getElementById("position_input").value, document.getElementById("strand_input").value, document.getElementById("offtarget_input").value, document.getElementById("f1_input").value.trim(), document.getElementById("r1_input").value.trim());
  all_outputs.push(MARstrand, MARgRNAseq, MARgRNAseq_degree, MARCutPos, MARPAMseq, MAROffTarget, MAROffTarget_degree, MAROffTarget_aboveOpt, MAROffTarget_above35, MAROffTarget_onlyOption, MARF1primers, MARR1primers);
  all_marks.push(studentMark, studentMarkPercentage);
  client.login().then(() =>
    db.collection("Student_Information").updateOne({version: "0.3"}, { $set: {[studentanswers]: all_answers, [studentoutputs]: all_outputs, [studentmarks]: all_marks}}, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
    db.close();
  }));
  loadJSON_Files();
  if (loadedMoad == "assignment") {
    document.getElementById("options_label").innerHTML = "Would you like to start a new assignment?";
    document.getElementById("seeFeedback").setAttribute("hidden", true);
  }
  else if (loadedMoad == "practice") {
    document.getElementById("options_label").innerHTML = "Would you like to see feedback on your answers or start a new assignment?";
    document.getElementById("seeFeedback").removeAttribute("hidden");
  }
  $("#feedbackButton").click();
}
