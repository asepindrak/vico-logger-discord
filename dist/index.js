"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const stream_1 = require("stream");
dotenv_1.default.config();
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || null;
const logger = (0, winston_1.createLogger)({
    level: process.env.LOG_LEVEL || "info",
    format: winston_1.format.combine(winston_1.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.format.errors({ stack: true }), winston_1.format.json()),
    transports: [
        new winston_daily_rotate_file_1.default({
            filename: "logs/app-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d"
        }),
        new winston_daily_rotate_file_1.default({
            filename: "logs/error-%DATE%.log",
            level: "error",
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "30d"
        }),
        new winston_1.transports.Console({
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.printf(({ level, message, timestamp, stack }) => {
                return `${timestamp} ${level}: ${stack || message}`;
            }))
        })
    ]
});
// Tambahkan transport Discord kalau ada webhook
if (DISCORD_WEBHOOK_URL) {
    const discordStream = new stream_1.Writable({
        write(chunk, encoding, callback) {
            const message = chunk.toString();
            axios_1.default.post(DISCORD_WEBHOOK_URL, {
                content: `⚠️ **Error Log:** ${message}`
            }).catch(() => { });
            callback();
        }
    });
    const discordTransport = new winston_1.transports.Stream({
        stream: discordStream,
        level: "error"
    });
    logger.add(discordTransport);
}
exports.default = logger; // untuk import
module.exports = logger; // untuk require
