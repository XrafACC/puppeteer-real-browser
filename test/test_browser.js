import realbrowser from '../dist/index.js';

let browser = new realbrowser();
browser.launch().then(async browser => {
   const page = await browser.newPage();
   await page.goto('https://bot.sannysoft.com');

   await page.waitForTimeout(5000);
   await page.screenshot({ path: './test/result.png', fullPage: true });
   await browser.close();
});
