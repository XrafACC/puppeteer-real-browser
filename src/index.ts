import './types';
import { Page } from 'puppeteer-core';
import { HeadlessBrowser } from './browser';

export const version = '[VI]{{version}}[/VI]';

Page.prototype.waitForTimeout = function (ms: number) {
   return new Promise(resolve => setTimeout(resolve, ms));
};

export default HeadlessBrowser;
