const { MongoClient } = require('mongodb');

const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoDBName = process.env.MONGO_DB_NAME;

const mongoURL = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}`;
console.log("== Mongo URL:", mongoURL);

let db = null;

exports.connectToDB = function (callback) {
  MongoClient.connect(mongoURL, { useNewUrlParser: true }, (err, client) => {
    if (err) {
      throw err;
    }
    db = client.db(mongoDBName);
    callback();
  });
};
exports.getDBReference = function () {
  return db;
};