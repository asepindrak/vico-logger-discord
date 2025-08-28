// src/index.ts
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import axios from "axios";
import dotenv from "dotenv";
import { Writable } from "stream";
dotenv.config();
var DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || null;
var queue = [];
var isSending = false;
var delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: "logs/app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d"
    }),
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      level: "error",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d"
    }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp, stack }) => {
          return `${timestamp} ${level}: ${stack || message}`;
        })
      )
    })
  ]
});
if (DISCORD_WEBHOOK_URL) {
  const discordStream = new Writable({
    write(chunk, encoding, callback) {
      queue.push(chunk.toString());
      processQueue();
      callback();
    }
  });
  const processQueue = async () => {
    if (isSending || queue.length === 0) {
      return;
    }
    isSending = true;
    while (queue.length > 0) {
      const message = queue.shift();
      try {
        await axios.post(DISCORD_WEBHOOK_URL, {
          content: `\u26A0\uFE0F **Error Log:** ${message}`
        });
        await delay(1e3);
      } catch (error) {
        console.error("Failed to send log to Discord:", error);
      }
    }
    isSending = false;
  };
  const discordTransport = new transports.Stream({
    stream: discordStream,
    level: "error"
  });
  logger.add(discordTransport);
}
var index_default = logger;
export {
  index_default as default
};
