# vico-logger-discord

A logger for Node.js based on Winston:
- Daily logs with automatic rotation
- `error` level logs sent to Discord (if DISCORD_WEBHOOK_WEBHOOKURL is set)
- Colorful output in the console during development

## Installation
```bash
npm install vico-logger-discord
```

## Usage Javascript (ESM)
```js
import logger from "vico-logger-discord";
logger.info("Hello from ESM!");
```

## Usage Javascript (CommonJS)
```js
const logger = require("vico-logger-discord");
logger.error("Hello from CJS!");
```

## Usage TypeScript
```ts
import logger from "vico-logger-discord";
logger.warn("Hello from TS!");
```

## Environment Variable
```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx/yyy
LOG_LEVEL=info
```