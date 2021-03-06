const express = require('express');
const router = express.Router();
const UserService = require('../../services/users');

router.post('/authenticate', authenticate);
router.post('/create', create);
module.exports = router;

function authenticate(req, res) {
  if (req.body) {
    UserService.authenticate(req.body.username, req.body.password)
      .then(token => {
        console.log('Token is');
        console.log(token);
        res.status(200).send(token);
        req.session.user = token;
        res.locals.user = token;
      })
      .catch(err => {
        // self-defined error
        if (err.error) {
          res.status(200).send(err);
        }
        else {
          res.status(400).send(err);
        }
      });
  } 
}

function create(req, res) {
    if (req.body) {
        UserService.create(req.body)
        .then(() => {
            res.sendStatus(200);
        })
        .catch(err => {
            res.status(400).send(err);
        })
    }
}

