import realbrowser from '../dist/index.js';

let browser = new realbrowser();
browser.launch().then(async browser => {
   const page = await browser.newPage();
   await page.goto('https://example.com');
   await page.screenshot({ path: 'example.png' });
   await browser.close();
});
