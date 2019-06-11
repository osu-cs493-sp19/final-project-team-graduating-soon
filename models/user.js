/*
 * Schema and data accessor methods;
 */

const mongo = require("../lib/mongo");
const { extractValidFields } = require("../lib/validation");
const { getDBReference } = require('../lib/mongo');
const bcrypt = require("bcryptjs");
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const { ObjectId } = require('mongodb');

const mysqlPool = require('../lib/mysqlPool');
/*
 * Schema describing required/optional fields of a user object.
 */
const UserSchema = {
    id: { required: false },
    name: { required: true },
    email: { required: true },
    password: { required: true },
    role: { required: true },
  };
exports.UserSchema = UserSchema;

/*
 * Executes a MySQL query to insert a new user into the database.  Returns
 * a Promise that resolves to the ID of the newly-created user entry.
 */
exports.insertNewUser = async function (user) {
    const userToInsert = extractValidFields(user, UserSchema);
    const db = getDBReference();
    const collection = db.collection('users');
  
    const passwordHash = await bcrypt.hash(userToInsert.password, 8);
    userToInsert.password = passwordHash;
  
    const result = await collection.insertOne(userToInsert);
    return result.insertedId;
};

/*
* Fetch a user from the DB based on user ID.
*/
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

/*
* Fetch a user from the DB based on user email.
*/
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


function deleteUserByID(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'DELETE FROM users WHERE id = ?',
      [ userID ],
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result.affectedRows > 0);
        }
      }
    );
  });
}
exports.deleteUserByID = deleteUserByID;



function updateUserByID(id, user) {
  return new Promise((resolve, reject) => {
    const userValues = {
	  id: null,
          name: user.name,
          email: user.email,
		  role: user.role
    };
    mysqlPool.query(
      'UPDATE users SET ? WHERE id = ?',
      [ userValues, id ],
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result.affectedRows > 0);
        }
      }
    );
  });
}


 exports.validateUser = async function (email, password) {
    const user = await getUserByEmail(email, true);
    const authenticated = user && await bcrypt.compare(password, user.password);
    return authenticated;
};