const Q = require('q');
const _ = require('lodash');

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
  filePath: String,
  isRoot: {
    type: Boolean,
    default: false
  },
  // tree structure of person id and children
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
  getRootByUserId,
  getRelatedPerson,
};

/**
 * this recursive function retrieves the root task for a given task _id
 * @param {string} _id 
 */
function getRootTaskByTaskId(_id) {
  const deferred = Q.defer();
  Task.findById(_id, (err, res) => {
    if (err) deferred.reject(err);
    if (res) {
      console.log(res);
      if (res.isRoot) {
        deferred.resolve(res);
      }
      else {
        deferred.resolve(
          getRootTaskByTaskId(res.parent._id)
        );
      }
    } 
  })
  return deferred.promise;
}

/**
 * this function returns title and _id of all the persons related in the task tree
 * @param {string} _id  - task._id
 * @returns {Array} relatedPersons
 */
function getRelatedPerson(_id) {
  const deferred = Q.defer();
  getRootTaskByTaskId(_id)
    .then(rootTask => {
      deferred.resolve(flattenOrganization(rootTask.organization));
    })
    .catch(err => {
      deferred.reject(err);
    })
  return deferred.promise;
}

/**
 * this function flatten the organization tree into a shallow array
 * @param {Array} organization
 * @returns {[]} flattenedOrganization 
 */
function flattenOrganization(organization) {
  if (_.isArray(organization) && organization.length > 0) {
  let flattenedArray = [];
    organization.forEach(person => {
      flattenedArray.push(_.omit(person, 'children'));
      flattenedArray = [...flattenedArray, ...flattenOrganization(person.children)];
    });
    return flattenedArray;
  }
  else {
    return [];
  }
}
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

function getRootByUserId(id) {
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