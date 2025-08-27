require('dotenv').config()
const { createLogger, format, transports } = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')
const axios = require('axios')

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || null

const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.json()
    ),
    transports: [
        new DailyRotateFile({
            filename: 'logs/app-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        }),
        new DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d'
        }),
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.printf(({ level, message, timestamp, stack }) => {
                    return `${timestamp} ${level}: ${stack || message}`
                })
            )
        })
    ]
})

// Tambahkan Discord alert hanya jika URL tersedia
if (DISCORD_WEBHOOK_URL) {
    const discordTransport = new transports.Stream({
        stream: {
            write: (message) => {
                axios.post(DISCORD_WEBHOOK_URL, {
                    content: `⚠️ **Error Log:** ${message}`
                }).catch(() => { })
            }
        },
        level: 'error'
    })
    logger.add(discordTransport)
}

module.exports = logger
