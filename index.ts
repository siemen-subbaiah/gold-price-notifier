/**
 * DISCLAIMER:
 * This script fetches publicly available gold price data from third-party websites
 * for personal and educational use only.
 *
 * All data belongs to their respective owners.
 * Source website: https://www.goodreturns.in
 *
 * This project is not affiliated with or endorsed by Greynium Information Technologies.
 *
 * Data Source: goodreturns.in (publicly accessible data)
 */

import puppeteer from 'puppeteer';

async function sendTelegramMessage(message: string): Promise<void> {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });
  } catch (error) {
    console.error('Failed to send Telegram message:', (error as Error).message);
  }
}

async function getGoldPrices(): Promise<void> {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  try {
    console.log('Fetching gold prices from Good Returns...');
    await page.goto('https://www.goodreturns.in/gold-rates/bangalore.html', {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });

    console.log('Waiting for page to fully load...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const goldData = await page.evaluate(() => {
      let section = document.querySelector('section[class*="gold_table_sec5"]');

      if (!section) {
        const headings = Array.from(document.querySelectorAll('h2'));
        const targetHeading = headings.find((h) =>
          h.textContent.includes('Gold Rate in Bangalore for Last 10 Days')
        );
        if (targetHeading) {
          section = targetHeading.closest('section');
        }
      }

      if (!section) {
        return { error: 'Section not found' };
      }

      const tbody = section.querySelector('tbody');
      if (!tbody) {
        return { error: 'Tbody not found' };
      }

      const rows = tbody.querySelectorAll('tr');
      if (rows.length < 2) {
        return { error: `Not enough rows: ${rows.length}` };
      }

      const todayRow = rows[0];
      if (!todayRow) {
        return { error: 'Today row not found' };
      }
      const todayCells = todayRow.querySelectorAll('td');
      if (todayCells.length < 2) {
        return { error: 'Not enough cells in today row' };
      }
      const todayDate = todayCells[0]?.textContent?.trim() || '';
      const todayPrice =
        todayCells[1]?.textContent?.trim()?.split('\n')[0]?.trim() || '';

      const yesterdayRow = rows[1];
      if (!yesterdayRow) {
        return { error: 'Yesterday row not found' };
      }
      const yesterdayCells = yesterdayRow.querySelectorAll('td');
      if (yesterdayCells.length < 2) {
        return { error: 'Not enough cells in yesterday row' };
      }
      const yesterdayDate = yesterdayCells[0]?.textContent?.trim() || '';
      const yesterdayPrice =
        yesterdayCells[1]?.textContent?.trim()?.split('\n')[0]?.trim() || '';

      return {
        today: {
          date: todayDate,
          price: todayPrice,
        },
        yesterday: {
          date: yesterdayDate,
          price: yesterdayPrice,
        },
      };
    });

    await browser.close();

    if (!goldData || goldData.error || !goldData.today || !goldData.yesterday) {
      const errorMsg = `*Gold Price Scraper Error*\n\n${
        goldData?.error || 'Could not find data'
      }`;
      await sendTelegramMessage(errorMsg);
      console.log('Could not find gold price data on the page.');
      if (goldData && goldData.error) {
        console.log('Error:', goldData.error);
      }
      return;
    }

    const todayPriceNum = parseInt(goldData.today.price.replace(/[₹,]/g, ''));
    const yesterdayPriceNum = parseInt(
      goldData.yesterday.price.replace(/[₹,]/g, '')
    );
    const difference = todayPriceNum - yesterdayPriceNum;

    let changeEmoji = '➡️';
    let changeText = 'No change';
    if (difference > 0) {
      changeEmoji = '📈';
      changeText = `₹${difference} (Gain)`;
    } else if (difference < 0) {
      changeEmoji = '📉';
      changeText = `₹${Math.abs(difference)} (Loss)`;
    }

    const message = `
🏆 *Gold Price Update - Bangalore*

📅 *Today* (${goldData.today.date})
💰 ${goldData.today.price}

📅 *Yesterday* (${goldData.yesterday.date})
💰 ${goldData.yesterday.price}

${changeEmoji} *Change:* ${changeText}

_Source: goodreturns.in (publicly available data)_`.trim();

    await sendTelegramMessage(message);

    console.log('\n========== Gold Price (24K - 1 gram) ==========');
    console.log(
      `Today's price - ${goldData.today.price} (${goldData.today.date})`
    );
    console.log(
      `Yesterday's price - ${goldData.yesterday.price} (${goldData.yesterday.date})`
    );

    if (difference > 0) {
      console.log(`Gain/Loss - ₹${difference} (Gain)`);
    } else if (difference < 0) {
      console.log(`Gain/Loss - ₹${Math.abs(difference)} (Loss)`);
    } else {
      console.log(`Gain/Loss - ₹0 (No change)`);
    }
    console.log('==============================================\n');
  } catch (error) {
    const errorMsg = `*Gold Price Scraper Error*\n\n${
      (error as Error).message
    }`;
    await sendTelegramMessage(errorMsg);
    console.error('Error fetching gold prices:', (error as Error).message);
    await browser.close();
  }
}

getGoldPrices();
