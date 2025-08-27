# vico-logger

Logger untuk Node.js berbasis Winston:
- Log harian dengan rotasi otomatis
- Level `error` dikirim ke Discord (jika DISCORD_WEBHOOK_URL diset)
- Output berwarna di console saat development

## Instalasi
```bash
npm install vico-logger


## Cara Pakai
const logger = require('custom-logger');

logger.info("Server starting...");
logger.warn("Disk space is low!");
logger.error(new Error("Database connection failed"));