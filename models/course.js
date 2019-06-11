/*
 * Schema and data accessor methods;
 */

const mongo = require("../lib/mongo");
const { getDBReference } = require("../lib/mongo");
const { extractValidFields } = require("../lib/validation");
const ObjectID = require('mongodb').ObjectID;


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


getCoursesPage = async function(page) {
  const db = getDBReference();
  const collection = db.collection("courses");
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
    courses: results,
    page: page,
    totalPages: lastPage,
    pageSize: pageSize,
    count: count
  };
}; 
exports.getCoursesPage = getCoursesPage;


insertNewCourse = async function(course) {
  // const lodgingToInsert = extractValidFields(lodging);
  const db = getDBReference();
  const collection = db.collection("courses");
  const result = await collection.insertOne(course);
  return result.insertedId;
};
exports.insertNewCourse = insertNewCourse;


async function getCourseByID(id) {
  const db = getDBReference();
  const collection = db.collection("courses");
  const results = await collection
    .find({
      _id: new ObjectID(id)
    })
    .toArray();
  return results[0];
};
exports.getCourseByID = getCourseByID;


async function updateCourse(id, course) {
  const db = getDBReference();
  const collection = db.collection("courses");
  const result = await collection.replaceOne(
    { "_id": ObjectID(id) },
    { "subject": course.subject, "number": course.number, "title": course.title, "term": course.term, "instructorID": course.instructorID}
    );
  return result;
}
exports.updateCourse = updateCourse;


async function deleteCourse(id) {
  const db = getDBReference();
  const collection = db.collection("courses");
  const result = await collection.deleteOne(
    {"_id": ObjectID(id) }
  );
  return result;
}
exports.deleteCourse = deleteCourse;


//getStudentsByCourseId


async function addRemoveStudents(id) {
  const db = getDBReference();
  const collection = db.collection("courses");
  const result = await collection.replaceOne(
    { "_id": ObjectID(id) },
    { "subject": course.subject, "number": course.number, "title": course.title, "term": course.term, "instructorID": course.instructorID}
    );
  return result;
}
exports.addRemoveStudents = addRemoveStudents;


//getRosterByCourseId


//getAssignmentsByCourseId