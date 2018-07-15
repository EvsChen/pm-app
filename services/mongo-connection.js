const config = require('../config.json');
const mongoose = require('mongoose');

let connectionString;
if (process.env.PORT || config.testMongo) {
    connectionString = config.cloudConnectionString;
}
else{
    connectionString = config.connectionString;
}

mongoose.connect(connectionString,connectionOptions = {})
  .then(() => { console.log(`Successfully connected to ${connectionString}`); })
  .catch(err => { 
    console.log(`Connection to ${connectionString} has failed`);
    console.log(err);
  });

mongoose.Promise = global.Promise;
module.exports = mongoose;