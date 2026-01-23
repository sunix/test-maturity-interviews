const reporter = require('cucumber-html-reporter');
const fs = require('fs');
const path = require('path');

const reportDir = path.join(__dirname, '..', 'reports');
const jsonReport = path.join(reportDir, 'cucumber-report.json');
const htmlReport = path.join(reportDir, 'cucumber-report.html');

// Check if JSON report exists
if (!fs.existsSync(jsonReport)) {
  console.error('Error: cucumber-report.json not found. Run tests first.');
  process.exit(1);
}

const options = {
  theme: 'bootstrap',
  jsonFile: jsonReport,
  output: htmlReport,
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: false,
  metadata: {
    'App Version': '2.2.2',
    'Test Environment': process.env.BASE_URL || 'http://localhost:8080',
    'Browser': 'Chromium',
    'Platform': process.platform,
    'Executed': new Date().toISOString()
  },
  failedSummaryReport: true
};

reporter.generate(options);

console.log('✓ HTML report generated at:', htmlReport);

// Also create a simple index.html for easier navigation
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Reports - Test Maturity Assessment</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 {
            margin: 0 0 10px 0;
            font-size: 32px;
        }
        .subtitle {
            opacity: 0.9;
            font-size: 16px;
        }
        .card {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .report-link {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            transition: background 0.2s;
            margin-right: 10px;
        }
        .report-link:hover {
            background: #5568d3;
        }
        .metadata {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 6px;
        }
        .metadata dt {
            font-weight: 600;
            margin-top: 10px;
        }
        .metadata dd {
            margin-left: 0;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Test Reports</h1>
        <p class="subtitle">BDD/Gherkin Test Results for Test Maturity Assessment Tool</p>
    </div>
    
    <div class="card">
        <h2>📊 Latest Test Run</h2>
        <p>View the detailed test execution report with all scenarios and steps.</p>
        <a href="cucumber-report.html" class="report-link">📈 View Full Report</a>
        <a href="cucumber-report.json" class="report-link">📄 View JSON Report</a>
        
        <dl class="metadata">
            <dt>📅 Executed:</dt>
            <dd>${new Date().toLocaleString()}</dd>
            
            <dt>🌐 Test Environment:</dt>
            <dd>${process.env.BASE_URL || 'http://localhost:8080'}</dd>
            
            <dt>🔧 App Version:</dt>
            <dd>2.2.2</dd>
            
            <dt>💻 Platform:</dt>
            <dd>${process.platform}</dd>
        </dl>
    </div>
    
    <div class="card">
        <h2>📝 About These Tests</h2>
        <p>These tests verify the functionality of the Test Maturity Assessment Tool using BDD (Behavior-Driven Development) approach with Gherkin syntax.</p>
        
        <h3>Test Coverage:</h3>
        <ul>
            <li><strong>Interview Management:</strong> Creating, answering, and saving interviews</li>
            <li><strong>Results Visualization:</strong> Viewing radar charts and maturity scores</li>
            <li><strong>Data Management:</strong> Exporting, importing, and deleting assessments</li>
        </ul>
        
        <h3>How to Reproduce Issues:</h3>
        <ol>
            <li>Open the detailed report above</li>
            <li>Find the failed scenario</li>
            <li>Review the step-by-step execution</li>
            <li>Follow the steps manually in the application</li>
            <li>Screenshots and error details are included in the report</li>
        </ol>
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(reportDir, 'index.html'), indexHtml);
console.log('✓ Index page generated at:', path.join(reportDir, 'index.html'));
