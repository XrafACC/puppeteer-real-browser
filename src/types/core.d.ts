import 'puppeteer-core';
declare module 'puppeteer-core' {
   interface Page {
      waitForTimeout(ms: number): Promise<void>;
   }
}
