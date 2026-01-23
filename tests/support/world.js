const { setWorldConstructor, Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

class CustomWorld {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.baseURL = process.env.BASE_URL || 'http://localhost:8080';
  }

  async init() {
    try {
      const slowMo = process.env.SLOWMO ? parseInt(process.env.SLOWMO, 10) : 0;
      
      // Validate slowMo is a valid number
      if (isNaN(slowMo) || slowMo < 0) {
        console.warn('Invalid SLOWMO value, using 0');
      }
      
      this.browser = await chromium.launch({
        headless: process.env.HEADED !== 'true',
        slowMo: isNaN(slowMo) || slowMo < 0 ? 0 : slowMo
      });
      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
        permissions: ['clipboard-read', 'clipboard-write']
      });
      this.page = await this.context.newPage();
    } catch (error) {
      console.error('Failed to initialize browser:', error);
      throw error;
    }
  }

  async cleanup() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }
}

setWorldConstructor(CustomWorld);

Before(async function() {
  await this.init();
});

After(async function() {
  await this.cleanup();
});
