const Q = require('q');
const bcrypt = require('bcryptjs');
const _ = require('lodash');

const config = require('../config.json');
const mongoose = require('./mongo-connection');// pack mongoose connection into one module
const Schema = mongoose.Schema;
const taskSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  positionX: Number,
  positionY: Number,
  owner: Schema.Types.ObjectId,
  description: String,
  startDate: Date,
  endDate: Date,
  parent: Schema.Types.ObjectId,
  children: [Schema.Types.ObjectId],
  linkTo: [Schema.Types.ObjectId],
  isRoot: {
    type: Boolean,
    default: false
  },
  organization: Schema.Types.Mixed
});
const Task = mongoose.model('Task', taskSchema);

module.exports = {
  query,
  create,
  update,
  remove,
  getByCreator,
  getByRoot,
  getRoot
};


/**
 * 
 * @param {Object} queryObj object of the query params 
 */
function query(queryObj) {
  const deferred = Q.defer();
  Task.find(queryObj, (err, res) => {
    if (err) deferred.reject(err.name + ': ' + err.message);
    else deferred.resolve(res);
  });
  return deferred.promise;
}

function create(params) {
  console.log(params);
  const deferred = Q.defer();
  const doc = new Task(params);
  doc.save((err, res) => {
    if (err) deferred.reject(err.name + ': ' + err.message);
    else {
      deferred.resolve(res);
    }
  });
  return deferred.promise;
}

function remove(id) {
  const deferred = Q.defer();
  Task.findByIdAndRemove(id, (err, res) => {
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
        else {
          console.log('Updated task is');
          console.log(updatedTask);
          deferred.resolve(updatedTask);
        }
      });
  }
  return deferred.promise;
}

function getByCreator(id) {
  const deferred = Q.defer();
  Task.find({ creator: id }, (err, res) => {
    if (err) deferred.reject(err.name + ': ' + err.message);
    else deferred.resolve(res);
  });
  return deferred.promise;
}

function getRoot(id) {
  const deferred = Q.defer();
  Task.find({
    creator: id,
    isRoot: true
  }, (err, res) => {
    if (err) deferred.reject(err.name + ': ' + err.message);
    else deferred.resolve(res);
  });
  return deferred.promise;
}

function getByRoot(id) {
  const deferred = Q.defer();
  Task.find({
    parent: id,
  }, (err, res) => {
    if (err) deferred.reject(err.name + ': ' + err.message);
    else deferred.resolve(res);
  });
  return deferred.promise;
}