# Agent Reference — Test Maturity Assessment Tool

This file gives AI coding assistants a quick, authoritative orientation to the codebase so they do not have to rediscover its structure from scratch.

---

## 1. Project Purpose

A **client-side-only Progressive Web App (PWA)** that lets teams assess and track their testing maturity. No backend, no database — all data lives in a user-selected folder on disk (via the File System Access API).

Key capabilities:
- Role-filtered questionnaire (developer / qa / devops / manager / all)
- Weighted maturity scoring (1–5) across 6 themes, visualised as a radar chart
- Excel export/import workflow for offline/distributed completion
- Deep merge of multiple interviews into a combined result
- Bidirectional real-time folder sync (OneDrive, Google Drive, local)
- Offline usage via Service Worker caching
- French / English UI

---

## 2. Technology Stack

| Concern | Technology |
|---------|-----------|
| Language | Vanilla JavaScript (ES6+), HTML5, CSS3 |
| Charts | Chart.js 4.4.0 (CDN) |
| Excel | SheetJS / XLSX 0.20.1 (CDN) |
| Storage | File System Access API + IndexedDB (folder handle) + localStorage |
| PWA | Service Worker + Web App Manifest |
| CI Preview | Surge.sh (`.github/workflows/preview-pr.yml`) — trigger with `/preview` comment on a PR |

No frameworks (no React, Vue, Angular). All processing is client-side.

---

## 3. Key Files

| File | Role |
|------|------|
| `index.html` | Application shell — all tabs, modals, forms, chart containers |
| `app.js` | All application logic (~5,500 lines) |
| `questions.js` | Default question catalogue (30 questions × 6 themes, bilingual) |
| `styles.css` | Full styling with CSS custom properties, responsive design |
| `service-worker.js` | Cache-first offline support, update detection |
| `manifest.json` | PWA metadata (icons, display mode, start URL) |
| `icons/` | 8 PNG icon sizes (72 × 72 → 512 × 512) |
| `screenshots/` | App-store preview images (desktop + mobile) |

Documentation files (`README.md`, `PWA_INSTALLATION.md`, `QUESTIONNAIRE_WORKFLOW.md`, `IMPLEMENTATION_SUMMARY.md`, `FIX_SUMMARY.md`, `COMPLETE_FIX_DOCUMENTATION.md`, `PWA_SUMMARY.md`) describe features and workflows for end-users.

Test/demo pages (`test-*.html`, `pwa-test.html`, `demo-*.html`, `fix-visualization.html`) are standalone browser pages for exercising individual features — open them directly in a browser to run them.

---

## 4. Global State (app.js)

```js
let currentAssessment = {
    name: '',               // Application / product name
    interviewName: '',      // Team or group identifier
    profile: '',            // Currently selected profile filter
    date: '',               // ISO timestamp of last save
    interviewDate: '',      // Editable interview date (display)
    interviewDates: [],     // Array of interview dates (multi-day)
    interviewees: [],       // People interviewed
    selectedProfiles: [],   // Active profile filters
    generalComments: '',
    answers: {},            // { questionId: 'yes' | 'no' | '' }
    comments: {},           // { questionId: 'string' }
    answeredBy: {},         // { questionId: 'profile' }
    attachments: {},        // { questionId: [{ name, size, data }] }  (base64)
    appVersion: APP_VERSION,
    // Merged results only:
    isMergedResult: true,
    sourceInterviews: [],
    mergedAnswerDetails: {} // { questionId: { yesCount, noCount, contributions[] } }
};

let assessments = [];       // All saved assessments (interviews + merged results)
let currentLanguage = 'fr'; // 'fr' | 'en'  (persisted in localStorage as 'appLanguage')
let customQuestions = null; // null → use QUESTIONS_CATALOG; object → custom set
let activeQuestions = QUESTIONS_CATALOG.questions;
const APP_VERSION = '3.2.0';
```

---

## 5. Question Catalogue (questions.js)

```js
QUESTIONS_CATALOG = {
    themes: [
        { fr: "Gouvernance & Organisation", en: "Governance & Organization" },
        // …5 more themes
    ],
    questions: [
        {
            id: "GO-1",            // Theme prefix + number
            theme: "Gouvernance & Organisation",
            profiles: ["manager", "all"],
            question: { fr: "…", en: "…" },
            category: "Test strategy",
            weight: 3              // 1–5; affects maturity calculation
        },
        // …30 total, 5 per theme
    ]
}
```

Question IDs follow the pattern `{THEME_CODE}-{N}`:
`GO`, `MS`, `AC`, `DT`, `ET`, `CC` for the six themes.

---

## 6. Important Functions

| Function | Purpose |
|----------|---------|
| `startInterview()` | Initialise `currentAssessment` from form values |
| `handleAnswer(id, value)` | Record yes/no and trigger auto-save |
| `handleComment(id, text)` | Record comment |
| `handleFileAttachment(id, files)` | Base64-encode and store attachments |
| `calculateMaturityScores()` | Compute 1–5 score per theme (see §7) |
| `renderRadarChart()` | Render/update the Chart.js radar chart |
| `saveAssessment()` | Persist current assessment to memory + folder |
| `loadAssessments()` | Read all `.json` files from the sync folder |
| `syncToFolder()` | Write all assessments to the sync folder |
| `deepMergeAssessment(existing, imported)` | Merge preserving fields absent in imported |
| `createMergedResult(ids, name, iName)` | Average answers from 2+ interviews |
| `exportAssessmentsToExcel()` | Create `.xlsx` (3 sheets: Instructions, Questionnaire, Options) |
| `importQuestionnaireFromExcel(file)` | Parse `.xlsx` and update assessment answers |
| `selectSyncFolder()` | File System Access API folder picker, stored in IndexedDB |
| `startPeriodicSync()` | Poll folder every 5 s (idle) / 15 s (active) |
| `getTranslation(value, lang)` | Resolve bilingual string `{ fr, en }` with fallback |
| `showUpdateBanner()` | Display PWA update notification |

---

## 7. Maturity Score Formula

```
earnedWeight = sum of weights of questions answered "yes"
totalWeight  = sum of weights of all answered questions
percentage   = earnedWeight / totalWeight × 100
score        = Math.round(percentage / 20 + 0.5)  →  clamped to [1, 5]
```

Constants in `app.js`: `MATURITY_SCALE_MIN = 1`, `MATURITY_SCALE_MAX = 5`, `PERCENTAGE_TO_SCALE_DIVISOR = 20`, `SCALE_OFFSET = 0.5`.

---

## 8. Data Storage

### Sync Folder (primary — File System Access API)

```
[Selected Folder]/
├── {appName}_{interviewName}_{date}.json   ← individual interview
├── merged_{date}.json                       ← merged result
└── _custom_questions.json                  ← custom question catalogue
```

Each `.json` file is a serialised `currentAssessment`-shaped object.

### IndexedDB (secondary)

- Database: `test_maturity_db` v1
- Object store: `folderHandles`
- Single entry (key `syncFolder`): stores the `DirectoryHandle` + folder name so the folder survives page reload.

### localStorage (minimal)

- Key `appLanguage` → `'fr'` or `'en'`

---

## 9. Localisation Pattern

All user-facing strings in questions and themes use bilingual objects:

```js
{ fr: "Texte en français", en: "English text" }
```

Call `getTranslation(value, lang)` everywhere a string may be bilingual.
Fallback order: requested language → `'fr'` → `'en'` → first defined key.

When adding or modifying questions/themes, always supply both `fr` and `en` properties.

---

## 10. PWA & Versioning

- `APP_VERSION` is declared in both `app.js` and `service-worker.js` and must match.
- The Service Worker cache name is `test-maturity-v${APP_VERSION}`.
- Bump `APP_VERSION` (semver) whenever assets change to force cache refresh on all clients.
- The Service Worker uses cache-first strategy and checks for updates every 60 s / on tab focus.

---

## 11. Checklist for Common Modifications

| Change type | Things to verify |
|-------------|-----------------|
| Scoring algorithm | Run `test-merged-results.html` and `test-radar-chart.html` in a browser |
| Data storage / sync | Run `test-deep-merge.html` and `test-multiple-interviews.html` |
| Excel export/import | Run `test-questionnaire-export-import.html` and `test-merged-excel-export.html` |
| UI change | Check responsive layout at desktop, tablet and mobile widths |
| PWA / caching | Bump `APP_VERSION` in both `app.js` and `service-worker.js`; run `pwa-test.html` |
| New translatable string | Add both `fr` and `en` values; use `getTranslation()` |
| New question field | Update `deepMergeAssessment()` to handle the new field during sync |

---

## 12. CI / Preview Workflow

`.github/workflows/preview-pr.yml` deploys a PR preview to Surge.sh.  
**Trigger:** comment `/preview` on any open pull request.  
**Requirement:** `SURGE_TOKEN` secret must be set in the repository's Actions secrets.  
The preview URL is `https://pr-{PR_NUMBER}-test-maturity-preview.surge.sh`.
