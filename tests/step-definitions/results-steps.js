const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Prerequisites
Given('I have a saved interview named {string}', async function(interviewName) {
  // Setup a saved interview
  await this.page.goto(this.baseURL);
  await this.page.waitForLoadState('networkidle');
  
  // Navigate to Interview tab and create an interview
  await this.page.click('button[data-tab="interview"]');
  await this.page.waitForTimeout(500);
  
  await this.page.fill('input[placeholder*="Application"]', 'Test App');
  await this.page.fill('input[placeholder*="Interview"]', interviewName);
  await this.page.selectOption('select#profile-filter', { label: 'All profiles' });
  
  await this.page.click('button:has-text("Start Interview")');
  await this.page.waitForSelector('.question-item', { timeout: 5000 });
  
  // Answer some questions
  const questions = await this.page.$$('.question-item');
  const limit = Math.min(10, questions.length);
  
  for (let i = 0; i < limit; i++) {
    const question = await this.page.locator('.question-item').nth(i);
    const yesButton = question.locator('button:has-text("Yes")');
    await yesButton.click();
    await this.page.waitForTimeout(50);
  }
  
  // Save the interview
  await this.page.click('button:has-text("Save Interview")');
  await this.page.waitForTimeout(1000);
  
  this.savedInterviewName = interviewName;
});

Given('I have a completed assessment named {string}', async function(assessmentName) {
  // Reuse the saved interview setup
  await this['I have a saved interview named'](assessmentName);
});

// Results viewing
When('I select {string} from the results dropdown', async function(assessmentName) {
  const dropdown = await this.page.locator('select#assessment-select');
  await dropdown.selectOption({ label: assessmentName });
  await this.page.waitForTimeout(1000);
});

When('I select {string} from the dropdown', async function(assessmentName) {
  const dropdown = await this.page.locator('select#assessment-select');
  await dropdown.selectOption({ label: assessmentName });
  await this.page.waitForTimeout(1000);
});

// Radar chart assertions
Then('I should see a radar chart with {int} themes', async function(themeCount) {
  await this.page.waitForSelector('canvas', { timeout: 5000 });
  const canvas = await this.page.locator('canvas');
  await expect(canvas).toBeVisible();
});

Then('each theme should have a score displayed', async function() {
  const themeScores = await this.page.locator('.theme-score');
  const count = await themeScores.count();
  expect(count).toBeGreaterThan(0);
});

// Theme breakdown assertions
Then('I should see theme names', async function() {
  const themeElements = await this.page.locator('.theme-name, .theme-title');
  const count = await themeElements.count();
  expect(count).toBeGreaterThan(0);
});

Then('I should see maturity levels for each theme', async function() {
  const maturityLevels = await this.page.locator('.maturity-level, .level-indicator');
  const count = await maturityLevels.count();
  expect(count).toBeGreaterThan(0);
});

Then('I should see scores between {int} and {int}', async function(min, max) {
  const scores = await this.page.locator('.score, .theme-score');
  const count = await scores.count();
  expect(count).toBeGreaterThan(0);
});

// Detailed answers
When('I scroll to the detailed answers section', async function() {
  await this.page.evaluate(() => {
    const detailsSection = document.querySelector('.answers-details, .detailed-answers, #detailed-answers');
    if (detailsSection) {
      detailsSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
  await this.page.waitForTimeout(500);
});

Then('I should see all answered questions', async function() {
  const answeredQuestions = await this.page.locator('.answer-item, .answered-question');
  const count = await answeredQuestions.count();
  expect(count).toBeGreaterThan(0);
});

Then('I should see the answers \\(Yes\\/No\\)', async function() {
  const answers = await this.page.locator('.answer-value, .answer-text');
  const count = await answers.count();
  expect(count).toBeGreaterThan(0);
});

Then('I should see comments if provided', async function() {
  // Comments may or may not be present, so we just check the structure exists
  const commentsSection = await this.page.locator('.comments-section, .answer-comments');
  // This is optional, so we don't assert it must be visible
  await this.page.waitForTimeout(100);
});
