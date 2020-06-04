const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.errors({ stack: true }), // <-- use errors format
    winston.format.colorize(),
    // winston.format.timestamp(),
    winston.format.prettyPrint()
  ),
  // defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log` 
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({ filename: './log/error.log', level: 'error' }),
    new winston.transports.File({ filename: './log/combined.log' })
  ]
});
 
//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// 
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.errors({ stack: true }), // <-- use errors format
      winston.format.colorize(),
      // winston.format.timestamp(),
      winston.format.prettyPrint(),
      winston.format.simple()
    ),
  }));
}

module.exports = logger;