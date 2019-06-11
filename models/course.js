/*
 * Schema and data accessor methods;
 */

const { getDBReference } = require("../lib/mongo");
const { getUserByID } = require("../models/user");
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


getCoursesPage = async function (page) {
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


insertNewCourse = async function (course) {
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
    { "subject": course.subject, "number": course.number, "title": course.title, "term": course.term, "instructorID": course.instructorID }
  );
  return result;
}
exports.updateCourse = updateCourse;


async function deleteCourse(id) {
  const db = getDBReference();
  const collection = db.collection("courses");
  const result = await collection.deleteOne(
    { "_id": ObjectID(id) }
  );
  return result;
}
exports.deleteCourse = deleteCourse;


async function addRemoveStudents(id, body) {
  console.log("In Add Remove")
  console.log("ID:", id)
  console.log("Body:", body)
  const db = getDBReference();
  const collection = db.collection("courses");

  const modBus = JSON.parse(JSON.stringify(body));
  const addArray = modBus.add;
  const addLength = addArray.length;

  //add students by id in the "add" array.
  for (var i = 0; i < addLength; i++) {

    await collection.updateOne({ _id: new ObjectID(id) }, { $pull: { students: addArray[i] } });

    //add the student to the course students array.
    await collection.updateOne({ _id: new ObjectID(id) }, { $push: { students: addArray[i] } });
  }

  const remArray = modBus.remove;
  const remLength = remArray.length;

  //remove students by id in the "remove" array.
  for (var i = 0; i < remLength; i++) {

    //remove the student from the course students array.
    await collection.updateOne({ _id: new ObjectID(id) }, { $pull: { students: remArray[i] } });

  }
}
exports.addRemoveStudents = addRemoveStudents;


async function generateCSV(id) {
  const db = getDBReference();
  const collection = db.collection("courses");

  const course = await collection
    .find({
      _id: new ObjectID(id)
    })
    .toArray();

    const students = course[0].students;
    const studentsLen = students.length;
    const data = [];

    for (var i = 0; i < studentsLen; i++) {
      const user = await getUserByID(students[i]);
      data.push([ students[i].toString(), user.name.toString(), user.email.toString() ]);
    }

    var csv = "ID,Name,Email\n";
     data.forEach(function(row) {
          csv += row.join(',');
          csv += "\n";
     });

     return csv;
}
exports.generateCSV = generateCSV;