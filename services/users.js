const Q = require('q');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require('lodash');

const config = require('../config.json');
const mongoose = require('./mongo-connection');// pack mongoose connection into one module
const Schema = mongoose.Schema;
const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true
    },
    firstName: String,
    lastName: String,
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
        if (err) deferred.reject(err);
        if (user) {
            if (bcrypt.compareSync(password, user.hash)) {
              // authentication successful
              deferred.resolve({ id: user._id, role: user.role, firstName: user.firstName });
            }
            else {
              deferred.reject({
                error: true,
                message: 'Wrong password!'
              });
            }
        } 
        else {
            // authentication failed
            deferred.reject({
              error: true,
              message: 'No such user!'
            });
        }
    });
    return deferred.promise;
}

// function getById(_id) {
//     var deferred = Q.defer();

//     User.findById(_id, function (err, user) {
//         if (err) deferred.reject(err.name + ': ' + err.message);

//         if (user) {
//             // return user (without hashed password)
//             deferred.resolve(_.omit(user, 'hash'));
//         } else {
//             // user not found
//             deferred.resolve();
//         }
//     });

//     return deferred.promise;
// }

// function getAll(){
//     var deferred = Q.defer();
//     User.find({},function (err, userList) {
//         if (err) deferred.reject(err.name + ': ' + err.message);

//         if (userList) {
//             deferred.resolve(userList);
//         } else {
//             // user not found
//             deferred.resolve();
//         }
//     });

//     return deferred.promise;
// }

// function update(_id, userParam) {
//     var deferred = Q.defer();

//     // validation
//     User.findById(_id, function (err, user) {
//         if (err) deferred.reject(err.name + ': ' + err.message);

//         if (user.username !== userParam.username) {
//             // username has changed so check if the new username is already taken
//             User.findOne(
//                 { username: userParam.username },
//                 function (err, user) {
//                     if (err) deferred.reject(err.name + ': ' + err.message);

//                     if (user) {
//                         // username already exists
//                         deferred.reject('Username "' + req.body.username + '" is already taken')
//                     } else {
//                         updateUser();
//                     }
//                 });
//         } else {
//             updateUser();
//         }
//     });

//     function updateUser() {
//         // fields to update
//         var set = {
//             firstName: userParam.firstName,
//             lastName: userParam.lastName,
//             username: userParam.username,
//         };

//         // update password if it was entered
//         if (userParam.password) {
//             set.hash = bcrypt.hashSync(userParam.password, 10);
//         }

//         User.update(
//             { _id: mongo.helper.toObjectID(_id) },
//             { $set: set },
//             function (err, doc) {
//                 if (err) deferred.reject(err.name + ': ' + err.message);

//                 deferred.resolve();
//             });
//     }

//     return deferred.promise;
// }

// function _delete(_id) {
//     var deferred = Q.defer();

//     User.remove(
//         { _id: _id },
//         function (err) {
//             if (err) deferred.reject(err.name + ': ' + err.message);
//             deferred.resolve();
//         });
//     return deferred.promise;
// }