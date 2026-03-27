# Demo

Bridges Bland AI voice calls and SMS with Telegram, using Claude Agent SDK as the brain.

[Watch it in action](https://www.loom.com/share/387f781f653f4684b40e6075b8be3b22)

## Prerequisites

- Node.js 20+
- Bland AI API key ([get one here](https://app.bland.ai))
- Telegram bot token (create via [@BotFather](https://t.me/BotFather))
- Anthropic API key
- ngrok (for exposing webhooks to the internet)

## Setup

1. Install dependencies:

   ```bash
   cd demo && npm install
   ```

2. Copy `.env.example` to `.env` and fill in your keys:

   ```bash
   cp .env.example .env
   ```

3. Start the server:

   ```bash
   npm run dev
   ```

4. In another terminal, expose the webhook endpoint:

   ```bash
   ngrok http 3000
   ```

5. Configure your Bland inbound number's webhook URL to `https://<ngrok-url>/webhook`

6. Configure your Bland's number's SMS webhook URL to `https://<ngrok-url>/webhook`

7. Message your Telegram bot to start!

## Demo Flow

1. **You → Telegram**: "Schedule a haircut at Luxe Salon for me"
2. **Agent**: Dispatches an outbound call, monitors it, reports back
3. **Salon → Bland inbound**: Calls your number to propose times
4. **Agent → Telegram**: "Luxe Salon offered Thursday 2pm or Friday 10am"
5. **You → Telegram**: "Thursday at 2pm"
6. **Agent**: Calls salon back to confirm, reports result
7. **Salon → SMS**: Sends confirmation text
8. **Agent → Telegram**: "Got SMS confirmation for Thursday 2pm"