# vico-logger-discord

A powerful Node.js logger built on **Winston**, designed for development and production:

- Daily log rotation for easy management
- Sends `error` level logs (and optionally other levels) to Discord via webhook
- Colorized console output for better readability during development
- Fully compatible with **ESM**, **CommonJS**, and **TypeScript**

---

## Installation

```bash
npm install vico-logger
```

---

## Usage

### JavaScript (ESM)
```js
import logger from "vico-logger";

logger.info("Hello from ESM!");
logger.error("This will also send to Discord if webhook is set.");
```

### JavaScript (CommonJS)
```js
const logger = require("vico-logger");

logger.warn("Hello from CJS!");
logger.debug("This is a debug message.");
```

### TypeScript
```ts
import logger from "vico-logger";

logger.verbose("Verbose log example");
logger.silly("Silly log example for testing purposes");
```

---

## Environment Variables

```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx/yyy
LOG_LEVEL=info
```

- `DISCORD_WEBHOOK_URL`: Your Discord webhook URL (optional, only needed if you want error logs sent to Discord)
- `LOG_LEVEL`: Minimum log level to log (default: `info`)

---

## Winston Log Levels

vico-logger supports all default Winston log levels:

| Level      | Numeric | Description                                                      |
|------------|---------|------------------------------------------------------------------|
| `error`    | 0       | Critical errors, sent to Discord if webhook is configured        |
| `warn`     | 1       | Warnings, important but non-critical issues                     |
| `info`     | 2       | General operational messages, e.g., server start, requests      |
| `http`     | 3       | HTTP requests logs                                               |
| `verbose`  | 4       | Detailed logs for debugging                                       |
| `debug`    | 5       | Debug messages for development                                    |
| `silly`    | 6       | Extremely detailed, usually only for testing and experimentation |

> You can use any of these levels via `logger.level("info")` or directly:  
> ```ts
> logger.error("Critical error");
> logger.debug("Debugging info");
> ```

---

## Create a Discord Webhook

1. Open Discord and select the server where you want the logs to appear.
2. Go to **Server Settings → Integrations → Webhooks**.
3. Click **New Webhook**.
4. Give it a name (e.g., `Logger Bot`) and select the channel for logs.
5. Click **Copy Webhook URL** → set it as `DISCORD_WEBHOOK_URL` in your `.env` file.

### Example URL

```bash
https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz
```

---

## Example: Sending Logs to Discord

```ts
import logger from "vico-logger";

// This will appear in console and on Discord if level is 'error'
logger.error("Database connection failed!");

// Other levels will only appear in console by default
logger.info("Server started on port 3000");
```

---

This README now provides clear guidance for:

- Installation & usage (ESM, CJS, TypeScript)  
- Environment variables setup  
- All Winston log levels and their purpose  
- Discord webhook setup and usage
