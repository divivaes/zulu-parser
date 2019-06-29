const winston = require('winston')
const moment = require('moment')
const settings = require('./config')

const tsFormat = () =>
  moment()
    .format('YYYY-MM-DD hh:mm:ss')
    .trim()

const logger = new winston.createLogger({
  exitOnError: false,
  levels: settings.logger.customLevels.levels,
  colors: settings.logger.customLevels.colors,
  transports: [
    new winston.transports.Console({
      level: 'info',
      handleExceptions: true,
      prettyPrint: true,
      silent: false,
      timestamp: tsFormat,
      colorize: true,
      json: false
    }),
    new winston.transports.File({
      filename: './' + settings.logger.debugFileName,
      name: 'debug-info',
      level: 'info',
      timestamp: tsFormat,
      maxsize: 5555242880,
      maxFiles: 10,
      handleExceptions: true,
      json: false
    })
  ]
})

module.exports = {
  logger: logger
}
module.exports.stream = {
  write: function(message, encoding) {
    logger.server(message.trim())
  }
}
