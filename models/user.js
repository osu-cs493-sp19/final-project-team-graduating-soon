/*
 * Schema and data accessor methods;
 */

const mongo = require("../lib/mongo");
const { extractValidFields } = require("../lib/validation");

const bcrypt = require("bcryptjs");
const { generateAuthToken, requireAuthentication } = require('../lib/auth');

const mysqlPool = require('../lib/mysqlPool');
/*
 * Schema describing required/optional fields of a user object.
 */
const UserSchema = {
  userid: { required: false },
  name: { required: true },
  email: { required: true },
  password: { required: true },
  role: { required: false }
};
exports.UserSchema = UserSchema;

/*
 * Executes a MySQL query to insert a new user into the database.  Returns
 * a Promise that resolves to the ID of the newly-created user entry.
 */
function insertNewUser(user) {
  return bcrypt.hash(user.password, 8)
    .then((passwordHash) => {
      return new Promise((resolve, reject) => {
        const userValues = {
          name: user.name,
          password: passwordHash,
          email: user.email,
        };
        mysqlPool.query(
          'INSERT INTO users SET ?',
          userValues,
          function (err, result) {
            if (err) {
              reject(err);
            } else {
              resolve(result.insertId);
            }
          }
        );
      });
    });
}
exports.insertNewUser = insertNewUser;


function getUserByEmail(userEmail) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
	'SELECT * FROM users WHERE email = ?',
	 [ userEmail ], 
	function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results[0]);
      }
    });
  });
}
exports.getUserByEmail = getUserByEmail;



/*
 * Fetch a user from the DB based on user ID.
 */
function getUserByID(userID) {
  return new Promise((resolve, reject) => {
    mysqlPool.query('SELECT * FROM users WHERE id = ?', [ userID ], function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results[0]);
      }
    });
  });
}
exports.getUserByID = getUserByID;




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
		  admin: user.admin
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



/*

exports.validateUser = async function(id, password) {
  const user = await getUserById(id, true);
  console.log("password: ", password);
  console.log("user.password: ", await user.password, user.name);
  console.log("bcrypt.compare: ", await bcrypt.compare(password, user.password));
  const authenticated = user && (await bcrypt.compare(password, user.password));
  return authenticated;
};
*/