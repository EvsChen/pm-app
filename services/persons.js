/**
 * @file services/persons.js - this file provides services to manipulate with the person database
 */
const Q = require('q');
const _ = require('lodash');

const mongoose = require('./mongo-connection');// pack mongoose connection into one module
const Schema = mongoose.Schema;
const personSchema = new Schema({
    // the user id here is used to link to the user database
    // but the id is not necessary
    userId: Schema.Types.ObjectId,
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    department: String, 
    email: String,
    position: String
});
const Person = mongoose.model('Person', personSchema);

module.exports = {
  create,
  remove,
  update,
  query
};

function create(params) {
  console.log(params);
  const deferred = Q.defer();
  const doc = new Person(params);
  doc.save((err, res) => {
    if (err) deferred.reject(err.name + ': ' + err.message);
    else deferred.resolve(res);
  });
  return deferred.promise;
}

function update(params) {
  const deferred = Q.defer();
  if (params._id) {
    Task.findByIdAndUpdate(
      params._id,
      { $set: _.omit(params, '_id') },
      { new: true },
      (err, updatedTask) => {
        if (err) deferred.reject(err.name + ': ' + err.message);
        else deferred.resolve(updatedTask);
      });
  }
  return deferred.promise;
}


function query(queryObj) {
  const deferred = Q.defer();
    Person.find(queryObj, (err, res) => {
    if (err) deferred.reject(err.name + ': ' + err.message);
    else deferred.resolve(res);
  });
  return deferred.promise;
}

function remove(id) {
  const deferred = Q.defer();
  Person.findByIdAndRemove(id, (err, res) => {
    if (err) deferred.reject(err.name + ': ' + err.message);
    else deferred.resolve(res);
  });
  return deferred.promise;
}

