//=============================================================================
//
// Purpose: Login scripts for AlMark
//
//=============================================================================

var student_reg_information;
/**
* Load JSON files
*/
function loadJSON_Files() {
  const client = new stitch.StitchClient('almark-wvohf');
  const db = client.service('mongodb', 'mongodb-atlas').db('AlMark');
  // Student information
  client.login().then(() =>
    db.collection('Student_register_information').find({version: "0.1"}).limit(100).execute()
  ).then(docs => {
    student_reg_information = docs;
  }).catch(err => {
    console.error(err)
  });
}

/**
* Check to determine if the student is within
*/
function checkStudentNumber() {

}
