import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { addExtra, PuppeteerExtra, PuppeteerExtraPlugin, VanillaPuppeteer } from 'puppeteer-extra';

import Stealth from './plugins/stealth/index';
interface LaunchOpts {
   plugins: PuppeteerExtraPlugin[];
}

const defaultConfig = { plugins: [] };

export class HeadlessBrowser {
   browser!: PuppeteerExtra;
   constructor() {
      //Empty
   }
   async launch(opts: LaunchOpts = defaultConfig) {
      const options = { ...defaultConfig, ...opts };
      const executablePath = await chromium.executablePath();

      const chromium_args = puppeteer.defaultArgs({ args: chromium.args, headless: 'shell' });
      const browser = await puppeteer.launch({
         headless: 'shell',
         executablePath: executablePath,
         ignoreDefaultArgs: true,
         args: chromium_args,
      });
      const extra = addExtra(browser as unknown as VanillaPuppeteer);

      extra.use(Stealth());
      if (options.plugins.length > 0) {
         for (const item of options.plugins) {
            extra.use(item);
         }
      }
      this.browser = extra;
      return browser;
   }
}
