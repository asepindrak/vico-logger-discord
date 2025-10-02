"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default,
  logger: () => logger
});
module.exports = __toCommonJS(index_exports);
var import_winston = require("winston");
var import_winston_daily_rotate_file = __toESM(require("winston-daily-rotate-file"));
var import_dotenv = __toESM(require("dotenv"));
import_dotenv.default.config();
var DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
var logger;
var isServer = typeof window === "undefined";
if (isServer) {
  try {
    logger = (0, import_winston.createLogger)({
      level: process.env.LOG_LEVEL || "info",
      format: import_winston.format.combine(
        import_winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        import_winston.format.errors({ stack: true }),
        import_winston.format.json()
      ),
      transports: [
        new import_winston_daily_rotate_file.default({
          filename: "logs/app-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          zippedArchive: true,
          maxSize: "20m",
          maxFiles: "14d",
          format: import_winston.format.combine(import_winston.format.json())
        }),
        new import_winston_daily_rotate_file.default({
          filename: "logs/error-%DATE%.log",
          level: "error",
          datePattern: "YYYY-MM-DD",
          zippedArchive: true,
          maxSize: "20m",
          maxFiles: "30d",
          format: import_winston.format.combine(import_winston.format.json())
        }),
        new import_winston.transports.Console({
          format: import_winston.format.combine(
            import_winston.format.colorize(),
            import_winston.format.printf(
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
        sendToDiscord(args.join(" \n--------------------------------------------------------\n"), false);
      };
    }
  } catch (err) {
    console.error("Failed to load file system module:", err);
  }
} else {
  logger = {
    info: (...args) => console.log("[client-info]", ...args),
    debug: (...args) => console.debug("[client-debug]", ...args),
    warn: (...args) => console.warn("[client-warn]", ...args),
    error: (...args) => {
      console.error("[client-error]", ...args);
      sendToDiscord(args.join(" \n--------------------------------------------------------\n"), true);
    }
  };
}
var sendToDiscord = (message, isClient) => {
  if (!DISCORD_WEBHOOK_URL) return;
  let type = isClient ? "===CLIENT SIDE===\n\n" : "===SERVER SIDE===\n\n";
  fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: [
        "```json",
        type + message.substring(0, 1800),
        "```"
      ].join("\n--------------------------------------------------------\n")
    })
  }).catch(() => {
  });
};
var index_default = logger;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  logger
});
