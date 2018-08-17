const express = require('express');
const path = require('path');
const cors = require('cors');
const log4js = require('log4js');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

// set up logger configuration
log4js.configure('./config/log4js.json');
const logger = require('./common/logger');

const PORT = process.env.PORT || 3001;

app.use(log4js.connectLogger(log4js.getLogger('http'), { level: 'auto' }));
app.use(cors());
app.use(bodyParser.json());
// to support URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); 
// TODO: session management
app.use(session({
  secret: 'sessiontest', // 与cookieParser中的一致
  resave: true,
  saveUninitialized:true
 }));

// app.use('/public', express.static(path.join(__dirname, '/pm-app/build')));
// app.get('/', (req, res) => {
//   res.sendFile(path.join(`${__dirname}/pm-app/build/index.html`));
// });

const baseApiPath = '/api/v1/';
const baseApi = str => baseApiPath.concat(str);
app.use(baseApi('users'), require(`.${baseApiPath}users`));
app.use(baseApi('tasks'), require(`.${baseApiPath}tasks`));
app.use(baseApi('persons'), require(`.${baseApiPath}persons`));
app.use(baseApi('actions'), require(`.${baseApiPath}actions`));

app.listen(PORT, () => {
  logger.$trace(`server has been started on localhost:${PORT}`);
});