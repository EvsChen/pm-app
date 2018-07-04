const express = require('express');
const _ = require('lodash');
const router = express.Router();
const ActionService = require('../../services/actions');

router.post('/create', create);
router.post('/update', update);
router.post('/remove', remove);
router.post('/query', query);
module.exports = router;

function query(req, res) {
  if (req.body) {
    ActionService.query(req.body)
      .then(result => {
        res.status(200).send(result);
      })
      .catch(err => {
        console.log(err);
        res.status(400).send(err);
      });
  }
  else {
    res.status(400).send(new Error('Invalid request body'));
  }
}

function remove(req, res) {
  if (req.body) {
    ActionService.remove(req.body.id)
      .then(result => {
        res.status(200).send(result);
      })
      .catch(err => {
        console.log(err);
        res.status(400).send(err);
      });
  }
  else {
    res.status(400).send(new Error('Invalid request body'));
  }
}

function create(req, res) {
  if (req.body) {
    console.log(req.body);
    ActionService.create(req.body)
      .then(result => {
        res.status(200).send(result);
      })
      .catch(err => {
        res.status(400).send(err);
      });
  }
  else {
    res.status(400).send(new Error('Invalid request body'));
  }
}

function update(req, res) {
  if (req.body && req.body._id) {
    ActionService.update(req.body)
      .then(updatedDoc => {
        res.status(200).send(updatedDoc);
      })
      .catch(err => {
        res.status(400).send(err);
      })
  }
  else {
    res.status(400).send(new Error('Invalid request body'));
  }
}