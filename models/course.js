/*
 * Schema and data accessor methods;
 */

const mongo = require("../lib/mongo");
const { extractValidFields } = require("../lib/validation");


/*
 * Schema describing required/optional fields of a user object.
 */
const CourseSchema = {
  subject: { required: true },
  number: { required: true },
  title: { required: true },
  term: { required: false },
  instrutorId: { required: false }
};
exports.CourseSchema = CourseSchema;


getCoursesPage


insertNewCourse


getCourseByID


updateCourse


deleteCourse


getStudentsByCourseId


insertNewCourse


getRosterByCourseId


getAssignmentsByCourseId