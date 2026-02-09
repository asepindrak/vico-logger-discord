import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import dotenv from "dotenv";

dotenv.config();
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

let logger: any;
const isServer = typeof window === "undefined";

if (isServer) {
  try {
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
          format: format.combine(
            format.timestamp(),
            format.prettyPrint()
          ),
        }),
        new transports.Console({
          format: format.combine(
            format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            format.colorize(),
            format.printf((info) => {
              const { timestamp, level, message } = info;
              return `${timestamp} ${level}:\n${message}`;
            })
          ),
        }),
      ],
    });

    // === Hook `.error` untuk kirim semua args ke Discord ===
    if (DISCORD_WEBHOOK_URL) {
      const origError = logger.error.bind(logger);

      logger.error = (...args: any[]) => {
        const serialized = args
          .map((arg) => {
            if (arg instanceof Error) {
              return arg.stack || arg.message;
            }
            if (typeof arg === "object") {
              try {
                return JSON.stringify(arg, null, 2);
              } catch {
                return String(arg);
              }
            }
            return String(arg);
          })
          .join("\n--------------------------------------------------------\n");

        // kirim 1 message ke winston (biar console/file log lengkap)
        origError(serialized);

        // kirim ke discord
        sendToDiscord(serialized, false);
      };
    }
  } catch (err) {
    console.error("Failed to load file system module:", err);
  }
} else {
  // === CLIENT SIDE LOGGER ===

  logger = {
    info: (...args: any[]) => console.log("[client-info]", ...args),
    debug: (...args: any[]) => console.debug("[client-debug]", ...args),
    warn: (...args: any[]) => console.warn("[client-warn]", ...args),
    error: (...args: any[]) => {
      console.error("[client-error]", ...args);
      sendToDiscord(args.join(" \n--------------------------------------------------------\n"), true);
    },
  };
}


const sendToDiscord = (message: string, isClient: boolean) => {
  if (!DISCORD_WEBHOOK_URL) return;
  let type = isClient ? "===CLIENT SIDE===\n\n" : "===SERVER SIDE===\n\n";

  fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: [
        "```json",
        type + message.substring(0, 1800),
        "```",
      ].join("\n--------------------------------------------------------\n"),
    }),
  }).catch(() => {
    // ignore fetch error on client
  });
};

export { logger };
export default logger;
