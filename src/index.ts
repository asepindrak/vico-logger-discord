import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import axios from "axios";
import dotenv from "dotenv";
import { Writable } from "stream";

dotenv.config();

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || null;

const logger = createLogger({
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

// Tambahkan transport Discord kalau ada webhook
if (DISCORD_WEBHOOK_URL) {

    const discordStream = new Writable({
        write(chunk, encoding, callback) {
            const message = chunk.toString();
            axios.post(DISCORD_WEBHOOK_URL, {
                content: `⚠️ **Error Log:** ${message}`
            }).catch(() => { });
            callback();
        }
    });

    const discordTransport = new transports.Stream({
        stream: discordStream,
        level: "error"
    });
    logger.add(discordTransport);
}

export default logger;  // untuk import
module.exports = logger; // untuk require
