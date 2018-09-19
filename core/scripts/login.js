//================================= SciGrade ==================================
//
// Purpose: Login and registeration for SciGrade
//
//=============================================================================

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
var studentUmail;
var alreadyRegistered = false;
var classRegister;
/**
 * Check to determine if the student is within
 * @param {Num} student_num Student number
 * @param {String} student_umail Student's email/uMail
 * @return {bool} checkstudentNum - Whether the student is a student in the system or not
 */
function checkStudentNumber(student_num, student_umail) {
  loadJSON_Files();
  var alreadyRegistered = false;
  checkstudentNum = false;
  var maxNum = 0;
  var classList = student_reg_information[0]["class_list"];
  for (key in classList) {
  if (student_reg_information[0]["student_list"] != null && student_reg_information[0]["student_list"].length > 0) {
    for (i = 0; i < student_reg_information[0]["student_list"].length; i++) {
        if (student_reg_information[0]["student_list"][i]["student_number"] == student_num && student_reg_information[0]["student_list"][i]["studentClass"] == key) {
          alreadyRegistered = true;
        }
      }
    }
  }
  if (alreadyRegistered == false) {
    for (key in classList) {    
      if (classList[key][student_num] == student_umail) {
          checkstudentNum = true;
          studentNumber = student_num;
          studentUmail = student_umail;
          studentParseNum = i;
          classRegister = key;
          break;
        }
      else {
        maxNum++; 
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
 * Check to determine if the student is registered in the system
 * @param {Num} student_num - Student number
 */
function loginVerify(student_NumVerify){
  alreadyRegistered = false;
  var maxNum = 0;
  checkstudentNum = false;
  if (student_reg_information[0]["student_list"] != null && student_reg_information[0]["student_list"].length > 0) {
    for (i = 0; i < student_reg_information[0]["student_list"].length; i++) {
      if (student_reg_information[0]["student_list"][i]["student_number"] == student_NumVerify) {
        if (student_reg_information[0]["student_list"][i]["gmail"] != "unregistered") {
          alreadyRegistered = true;
          checkstudentNum = true;
          studentNumber = student_NumVerify;
          studentParseNum = i;
        }
        else if (student_reg_information[0]["student_list"][i]["gmail"] == "unregistered") {
          alreadyRegistered = false;
        }
      }
      else {
        maxNum += 1;
      }
    }
  }
  if (alreadyRegistered == true && checkstudentNum == true) {
    $("#loginForm").empty();
    document.getElementById("loginP2").style.display = "block";
  }
  else if (alreadyRegistered == false) {
    showRegError(5);
  }
  else if (maxNum == student_reg_information[0]["student_list"].length) {
    showRegError(1);
  }
}

/**
 * Which reg error shows
 * @param {Num} whichOne - Number indicator for which error to show
 */
function showRegError(whichOne) {
  if (whichOne == 1) { // Not in our database
    document.getElementById("errorRegContent").innerHTML = "It appears that you are not a student in our database.\n Are you a UofT student? If so, contact your TA, Professor or Admin for further help.";
    $("#errorRegButton").click();
  }
  else if (whichOne == 2) { // Something went wrong with registration
    document.getElementById("errorRegContent").innerHTML = "Something went wrong. Please refresh the page and try again. If this persists, please contact your TA, Professor or Admin with the following error code: lgn83-85";
    $("#errorRegButton").click();
  }
  else if (whichOne == 3) { // Verify ID was incorrect
    document.getElementById("errorRegContent").innerHTML = "It appears that your verification ID is incorrect. Please retype it and try again. If this persists, contact your TA, Professor or Admin for further help. NOTE: Only students of HMB311 can register for SciGrade.";
    $("#errorRegButton").click();
  }
  else if (whichOne == 4) { // Verify ID was incorrect
    document.getElementById("errorRegContent").innerHTML = "You are already registered for SciGrade, please navigate to the login tab instead of the register. If an issue arises, please contact your TA, Professor or Admin for further help.";
    $("#errorRegButton").click();
  }
  else if (whichOne == 5) { // Not yet registered for SciGrade
    document.getElementById("errorRegContent").innerHTML = "It appears that you have not yet registered for SciGrade, please navigate to the register tab and register first. If an issue arises, please contact your TA, Professor or Admin for further help.";
    $("#errorRegButton").click();
  }
  else if (whichOne == 6) { // Not yet registered for SciGrade
    document.getElementById("errorRegContent").innerHTML = "This is not the Google account associated with this student number. If an issue arises, please contact your TA, Professor or Admin for further help.";
    $("#errorRegButton").click();
  }
  else if (whichOne == 7) { // Restricted access to only TA's and Admins'
    document.getElementById("errorRegContent").innerHTML = "This feature is restricted to only TA's and admins. You do not have access. Please contact a TA or admin for access.";
    $("#errorRegButton").click();
  }
  else if (whichOne == 8) { // Unequal amount of student numbers and student emails
    document.getElementById("errorRegContent").innerHTML = "There is an unequal amount of student numbers and student uMails, please correct this to proceed";
    $("#errorRegButton").click();
}
}

/**
 * Adds the verification student section to the login page
 */
function addSecondSection() {
  $("#pP1").empty();
  $("#registerP1").empty();
  document.getElementById("pP3").innerHTML = "Next, you will login through Google to register for SciGrade. This way you will never need to remember a username or password. Please click the button below to complete your registration.";
  document.getElementById("registerP3").style.display = "block";
}

var gupper;
/**
 * Retrieves Google user information and stores it
 */
function sendLogReg() {
  if (alreadyRegistered == false) {
    if (studentUmail) {
      var gupper = "student_list." + studentParseNum;
      // Create student name
      var splitName = studentUmail.split('@')[0].split('.');
      var name = "";
      for (var n = 0; n < splitName.length; n++) {
        var capName = splitName[n].charAt(0).toUpperCase() + splitName[n].substr(1);
        name += capName + " ";
      }
      name = name.trim();
      var manuallyAdded = false;
      var gupperType = "Student"
      for (i = 0; i < student_reg_information[0]["student_list"].length; i++) {
        if (student_reg_information[0]["student_list"][i].umail == studentUmail) {
          manuallyAdded = true;
          gupperType = student_reg_information[0]["student_list"][i].type;
        }
      }
      if (checkstudentNum == true && studentNumber != 0 && googleEmail != null) {
        client.login().then(() =>
          db.collection("Student_Information").updateOne({version: "0.3"}, { $set: {[gupper + ".studentClass"]: classRegister, [gupper + ".student_number"]: studentNumber, [gupper + ".name"]: name, [gupper + ".umail"]: studentUmail, [gupper + ".type"]: gupperType, [gupper + ".gmail"]: googleEmail, [manuallyAdded]: "true"}}, function(err, res) {
          if (err) throw err;
          console.log("1 document updated");
          db.close();
        }));
        redirectCRISPR();
      }
    }
  }
  if (alreadyRegistered == true) {
    if (googleEmail == student_reg_information[0]["student_list"][studentParseNum]["gmail"]) {
      redirectCRISPR();
    }
    else {
      showRegError(6);
    }
  }
}


/**
 * Signs the user out and returns screen back to login/register display
 */
function signOutDisplay() {
  signOut();
  document.getElementById("logIO").setAttribute("hidden", true);
  document.getElementById("accountIO").setAttribute("hidden", true);
  document.getElementById("logIO").innerHTML = changeLogin + " Login";
  document.getElementById("logIO").setAttribute("onclick");  
  $("#mainContainer").empty();  
  var append_str;
  append_str = "<div class='row'>\n";
  // Pre-all
  append_str += '<div class="col-sm-1"></div><div class="col-sm-10"><ul class="nav nav-tabs"  id="logTabs" role="tablist"><li class="nav-item"><a class="nav-link" id="login-tab" data-toggle="tab" href="#login" role="tab" aria-controls="login">Login</a></li><li class="nav-item"><a class="nav-link" id="register-tab" data-toggle="tab" href="#register" role="tab" aria-controls="register">Register</a></li></ul><div class="tab-content" id="logTabContent">\n';
  // Login
  append_str += '<!-- Login --><div role="tabpanel" class="tab-pane fade" id="login" aria-labelledby="login"><form id="loginForm"><div class="form-group"><label for="InputStudentNumberLogin">Student number</label><input class="form-control" id="StudentNumberLogin" placeholder="1234567890" maxlength="10" onkeypress="IfPressEnter(event, \'verifyLogin\')" type="text"><small id="studentNumberLoginHelp" class="form-text text-muted">We\'ll never share your student number with anyone else.</small></div><button id="verifyLogin" type="button" class="btn btn-primary" onclick="loginVerify(document.getElementById(' + "'StudentNumberLogin'" + ').value)">Verify</button></form><form id="loginP2" style="display:none; margin-top:2%;"><div class="g-signin2" data-onsuccess="onSignIn"></div></form></div>\n';
  // Registration
  append_str += '<!-- Registration --><div role="tabpanel" class="tab-pane fade" id="register" aria-labelledby="register"><p> Registration is limited to students in the appropriate University of Toronto HMB class. If you are not in the appropriate HMB class, you cannot register for SciGrade. Though once you have registered for SciGrade, you now have a permanent account and can use SciGrade whenever you want. <p><p id="pP1"> First, please verify that you are a student at the University of Toronto:</p><form id="registerP1"><div class="form-group" id="studentID"><label for="StudentNumber">Student number:</label><input class="form-control" id="StudentNumber" placeholder="1234567890" maxlength="10" onkeypress="IfPressEnter(event, \'firstSubmit\')" type="text"><small id="studentNumberHelp" class="form-text text-muted">Insert your 9 to 10 digit student number to verify you are a student at the University of Toronto.</small></div><div class="form-group" id="studentumail"><label for="StudentEmail">Student uMail:</label><input type="email" class="form-control" id="StudentEmail" placeholder="first.last@mail.utoronto.ca" onkeypress="IfPressEnter(event, \'firstSubmit\')"><small id="studentEmailHelp" class="form-text text-muted">Insert your student uMail (email) from the University of Toronto.</small></div><button id="firstSubmit" type="button" class="btn btn-primary" onclick="checkStudentNumber(document.getElementById(\'StudentNumber\').value, document.getElementById(\'StudentEmail\').value);">Check</button></form><p id="pP2"></p><form id="registerP2"></form><p id="pP3"></p><form id="registerP3" style="display:none;"><div class="g-signin2" data-onsuccess="onSignIn"></div></form></div>\n';
  // Close
  append_str += '</div><div class="col-sm-1"></div>\n'
  append_str += "</div>\n";
  $("#mainContainer").append(append_str);
};

var changeLogin = '<i class="material-icons" style="font-size:inherit;">&#xE7FD;</i>';
/**
 * Once users have registered OR logged in, the page dynamically generates the CRISPR assignment page
 */
function redirectCRISPR() {
  $("#mainContainer").empty();
  var append_str;
  append_str = "<div class='row'>\n";
  append_str += "<div class='col-sm-1'></div>\n";
  append_str += "<div class='col-sm-10' id='content_body'>\n";
  append_str += "<div id='selection_process'>\n";
  append_str += "<div id='mode_selection' style='margin-top: 2%;'>\n";
  append_str += "<p>Please select the dry lab mode you would like to use: </p>\n";
  append_str += "<div>\n";
  append_str += "Mode: <div class='btn-group' data-toggle='buttons'>\n";
  append_str += "<label class='btn btn-primary active' style='padding: .075rem .75rem;'' id='practice' onclick='selection_inMode = this.id; ModeSelectionAdd(this.id)'>\n";
  append_str += "<input type='radio' name='practice_mode' autocomplete='off'  checked> Practice\n";
  append_str += "</label>\n";
  append_str += "<label class='btn btn-primary' style='padding: .075rem .75rem;' id='assignment' onclick='selection_inMode = this.id; ModeSelectionAdd(this.id);'>\n";
  append_str += "<input type='radio' name='assignemnt_mode' autocomplete='off'> Assignment\n";
  append_str += "</label>\n";
  append_str += "</div>\n";
  append_str += "</div>\n";
  append_str += "</div>\n";
  append_str += "<div id='gene_selection'>\n";
  append_str += "Please select your gene:\n";
  append_str += "<div class='btn-group'>\n";
  append_str += "<select class='form-control' id='gene_dropdown_selection' onchange='possible_gene=(document.getElementById(\"gene_dropdown_selection\").value);'>\n";
  append_str += "</select>\n";
  append_str += "</div>\n";
  append_str += "</div>\n";
  append_str += "<div id='load_button'>\n";
  append_str += "<button type='button' class='btn btn-success' style='margin-top: 2%;'' onclick='checkAnswers_executed=false; possible_gene=(document.getElementById(\"gene_dropdown_selection\").value); select_Gene();''>Load Gene</button>\n";
  append_str += "</div>\n";
  append_str += "</div>\n";
  append_str += "<div id='work'>\n";
  append_str += "</div>\n";
  append_str += "</div>\n";
  append_str += "<div class='col-sm-1'></div>\n";
  append_str += "</div>\n";
  $("#mainContainer").append(append_str);
  ModeSelectionAdd(selection_inMode);  
  loadJSON_Files();
  loadCRISPRJSON_Files();
  setTimeout(function(){fillGeneList();}, 700);
  document.getElementById("logIO").innerHTML = changeLogin + " Logout";
  document.getElementById("logIO").setAttribute("onclick", "signOutDisplay();")
  document.getElementById("accountIO").removeAttribute("hidden");
  document.getElementById("logIO").removeAttribute("hidden");
}

$(document).ready(function() {
  loadJSON_Files();
  $("#loginTab").click();
})