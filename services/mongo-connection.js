const mongoose = require('mongoose');
const config = require('../config.json');
const logger = require('../common/logger');

let connectionString;
if (process.env.PORT || config.testMongo) {
    connectionString = config.cloudConnectionString;
}
else{
    connectionString = config.connectionString;
}

mongoose.connect(connectionString,connectionOptions = {})
  .then(() => { logger.info(`Successfully connected to ${connectionString}`); })
  .catch(err => { 
    logger.error(`Connection to ${connectionString} has failed`);
  });

mongoose.Promise = global.Promise;
module.exports = mongoose;