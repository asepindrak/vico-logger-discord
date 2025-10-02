import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

let logger: any;

try {
  // Coba untuk mengimpor fs, yang hanya ada di server
  const fs = require("fs");
  // === SERVER SIDE LOGGER ===
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
          format.printf(({ level, message, timestamp, stack }) =>
            `${timestamp} ${level}: ${stack || message}`
          )
        ),
      }),
    ],
  });

  // === Hook `.error` untuk kirim semua args ke Discord ===
  if (DISCORD_WEBHOOK_URL) {
    const origError = logger.error.bind(logger);
    logger.error = (...args: any[]) => {
      // 1) Tetap log seperti biasa
      origError(...args);
      // 2) Gabungkan semua argumen jadi satu string
      const text = args.join(" \n--------------------------------------------------------\n");
      // 3) Kirim ke Discord
      axios
        .post(DISCORD_WEBHOOK_URL, {
          content: ["```json", "===SERVER SIDE===\n\n" + text.substring(0, 1800), "```"].join("\n--------------------------------------------------------\n"),
        })
        .catch((e) => console.error("[Discord]", e.message));
    };
  }
} catch (err) {
  // === CLIENT SIDE LOGGER ===
  const sendToDiscord = (message: string) => {
    if (!DISCORD_WEBHOOK_URL) return;
    fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: [
          "```json",
          "===CLIENT SIDE===\n\n" + message.substring(0, 1800),
          "```",
        ].join("\n--------------------------------------------------------\n"),
      }),
    }).catch(() => {
      // ignore fetch error on client
    });
  };

  logger = {
    info: (...args: any[]) => console.log("[client-info]", ...args),
    debug: (...args: any[]) => console.debug("[client-debug]", ...args),
    warn: (...args: any[]) => console.warn("[client-warn]", ...args),
    error: (...args: any[]) => {
      console.error("[client-error]", ...args);
      sendToDiscord(args.join(" \n--------------------------------------------------------\n"));
    },
  };
}

export { logger };
export default logger;
