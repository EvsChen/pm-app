const config = require('../config.json');
const mongoose = require('mongoose');

let connectionString;
if (process.env.VCAP_SERVICES) {
    const vcap_services = JSON.parse(process.env.VCAP_SERVICES);
    connectionString = vcap_services["MongoDB-Service"][0].credentials.uri;
}
else{
    connectionString = config.connectionString;
}

var connectionOptions = {
    // useMongoClient: true
}
mongoose.connect(connectionString,connectionOptions, (err) => {
    console.error('connection error:');
    console.error(err);
});

mongoose.Promise = global.Promise;
module.exports = mongoose;