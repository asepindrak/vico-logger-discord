import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import axios from "axios";
import dotenv from "dotenv";
import { Writable } from "stream";

dotenv.config();

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

let logger: any;

if (typeof window === "undefined") {
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
      }),
      new DailyRotateFile({
        filename: "logs/error-%DATE%.log",
        level: "error",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "30d",
      }),
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.printf(({ level, message, timestamp, stack }) => {
            return `${timestamp} ${level}: ${stack || message}`;
          })
        ),
      }),
    ],
  });

  // === DISCORD STREAM: kirim error ke Discord (1 pesan per 500ms) ===
  if (DISCORD_WEBHOOK_URL) {
    const queue: Array<{ message: string; callback: () => void }> = [];
    let isProcessing = false;

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const processQueue = async () => {
      if (isProcessing) return;
      isProcessing = true;

      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) continue;

        const { message, callback } = item;
        try {
          await axios.post(DISCORD_WEBHOOK_URL, {
            content: [
              "```json",
              `${message.substring(0, 1800)}`,
              "```",
            ].join("\n"),
          });
        } catch (err: any) {
          console.error("[Discord] Gagal kirim:", err.message);
        } finally {
          callback();
        }

        await delay(500);
      }
      isProcessing = false;
    };

    const discordStream = new Writable({
      write(chunk, encoding, callback) {
        const message = chunk.toString().trim();
        queue.push({ message, callback });
        if (!isProcessing) processQueue().catch(console.error);
      },
    });

    logger.add(
      new transports.Stream({
        stream: discordStream,
        level: "error",
      })
    );
  }
} else {
  // === CLIENT SIDE LOGGER ===
  const sendToDiscord = (message: string) => {
    if (!DISCORD_WEBHOOK_URL) return;
    fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: [
          "```json",
          message.substring(0, 1800),
          "```",
        ].join("\n"),
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
      sendToDiscord(args.join(" "));
    },
  };
}

export default logger;
