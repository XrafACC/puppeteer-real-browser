declare module 'puppeteer-extra-plugin' {
   export type PluginRequirements = 'launch' | 'headful' | 'dataFromPlugins' | 'runLast';

   export abstract class PuppeteerExtraPlugin<TOpts = Record<string, unknown>> {
      _isPuppeteerExtraPlugin: boolean;
      protected constructor(opts?: Partial<TOpts>);

      get name(): string;
      get defaults(): Partial<TOpts>;
      get opts(): TOpts;

      get requirements(): Set<PluginRequirements>;
      get dependencies(): Set<string>;
      get data(): { name: string; value: unknown }[];

      get debug(): (...args: unknown[]) => void;

      beforeLaunch?(options: unknown): Promise<void>;
      afterLaunch?(browser: unknown, opts?: unknown): Promise<void>;
      beforeConnect?(options: unknown): Promise<void>;
      afterConnect?(browser: unknown, opts?: unknown): Promise<void>;
      onBrowser?(browser: unknown, opts?: unknown): Promise<void>;
      onPageCreated?(page: unknown): Promise<void>;
      onTargetCreated?(target: unknown): Promise<void>;
      onTargetChanged?(target: unknown): Promise<void>;
      onTargetDestroyed?(target: unknown): Promise<void>;
      onDisconnected?(): Promise<void>;
      onClose?(): Promise<void>;
      onPluginRegistered?(): Promise<void>;
   }
}
