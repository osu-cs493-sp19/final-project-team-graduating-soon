

// UNTOUCHED USERS - OLD CODE - NEEDS UPDATE


const router = require('express').Router();
const validation = require("../lib/validation");
const { getDBReference } = require("../lib/mongo");
const ObjectID = require('mongodb').ObjectID;

exports.router = router;

const { businesses } = require('./businesses');
const { reviews } = require('./reviews');
const { photos } = require('./photos');

/*
 * Route to list all of a user's businesses.
 */
router.get("/:userid", async (req, res, next) => {
  try {
    const user = await getBusinessByUserID(parseInt(req.params.userid));
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

async function getBusinessByUserID(id) {
  const db = getDBReference();
  const collection = db.collection("businesses");
  const results = await collection
    .find({
      ownerid: id
    })
    .toArray();
  return results;
}

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


router.post("/login", async (req, res, next) => {

});