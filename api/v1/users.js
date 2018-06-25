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
                res.status(200).send(token);
            })
            .catch(err => {
                res.status(400).send(err);
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

