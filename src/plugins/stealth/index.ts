import { PuppeteerExtraPlugin } from 'puppeteer-extra-plugin';

export interface StealthOptions {
   enabledEvasions?: Set<string>;
}

export class StealthPlugin extends PuppeteerExtraPlugin<Required<StealthOptions>> {
   _isPuppeteerExtraPlugin = true;
   constructor(opts: StealthOptions = {}) {
      super(opts);
   }

   override get name(): string {
      return 'stealth';
   }

   override get defaults() {
      const availableEvasions = new Set<string>([]);

      return {
         availableEvasions,
         enabledEvasions: new Set(availableEvasions),
      };
   }

   override get dependencies(): Set<string> {
      return new Set([...this.opts.enabledEvasions].map(e => `${this.name}/evasions/${e}`));
   }

   get availableEvasions(): Set<string> {
      return this.defaults.availableEvasions;
   }

   get enabledEvasions(): Set<string> {
      return this.opts.enabledEvasions;
   }

   set enabledEvasions(evasions: Set<string>) {
      this.opts.enabledEvasions = evasions;
   }
}
export default new StealthPlugin();
