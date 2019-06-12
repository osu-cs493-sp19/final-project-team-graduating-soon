/*
 * Schema and data accessor methods;
 */

const fs = require('fs');
const { getDBReference, GridFSBucket  } = require("../lib/mongo");
const { extractValidFields } = require("../lib/validation");
const ObjectID = require('mongodb').ObjectID;

/*
 * Schema describing required/optional fields of a user object.
 */
const AssignmentSchema = {
  courseId: { required: true },
  title: { required: true },
  points: { required: true },
  due: { required: true }
};
exports.AssignmentSchema = AssignmentSchema;


insertNewAssignment = async function (assignment) {
  // const lodgingToInsert = extractValidFields(lodging);
  const db = getDBReference();
  const collection = db.collection("assignments");
  const result = await collection.insertOne(assignment);
  return result.insertedId;
};
exports.insertNewAssignment = insertNewAssignment;


async function getAssignmentByID(id) {
  const db = getDBReference();
  const collection = db.collection("assignments");
  const results = await collection
    .find({
      _id: new ObjectID(id)
    })
    .toArray();
  return results[0];
};
exports.getAssignmentByID = getAssignmentByID;


async function updateAssignment(id, assignment) {
  const db = getDBReference();
  const collection = db.collection("assignments");
  const result = await collection.replaceOne(
    { "_id": ObjectID(id) },
    { "courseId": assignment.courseId, "title": assignment.title, "points": assignment.points, "due": assignment.due }
  );
  return result;
}
exports.updateAssignment = updateAssignment;


async function deleteAssignment(id) {
  const db = getDBReference();
  const collection = db.collection("assignments");
  const result = await collection.deleteOne(
    { "_id": ObjectID(id) }
  );
  return result;
}
exports.deleteAssignment = deleteAssignment;


getAssignmentsPage = async function (page) {
  const db = getDBReference();
  const collection = db.collection("assignments");
  const count = await collection.countDocuments();

  const pageSize = 10;
  const lastPage = Math.ceil(count / pageSize);
  page = page < 1 ? 1 : page;
  page = page > lastPage ? lastPage : page;
  const offset = (page - 1) * pageSize;

  const results = await collection
    .find({})
    .sort({ _id: 1 })
    .skip(offset)
    .limit(pageSize)
    .toArray();

  return {
    submissions: results[0].submissions,
    page: page,
    totalPages: lastPage,
    pageSize: pageSize,
    count: count
  };
};
exports.getAssignmentsPage = getAssignmentsPage;




async function insertNewSubmission(id, body) {
  const db = getDBReference();
  const collection = db.collection("assignments");
  const result = await collection.updateOne({ _id: new ObjectID(id) }, { $push: { submissions: body } });
  console.log(result);
  return result.insertedId;
}
exports.insertNewSubmission = insertNewSubmission;

// function insertNewSubmission(id, newUpload) {
//   return new Promise((resolve, reject) => {
//       const db = getDBReference();
//       const bucket = new GridFSBucket(db, { bucketName: 'submissions' });
//       const assignmentCollection = db.collection('assignments');
  
//       const metadata = {
//           contentType: newUpload.contentType,
//           assignmentid: newUpload.assignmentid,
//           studentid: newUpload.studentid
//       };
  
//       const uploadStream = bucket.openUploadStream(
//           newUpload.filename,
//           {
//               metadata: metadata
//           }
//       );
  
//       fs.createReadStream(newUpload.path)
//         .pipe(uploadStream)
//         .on('error', (err) => {
//             reject(err);
//         })
//         .on('finish', async (result) => {
//             await assignmentCollection.updateOne({_id: new ObjectId(newUpload.assignmentid)}, {$addToSet : {submissions: result._id}});
//             resolve(result._id);
//         });
//   });
// } exports.insertNewSubmission = insertNewSubmission;

exports.getDownloadStreamByFilename = function (filename) {
  const db = getDBReference();
  const bucket = new GridFSBucket(db, { bucketName: 'submissions' });
  return bucket.openDownloadStreamByName(filename);
};