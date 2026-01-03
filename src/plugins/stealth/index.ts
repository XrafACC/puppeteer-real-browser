import { Page } from 'puppeteer-core';
import { PuppeteerExtraPlugin } from 'puppeteer-extra-plugin';

type StealthOptions = Record<string, unknown>;
/*
export interface StealthOptions {}
*/
export class StealthPlugin extends PuppeteerExtraPlugin {
   constructor(opts: Partial<StealthOptions> = {}) {
      super(opts);
   }

   onPluginRegistered() {
      this.debug('StealthPlugin initialized');
      return Promise.resolve();
   }

   override get name(): string {
      return 'stealth';
   }

   override get defaults() {
      return {};
   }

   async onPageCreated(page: Page) {
      console.log('onPageCreated');
      await page.evaluateOnNewDocument(() => {
         const doc: unknown = globalThis.document;

         if (doc && typeof doc === 'object' && 'body' in doc && doc.body && typeof doc.body === 'object') {
            (doc as { body: { innerHTML: string } }).body.innerHTML = '';
         }
      });
   }
}
export default function (pluginConfig: Partial<StealthOptions> = {}) {
   return new StealthPlugin(pluginConfig);
}
