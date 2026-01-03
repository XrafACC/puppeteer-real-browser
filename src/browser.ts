import chromium from '@sparticuz/chromium';
import puppeteer, { Browser } from 'puppeteer-core';

export class HeadlessBrowser {
   browser: Browser;
   constructor() {
      const chromium_args = chromium.args;
      console.log('chromium_args:', chromium_args);
   }
   async launch() {
      const executablePath = await chromium.executablePath();
      const browser = await puppeteer.launch({
         executablePath: executablePath,
         args: chromium.args,
      });
      this.browser = browser;
      return browser;
   }
}
