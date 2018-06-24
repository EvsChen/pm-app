const express = require('express');
const router = express.Router();
const TaskService = require('../../services/tasks');

router.post('/create', create);
module.exports = router;

function create(req, res) {
    if (req.body) {
        TaskService.create(req.body)
        .then(() => {
            res.sendStatus(200);
        })
        .catch(err => {
            res.status(400).send(err);
        })
    }
}

