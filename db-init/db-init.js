db.createUser({
    user: "root",
    pwd: "password",
    roles: [ { role: "readWrite", db: "mongodb" } ]
  })
  
db.users.insertOne({
  userID: "David",
  password: "pass123",
})