module.exports = {
  default: {
    require: ['tests/step-definitions/**/*.js', 'tests/support/**/*.js'],
    requireModule: [],
    format: [
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json',
      'summary'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    publishQuiet: true,
    dryRun: false,
    failFast: false
  }
};
