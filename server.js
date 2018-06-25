const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3001;

// TODO: consider using create-react-app proxy
// TODO: separate backend and front end
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies
app.listen(PORT, () => {
    console.log(`server has been started on localhost:${PORT}`);
});

const baseApiPath = '/api/v1/';
const baseApi = (str) => {
    return baseApiPath.concat(str);
};
app.use(baseApi('users'), require('./api/v1/users'));
app.use(baseApi('tasks'), require('./api/v1/tasks'));