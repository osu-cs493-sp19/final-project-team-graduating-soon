

// UNTOUCHED BUSINESS -  OLD CODE - NEEDS UPDATE


const router = require("express").Router();
const validation = require("../lib/validation");
const { getDBReference } = require("../lib/mongo");
const ObjectID = require('mongodb').ObjectID;


exports.router = router;

router.get("/", async (req, res) => {
  try {
    const CoursesPage = await getCoursesPage(
      parseInt(req.query.page) || 1
    );
    console.log(CoursesPage);
    res.status(200).send(CoursesPage);
  } catch (err) {
    res.status(500).send({
      error: "Error fetching courses.  Try again later."
    });
  }
});


router.post("/", async (req, res) => {
  if (validation.validateAgainstSchema(req.body, courseSchema)) {
    try {
      const id = await insertNewCourse(req.body);
      res.status(201).send({
        id: id
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Failed to insert course.  Try again later."
      });
    }
  } else {
    res.status(400).send({
      err: "Request body does not contain a valid Course."
    });
  }
});


/*
 * Route to fetch info about a specific business.
 */
router.get("/:courseid", async (req, res, next) => {
  try {
    const course = await getCourseByID(req.params.courseid);
    if (course) {
      res.status(200).send({ course: course });
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Unable to fetch course."
    });
  }
  
});


/*
 * Route to replace data for a business.
 */
router.patch("/:courseid", async(req, res, next) => {
  try {
    const course = await updateCourse(req.params.courseid, req.body);
    if (course) {
      res.status(200).send(course);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Unable to update course."
    })
  }

});


/*
 * Route to delete a business.
 */
router.delete("/:courseid", async (req, res, next) => {
  try {
    const course = await deleteCourse(req.params.courseid);
    if (course) {
      res.status(200).send(course);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Unable to delete course."
    })
  }

});


/*
 * Route to list all of a user's businesses.
 */
router.get('/:id/students', async (req, res, next) => {
  try {
    const students = await getStudentsByCourseId(parseInt(req.params.id));
    if (students) {
      res.status(200).send({ students: students });
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch students.  Please try again later."
    });
  }
});

//dont know about the schema
router.post("/:id/students", async (req, res) => {
  if (validation.validateAgainstSchema(req.body, courseSchema)) {
    try {
      const id = await insertNewCourse(req.body);
      res.status(201).send({
        id: id
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Failed to insert course.  Try again later."
      });
    }
  } else {
    res.status(400).send({
      err: "Request body does not contain a valid Course."
    });
  }
});


router.get('/:id/roster', async (req, res, next) => {
  try {
    const roster = await getRosterByCourseId(parseInt(req.params.id));
    if (roster) {
      res.status(200).send({ roster: roster });
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch roster.  Please try again later."
    });
  }
});


router.get('/:id/assignments', async (req, res, next) => {
  try {
    const assignments = await getAssignmentsByCourseId(parseInt(req.params.id));
    if (assignments) {
      res.status(200).send({ assignments: assignments });
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch assignments.  Please try again later."
    });
  }
});