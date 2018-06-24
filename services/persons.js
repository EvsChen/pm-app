const Q = require('q');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require('lodash');

const config = require('../config.json');
const mongoose = require('./mongo-connection');// pack mongoose connection into one module
const Schema = mongoose.Schema;
const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    department: String, 
    role: String,
    email: String, 
});
const User = mongoose.model('User',userSchema);

const service = {};
service.create = create;
service.authenticate = authenticate;
module.exports = service;

function create(userParam) {
    var deferred = Q.defer();
    // validation    
    User.find({ username: userParam.username }, (err, userList) => {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (userList.length > 0) {
            deferred.reject(`Username ${userParam.username} is already taken`);
        } else {
            createUser();
        }
    });

    function createUser() {
        // set user object to userParam without the cleartext password
        // add hashed password to user object
        const user = new User(_.omit(userParam, 'password'));
        user.hash = bcrypt.hashSync(userParam.password, 10);
        user.save((err, res) => {
            if (err) deferred.reject(err.name + ': ' + err.message);
            else {
                deferred.resolve(res);
            }
        });
    }
    return deferred.promise;
}


function authenticate(username, password) {
    const deferred = Q.defer();
    User.findOne({ username: username }, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (user && bcrypt.compareSync(password, user.hash)) {
            // authentication successful
            deferred.resolve(jwt.sign({ sub: user._id, role: user.role, firstName: user.firstName }, config.secret));
        } else {
            // authentication failed
            deferred.reject();
        }
    });
    return deferred.promise;
}
