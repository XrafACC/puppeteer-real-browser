import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { addExtra, PuppeteerExtra, PuppeteerExtraPlugin, VanillaPuppeteer } from 'puppeteer-extra';

interface LaunchOpts {
   plugins: PuppeteerExtraPlugin[];
}

export class HeadlessBrowser {
   browser!: PuppeteerExtra;
   constructor() {
      //Empty
   }
   async launch(opts: LaunchOpts) {
      const executablePath = await chromium.executablePath();

      const chromium_args = chromium.args;
      const browser = await puppeteer.launch({
         ignoreDefaultArgs: true,
         executablePath: executablePath,
         args: chromium_args,
      });

      const extra = addExtra(browser as unknown as VanillaPuppeteer);

      if (opts.plugins.length > 0) {
         for (const item of opts.plugins) {
            extra.use(item);
         }
      }
      this.browser = extra;
      return browser;
   }
}
