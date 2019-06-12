


// UNTOUCHED REVIEWS - OLD CODE - NEEDS UPDATE



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


router.post("/", async (req, res) => {
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


router.patch("/:assignmentid", async(req, res, next) => {
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

});


router.delete("/:assignmentid", async (req, res, next) => {
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

});


router.get("/:assignmentid/submissions", async (req, res, next) => {
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
});


router.post("/:assignmentid/submissions", async (req, res) => {
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
});

module.exports = router;