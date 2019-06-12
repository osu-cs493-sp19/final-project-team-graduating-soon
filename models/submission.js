/*
 * Schema and data accessor methods;
 */

const mongo = require("../lib/mongo");
const { extractValidFields } = require("../lib/validation");

/*
 * Schema describing required/optional fields of a user object.
 */
const submissionSchema = {
  assignmentId: { required: true },
  studentId: { required: true },
  timestamp: { required: true },
  file: { required: true }
};
exports.submissionSchema = submissionSchema;