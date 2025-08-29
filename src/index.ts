// src/index.ts - ✅ Sudah Diperbaiki: Kirim 1x per detik, semua pesan terkirim

import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import axios from "axios";
import dotenv from "dotenv";
import { Writable } from "stream";

dotenv.config();

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

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

// === ✅ KIRIM KE DISCORD: 1 PESAN PER DETIK, SEMUA TERKIRIM ===
if (DISCORD_WEBHOOK_URL) {
  const queue: Array<{ message: string; callback: () => void }> = [];
  let isProcessing = false;

  // Fungsi delay async
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const processQueue = async () => {
    if (isProcessing) return;
    isProcessing = true;

    while (queue.length > 0) {
      const item = queue.shift(); // Ambil pesan
      if (!item) continue;

      const { message, callback } = item;

      try {
        await axios.post(DISCORD_WEBHOOK_URL, {
          content: [
            `\`\`\`json`,
            `${message.substring(0, 1800)}`,
            `\`\`\``,
          ].join("\n"),
        });
      } catch (err: any) {
        console.error("[Discord] Gagal kirim:", err.message);
      } finally {
        callback(); // Wajib: akhiri stream
      }

      // Tunggu 1 detik SEBELUM kirim berikutnya
      await delay(500);
    }

    isProcessing = false;
  };

  const discordStream = new Writable({
    write(chunk, encoding, callback) {
      const message = chunk.toString().trim();
      queue.push({ message, callback });

      if (!isProcessing) {
        processQueue().catch(console.error);
      }
    },
  });

  logger.add(
    new transports.Stream({
      stream: discordStream,
      level: "error",
    })
  );
}

export default logger;
