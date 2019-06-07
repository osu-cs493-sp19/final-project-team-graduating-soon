/*
 * Schema and data accessor methods;
 */

const mongo = require("../lib/mongo");
const { extractValidFields } = require("../lib/validation");

/*
 * Schema describing required/optional fields of a user object.
 */
const AssignmentSchema = {
  assignmentId: { required: true },
  studentId: { required: true },
  timestamp: { required: true },
  file: { required: false }
};
exports.AssignmentSchema = AssignmentSchema;