//= ================================ SciGrade ==================================
//
// Purpose: Login and registration for SciGrade
//
//= ============================================================================

let student_reg_information;

/** Let users continue with practice application without logging in (true) (default false) */
let continueWithoutLogin = true;

let checkStudentNum = false;
let studentNumber = 0;
let studentUmail;
let alreadyRegistered = false;
let classRegister;
/**
 * Check to determine if the student is within
 * @param {Num} student_num Student number
 * @param {String} student_umail Student's email/uMail
 * @return {bool} checkStudentNum - Whether the student is a student in the system or not
 */

function checkStudentNumber(student_num, student_umail) {
	alreadyRegistered = false;
	checkStudentNum = false;
	let maxNum = 0;
	const classList = student_reg_information?.[0]?.class_list;
	if (classList) {
		for (const key in classList) {
			if (
				student_reg_information[0].student_list !== null &&
				student_reg_information[0].student_list.length > 0
			) {
				for (const student of student_reg_information[0].student_list) {
					if (student.student_number === student_num && student.studentClass === key) {
						alreadyRegistered = true;
					}
				}
			}
		}
	}

	if (!alreadyRegistered) {
		for (const key in classList) {
			if (classList[key][student_num] === student_umail) {
				checkStudentNum = true;
				studentNumber = student_num;
				studentUmail = student_umail;
				studentParseNum = i;
				classRegister = key;
				break;
			} else {
				maxNum += 1;
			}
		}
	}
	if (checkStudentNum) {
		addSecondSection();
	} else if (alreadyRegistered) {
		showRegError(4);
	} else if (!checkStudentNum && maxNum === student_reg_information?.[0]?.student_list.length) {
		showRegError(1);
	} else if (!checkStudentNum) {
		showRegError(2);
	}
}

/**
 * Check to determine if the student is registered in the system
 * @param {Num} student_num - Student number
 */
function loginVerify(student_NumVerify) {
	alreadyRegistered = false;
	let maxNum = 0;
	checkStudentNum = false;

	if (student_reg_information?.[0]?.student_list && student_reg_information[0].student_list.length > 0) {
		for (let i = 0; i < student_reg_information[0].student_list.length; i += 1) {
			if (student_reg_information[0].student_list[i].student_number === student_NumVerify) {
				if (student_reg_information[0].student_list[i].gmail !== "unregistered") {
					alreadyRegistered = true;
					checkStudentNum = true;
					studentNumber = student_NumVerify;
					studentParseNum = i;
				} else if (student_reg_information[0].student_list[i].gmail === "unregistered") {
					alreadyRegistered = false;
				}
			} else {
				maxNum += 1;
			}
		}
	}

	if (alreadyRegistered && checkStudentNum) {
		$("#loginForm").empty();
		document.getElementById("loginP2").style.display = "block";
	} else if (!alreadyRegistered) {
		showRegError(5);
	} else if (maxNum === student_reg_information[0].student_list.length) {
		showRegError(1);
	}
}

/**
 * Which reg error shows
 * @param {Num} whichOne - Number indicator for which error to show
 */
function showRegError(whichOne) {
	if (whichOne === 1) {
		// Not in our database
		document.getElementById("errorRegContent").innerHTML =
			"It appears that you are not a student in our database.\n Are you a UofT student? If so, contact your TA, Professor or Admin for further help.";
		$("#errorRegButton").click();
	} else if (whichOne === 2) {
		// Something went wrong with registration
		document.getElementById("errorRegContent").innerHTML =
			"Something went wrong. Please refresh the page and try again. If this persists, please contact your TA, Professor or Admin with the following error code: lgn83-85";
		$("#errorRegButton").click();
	} else if (whichOne === 3) {
		// Verify ID was incorrect
		document.getElementById("errorRegContent").innerHTML =
			"It appears that your verification ID is incorrect. Please retype it and try again. If this persists, contact your TA, Professor or Admin for further help. NOTE: Only students of HMB311 can register for SciGrade.";
		$("#errorRegButton").click();
	} else if (whichOne === 4) {
		// Verify ID was incorrect
		document.getElementById("errorRegContent").innerHTML =
			"You are already registered for SciGrade, please navigate to the login tab instead of the register. If an issue arises, please contact your TA, Professor or Admin for further help.";
		$("#errorRegButton").click();
	} else if (whichOne === 5) {
		// Not yet registered for SciGrade
		document.getElementById("errorRegContent").innerHTML =
			"It appears that you have not yet registered for SciGrade, please navigate to the register tab and register first. If an issue arises, please contact your TA, Professor or Admin for further help.";
		$("#errorRegButton").click();
	} else if (whichOne === 6) {
		// Not yet registered for SciGrade
		document.getElementById("errorRegContent").innerHTML =
			"This is not the Google account associated with this student number. If an issue arises, please contact your TA, Professor or Admin for further help.";
		$("#errorRegButton").click();
	} else if (whichOne === 7) {
		// Restricted access to only TA's and Admins'
		document.getElementById("errorRegContent").innerHTML =
			"This feature is restricted to only TA's and admins. You do not have access. Please contact a TA or admin for access.";
		$("#errorRegButton").click();
	} else if (whichOne === 8) {
		// Unequal amount of student numbers and student emails
		document.getElementById("errorRegContent").innerHTML =
			"There is an unequal amount of student numbers and student uMails, please correct this to proceed";
		$("#errorRegButton").click();
	}
}

/**
 * Adds the verification student section to the login page
 */
function addSecondSection() {
	$("#pP1").empty();
	$("#registerP1").empty();
	document.getElementById("pP3").innerHTML =
		"Next, you will login through Google to register for SciGrade. This way you will never need to remember a username or password. Please click the button below to complete your registration.";
	document.getElementById("registerP3").style.display = "block";
}

/**
 * Signs the user out and returns screen back to login/register display
 */
function signOutDisplay() {
	if (document.getElementById("accountIO")) {
		document.getElementById("accountIO").setAttribute("hidden", true);
	}

	if (document.getElementById("logIO")) {
		document.getElementById("logIO").setAttribute("hidden", true);
		document.getElementById("logIO").innerHTML = `${changeLogin} Login`;
		document.getElementById("logIO").setAttribute("onclick");
	}

	$("#mainContainer").empty();

	let append_str;
	append_str = "<div class='row'>\n";
	// Pre-all
	append_str +=
		'<div class="col-sm-1"></div><div class="col-sm-10"><ul class="nav nav-tabs"  id="logTabs" role="tablist"><li class="nav-item"><a class="nav-link" id="login-tab" data-toggle="tab" href="#login" role="tab" aria-controls="login">Login</a></li><li class="nav-item"><a class="nav-link" id="register-tab" data-toggle="tab" href="#register" role="tab" aria-controls="register">Register</a></li></ul><div class="tab-content" id="logTabContent">\n';
	// Close
	append_str += '</div><div class="col-sm-1"></div>\n';
	append_str += "</div>\n";
	$("#mainContainer").append(append_str);
}

/**
 * Load the content fill section for a gene
 * @example <caption>Use this function to call and load the gene in the gene dropdown</caption>
 * loadGeneContent()
 * // returns null (does not return anything but loads the gene content on the web app)
 */
function loadGeneContent() {
	checkAnswers_executed = false;
	possible_gene = document.getElementById("gene_dropdown_selection").value;
	select_Gene();
}

const changeLogin = '<i class="material-icons" style="font-size:inherit;">&#xE7FD;</i>';
/**
 * Once users have registered OR logged in, the page dynamically generates the CRISPR assignment page
 */
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
							class='btn btn-success'
							style='margin-top: 2%;'
							onClick='loadGeneContent()'
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

	if (!continueWithoutLogin) {
		if (document.getElementById("accountIO")) {
			document.getElementById("accountIO").removeAttribute("hidden");
		}
		if (document.getElementById("logIO")) {
			document.getElementById("logIO").innerHTML = `${changeLogin} Logout`;
			document.getElementById("logIO").setAttribute("onclick", "signOutDisplay();");
			document.getElementById("logIO").removeAttribute("hidden");
		}
	}
}

$(document).ready(() => {
	$("#loginTab").click();
});
