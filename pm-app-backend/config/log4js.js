const config = require('../config.json');

const useFileLogger = config.useFileLogger;

const noFileConfig = {
  "appenders": {
    "access": {
      "type": "stdout",
      "pattern": "-yyyy-MM-dd",
      "category": "http"
    },
    "app": {
      "type": "stdout",
    },
    "errorFile": {
      "type": "stdout",
    },
    "errors": {
      "type": "logLevelFilter",
      "level": "ERROR",
      "appender": "errorFile"
    }
  },
  "categories": {
    "default": { "appenders": [ "app", "errors" ], "level": "DEBUG" },
    "http": { "appenders": [ "access"], "level": "DEBUG" }
  }
};

const normalConfig = {
  "appenders": {
    "access": {
      "type": "dateFile",
      "filename": "log/access.log",
      "pattern": "-yyyy-MM-dd",
      "category": "http"
    },
    "app": {
      "type": "file",
      "filename": "log/app.log"
    },
    "errorFile": {
      "type": "file",
      "filename": "log/errors.log"
    },
    "errors": {
      "type": "logLevelFilter",
      "level": "ERROR",
      "appender": "errorFile"
    }
  },
  "categories": {
    "default": { "appenders": [ "app", "errors" ], "level": "DEBUG" },
    "http": { "appenders": [ "access"], "level": "DEBUG" }
  }
};

module.exports = useFileLogger ? normalConfig : noFileConfig;
