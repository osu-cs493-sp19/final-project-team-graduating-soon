const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const { UserSchema, insertNewUser, getUserById /*, validateUser*/, postUserLogin,getUserByEmail } = require('../models/user');
const bcrypt = require('bcryptjs');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
/*
 * Route to list all of a user's businesses.
 */
router.get("/:userid", async (req, res, next) => {
  try {
    const user = await getUserByID(parseInt(req.params.userid));
    if (user) {
      res.status(200).send(user);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Unable to fetch user's businesses."
    });
  }
  
});

/*   Post for Business?
router.post("/", async (req, res, next) => {
  if (validation.validateAgainstSchema(req.body, businessSchema)) {
    try {
      const id = await insertNewBusiness(req.body);
      res.status(201).send({
        id: id
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Failed to insert business.  Try again later."
      });
    }
  } else {
    res.status(400).send({
      err: "Request body does not contain a valid Business."
    });
  }
});
*/

router.post('/login', async (req, res) => {
try{
const userr = await getUserByEmail(req.body.email);
  if (req.body && req.body.email && req.body.password) {
    getUserByEmail(req.body.email, true)
      .then((user) => {
        if (user) {
          return bcrypt.compare(req.body.password, user.password);
        } else {
          return Promise.reject(401);
        }
      })
      .then((loginSuccessful) => {
        if (loginSuccessful) {
          return generateAuthToken(userr.id);
        } else {
          return Promise.reject(401);
        }
      })
      .then((token) => {
        res.status(200).json({
          token: token
        });
      })  
} else {
    res.status(400).json({
      error: "Request needs a userID and password."
    })
  }
      }catch(err) {
        if (err === 401) {
          res.status(401).json({
            error: "Invalid credentials."
          });
        } else {
	  console.error(err);
          res.status(500).json({
            error: "Failed to fetch user."
          });
        }
      }
});

module.exports = router;