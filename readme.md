# gold-price-notifier

A simple Bun script that fetches publicly available gold price information
and sends daily updates to a Telegram bot.

## How it works

- Runs once per day (via cron)
- Extracts the latest 24K gold price for Bangalore
- Sends today vs yesterday comparison to Telegram

## Setup Instructions

### 1. Install Dependencies

```bash
bun install
```

### 2. Create a Telegram Bot

1. **Open Telegram** and search for `@BotFather`
2. **Start a chat** and send `/newbot`
3. **Follow the prompts:**
   - Choose a name for your bot (e.g., "Gold Price Notifier")
   - Choose a username (must end in 'bot', e.g., "gold_price_tracker_bot")
4. **Copy the Bot Token** - You'll receive something like:
   ```
   123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   ```
   This is your `TELEGRAM_BOT_TOKEN`

### 3. Get Your Chat ID

1. **Start your bot** - Search for your bot username in Telegram and click "Start"
2. **Send any message** to your bot (e.g., "Hello")
3. **Open this URL** in your browser (replace `<YOUR_BOT_TOKEN>` with your actual token):
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
4. **Find your Chat ID** in the response - Look for:
   ```json
   "chat":{"id":123456789}
   ```
   The number after `"id":` is your `TELEGRAM_CHAT_ID`

### 4. Set Up Environment Variables

#### For Local Testing:

Create a `.env` file in the project root:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

#### For GitHub Actions:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add two secrets:
   - Name: `TELEGRAM_BOT_TOKEN`, Value: (your bot token)
   - Name: `TELEGRAM_CHAT_ID`, Value: (your chat ID)

### 5. Test Locally

```bash
bun run index.ts
```

You should receive a Telegram notification with the current gold price!

## Data Source

This project fetches publicly accessible gold price data from:

- https://www.goodreturns.in

## Disclaimer

This project is intended for personal and educational use only.

All data remains the property of their respective owners.
This project is not affiliated with, endorsed by, or officially connected to
Greynium Information Technologies Pvt. Ltd. or goodreturns.in.

If you are a rights holder and believe this project violates your terms,
please open an issue or contact the maintainer for prompt resolution.
