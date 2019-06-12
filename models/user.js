/*
 * Schema and data accessor methods;
 */

const mongo = require("../lib/mongo");
const { extractValidFields } = require("../lib/validation");
const { getDBReference } = require('../lib/mongo');
const bcrypt = require("bcryptjs");
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const { ObjectId } = require('mongodb');


const UserSchema = {
    id: { required: false },
    name: { required: true },
    email: { required: true },
    password: { required: true },
    role: { required: true },
  };
exports.UserSchema = UserSchema;

exports.insertNewUser = async function (user) {
    const userToInsert = extractValidFields(user, UserSchema);
    const db = getDBReference();
    const collection = db.collection('users');
  
    const passwordHash = await bcrypt.hash(userToInsert.password, 8);
    userToInsert.password = passwordHash;
  
    const result = await collection.insertOne(userToInsert);
    return result.insertedId;
};

async function getUserById(id, includePassword) {
    const db = getDBReference();
    const collection = db.collection('users');
	const projection = includePassword ? {} : { password: 0 };
	const results = await collection
		.find({ _id: new ObjectId(id) })
		.project(projection)
		.toArray();
	return results[0];
};
exports.getUserById = getUserById;

async function getUserByEmail(userEmail, includePassword) {
    const db = getDBReference();
    const collection = db.collection('users');
    const projection = includePassword ? {} : { password: 0 };
    const results = await collection
        .find({ email: userEmail })
        .project(projection)
        .toArray();
    return results[0];
};
exports.getUserByEmail = getUserByEmail;

async function getCoursesByInstructorId(id) {
    const db = getDBReference();
    const collection = db.collection('users');
    const results = await collection.aggregate([
      {
        $match: { _id: id }
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "instructorId",
          as: "instructorCourses"
        }
      }
    ]).toArray();
    console.log("instructor Courses results: ", results[0]);
    return results[0];
};
exports.getCoursesByInstructorId = getCoursesByInstructorId;

async function deleteUserById(id) {
  const db = getDBReference();
  const collection = db.collection('users');
  const result = await collection.deleteOne(
    { "_id": ObjectId(id) }
  );
  return result;
}
exports.deleteUserById = deleteUserById;

async function updateUserById(id, user) {
	console.log("HEEEEEEEEEY",user);
   const db = getDBReference();
   const collection = db.collection('users');
   const passwordHash = await bcrypt.hash(user.password, 8);
   const result = await collection.replaceOne(
    { "_id": ObjectId(id) },
	{"name":user.name, "email": user.email, "password": passwordHash, "role": user.role}
	);
return result;
}
exports.updateUserById = updateUserById;

 exports.validateUser = async function (email, password) {
    const user = await getUserByEmail(email, true);
    const authenticated = user && await bcrypt.compare(password, user.password);
    return authenticated;
};