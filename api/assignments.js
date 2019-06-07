


// UNTOUCHED REVIEWS - OLD CODE - NEEDS UPDATE



const router = require('express').Router();
const validation = require('../lib/validation');
const { getDBReference } = require("../lib/mongo");
const ObjectID = require('mongodb').ObjectID;

exports.router = router;

/*
 * Route to create a new review.
 */
router.post("/", async (req, res) => {
  if (validation.validateAgainstSchema(req.body, assignmentSchema)) {
    try {
      const id = await insertNewAssignment(req.body);
      res.status(201).send({
        id: id
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Failed to insert assignment.  Try again later."
      });
    }
  } else {
    res.status(400).send({
      err: "Assignment body does not contain a valid Assignment."
    });
  }
});


/*
 * Route to fetch info about a specific review.
 */
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


/*
 * Route to update a review.
 */
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


/*
 * Route to delete a assignment.
 */
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
    const SubmissionsPage = await getSubmissionsPage(
      parseInt(req.query.page) || 1
    );
    console.log(SubmissionsPage);
    res.status(200).send(SubmissionsPage);
  } catch (err) {
    res.status(500).send({
      error: "Error fetching submissions.  Try again later."
    });
  }
});


router.post("/:assignmentid/submissions", async (req, res) => {
  if (validation.validateAgainstSchema(req.body, submissionSchema)) {
    try {
      const id = await insertNewSubmission(req.body);
      res.status(201).send({
        id: id
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Failed to insert submissions.  Try again later."
      });
    }
  } else {
    res.status(400).send({
      err: "Assignment body does not contain a valid Submissions."
    });
  }
});