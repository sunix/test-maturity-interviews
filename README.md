# Test Maturity Assessment Tool

A frontend-only web application to assess and track testing maturity across teams and applications.

## Features

- 📋 **Interview Mode**: Answer questions filtered by profile (Developer, QA, DevOps, Manager)
- 📊 **Maturity Scoring**: Automatic calculation of maturity levels (1-5) per theme
- 📈 **Radar Chart**: Visual representation of maturity across 8 testing themes
- 💾 **Local Storage**: All data stored in browser's local storage
- 📥 **Export/Import**: Save assessments to file and import them back (works with OneDrive or any file system)
- 📁 **Folder Sync**: Automatically sync assessments to a filesystem folder (like OneDrive sync)
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
- **Folder Sync**: Select a folder (e.g., OneDrive, Google Drive) to automatically sync assessments
  - Each assessment saved as individual JSON file
  - Smart automatic sync with conflict prevention
  - Works with cloud storage folders (OneDrive, Google Drive, Dropbox)
  - Requires modern browser with File System Access API support (Chrome, Edge)
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
- **NEW: Folder Sync** - Automatically sync assessments to a folder
  - Select a folder on your filesystem (local, OneDrive, Google Drive, etc.)
  - Assessments automatically saved as individual JSON files
  - Changes in folder are detected and synced back to the app
  - Perfect for team collaboration via shared cloud folders
- Import files to restore or merge assessments

## Technical Details

- **Frontend Only**: No backend required
- **Dependencies**: Chart.js (loaded via CDN)
- **Browser Support**: Modern browsers with localStorage support
- **Folder Sync**: Requires File System Access API (Chrome 86+, Edge 86+)
- **File Format**: JSON for import/export

## Files

- `index.html` - Main application structure
- `styles.css` - Styling and responsive design
- `questions.js` - Questions catalog with themes and profiles
- `app.js` - Application logic and state management

## No Installation Required

Simply open `index.html` in your browser to start using the tool!

## Folder Sync Setup (Optional)

The folder sync feature allows you to automatically sync assessments to a folder on your filesystem, making it perfect for:
- Backing up assessments to cloud storage (OneDrive, Google Drive, Dropbox)
- Sharing assessments with team members via shared folders
- Version control via file timestamps
- Offline access to assessment data

### How to Enable Folder Sync

1. **Browser Requirement**: Use Chrome 86+ or Edge 86+ (File System Access API required)
2. **Select Folder**: Click "📁 Select Sync Folder" button in the Setup tab
3. **Choose Location**: Select a folder (can be local, OneDrive, Google Drive, etc.)
4. **Grant Permission**: Allow the app to read/write to the selected folder
5. **Automatic Sync**: Assessments are now automatically synced!
6. **Persistent Configuration**: Your folder selection is saved and automatically restored when you reload the app!

### How It Works

- **Individual Files**: Each assessment is saved as `assessment-{name}-{date}.json`
- **Auto-Save**: When you save an assessment, it's immediately written to the folder
- **Persistent Folder Selection**: The sync folder is automatically remembered and restored on reload using IndexedDB
- **Permission Verification**: On reload, the app verifies it still has access to the folder and requests permission if needed
- **Smart Auto-Load**: Files in the folder are checked for changes with intelligent timing:
  - **Every 5 seconds** when you're not actively editing (idle state)
  - **Every 15 seconds** when you're actively editing to avoid conflicts
  - **Protected editing**: Changes you make won't be overwritten while you're actively working
- **Conflict Prevention**: If you're editing an assessment, incoming changes are delayed until you finish
- **Merge Logic**: For other assessments, the newer version always wins based on file modification time
- **Cloud Sync**: If the folder is in OneDrive/Google Drive, changes sync across devices

### Example Use Cases

1. **Team Collaboration**: 
   - Select a shared OneDrive/Google Drive folder
   - Multiple team members can create assessments
   - All assessments appear in everyone's app automatically

2. **Backup Strategy**:
   - Select a folder that's backed up to cloud storage
   - Assessments are automatically backed up
   - Restore by selecting the same folder on a new device

3. **Version Control**:
   - Each assessment file includes a timestamp
   - You can manually inspect or edit JSON files
   - Changes are picked up automatically

### Troubleshooting

- **Permission Expired**: If browser permissions expire, the app will prompt you to re-select the folder
- **Not Supported**: If your browser doesn't support the API, use Export/Import instead
- **Sync Not Working**: Check browser console for errors, ensure folder permissions are granted