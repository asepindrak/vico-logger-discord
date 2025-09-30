// src/index.ts
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
var DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
var logger;
if (typeof window === "undefined") {
  logger = createLogger({
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
        maxFiles: "14d",
        format: format.combine(format.json())
      }),
      new DailyRotateFile({
        filename: "logs/error-%DATE%.log",
        level: "error",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "30d",
        format: format.combine(format.json())
      }),
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.printf(
            ({ level, message, timestamp, stack }) => `${timestamp} ${level}: ${stack || message}`
          )
        )
      })
    ]
  });
  if (DISCORD_WEBHOOK_URL) {
    const origError = logger.error.bind(logger);
    logger.error = (...args) => {
      origError(...args);
      const text = args.join(" \n");
      axios.post(DISCORD_WEBHOOK_URL, {
        content: ["```json", text.substring(0, 1800), "```"].join("\n")
      }).catch((e) => console.error("[Discord]", e.message));
    };
  }
} else {
  const sendToDiscord = (message) => {
    if (!DISCORD_WEBHOOK_URL) return;
    fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: [
          "```json",
          message.substring(0, 1800),
          "```"
        ].join("\n")
      })
    }).catch(() => {
    });
  };
  logger = {
    info: (...args) => console.log("[client-info]", ...args),
    debug: (...args) => console.debug("[client-debug]", ...args),
    warn: (...args) => console.warn("[client-warn]", ...args),
    error: (...args) => {
      console.error("[client-error]", ...args);
      sendToDiscord(args.join(" \n"));
    }
  };
}
var index_default = logger;
export {
  index_default as default,
  logger
};
