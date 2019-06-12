

// UNTOUCHED BUSINESS -  OLD CODE - NEEDS UPDATE


const router = require("express").Router();
const validation = require("../lib/validation");
const {
  CourseSchema,
  getCoursesPage,
  insertNewCourse,
  getCourseByID,
  updateCourse,
  addRemoveStudents,
  deleteCourse,
  generateCSV
} = require('../models/course');


router.get("/", async (req, res) => {
  try {
    const CoursesPage = await getCoursesPage(
      parseInt(req.query.page) || 1
    );
    console.log(CoursesPage);
    CoursesPage.links = {};
    if (CoursesPage.page < CoursesPage.totalPages) {
      CoursesPage.links.nextPage = `/courses?page=${CoursesPage.page + 1}`;
      CoursesPage.links.lastPage = `/courses?page=${CoursesPage.totalPages}`;
    }
    if (CoursesPage.page > 1) {
      CoursesPage.links.prevPage = `/courses?page=${CoursesPage.page - 1}`;
      CoursesPage.links.firstPage = '/courses?page=1';
    }
    res.status(200).send(CoursesPage);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error fetching courses.  Try again later."
    });
  }
});


router.post("/", async (req, res) => {
  if (validation.validateAgainstSchema(req.body, CourseSchema)) {
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


router.get('/:id/students', async (req, res, next) => {
  try {
    const course = await getCourseByID(req.params.id);
    if (course) {
      res.status(200).send({ students: course.students });
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


router.post("/:id/students", async (req, res) => {
  if (req.body) {
    try {
      const id = await addRemoveStudents(req.params.id, req.body);
      res.status(201).send({
        Response : "Success"
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
      });
    }
  } else {
    res.status(400).send({
      err: "The request body was either not present or did not contain the fields described above"
    });
  }
});


router.get('/:id/roster', async (req, res, next) => {
  try {
    const course = await getCourseByID(req.params.id);
    if (course) {
      const csv = await generateCSV(req.params.id);
      res.status(200).send({ csv });
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


router.get('/:id/assignments', async (req, res, next) => {
  try {
    const course = await getCourseByID(req.params.id);
    if (course) {
      res.status(200).send({ students: course.assignments });
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

module.exports = router;