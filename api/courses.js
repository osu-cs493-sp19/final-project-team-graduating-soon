

// UNTOUCHED BUSINESS -  OLD CODE - NEEDS UPDATE


const router = require("express").Router();
const validation = require("../lib/validation");
const { getDBReference } = require("../lib/mongo");
const ObjectID = require('mongodb').ObjectID;

const businesses = require("../data/businesses");
const { reviews } = require("./reviews");
const { photos } = require("./photos");

exports.router = router;
exports.businesses = businesses;

/*
 * Schema describing required/optional fields of a business object.
 */
const businessSchema = {
  ownerid: { required: true },
  name: { required: true },
  address: { required: true },
  city: { required: true },
  state: { required: true },
  zip: { required: true },
  phone: { required: true },
  category: { required: true },
  subcategory: { required: true },
  website: { required: false },
  email: { required: false }
};

router.get("/", async (req, res) => {
  try {
    const businessesPage = await getBusinessesPage(
      parseInt(req.query.page) || 1
    );
    console.log(businessesPage);
    res.status(200).send(businessesPage);
  } catch (err) {
    res.status(500).send({
      error: "Error fetching businesses.  Try again later."
    });
  }
});

getBusinessesPage = async function(page) {
  const db = getDBReference();
  const collection = db.collection("businesses");
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
    businesses: results,
    page: page,
    totalPages: lastPage,
    pageSize: pageSize,
    count: count
  };
};

router.post("/", async (req, res) => {
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

insertNewBusiness = async function(business) {
  // const lodgingToInsert = extractValidFields(lodging);
  const db = getDBReference();
  const collection = db.collection("businesses");
  const result = await collection.insertOne(business);
  return result.insertedId;
};

/*
 * Route to fetch info about a specific business.
 */
router.get("/:businessid", async (req, res, next) => {
  try {
    const business = await getBusinessByID(req.params.businessid);
    const photos = await getPhotosByBusinessID(req.params.businessid);
    const reviews = await getReviewsByBusinessID(req.params.businessid);
    if (business) {
      res.status(200).send({business: business, photos: photos, reviews: reviews});
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Unable to fetch business."
    });
  }
  
});

async function getBusinessByID(id) {
  const db = getDBReference();
  const collection = db.collection("businesses");
  const results = await collection
    .find({
      _id: new ObjectID(id)
    })
    .toArray();
  return results[0];
}

async function getPhotosByBusinessID(id) {
  const db = getDBReference();
  const collection = db.collection("photos");
  const results = await collection
    .find({
      businessid: id
    })
    .toArray();
  return results;
}

async function getReviewsByBusinessID(id) {
  const db = getDBReference();
  const collection = db.collection("reviews");
  const results = await collection
    .find({
      businessid: id
    })
    .toArray();
  return results;
}

/*
 * Route to replace data for a business.
 */
router.put("/:businessid", async(req, res, next) => {
  try {
    const business = await updateBusiness(req.params.businessid, req.body);
    if (business) {
      res.status(200).send(business);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Unable to update business."
    })
  }

});

async function updateBusiness(id, business) {
  const db = getDBReference();
  const collection = db.collection("businesses");
  const result = await collection.replaceOne(
    { "_id": ObjectID(id) },
    { "ownerid": business.ownerid, "name": business.name, "address": business.address, "city": business.city, "state": business.state, "zip": business.zip, "phone": business.phone, "category": business.category, "subcategory": business.subcategory, "website": business.website, "email": business.email}
    );
  return result;
}

/*
 * Route to delete a business.
 */
router.delete("/:businessid", async (req, res, next) => {
  try {
    const business = await deleteBusiness(req.params.businessid);
    if (business) {
      res.status(200).send(business);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Unable to delete business."
    })
  }

});

async function deleteBusiness(id) {
  const db = getDBReference();
  const collection = db.collection("businesses");
  const result = await collection.deleteOne(
    {"_id": ObjectID(id) }
  );
  return result;
}