const express = require('express');
const router = express.Router();
const TaskService = require('../../services/tasks');

router.post('/create', create);
router.post('/get', get);
module.exports = router;

function create(req, res) {
  if (req.body) {
    console.log(req.body);
    const promiseArr = [];
    req.body.tasks.forEach((task) => {
      task.creator = req.body.id;
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
            .then(() => {
              resolve();
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