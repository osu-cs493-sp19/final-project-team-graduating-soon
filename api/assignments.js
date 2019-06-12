
const router = require('express').Router();
const validation = require('../lib/validation');

const { 
  AssignmentSchema,
  insertNewAssignment,
  getAssignmentByID,
  updateAssignment,
  deleteAssignment,
  insertNewSubmission
 } = require("../models/assignment");

const {
  submissionSchema
} = require("../models/submission");

const {getCourseByID} = require('../models/course');
const {getUserById} = require('../models/user');

const bcrypt = require('bcryptjs');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const { validateAgainstSchema } = require('../lib/validation');




router.post("/", requireAuthentication, async (req, res) => {
const requestor = await getUserById(req.user);
const course = await getCourseByID(req.body.courseId);
if(requestor.role == 'admin' ||  requestor.id == course.instructorID){
  if (validation.validateAgainstSchema(req.body, AssignmentSchema)) {
    try {
      const id = await insertNewAssignment(req.body);
      res.status(201).send({
        id: id
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
      });
    }
  } else {
    res.status(400).send({
      err: "The request body was either not present or did not contain a valid Assignment object."
    });
  }
 }else {
	res.status(403).json({
		error: "Unauthorized to access that resource."
	});
}
});


router.get("/:assignmentid", async (req, res, next) => {
  try {
    const assignment = await getAssignmentByID(req.params.assignmentid);
    if (assignment) {
      res.status(200).send(assignment);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Unable to fetch assignment."
    });
  }
  
});


router.patch("/:assignmentid",  requireAuthentication, async(req, res, next) => {
const requestor = await getUserById(req.user);
const course = await getCourseByID(req.body.courseId);
if(requestor.role == 'admin' ||  requestor.id == course.instructorID){
  try {
    const assignment = await updateAssignment(req.params.assignmentid, req.body);
    if (assignment) {
      res.status(200).send(assignment);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Unable to update assignment."
    })
  }
 }else {
	res.status(403).json({
		error: "Unauthorized to access that resource."
	});
}
});


router.delete("/:assignmentid",   requireAuthentication, async (req, res, next) => {
const requestor = await getUserById(req.user);
const assignment = await getAssignmentByID(req.params.assignmentid);
const course = await getCourseByID(assignment.courseId);
if(requestor.role == 'admin' ||  requestor.id == course.instructorID){
  try {
    const assignment = await deleteAssignment(req.params.assignmentid);
    if (assignment) {
      res.status(200).send(assignment);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Unable to delete assignment."
    })
  }
 }else {
	res.status(403).json({
		error: "Unauthorized to access that resource."
	});
}
});


router.get("/:assignmentid/submissions",   requireAuthentication, async (req, res, next) => {
const requestor = await getUserById(req.user);
const assignment = await getAssignmentByID(req.params.assignmentid);
const course = await getCourseByID(assignment.courseId);
if(requestor.role == 'admin' ||  requestor.id == course.instructorID){
  try {
    const AssignmentsPage = await getAssignmentsPage(
      parseInt(req.query.page) || 1
    );
    console.log(AssignmentsPage);
    AssignmentsPage.links = {};
    if (AssignmentsPage.page < AssignmentsPage.totalPages) {
      AssignmentsPage.links.nextPage = `/submissions?page=${AssignmentsPage.page + 1}`;
      AssignmentsPage.links.lastPage = `/submissions?page=${AssignmentsPage.totalPages}`;
    }
    if (AssignmentsPage.page > 1) {
      AssignmentsPage.links.prevPage = `/submissions?page=${AssignmentsPage.page - 1}`;
      AssignmentsPage.links.firstPage = '/submissions?page=1';
    }
    res.status(200).send(AssignmentsPage);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error fetching submissions.  Try again later."
    });
  }
 }else {
	res.status(403).json({
		error: "Unauthorized to access that resource."
	});
}
});


router.post("/:assignmentid/submissions",   requireAuthentication, async (req, res) => {
const requestor = await getUserById(req.user);
const assignment = await getAssignmentByID(req.params.assignmentid);
const course = await getCourseByID(assignment.courseId);

var i;
var check = 0;
for (i = 0; i < course.students.length; i++) {
	 if(course.students[i] == requestor.id){
		 check = 1;
	 }
} 

if(check == 1){
  if (validation.validateAgainstSchema(req.body, submissionSchema)) {
    try {
      const id = await insertNewSubmission(req.params.assignmentid, req.body);
      res.status(201).send({
        id: id
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
      });
    }
  } else {
    res.status(400).send({
      err: "Assignment body does not contain a valid Submissions."
    });
  }
} else {
	res.status(403).json({
		error: "Unauthorized to access that resource."
	});
}
});

module.exports = router;