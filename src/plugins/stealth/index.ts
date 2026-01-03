import { Page } from 'puppeteer-core';
import { PuppeteerExtraPlugin } from 'puppeteer-extra-plugin';

type StealthOptions = Record<string, unknown>;
/*
export interface StealthOptions {}
*/
export class StealthPlugin extends PuppeteerExtraPlugin<Required<StealthOptions>> {
   _isPuppeteerExtraPlugin = true;
   constructor(opts: StealthOptions = {}) {
      super(opts);
   }

   override get name(): string {
      return 'stealth';
   }

   override get defaults() {
      return {};
   }

   override async onPageCreated(page: Page) {
      await import('./evasions/_template/index').then(({ onPageCreated }) => onPageCreated(page));
      console.log('onPageCreated');
      await page.evaluateOnNewDocument(() => {
         const doc: unknown = globalThis.document;

         if (doc && typeof doc === 'object' && 'body' in doc && doc.body && typeof doc.body === 'object') {
            (doc as { body: { innerHTML: string } }).body.innerHTML = '';
         }
      });
   }
}
export default new StealthPlugin();
