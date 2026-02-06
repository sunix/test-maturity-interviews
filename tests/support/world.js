const { setWorldConstructor, Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

class CustomWorld {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.baseURL = process.env.BASE_URL || 'http://localhost:8080';
    this.tempFiles = []; // Track temp files for cleanup
  }

  async init() {
    try {
      // Validate and parse SLOWMO value
      let slowMo = 0;
      if (process.env.SLOWMO) {
        const parsed = parseInt(process.env.SLOWMO, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          slowMo = parsed;
        } else {
          console.warn('Invalid SLOWMO value, using 0');
        }
      }
      
      this.browser = await chromium.launch({
        headless: process.env.HEADED !== 'true',
        slowMo
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
    
    // Cleanup temp files
    this.tempFiles.forEach(filePath => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.warn(`Failed to cleanup temp file ${filePath}:`, error.message);
      }
    });
  }
}

setWorldConstructor(CustomWorld);

Before(async function() {
  await this.init();
});

After(async function() {
  await this.cleanup();
});
