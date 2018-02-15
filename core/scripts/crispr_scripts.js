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
    db.collection('Benchling_gRNA_Outputs').find({version: "0.1"}).limit(100).execute()
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
    append_str += '<button type="button" class="btn btn-success" style="margin:1%;">Save</button>';
    append_str += '<button type="button" class="btn btn-primary" style="margin:1%;">Submit</button>';

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
var MARF1primers = false;
var MARR1primers = false;

var possible_comparable_answers = [];
var possible_outputs = [];
var correctNucleotideIncluded = false;
var true_counts = 0; // This exists for the instance that there is more than one match for inputedSeq
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
  else if (possible_comparable_answers.length == 0) {
    // Under this circumstance, you are assuming that their information is correct:
    var originalSeq = gene_backgroundInfo[0]["gene_list"][current_gene]["Sequence"];
    var reverseSeq = createComplementarySeq(gene_backgroundInfo[0]["gene_list"][current_gene]["Sequence"]);
    if (originalSeq.indexOf(inputedSeq) != -1 || reverseSeq.indexOf(inputedSeq) != -1) {
      // TODO: Count this as wrong?
    }
  }
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
    document.getElementById("targetregion_input").value.replace(/./g,'')
    var Range_upper = document.getElementById("targetregion_input").value.split("-")[1];
    var Range_lower = document.getElementById("targetregion_input").value.split("-")[0];
    // Check if gRNA sequence is in against listed
    for (i=0; i<benchling_grna_ouputs[0]["gene_list"][current_gene].length; i++) {
      if (benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Position"] >= Range_lower && benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Position"] <= Range_upper) {
        if (benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Efficiency Score"] != null || benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Efficiency Score"] != undefined) {
          ontarget_geneParse.push(benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Efficiency Score"])
        };
      }
    }
    // Check for last-resort regions:
    var rangeStarter_upper = parseInt(document.getElementById("position_input").value.replace(/./g,'')) + 35;
    var rangeStarter_lower = parseInt(document.getElementById("position_input").value.replace(/./g,'')) - 35;
    // Check if gRNA sequence is in against listed
    ontarget_lastResort = [];
    for (i=0; i<benchling_grna_ouputs[0]["gene_list"][current_gene].length; i++) {
      if (benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Position"] >= rangeStarter_upper && benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Position"] <= rangeStarter_lower) {
        if (benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Efficiency Score"] != null || benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Efficiency Score"] != undefined) {
          ontarget_lastResort.push(benchling_grna_ouputs[0]["gene_list"][current_gene][i]["Efficiency Score"])
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
function checkOffTarget(score) {
  // Create on-target variables
  var OffTargetValue_down = Math.floor(score);
  var OffTargetValue_up = Math.ceil(score);
  var InputOffTargetValue = parseInt(document.getElementById("offtarget_input").value);
  // See if on-target value matches input value
  if (correctNucleotideIncluded == true && MARgRNAseq == true) {
    if (InputOffTargetValue >= OffTargetValue_down && InputOffTargetValue <= OffTargetValue_up) {
      MAROffTarget = true;
      true_counts++;
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

var all_answers = [];
var all_marks = [];
var studentanswers = "student_list." + studentParseNum + "."+ selection_inMode + "-" + current_gene + "-Answers";
var studentmarks = "student_list." + studentParseNum + "."+ selection_inMode + "-" + current_gene + "-Marks";
function submitAnswers() {
  checkAnswers();
  all_answers.push(document.getElementById("sequence_input").value, document.getElementById("pam_input").value, document.getElementById("position_input").value, document.getElementById("strand_input").value, document.getElementById("ontarget_input").value, document.getElementById("targetregion_input").value, document.getElementById("offtarget_input").value, document.getElementById("f1_input").value, document.getElementById("r1_input").value);
  all_marks.push(MARstrand, MARgRNAseq, MARgRNAseq_degree, MARCutPos, MARPAMseq, MAROnTarget, MAROnTarget_aboveOpt, MAROnTarget_above40, MAROnTarget_degree, MAROffTarget, MARF1primers, MARR1primers);
  client.login().then(() =>
    db.collection("Student_Information").updateOne({version: "0.3"}, { $set: {[studentanswers]: all_answers, [studentmarks]: all_marks}}, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
    db.close();
  }));
}
