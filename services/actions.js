/**
 * @file services/actions.js - this service provides direct manipulation over the actions 
 * notice that action is different than the task since it can only be a child of the task 
 * and will have no children of their own. Thus the data stucture could be much simpler
 */

const Q = require('q');
const _ = require('lodash');

const mongoose = require('./mongo-connection');// pack mongoose connection into one module
const Schema = mongoose.Schema;
const actionSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  // it should be an enum object with editable entries
  status: String,
  // should be enum as well
  category: String,
  progress: {
    type: Number,
    validate: {
      validator: Number.isInteger,
      message: 'Progress {VALUE} is not an integer value'
    }
  },
  owner: Schema.Types.ObjectId,
  description: String,
  startDate: Date,
  endDate: Date,
  // under which task the action lies
  parent: Schema.Types.ObjectId,
});
const Action = mongoose.model('Action', actionSchema);

module.exports = {
  query,
  create,
  update,
  remove
};

/**
 * 
 * @param {Object} queryObj object of the query params 
 */
function query(queryObj) {
  const deferred = Q.defer();
  Action.find(queryObj, (err, res) => {
    if (err) deferred.reject(err.name + ': ' + err.message);
    else deferred.resolve(res);
  });
  return deferred.promise;
}

function create(params) {
  const deferred = Q.defer();
  const doc = new Action(params);
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
  Action.findByIdAndRemove(id, (err, res) => {
    if (err) deferred.reject(err.name + ': ' + err.message);
    else deferred.resolve(res);
  });
  return deferred.promise;
}

function update(params) {
  const deferred = Q.defer();
  if (params._id) {
    Action.findByIdAndUpdate(
      params._id,
      { $set: _.omit(params, '_id') },
      { new: true },
      (err, updatedDoc) => {
        if (err) deferred.reject(err.name + ': ' + err.message);
        else {
          deferred.resolve(updatedDoc);
        }
      });
  }
  return deferred.promise;
}