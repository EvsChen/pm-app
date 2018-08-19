const log4js = require('log4js');
// ALL < TRACE < DEBUG < INFO < WARN < ERROR < FATAL < MARK 

const logger = log4js.getLogger();
logger.$error = err => {
  console.log(err);
  if (err instanceof Error) {
    logger.error(`${err.name}: ${err.message}`);
  }
  else if (err.message) {
    logger.error(err.message);
  }
  else {
    logger.error('Failure. See the console for more info');
  }
};
logger.$info = (...args) => {
  logger.info(...args);
  console.log(...args);
}
logger.$trace = (...args) => {
  logger.trace(...args);
  console.log(...args);
};
logger.$debug = logger.debug;
logger.$warn = logger.warn;
logger.$fatal = logger.fatal;
module.exports = logger;
// logger.trace('Entering cheese testing');
// logger.debug('Got cheese.');
// logger.info('Cheese is Comté.');
// logger.warn('Cheese is quite smelly.');
// logger.error('Cheese is too ripe!');
// logger.fatal('Cheese was breeding ground for listeria.');