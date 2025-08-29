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
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_winston = require("winston");
var import_winston_daily_rotate_file = __toESM(require("winston-daily-rotate-file"));
var import_axios = __toESM(require("axios"));
var import_dotenv = __toESM(require("dotenv"));
var import_stream = require("stream");
import_dotenv.default.config();
var DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
var logger = (0, import_winston.createLogger)({
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
      maxFiles: "14d"
    }),
    new import_winston_daily_rotate_file.default({
      filename: "logs/error-%DATE%.log",
      level: "error",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d"
    }),
    new import_winston.transports.Console({
      format: import_winston.format.combine(
        import_winston.format.colorize(),
        import_winston.format.printf(({ level, message, timestamp, stack }) => {
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
      await import_axios.default.post(DISCORD_WEBHOOK_URL, {
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
  const discordStream = new import_stream.Writable({
    write(chunk, encoding, callback) {
      const message = chunk.toString().trim();
      queue.push({ message, callback });
      if (!isProcessing) {
        processQueue();
      }
    }
  });
  logger.add(
    new import_winston.transports.Stream({
      stream: discordStream,
      level: "error"
    })
  );
}
var index_default = logger;
