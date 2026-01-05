# Test Maturity Assessment Tool

A modern, browser-based web application designed to assess and track testing maturity across teams and applications. No installation, no backend, no hassle—just open and start assessing!

## ✨ Key Features

### 🎯 **Smart Interview Mode**
- **Role-Based Questions**: Dynamically filter questions by profile (Developer, QA, DevOps, Manager, or All)
- **Profile Tracking**: Track which team member answered each question for better accountability
- **Progress Tracking**: Real-time progress bar shows completion status
- **Weighted Questions**: Questions are weighted (1-5) based on their importance to maturity assessment
- **Contextual Comments**: Add notes and context to any question for better documentation

### 📊 **Intelligent Maturity Scoring**
- **Automatic Calculation**: Real-time calculation of maturity levels (1-5) across 6 themes
- **Industry-Standard Levels**: From Level 1 (Initial) to Level 5 (Optimized)
- **Theme-Based Analysis**: Evaluate maturity across:
  - Gouvernance & Organisation
  - Méthodes & Standardisation
  - Automatisation & CI/CD
  - Données de Test & Conformité
  - Environnements de test
  - Culture & Collaboration

### 📈 **Visual Analytics**
- **Interactive Radar Chart**: Instantly visualize your testing maturity across all themes
- **Detailed Breakdowns**: View theme-by-theme scores with maturity level indicators
- **Answer History**: Review all answers with comments and metadata for comprehensive analysis

### 💾 **Flexible Data Management**
- **Local Storage**: All data saved in your browser—no server, no privacy concerns
- **Export/Import**: Download assessments as JSON files for backup or sharing
- **📁 Advanced Folder Sync**: 
  - Automatically sync to OneDrive, Google Drive, or any local folder
  - Real-time collaboration through shared cloud folders
  - Persistent folder selection—automatically restores your sync folder on reload
  - Smart conflict prevention during active editing
  - Individual file per assessment for easy version control

### 🎨 **Customizable Question Sets**
- **Question Editor**: Add, edit, or remove questions to fit your organization's needs
- **Drag & Drop Reordering**: Easily reorganize custom questions
- **Sync Custom Questions**: Your custom question sets sync to your folder for team-wide consistency
- **Reset to Defaults**: Quickly restore the default question catalog if needed

### ⚡ **Smart Auto-Save**
- **Automatic Saving**: Never lose work—changes save automatically every 2 seconds
- **Visual Feedback**: Clear status indicators show when changes are being saved or are saved
- **Cross-Tab Sync**: Changes made in one tab automatically appear in other tabs
- **Multi-User Support**: When using folder sync, multiple users can work simultaneously

## 🏆 Why Choose This Tool Over Excel?

### **Excel Limitations vs. Our Solution**

| Challenge with Excel | How We Solve It |
|---------------------|-----------------|
| ❌ **Manual Calculations** - Score calculations are error-prone and time-consuming | ✅ **Automatic Scoring** - Maturity levels calculated instantly with weighted algorithms |
| ❌ **No Visualization** - Hard to see the big picture; charts require manual setup | ✅ **Interactive Radar Chart** - Beautiful, real-time visual representation of all themes |
| ❌ **Version Chaos** - Multiple file versions floating around (`assessment_v2_final_FINAL.xlsx`) | ✅ **Single Source of Truth** - Folder sync keeps everyone on the same version automatically |
| ❌ **Collaboration Headaches** - Email attachments, merge conflicts, lost changes | ✅ **Seamless Collaboration** - Share via OneDrive/Google Drive with automatic conflict resolution |
| ❌ **Profile Mixing** - Difficult to track which role answered which question | ✅ **Profile Tracking** - Built-in tracking shows exactly who answered each question |
| ❌ **Static Questions** - Difficult to customize and maintain question sets | ✅ **Question Editor** - Easy-to-use interface for creating and organizing custom questions |
| ❌ **Limited Filtering** - Complex formulas needed to view role-specific questions | ✅ **Smart Filtering** - One-click filtering by role; see only relevant questions |
| ❌ **No History** - Previous assessments overwritten or saved as separate files | ✅ **Assessment History** - All assessments saved with timestamps, easily editable |
| ❌ **Setup Required** - Need Excel installed; compatibility issues across versions | ✅ **Zero Installation** - Works in any modern browser; no software needed |
| ❌ **Security Concerns** - Macros, file sharing risks, version tracking issues | ✅ **Privacy-First** - Data stays in your browser; sync only what you choose |

### **Real-World Advantages**

🎯 **For Teams**
- Everyone works with the same question set (via folder sync)
- No "which version are we using?" confusion
- Instant visibility into team maturity levels
- Easy progress tracking across multiple assessments

📊 **For Managers**
- Quick visual comparison of team maturity
- Professional radar charts ready for presentations
- Consistent methodology across all teams
- Historical data for tracking improvement

⚡ **For Efficiency**
- 10 minutes to complete an assessment (vs. 30+ min in Excel)
- Zero time spent on calculations or chart creation
- No manual data entry errors
- Automatic backup and recovery

## 📋 Testing Themes

Assess your organization's testing maturity across 6 comprehensive dimensions:

1. **Gouvernance & Organisation** - Testing governance, roles, responsibilities, and strategic planning
2. **Méthodes & Standardisation** - Test methodologies, standardized processes, and best practices
3. **Automatisation & CI/CD** - Test automation coverage, CI/CD integration, and pipeline quality
4. **Données de Test & Conformité** - Test data management, compliance, RGPD/DORA alignment
5. **Environnements de test** - Test environment availability, stability, and management
6. **Culture & Collaboration** - Team collaboration, knowledge sharing, and continuous improvement

## 🚀 Quick Start

### Install as Windows App (Recommended) 🪟

Transform the web app into a native Windows application:

1. **Open in Chrome or Edge** on Windows
2. **Look for the install icon** in the address bar (⊕ or 🖥️)
3. **Click "Install Test Maturity Assessment"**
4. **Launch from Start Menu** - it's now a Windows app!

📖 **Detailed installation guide**: See [PWA_INSTALLATION.md](PWA_INSTALLATION.md)

**Benefits of installing:**
- ✅ Runs in its own window (no browser tabs)
- ✅ Appears in Windows Start menu and taskbar
- ✅ Works offline after first load
- ✅ Faster startup with cached resources
- ✅ Professional, app-like experience

### Basic Setup (30 seconds)
1. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari)
2. Enter your application/team name
3. Select a profile or choose "All profiles"
4. Click **"Start Interview"**
5. Answer questions with Yes/No (add comments for context)
6. Save when complete—results appear instantly!

### Advanced: Enable Folder Sync (Team Collaboration)
Perfect for teams using OneDrive, Google Drive, or Dropbox:

1. Click **"📁 Select Sync Folder"** in the Setup tab
2. Choose a folder (local or cloud storage)
3. Grant browser permissions
4. **Done!** Assessments now sync automatically

**Benefits:**
- Share assessments with your team instantly
- Automatic backup to cloud storage
- Changes sync across all devices
- Folder selection persists—no need to re-select after reload

## 📖 How to Use

### Conducting an Interview

1. **Profile Selection**: Filter questions by role to focus on relevant areas
   - Developer: Focus on automation, CI/CD, code quality
   - QA: Emphasis on test strategy, execution, UAT
   - DevOps: Environment management, deployment, infrastructure
   - Manager: Governance, strategy, metrics
   - All: See every question

2. **Answering Questions**:
   - Each question is weighted by importance (1-5)
   - Answer honestly—this tool helps identify improvement areas
   - Add comments to capture context, blockers, or action items
   - For multi-profile questions, select who answered it

3. **Tracking Progress**:
   - Progress bar shows completion in real-time
   - Auto-save ensures no data loss
   - Edit assessments anytime—just click "Edit" from the list

### Viewing Results

1. Navigate to the **Results** tab
2. Select an assessment from the dropdown
3. View:
   - **Radar Chart**: Visual maturity across all themes
   - **Theme Scores**: Numeric scores (1-5) with maturity labels
   - **Detailed Answers**: All responses with comments and who answered

### Managing Assessments

**Edit**: Update any saved assessment—perfect for tracking improvements over time

**Export**: Download all assessments as JSON for archiving or sharing

**Import**: Restore from a backup or merge assessments from another source

**Delete**: Remove outdated or duplicate assessments

**Folder Sync**: Automatic continuous sync with cloud storage (requires modern browser)

## 📊 Maturity Levels Explained

The tool evaluates your testing practices using a 5-level maturity model:

| Level | Name | Description | Characteristics |
|-------|------|-------------|-----------------|
| **1** | **Initial** | Ad-hoc, reactive | Testing is chaotic, inconsistent, and reactive to issues |
| **2** | **Managed** | Basic processes | Some testing processes exist but aren't standardized |
| **3** | **Defined** | Standardized | Clear, documented processes followed consistently |
| **4** | **Measured** | Metrics-driven | Testing is measured, analyzed, and quantified |
| **5** | **Optimized** | Continuous improvement | Industry-leading practices with ongoing optimization |

**How Scoring Works:**
- Each question has a weight (1-5) based on its importance
- "Yes" answers contribute their weight to the theme's score
- Scores are automatically calculated and mapped to maturity levels
- Visual indicators help identify strengths and areas for improvement

## 💡 Use Cases

### **1. Team Self-Assessment**
Conduct quarterly assessments to track testing maturity improvements:
```
Q1: Overall maturity 2.3 → Q2: 2.8 → Q3: 3.2 ✅ Trending up!
```

### **2. Multi-Team Comparison**
Assess multiple teams/applications to identify best practices:
```
Team A (Maturity 4.1) → Share practices with → Team B (Maturity 2.9)
```

### **3. Pre-Release Readiness**
Evaluate if testing practices are mature enough for production:
```
Required: Level 3 in all themes
Current: 5 themes at Level 3+, 1 theme at Level 2 → Action needed!
```

### **4. Audit & Compliance**
Document testing practices for compliance (DORA, RGPD, ISO standards):
```
Export assessment → Include in compliance documentation → Track improvements
```

### **5. Continuous Improvement Tracking**
Use folder sync for ongoing maturity tracking:
```
Shared OneDrive folder → Team updates monthly → Management views trends
```

## 🔧 Technical Details

### Architecture
- **Type**: Single-page application (SPA) & Progressive Web App (PWA)
- **Backend**: None required—fully client-side
- **Framework**: Vanilla JavaScript (no build step needed)
- **Visualization**: Chart.js (loaded via CDN)
- **Storage**: Browser LocalStorage + IndexedDB (for folder handles)
- **File Format**: JSON (human-readable, git-friendly)
- **PWA Features**: Service Worker, Web App Manifest, offline support

### Browser Requirements
- **Basic Features**: Any modern browser with localStorage
  - Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
- **PWA Installation**: Windows app installation support
  - Chrome 86+, Edge 86+ (Windows 10+)
  - Offline functionality via Service Worker
- **Folder Sync**: File System Access API support
  - Chrome 86+, Edge 86+ (as of Dec 2023)
  - Not supported: Firefox, Safari (use Export/Import instead)

### Data Storage
- **Local Storage**: Assessments stored in browser (private, offline-capable)
- **IndexedDB**: Folder handle persistence for automatic sync restoration
- **File Sync**: Individual JSON files per assessment
  - Format: `assessment-{name}-{date}.json`
  - Easy to read, edit manually, or version control with Git

### Security & Privacy
- ✅ No data sent to external servers
- ✅ No tracking or analytics
- ✅ Data stays in your browser or your chosen folder
- ✅ No login or authentication required
- ✅ Works offline after first load

## 📁 Advanced: Folder Sync Deep Dive

Folder sync is the killer feature that makes team collaboration seamless:

### How It Works

1. **Select Folder Once**: Choose any folder (local, OneDrive, Google Drive, Dropbox)
2. **Persistent Configuration**: Your folder selection is remembered using IndexedDB
3. **Automatic Restore**: On page reload, the app verifies permissions and reconnects
4. **Smart Syncing**:
   - Every 5 seconds when idle (no editing)
   - Every 15 seconds when actively editing (prevents conflicts)
   - Protected editing: Your changes won't be overwritten while you're working

### Sync Features

**Automatic Save**: When you save an assessment, it's immediately written to the folder

**Smart Auto-Load**: The app monitors the folder for changes from other users/devices

**Conflict Prevention**: 
- If you're editing, incoming changes are delayed
- For other assessments, newer version always wins (based on file modification time)
- No merge conflicts—simple and predictable

**Cloud Integration**: 
- If the folder is in OneDrive/Google Drive, changes sync across devices automatically
- Perfect for distributed teams

**Version Compatibility & Data Preservation** (v1.1.0+):
- All assessments include version metadata for compatibility tracking
- Deep merge strategy preserves all fields when syncing between different app versions
- Attachments and other newer fields are automatically preserved even if an older version syncs
- This ensures data integrity across team members using different app versions

### Troubleshooting Folder Sync

| Issue | Solution |
|-------|----------|
| Permission expired | Click "Re-select Folder" button |
| Not syncing | Check browser console for errors; ensure folder permissions granted |
| Browser not supported | Use Chrome 86+ or Edge 86+; fallback to Export/Import |
| Lost folder connection | App will prompt to re-select folder on next load |
| Attachments missing after sync | Ensure all team members use v1.1.0+; older versions may not display attachments but won't delete them |
## 🎨 Customization: Question Editor

Create your own question sets tailored to your organization:

### Features
- **Add Questions**: Create new questions with custom themes, profiles, and weights
- **Edit Questions**: Modify existing questions (creates a custom question set)
- **Delete Questions**: Remove questions that aren't relevant
- **Reorder**: Drag and drop to organize questions logically
- **Sync Custom Questions**: Custom question sets sync to your folder for team consistency
- **Reset to Default**: Restore the original question catalog anytime

### How to Customize

1. Navigate to **Setup** tab
2. Scroll to **Question Editor** section
3. Click **"+ Add Question"** or **"✏️ Edit"** on any question
4. Fill in the form:
   - Question ID (e.g., "GO-24")
   - Theme selection
   - Profiles that can answer
   - Question text
   - Category (optional)
   - Weight (1-5)
5. Click **"Save Question"**

Your custom question set is immediately saved and synced (if folder sync is enabled).

## 📦 Repository Structure

```
test-maturity-interviews/
├── index.html          # Main application interface
├── app.js             # Application logic and state management
├── questions.js       # Default questions catalog
├── styles.css         # Styling and responsive design
└── README.md          # This documentation
```

### Key Files

**index.html**: The main HTML structure including:
- Tab navigation (Setup, Interview, Results)
- Interview interface with profile filtering
- Results visualization with radar chart
- Question editor modal

**app.js**: Core application logic:
- Assessment management (create, edit, delete)
- Auto-save functionality
- Folder sync with smart conflict resolution
- Maturity score calculation
- Question editor functionality

**questions.js**: Default question catalog with:
- 6 testing themes
- 150+ questions covering all testing aspects
- Profile assignments (Developer, QA, DevOps, Manager)
- Weighted questions (1-5 importance)

**styles.css**: Responsive design with:
- Mobile-friendly interface
- Professional color scheme
- Print-optimized styles
- Accessibility features

## 🤝 Contributing & Feedback

This is an open tool designed to help teams improve their testing practices. Suggestions and improvements are welcome!

### Ideas for Contribution
- Additional questions for specific industries
- Alternative maturity models
- UI/UX improvements
- Additional language support
- Integration with other tools

## 📄 License & Usage

This tool is designed for assessing testing maturity. Feel free to:
- Use it for your team/organization
- Customize questions to fit your needs
- Share assessments and results
- Modify the tool for your specific requirements

## 🔮 Future Enhancements (Potential)

- **Multi-language Support**: Questions in multiple languages
- **Custom Themes**: Define your own maturity themes
- **Trend Analysis**: Track maturity improvements over time with charts
- **Comparison Mode**: Side-by-side comparison of multiple assessments
- **PDF Export**: Generate professional reports for stakeholders
- **Template Library**: Pre-built question sets for different industries
- **API Integration**: Connect with JIRA, Azure DevOps, or other tools

---

## 🎯 Getting Started Now

**Just want to try it?** → Open `index.html` in your browser

**Need team collaboration?** → Enable Folder Sync with OneDrive/Google Drive

**Want to customize?** → Use the Question Editor to create your perfect assessment

**Questions or issues?** → Check the Troubleshooting sections above

---

**Made with ❤️ for software testing teams everywhere.**

*Happy testing! May your maturity scores be ever increasing.* 🚀
