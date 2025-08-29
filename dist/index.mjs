// src/index.ts
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import axios from "axios";
import dotenv from "dotenv";
import { Writable } from "stream";
dotenv.config();
var DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
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
  const queue = [];
  let isProcessing = false;
  const processQueue = async () => {
    if (isProcessing) return;
    if (queue.length === 0) {
      isProcessing = false;
      return;
    }
    isProcessing = true;
    const { message, callback } = queue.shift();
    try {
      await axios.post(DISCORD_WEBHOOK_URL, {
        content: `\u26A0\uFE0F **Log Error**
\`\`\`json
${message.substring(
          0,
          1800
        )}
\`\`\``
      });
    } catch (err) {
      console.error("[Discord] Gagal kirim:", err.message);
    } finally {
      callback();
      setTimeout(processQueue, 1e3);
    }
  };
  const discordStream = new Writable({
    write(chunk, encoding, callback) {
      const message = chunk.toString().trim();
      queue.push({ message, callback });
      if (!isProcessing) {
        processQueue();
      }
    }
  });
  logger.add(
    new transports.Stream({
      stream: discordStream,
      level: "error"
    })
  );
}
var index_default = logger;
export {
  index_default as default
};
