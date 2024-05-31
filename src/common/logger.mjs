import fs from "fs";
import path from "path";
import moment from "moment-timezone";

import { app } from "electron";
import { format } from "logform";
import winston from "winston";

// Ensure the log directory exists
const loggingDirectory = path.join(app.getPath("userData"), "logs");
if (!fs.existsSync(loggingDirectory)) {
  fs.mkdirSync(loggingDirectory, { recursive: true });
}

// configure timestamp to NY/EST. Yes, this is just for me. Post release we can do a relative
// timestamp for folks so the end-user isn't sad.
const localTimeZone = "America/New_York";
const timestampFormat = () =>
  moment().tz(localTimeZone).format("YYYY-MM-DD HH:mm:ss");

// Configure the log format
const alignedWithColorsAndTime = format.combine(
  format.colorize(),
  format.timestamp({ format: timestampFormat }),
  format.align(),
  format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

// Create the logger
const logger = winston.createLogger({
  level: "debug",
  format: alignedWithColorsAndTime,
  transports: [
    new winston.transports.File({
      filename: path.join(loggingDirectory, "error.log"),
      level: "error",
      handleExceptions: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(loggingDirectory, "combined.log"),
      handleExceptions: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production, log to console as well
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.json(),
    })
  );
}

// Override console methods for imported libraries like Phaser
console.log = (...args) => {
  logger.info(args.join(" "));
};
console.error = (...args) => {
  logger.error(args.join(" "));
};
console.warn = (...args) => {
  logger.warn(args.join(" "));
};
console.info = (...args) => {
  logger.info(args.join(" "));
};

logger.info(`Logger ready. Logs are in ${loggingDirectory}`);

export { logger, loggingDirectory };
