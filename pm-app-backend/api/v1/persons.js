/**
 * @file api/v1/persons.js - the router for person related queries
 */
const express = require('express');
const router = express.Router();
const PersonService = require('../../services/persons');

router.post('/create', create);
router.post('/update', update);
router.post('/remove', remove);
router.post('/query', query);
module.exports = router;

function query(req, res) {
  if (req.body) {
    PersonService.query(req.body)
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
    PersonService.remove(req.body.id)
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
    PersonService.create(req.body)
      .then(newPerosn => {
        res.status(200).send(newPerosn);
      })
      .catch(err => {
        console.error(err);
        res.status(400).send(err);
      })
  }
}

function update(req, res) {
  if (req.body) {
    PersonService.update(req.body)
      .then(res => {
        res.status(200).send(resArr);
      })
      .catch(err => {
        res.status(400).send(err);
      })
  }
}