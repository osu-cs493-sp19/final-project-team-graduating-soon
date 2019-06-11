const router = require('express').Router();

const validation = require('../lib/validation');
const { UserSchema,
	insertNewUser, 
	getUserById, 
	postUserLogin,
	getUserByEmail,
	validateUser,
	getCoursesByInstructorId
} = require('../models/user');
const bcrypt = require('bcryptjs');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const { validateAgainstSchema } = require('../lib/validation');

/*
const { getBusinessesByOwnerId } = require('../models/business');
const { getReviewsByUserId } = require('../models/review');
const { getPhotosByUserId } = require('../models/photo');
*/



/*
 * Route to list all of a user's businesses.
 */
 
 /* 
router.get('/:id/businesses', requireAuthentication, async (req, res, next) => {
if (req.user != req.params.id) {
	console.log(req.user);
    res.status(403).json({
      error: "Unauthorized to access that resource."
    });
	console.log(req.params.id);
  } else {
  try {
    const businesses = await 			getBusinessesByOwnerId(parseInt(req.params.id));
    if (businesses) {
      res.status(200).send({ businesses: businesses });
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch businesses.  Please try again later."
    });
  }
}
}); 
*/


/*
 * Route to list all of a user's reviews.
 */
 /* 
router.get('/:id/reviews', requireAuthentication, async (req, res, next) => {
  if (req.user != req.params.id) {
	console.log(req.user);
    res.status(403).json({
      error: "Unauthorized to access that resource."
    });
	console.log(req.params.id);
  } else {
  try {
    const reviews = await getReviewsByUserId(parseInt(req.params.id));
    if (reviews) {
      res.status(200).send({ reviews: reviews });
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch reviews.  Please try again later."
    });
  }
}
});
 */


/*
 * Route to list all of a user's photos.
 */
 /* 
router.get('/:id/photos', requireAuthentication, async (req, res, next) => {
if (req.user != req.params.id) {
	console.log(req.user);
    res.status(403).json({
      error: "Unauthorized to access that resource."
    });
	console.log(req.params.id);
  } else {
  try {
    const photos = await getPhotosByUserId(parseInt(req.params.id));
    if (photos) {
      res.status(200).send({ photos: photos });
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch photos.  Please try again later."
    });
  }
}
});
 */

/*
 * Route to create a new user.
 */
 router.post('/', async (req, res) => {
  console.log("req user: ", req.user);
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

//**************************************************8888888

/*
 * Route to delete a user.
 */
router.delete('/:id', requireAuthentication, async (req, res, next) =>{
try {
	const user = await getUserByID(parseInt(req.user));
	if(user.role == 'admin'){
		 deleteUserByID(id)
		  .then((deleteSuccessful) => {
			if (deleteSuccessful) {
			  res.status(204).end();
			} else {
			  next();
			}
		  })
		  .catch((err) => {
			res.status(500).json({
			  error: "Unable to delete user."
			});
		  });
	}else if( req.params.id == req.user){
		deleteUserByID(id)
		  .then((deleteSuccessful) => {
			if (deleteSuccessful) {
			  res.status(204).end();
			} else {
			  next();
			}
		  })
		  
	}else{
		res.status(403).json({
			  error: "Unauthorized to access that resource."
		});
	}
}catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to delete user.  Please try again later."
    });
  }
});


router.put('/:userID', requireAuthentication, async (req, res, next) => {
try {
    const user = await getUserByID(parseInt(req.user));
    if (user.role == 'admin') {
			if (validation.validateAgainstSchema(req.body, UserSchema)) {
			   updateUserByID(userID, req.body)
			}
      res.status(200).send({ user: userID });
    }else if(req.user == req.body.id && req.body.role == user.role){
			if (validation.validateAgainstSchema(req.body, UserSchema)) {
			   updateUserByID(userID, req.body)
			}
			res.status(200).send({ user: userID });
	}else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Invalid Authorization Level, please check parameters"
    });
  }
});




module.exports = router;