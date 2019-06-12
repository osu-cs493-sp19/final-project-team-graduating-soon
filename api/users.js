const router = require('express').Router();

const validation = require('../lib/validation');
const { UserSchema,
	insertNewUser, 
	getUserById, 
	getUserByEmail,
	validateUser,
	getCoursesByInstructorId,
	deleteUserById,
	updateUserById,
} = require('../models/user');
const bcrypt = require('bcryptjs');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const { validateAgainstSchema } = require('../lib/validation');

 router.post('/', async (req, res) => {
  console.log("req user: ", req.user);
  try{
	  const user = await getUserByEmail(req.body.email);
	     if(user.email){
			res.status(403).send({
				  error: "Email already exists!"
			});
		 }
  }catch (err) {
  }
  
  if (validateAgainstSchema(req.body, UserSchema)) {
    try {
      if(req.body.role == "admin" ){
        res.status(403).send({
          error: "New users must register as students"
        });
      } else if(req.body.role == "instructor" ){
        res.status(403).send({
          error: "New users must register as students"
        });
      } else {
        const id = await insertNewUser(req.body);
        console.log("newUser _id: ", id);
        res.status(201).send({
          _id: id
        });
      }
    } catch (err) {
      console.error("  -- Error:", err);
      res.status(500).send({
        error: "Error inserting new user.  Try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body does not contain a valid User."
    });
  }
});


router.post('/login', async (req, res) => {
  if (req.body && req.body.email && req.body.password) {
    try {
      const authenticated = await validateUser(req.body.email, req.body.password);
      if (authenticated) {
        const user = await getUserByEmail(req.body.email);
        const token = generateAuthToken(user._id);
        console.log("_id: ", user);
        console.log("auth token: ", token);
        res.status(200).send({
          token: token
        });
      } else {
        res.status(401).send({
          error: "Invalid credentials"
        });
      }
    } catch (err) {
      res.status(500).send({
        error: "Error validating user.  Try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body was invalid"
    });
  }
});


router.get('/:id', requireAuthentication, async (req, res, next) => {
 if (req.params.id == req.user) {	   
    try {
      const user = await getUserById(req.params.id);
      if (user) {
        if (user.role == "instructor") {
          await getCoursesByInstructorId(req.params.id);
        }
        res.status(200).send(user);
      } else {
        next();
      }
    } catch (err) {
      console.error("  -- Error:", err);
      res.status(500).send({
        error: "Error fetching user.  Try again later."
      });
    }
  } else {
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  }
});


router.delete('/:id', requireAuthentication, async (req, res, next) =>{
const requestor = await getUserById(parseInt(req.user));
if( req.params.id == req.user || requestor.role == 'admin'){
	try {
		const user = await deleteUserById(req.params.id);
		if (user) {
		  res.status(200).send(user);
		} else {
		  next();
		}
	  } catch (err) {
		console.log(err);
		res.status(500).send({
		  error: "Unable to delete user."
		})
	  }
	}else{
		res.status(403).json({
			  error: "Unauthorized to access that resource."
		});
	}
});


router.patch('/:id', requireAuthentication, async (req, res, next) => {
const requestor = await getUserById(req.user);
if( req.params.id == req.user || requestor.role == 'admin'){
	try {
		const user = await updateUserById(req.params.id, req.body);
		if (user) {
		  res.status(200).send(user);
		} else {
		  next();
		}
	  } catch (err) {
		console.log(err);
		res.status(500).send({
		  error: "Unable to update user."
		})
	  }
	}else{
		res.status(403).json({
			  error: "Unauthorized to access that resource."
		});
	}
});


module.exports = router;