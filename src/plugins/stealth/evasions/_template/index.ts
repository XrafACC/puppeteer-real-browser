import { Page } from 'puppeteer-core';

export async function onPageCreated(page: Page) {
   await page.evaluateOnNewDocument(() => {
      console.log('Page created');
   });
}
