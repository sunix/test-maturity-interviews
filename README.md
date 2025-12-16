# Test Maturity Assessment Tool

A frontend-only web application to assess and track testing maturity across teams and applications.

## Features

- 📋 **Interview Mode**: Answer questions filtered by profile (Developer, QA, DevOps, Manager)
- 📊 **Maturity Scoring**: Automatic calculation of maturity levels (1-5) per theme
- 📈 **Radar Chart**: Visual representation of maturity across 8 testing themes
- 💾 **Local Storage**: All data stored in browser's local storage
- 📥 **Export/Import**: Save assessments to file and import them back (works with OneDrive or any file system)
- 🎯 **Multiple Profiles**: Different question sets for different roles

## Testing Themes

1. **Test Strategy** - Overall testing approach and planning
2. **Test Automation** - Automated testing practices
3. **Code Quality** - Code standards and quality metrics
4. **CI/CD Integration** - Testing in continuous integration/deployment
5. **Test Data Management** - Test data handling and security
6. **Performance Testing** - Performance and load testing practices
7. **Security Testing** - Security testing integration
8. **Test Documentation** - Test documentation and reporting

## How to Use

### Setup
1. Open `index.html` in a web browser
2. Enter your application/team name
3. Select a profile (Developer, QA, DevOps, Manager, or All)
4. Click "Start Interview"

### Interview
1. Answer questions with Yes/No
2. Progress bar shows completion status
3. Questions are weighted (1-5) based on importance
4. Save assessment when complete

### Results
1. Navigate to Results tab
2. Select an assessment from dropdown
3. View radar chart and theme scores
4. Scores range from 1 (Initial) to 5 (Optimized)

### Data Management
- **Export**: Download all assessments as JSON file
- **Import**: Upload previously exported JSON file
- **Edit**: Click edit on any saved assessment to modify answers
- **Delete**: Remove assessments you no longer need

## Maturity Levels

- **Level 1 - Initial**: Ad-hoc, inconsistent practices
- **Level 2 - Managed**: Basic processes in place
- **Level 3 - Defined**: Documented, standardized processes
- **Level 4 - Measured**: Metrics-driven, quantitative management
- **Level 5 - Optimized**: Continuous improvement, industry-leading

## Storage

- Data is stored in browser's `localStorage`
- Export to JSON file for backup or sharing
- Store exported files in OneDrive, Google Drive, or local filesystem
- Import files to restore or merge assessments

## Technical Details

- **Frontend Only**: No backend required
- **Dependencies**: Chart.js (loaded via CDN)
- **Browser Support**: Modern browsers with localStorage support
- **File Format**: JSON for import/export

## Files

- `index.html` - Main application structure
- `styles.css` - Styling and responsive design
- `questions.js` - Questions catalog with themes and profiles
- `app.js` - Application logic and state management

## No Installation Required

Simply open `index.html` in your browser to start using the tool!