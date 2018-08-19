const express = require('express');
const path = require('path');
const cors = require('cors');
const log4js = require('log4js');
const bodyParser = require('body-parser');
const session = require('express-session');
const _ = require('lodash');
const app = express();

// set up logger configuration
const loggerConfig = require('./config/log4js');
log4js.configure(loggerConfig);
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
app.use(baseApi('log'), express.static(path.join(__dirname, '/log')));

const buildRouters = actionType => {
  if (_.isArray(actionType)) {
    _.forEach(actionType, item => {
      buildRouters(item);
    });
  }
  else {
    app.use(baseApi(actionType), require(`.${baseApiPath}${actionType}`));
  }
};
buildRouters(['users', 'tasks', 'persons', 'actions']);

app.listen(PORT, () => {
  logger.$trace(`server has been started on localhost:${PORT}`);
});