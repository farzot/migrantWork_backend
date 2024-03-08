const winston = require("winston");
const expressWinston = require("express-winston");
const config = require("config");
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, prettyPrint, json, colorize, metadata } =
  format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp}  ${level}: ${message}`;
});

const yozish = expressWinston.logger({
  transports: [
    new transports.Console(),
  ],
  format: format.combine(timestamp(), prettyPrint(), metadata()),
  meta: true, // optional: control whether you want to log the meta data about the request (default to true)
  msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
  expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
  colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
  ignoreRoute: function (req, res) {
    return false;
  }, // optional: allows to skip some log messages based on request and/or response
});

const xatolar = expressWinston.errorLogger({
  transports: [
    new transports.File({
      filename: "log/exWinsdon.log",
      level: "error",
    }),
  ],
  format: format.combine(format.colorize(), format.json()),
});
module.exports = {
  yozish,
  xatolar,
};
