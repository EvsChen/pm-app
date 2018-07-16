const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

const PORT = process.env.PORT || 3001;
console.log(`The port is ${PORT}`);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies
// TODO: session management
app.use(session({
  secret: 'sessiontest', // 与cookieParser中的一致
  resave: true,
  saveUninitialized:true
 }));

app.use('/public', express.static(path.join(__dirname, '/pm-app/build')));
app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/pm-app/build/index.html`));
});

const baseApiPath = '/api/v1/';
const baseApi = str => baseApiPath.concat(str);
app.use(baseApi('users'), require('./api/v1/users'));
app.use(baseApi('tasks'), require('./api/v1/tasks'));
app.use(baseApi('persons'), require('./api/v1/persons'));
app.use(baseApi('actions'), require('./api/v1/actions'));

app.listen(PORT, () => {
  console.log(`server has been started on localhost:${PORT}`);
});