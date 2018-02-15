/**
* Purpose: Login scripts for SciGrade
**/
var student_reg_information;
const client = new stitch.StitchClient('almark-wvohf');
const db = client.service('mongodb', 'mongodb-atlas').db('AlMark');
/**
* Load JSON files
*/
function loadJSON_Files() {
  // Student information
  client.login().then(() =>
    db.collection('Student_Information').find({version: "0.3"}).limit(100).execute()
  ).then(docs => {
    student_reg_information = docs;
  }).catch(err => {
    console.error(err)
  });
}

var checkstudentNum = false;
var studentNumber = 0;
var studentParseNum = 999999999;
var alreadyRegistered = false;
/**
* Check to determine if the student is within
* @param {Num} student_num - Student number
* @param {String} student_umail - Student's email/uMail
* @return {bool} checkstudentNum - Whether the student is a student in the system or not
*/
function checkStudentNumber(student_num, student_umail) {
  alreadyRegistered = false;
  var maxNum = 0;
  checkstudentNum = false;
  if (student_reg_information[0]["student_list"] != null && student_reg_information[0]["student_list"].length > 0) {
    for (i = 0; i < student_reg_information[0]["student_list"].length; i++) {
      if (student_reg_information[0]["student_list"][i]["student_number"] == student_num) {
        if (student_reg_information[0]["student_list"][i]["gmail"] != "unregistered") {
          alreadyRegistered = true;
        }
        if (student_reg_information[0]["student_list"][i]["umail"] == student_umail && alreadyRegistered == false) {
          checkstudentNum = true;
          studentNumber = student_num;
          studentParseNum = i;
        }
      }
      else {
        maxNum += 1;
      }
    }
  }
  if (checkstudentNum == true) {
    addSecondSection();
  }
  else if (alreadyRegistered == true) {
    showRegError(4);
  }
  else if (checkstudentNum == false && maxNum == student_reg_information[0]["student_list"].length) {
    showRegError(1);
  }
  else if (checkstudentNum == false) {
    showRegError(2);
  }
}

/**
* Which reg error shows
* @param {Num} whichOne - Number indicator for which error to show
*/
function showRegError(whichOne) {
  if (whichOne == 1) { // Not in our database
    document.getElementById("errorRegContent").innerHTML = "It appears that you are not a student in our database.\n Are you a UofT student? If so, contact our TA, Professor or Admin for further help.";
    $("#errorRegButton").click();
  }
  else if (whichOne == 2) { // Something went wrong with registeration
    document.getElementById("errorRegContent").innerHTML = "Something went wrong. Please refresh the page and try again. If this persist, please contact our TA, Professor or Admin with the following error code: lgn83-85";
    $("#errorRegButton").click();
  }
  else if (whichOne == 3) { // Verify ID was incorrect
    document.getElementById("errorRegContent").innerHTML = "It appears that your verification ID is incorrect. Please retype it and try again. If this persist, contact our TA, Professor or Admin for further help. NOTE: Only students of HMB311 can register for SciGrade.";
    $("#errorRegButton").click();
  }
  else if (whichOne == 4) { // Verify ID was incorrect
    document.getElementById("errorRegContent").innerHTML = "You are already registered for SciGrade, please navigate to the login tab instead of the register. If an issue arises, please contact our TA, Professor or Admin for further help.";
    $("#errorRegButton").click();
  }
}

/**
* Adds the verification student section to the login page
*/
function addSecondSection() {
  $("#pP1").empty();
  $("#registerP1").empty();
  document.getElementById("pP2").innerHTML = "Second, please verify that you are a student in our HMB311 class:";
  // Adding the second section here:
  var append_str;
  append_str = '<div class="form-group" id="studentVerify">\n';
  append_str += '<label for="VerifyStudent">Student Verification ID:</label>\n';
  append_str += '<input class="form-control" id="VerifyStudent" placeholder="wordWord000">\n';
  append_str += '<small id="studentNumberHelp" class="form-text text-muted">Insert the verification ID given to you by your TA/Professor that is used to verify that you are part of the HMB311 class. Typical format is word then Word then 3 digit number.</small>\n';
  append_str += '</div>\n';
  append_str += '<button type="button" id="secondSubmit" class="btn btn-primary" onclick="verifyStudent(document.getElementById(\'VerifyStudent\').value);">Verify</button>\n';
  $("#registerP2").append(append_str);
}

/**
* Adds the verification student section to the login page
*/
function addThirdSection() {
  $("#pP2").empty();
  $("#registerP2").empty();
  document.getElementById("pP3").innerHTML = "Finnally, you will login through Google to register for SciGrade. This way you will never need to remmeber a username or password. Please click the button below to complete your registration";
  document.getElementById("registerP3").style.display = "block";
}

var checkVerifyStudent = false;
/**
* Checks and verifies if the student is in the class or not
*/
function verifyStudent(VerifyIDHolder) {
  checkVerifyStudent = false;
  if (student_reg_information[0]["student_list"] != null && Object.keys(student_reg_information[0]["student_list"]).length > 0) {
    if (student_reg_information[0]["student_list"][studentParseNum] != null || student_reg_information[0]["student_list"][studentParseNum] != undefined) {
      if (student_reg_information[0]["student_list"][studentParseNum]["verifyID"] == VerifyIDHolder) {
        checkVerifyStudent = true;
      }
    }
  }
  if (checkVerifyStudent == true) {
    addThirdSection();
  }
  else if (checkVerifyStudent == false) {
    showRegError(3);
  }
  else {
    showRegError(2);
  }
}


/**
* Retrieves Google user information and stores it
*/
function sendLogReg() {
  var upper = "student_list." + studentParseNum + ".gmail";
  if (checkVerifyStudent == true && checkstudentNum == true && studentNumber != 0 && googleEmail != null) {
    client.login().then(() =>
      db.collection("Student_Information").updateOne({version: "0.3"}, { $set: {upper: googleEmail}}, function(err, res) {
      if (err) throw err;
      console.log("1 document updated");
      db.close();
    }));
    redirectCRISPR();
  }
}

/**
* Once users have registered OR logged in, the page dynamically generates the CRISPR assignment page
*/
function redirectCRISPR() {
  $("#mainContainer").empty();
  var append_str;
  append_str = "<div class='row'>\n";
  append_str += "<div class='col-sm-1'></div>\n";
  append_str += "<div class='col-sm-9' id='content_body'>\n";
  append_str += "<div id='selection_process'>\n";
  append_str += "<div id='mode_selection' style='margin-top: 2%;'>\n";
  append_str += "<p>Please select the dry lab mode you would like to use: </p>\n";
  append_str += "<div>\n";
  append_str += "Mode: <div class='btn-group' data-toggle='buttons'>\n";
  append_str += "<label class='btn btn-primary active' style='padding: .075rem .75rem;'' id='practice' onclick='selection_inMode = this.id; ModeSelectionAdd(this.id)'>\n";
  append_str += "<input type='radio' name='practice_mode' autocomplete='off'  checked> Practice\n";
  append_str += "</label>\n";
  append_str += "<label class='btn btn-primary' style='padding: .075rem .75rem;' id='assignment' onclick='selection_inMode = this.id; ModeSelectionAdd(this.id)'>\n";
  append_str += "<input type='radio' name='assignemnt_mode' autocomplete='off'> Assignment\n";
  append_str += "</label>\n";
  append_str += "</div>\n";
  append_str += "</div>\n";
  append_str += "</div>\n";
  append_str += "<div id='gene_selection'>\n";
  append_str += "Please select your gene:\n";
  append_str += "<div class='btn-group'>\n";
  append_str += "<select class='form-control' id='gene_dropdown_selection' onchange='possible_gene = document.getElementById('gene_dropdown_selection').value;'>\n";
  append_str += "</select>\n";
  append_str += "</div>\n";
  append_str += "</div>\n";
  append_str += "<div id='load_button'>\n";
  append_str += "<button type='button' class='btn btn-success' style='margin-top: 2%;'' onclick='select_Gene();''>Load Gene</button>\n";
  append_str += "</div>\n";
  append_str += "</div>\n";
  append_str += "<div id='work'>\n";
  append_str += "</div>\n";
  append_str += "</div>\n";
  append_str += "<div class='col-sm-1'></div>\n";
  append_str += "</div>\n";
  $("#mainContainer").append(append_str);
  ModeSelectionAdd(selection_inMode);
  loadCRISPRJSON_Files();
}

$(document).ready(function() {
  loadJSON_Files();
  signOut();
})
