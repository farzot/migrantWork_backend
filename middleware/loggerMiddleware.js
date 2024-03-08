const expressWinston = require("express-winston");
const { format, transports } = require("winston");
const { combine, timestamp, prettyPrint, metadata } = format;
const winston = require("winston");
const config = require("config");

const expressWinstonLogger = expressWinston.logger({
  transports: [
    new transports.Console(),
  ],
  format: winston.format.combine(timestamp(), prettyPrint(), metadata()),
  meta: true,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: false,
  ignoreRoute: function (req, res) {
    return false;
  },
});

const expressWinstonErrorLogger = expressWinston.errorLogger({
  transports: [
    new transports.File({
      filename: "log/farzot.log",
      level: "error",
    }),
  ],
  format: format.combine(format.prettyPrint()),
});

module.exports = {
  expressWinstonErrorLogger,
  expressWinstonLogger,
};
