# vico-logger-discord

A logger for Node.js based on Winston:
- Daily logs with automatic rotation
- `error` level logs sent to Discord (if DISCORD_WEBHOOK_WEBHOOKURL is set)
- Colorful output in the console during development

## Installation
```bash
npm install vico-logger
```

## Usage Javascript (ESM)
```js
import logger from "vico-logger";
logger.info("Hello from ESM!");
```

## Usage Javascript (CommonJS)
```js
const logger = require("vico-logger");
logger.error("Hello from CJS!");
```

## Usage TypeScript
```ts
import logger from "vico-logger";
logger.warn("Hello from TS!");
```

## Environment Variable
```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx/yyy
LOG_LEVEL=info
```

## Create a Discord Webhook

- Open Discord → select the server where you want the logs to be sent.

- Go to Server Settings → Integrations → Webhooks.

- Click on New Webhook.

- Give the webhook a name (e.g., Logger Bot) and select the channel where the logs will be sent.

- Click Copy Webhook URL → this will be used as DISCORD_WEBHOOK_URL.


### Example URL:

```bash
https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz
```