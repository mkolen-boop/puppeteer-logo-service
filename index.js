const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json({ limit: '1mb' }));

app.post('/logo', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url is required' });

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new'
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({ width: 1440, height: 900 });
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    const logo = await page.evaluate(() => {
      const header = document.querySelector('header');
      if (!header) return null;

      const img = header.querySelector('img');
      if (img?.src) return { type: 'img', value: img.src };

      const svg = header.querySelector('svg');
      if (svg) return { type: 'svg', value: svg.outerHTML };

      return null;
    });

    res.json(logo ?? { error: 'logo not found' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await browser.close();
  }
});

app.listen(3000, () => {
  console.log('Puppeteer logo service running on port 3000');
});
