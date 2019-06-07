/*
 * Schema and data accessor methods;
 */

const mongo = require("../lib/mongo");
const { extractValidFields } = require("../lib/validation");

/*
 * Schema describing required/optional fields of a user object.
 */
const AssignmentSchema = {
  courseId: { required: true },
  title: { required: true },
  points: { required: true },
  due: { required: false }
};
exports.AssignmentSchema = AssignmentSchema;


insertNewAssignment


getAssignmentByID


updateAssignment


deleteAssignment


getSubmissionsPage


insertNewSubmission