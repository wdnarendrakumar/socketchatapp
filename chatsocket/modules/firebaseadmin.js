
var admin = require("firebase-admin");

var serviceAccount = require("../config/firebaseconfig.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin.auth()
