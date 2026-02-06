# UI Tests - Test Maturity Assessment Tool

This directory contains end-to-end UI tests for the Test Maturity Assessment Tool using BDD (Behavior-Driven Development) with Gherkin syntax.

## 📋 Overview

The tests are written using:
- **Playwright**: Modern browser automation framework
- **Cucumber**: BDD framework for Gherkin syntax
- **Gherkin**: Human-readable test scenarios

## 🎯 Test Coverage

### Interview Management (`features/interview.feature`)
- Starting a new interview
- Answering questions with comments
- Saving interview results
- Viewing saved interviews

### Results Visualization (`features/results.feature`)
- Viewing radar charts
- Theme-based score breakdowns
- Detailed answer reviews

### Data Management (`features/data-management.feature`)
- Exporting assessments
- Importing assessments
- Deleting assessments

## 🚀 Running Tests

### Prerequisites

```bash
npm install
```

### Run Tests Locally

1. **Start the local server:**
   ```bash
   npm run serve
   ```

2. **In another terminal, run the tests:**
   ```bash
   npm run test:local
   ```

### Run Tests Against Any Server

```bash
BASE_URL=https://your-server.com npm run test:report
```

This allows you to test against:
- Local development server
- Preview deployments (surge.sh)
- Production environment
- GitHub Copilot started servers

### Run Tests in Headed Mode (See Browser)

```bash
HEADED=true npm run test:local
```

### Run Tests with Slow Motion (Debug)

```bash
HEADED=true SLOWMO=100 npm run test:local
```

## 📊 Test Reports

After running tests, reports are generated in the `reports/` directory:

- **`reports/index.html`**: Main report page with overview and links
- **`reports/cucumber-report.html`**: Detailed test execution report
- **`reports/cucumber-report.json`**: Machine-readable test results

### Viewing Reports

1. Run the tests: `npm run test:report`
2. Open `reports/index.html` in your browser
3. Click "View Full Report" to see detailed results

### Report Features

✅ **Scenario-by-scenario results** with pass/fail status  
✅ **Step-by-step execution details**  
✅ **Screenshots of failures** (if any)  
✅ **Execution time** for each scenario  
✅ **Environment metadata** (URL, version, platform)  
✅ **Clear error messages** for debugging  

### Reproducing Issues from Reports

1. Open the HTML report
2. Find the failed scenario
3. Review the step that failed
4. Follow the exact steps in the application
5. Error messages and screenshots help identify the issue

## 🔄 CI/CD Integration

### Trigger Tests via PR Comments

Post a comment on any Pull Request with:
```
/test
```

The workflow will:
1. Deploy the PR to a preview environment (if needed)
2. Run all UI tests against the preview
3. Post results back to the PR
4. Upload detailed HTML reports as artifacts

### Automatic Testing on PRs

Tests run automatically on every Pull Request to the `main` branch.

### GitHub Actions Workflow

The workflow is defined in `.github/workflows/run-ui-tests.yml` and includes:
- Node.js and Playwright setup
- Local server startup
- Test execution
- Report generation
- Artifact upload
- PR comment with results

## 📝 Writing New Tests

### 1. Create a Feature File

Create a new `.feature` file in `tests/features/`:

```gherkin
Feature: New Feature
  As a user
  I want to do something
  So that I can achieve a goal

  Scenario: Do something
    Given I am on the homepage
    When I click a button
    Then I should see a result
```

### 2. Implement Step Definitions

Create a new `.js` file in `tests/step-definitions/`:

```javascript
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Given('I am on the homepage', async function() {
  await this.page.goto(this.baseURL);
});

When('I click a button', async function() {
  await this.page.click('button:has-text("Click Me")');
});

Then('I should see a result', async function() {
  const result = await this.page.locator('.result');
  await expect(result).toBeVisible();
});
```

### 3. Run Your New Tests

```bash
npm run test:local
```

## 🛠️ Test Architecture

### Directory Structure

```
tests/
├── features/              # Gherkin feature files
│   ├── interview.feature
│   ├── results.feature
│   └── data-management.feature
├── step-definitions/      # Step implementation
│   ├── interview-steps.js
│   ├── results-steps.js
│   └── data-management-steps.js
└── support/              # Test configuration
    ├── world.js          # Test context and browser setup
    └── report-generator.js
```

### Test Hooks

- **Before**: Initialize browser and page for each scenario
- **After**: Cleanup browser and page after each scenario

### Browser Configuration

- **Browser**: Chromium (can be changed in `world.js`)
- **Viewport**: 1280x720 (can be adjusted)
- **Headless**: Default (set `HEADED=true` to see browser)

## 🔍 Debugging Tests

### View Browser During Tests

```bash
HEADED=true npm run test:local
```

### Add Breakpoints

Add `await this.page.pause();` in your step definition:

```javascript
Then('I should see a result', async function() {
  await this.page.pause(); // Browser will pause here
  const result = await this.page.locator('.result');
  await expect(result).toBeVisible();
});
```

### Console Logs

All console messages from the browser are captured. Add logging in steps:

```javascript
console.log('Current URL:', await this.page.url());
```

## 🌐 Testing Against Different Environments

### Local Development

```bash
npm run test:local
```

### Preview Environment (Surge.sh)

```bash
BASE_URL=https://pr-123-test-maturity-preview.surge.sh npm run test:report
```

### Custom Server

```bash
BASE_URL=http://custom-server:3000 npm run test:report
```

### GitHub Copilot Server

If GitHub Copilot starts a server for you (e.g., on port 8080):

```bash
BASE_URL=http://localhost:8080 npm run test:report
```

## 📚 Best Practices

### 1. Keep Scenarios Independent
Each scenario should be able to run independently without relying on previous scenarios.

### 2. Use Background for Common Setup
Put common setup steps in the `Background` section of feature files.

### 3. Write Clear Scenario Titles
Scenario titles should clearly describe what is being tested.

### 4. Add Comments to Complex Steps
If a step does something complex, add comments explaining why.

### 5. Wait for Elements
Always wait for elements to be visible before interacting:
```javascript
await this.page.waitForSelector('.element');
```

### 6. Use Meaningful Assertions
Use clear, specific assertions:
```javascript
// Good
await expect(scoreElement).toHaveText('4.2');

// Not as good
await expect(scoreElement).toBeVisible();
```

## 🐛 Troubleshooting

### Tests Fail Locally But Pass in CI

- Check browser versions (update Playwright)
- Verify environment variables
- Check for timing issues (add waits)

### Cannot Find Elements

- Verify selectors in the browser DevTools
- Wait for page to load completely
- Check if element is in an iframe

### Tests Are Slow

- Reduce `SLOWMO` value
- Remove unnecessary waits
- Run in headless mode

### Server Won't Start

- Check if port 8080 is already in use
- Kill existing processes: `pkill -f http-server`
- Try a different port

## 📖 Additional Resources

- [Cucumber.js Documentation](https://github.com/cucumber/cucumber-js)
- [Playwright Documentation](https://playwright.dev/)
- [Gherkin Syntax Reference](https://cucumber.io/docs/gherkin/reference/)
- [BDD Best Practices](https://cucumber.io/docs/bdd/)

## 🤝 Contributing

When adding new features to the application:

1. Write a Gherkin scenario first (test-first approach)
2. Implement the feature
3. Implement the step definitions
4. Verify tests pass
5. Include test updates in your PR

## ⚡ Quick Reference

```bash
# Install dependencies
npm install

# Run all tests with reports
npm run test:report

# Run tests locally with server
npm run test:local

# Run tests against custom URL
BASE_URL=https://example.com npm run test:report

# Run with visible browser
HEADED=true npm run test:local

# Run with slow motion
HEADED=true SLOWMO=100 npm run test:local

# Start local server only
npm run serve

# Run specific feature
npx cucumber-js tests/features/interview.feature
```

---

**Questions or Issues?** Check the main [README.md](../README.md) or open an issue on GitHub.
