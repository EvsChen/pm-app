const express = require('express');
const _ = require('lodash');
const router = express.Router();
const TaskService = require('../../services/tasks');

router.post('/create', create);
router.post('/update', update);
router.post('/get', get);
router.post('/getRoot', getRootByUserId);
router.post('/getRelatedPerson', getRelatedPerson);
router.post('/getByRoot', getByRoot);
router.post('/remove', remove);
router.post('/query', query);
module.exports = router;

function getRelatedPerson(req, res) {
  if (req.body) {
    TaskService.getRelatedPerson(req.body._id)
      .then(relatedPersons => {
        res.status(200).send(relatedPersons);
      })
      .catch(err => {
        console.log(err);
        res.status(400).send(err);
      })
  }
}

function query(req, res) {
  if (req.body) {
    TaskService.query(req.body)
      .then(result => {
        res.status(200).send(result);
      })
      .catch(err => {
        console.log(err);
        res.status(400).send(err);
      });
  }
}

function remove(req, res) {
  if (req.body) {
    TaskService.remove(req.body.id)
      .then(result => {
        res.status(200).send(result);
      })
      .catch(err => {
        console.log(err);
        res.status(400).send(err);
      });
  }
}

function create(req, res) {
  if (req.body) {
    console.log(req.body);
    const promiseArr = [];
    req.body.tasks.forEach((task) => {
      if (task._id) {
        // update task
        promiseArr.push(new Promise((resolve, reject) => {
          TaskService.update(task)
            .then(result => {
              resolve(result);
            })
            .catch(err => {
              reject(err);
            })
        }));
      }
      else {
        promiseArr.push(new Promise((resolve, reject) => {
          TaskService.create(task)
            .then(res => {
              resolve(res);
            })
            .catch(err => {
              reject(err);
            })
        }));
      }
    });
    Promise.all(promiseArr)
      .then(resArr => {
        res.status(200).send(resArr);
      })
      .catch(err => {
        res.status(400).send(err);
      })
  }
}

function update(req, res) {
  if (req.body) {
    if (req.body.tasks && _.isArray(req.body.tasks)) {
      const promiseArr = [];
      req.body.tasks.forEach((task) => {
        promiseArr.push(new Promise((resolve, reject) => {
          TaskService.update(task)
            .then(res => {
              resolve(res);
            })
            .catch(err => {
              reject(err);
            })
        }));
      });
      Promise.all(promiseArr)
        .then(resArr => {
          res.status(200).send(resArr);
        })
        .catch(err => {
          res.status(400).send(err);
        })
    }
    else {
      if (req.body._id) {
        TaskService.update(req.body)
          .then(updatedTask => {
            res.status(200).send(updatedTask);
          })
          .catch(err => {
            res.status(400).send(err);
          })
      }
    }
  }
}

function get(req, res) {
  if (req.body) {
    TaskService.getByCreator(req.body.id)
      .then(taskArr => {
        res.status(200).send(taskArr)
      })
      .catch(err => {
        res.status(404).send(err);
      })
  }
}

function getRootByUserId(req, res) {
  console.log('Received get root by user id');
  if (req.body) {
    TaskService.getRootByUserId(req.body.id)
      .then(taskArr => {
        res.status(200).send(taskArr)
      })
      .catch(err => {
        res.status(404).send(err);
      })
  }
}

function getByRoot(req, res) {
  if (req.body) {
    TaskService.getByRoot(req.body.id)
      .then(taskArr => {
        res.status(200).send(taskArr)
      })
      .catch(err => {
        res.status(404).send(err);
      })
  }
}