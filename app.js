// Application version for compatibility tracking
const APP_VERSION = '1.2.4'; // Version bump to test update banner detection

// Application state
let currentAssessment = {
    name: '', // Application name
    interviewName: '', // Interview name (team name, profile name, or group)
    profile: '',
    date: '', // Last modified timestamp
    interviewDate: '', // Actual interview date (editable, independent from date)
    interviewees: [], // List of people interviewed
    selectedProfiles: [], // Profiles selected for this interview
    generalComments: '', // General comments about the interview
    answers: {},
    comments: {},
    answeredBy: {}, // Track which profile answered each question
    attachments: {}, // Store file attachments for each question
    appVersion: APP_VERSION // Track which version created/modified this assessment
};

let assessments = [];
let filteredQuestions = [];

// Custom questions state
let customQuestions = null; // null = using default, otherwise array of custom questions
let activeQuestions = QUESTIONS_CATALOG.questions; // The actual questions being used (custom or default), defaults to standard questions
let editingQuestionId = null; // Track which question is being edited

// Filesystem sync state
let syncFolderHandle = null;
let syncEnabled = false;
let syncInterval = null;

// Maximum display length for sync folder names in header - longer names will be truncated with "..." and show full name in tooltip
const MAX_FOLDER_NAME_LENGTH = 15;

// Auto-save state
let autoSaveTimeout = null;
let autoSaveStatus = null;

// Active editing state for smart sync
let isActivelyEditing = false;
let editingIdleTimeout = null;
const EDITING_IDLE_THRESHOLD = 5000; // Consider idle after 5 seconds of no changes
const SYNC_INTERVAL_ACTIVE = 15000; // 15 seconds during active editing
const SYNC_INTERVAL_IDLE = 5000; // 5 seconds when idle

// Helper function to get active questions catalog
function getActiveQuestionsCatalog() {
    return activeQuestions || QUESTIONS_CATALOG.questions;
}

// Deep merge function to preserve all fields when syncing assessments
// This ensures that newer fields (like attachments) are preserved even if
// an older version of the app loads and re-saves an assessment
function deepMergeAssessment(existing, imported) {
    // Start with the imported data (newer file version)
    const merged = { ...imported };
    
    // Preserve any fields that exist in the existing assessment but not in imported
    // This handles the case where an old app version loads a new assessment
    for (const key in existing) {
        if (!(key in merged)) {
            // Field exists in existing but not in imported - preserve it
            merged[key] = existing[key];
            console.log(`Preserved field '${key}' from existing assessment during sync`);
        }
    }
    
    // Always use the imported version's appVersion and _fileLastModified
    merged.appVersion = imported.appVersion || existing.appVersion || APP_VERSION;
    if (imported._fileLastModified) {
        merged._fileLastModified = imported._fileLastModified;
    }
    
    return merged;
}

// Constants for maturity calculation
const MATURITY_SCALE_MIN = 1;
const MATURITY_SCALE_MAX = 5;
const PERCENTAGE_TO_SCALE_DIVISOR = 20; // Maps 0-100% to 0-5 range
const SCALE_OFFSET = 0.5; // Ensures proper rounding to maturity levels

// All available profiles - used for "Answered by" dropdown
const ALL_PROFILES = ['developer', 'qa', 'devops', 'manager'];

// IndexedDB for persisting folder handle
const DB_NAME = 'TestMaturityDB';
const DB_VERSION = 1;
const STORE_NAME = 'settings';
const FOLDER_HANDLE_KEY = 'syncFolderHandle';

// IndexedDB Helper Functions
async function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
}

async function saveFolderHandleToIndexedDB(handle) {
    let db;
    try {
        db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        await new Promise((resolve, reject) => {
            const request = store.put(handle, FOLDER_HANDLE_KEY);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        return true;
    } catch (error) {
        console.error('Error saving folder handle to IndexedDB:', error);
        return false;
    } finally {
        if (db) db.close();
    }
}

async function loadFolderHandleFromIndexedDB() {
    let db;
    try {
        db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const handle = await new Promise((resolve, reject) => {
            const request = store.get(FOLDER_HANDLE_KEY);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        return handle;
    } catch (error) {
        console.error('Error loading folder handle from IndexedDB:', error);
        return null;
    } finally {
        if (db) db.close();
    }
}

async function removeFolderHandleFromIndexedDB() {
    let db;
    try {
        db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        await new Promise((resolve, reject) => {
            const request = store.delete(FOLDER_HANDLE_KEY);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        return true;
    } catch (error) {
        console.error('Error removing folder handle from IndexedDB:', error);
        return false;
    } finally {
        if (db) db.close();
    }
}

// DOM Elements
const tabs = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const appNameInput = document.getElementById('app-name');
const interviewNameInput = document.getElementById('interview-name');
const intervieweesInput = document.getElementById('interviewees');
const startInterviewBtn = document.getElementById('start-interview');
const profileFilterContainer = document.getElementById('profile-filter');
const questionsContainer = document.getElementById('questions-container');

// Metadata editor elements
const toggleMetadataBtn = document.getElementById('toggle-metadata-editor');
const metadataSection = document.querySelector('.metadata-section');
const editAppNameInput = document.getElementById('edit-app-name');
const editInterviewNameInput = document.getElementById('edit-interview-name');
const interviewDatesContainer = document.getElementById('interview-dates-container');
const addInterviewDateBtn = document.getElementById('add-interview-date');
const editIntervieweesInput = document.getElementById('edit-interviewees');
const editGeneralCommentsInput = document.getElementById('edit-general-comments');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const viewResultsBtn = document.getElementById('view-results');
const exportDataBtn = document.getElementById('export-data');
const importDataBtn = document.getElementById('import-data');
const importFileInput = document.getElementById('import-file');
const savedAssessmentsDiv = document.getElementById('saved-assessments');
const resultsSelect = document.getElementById('results-select');
const resultsContainer = document.getElementById('results-container');
const interviewTitle = document.getElementById('interview-title');
const selectSyncFolderBtn = document.getElementById('select-sync-folder');
const syncStatusDiv = document.getElementById('sync-status');
const headerSyncIndicator = document.getElementById('header-sync-indicator');
const headerSelectSyncFolderBtn = document.getElementById('header-select-sync-folder');
const hamburgerBtn = document.getElementById('hamburger-menu');
const tabsMobile = document.querySelector('.tabs-mobile');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    loadAssessments();
    updateSavedAssessmentsList();
    setupEventListeners();
    checkFileSystemAccessSupport();
    initAutoSave();
    updateHeaderSyncStatus(); // Initialize header sync status
    updateTabVisibility(); // Initialize tab visibility
    
    // Initialize question editor
    initQuestionEditor();
    
    // Load sync settings asynchronously (doesn't block other initialization)
    await loadSyncSettings();
    
    // Clean up intervals when page unloads
    window.addEventListener('beforeunload', () => {
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }
        if (editingIdleTimeout) {
            clearTimeout(editingIdleTimeout);
        }
        if (syncInterval) {
            clearInterval(syncInterval);
        }
    });
});

// Event Listeners
function setupEventListeners() {
    // Tab navigation
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
            // Close mobile menu after selecting a tab
            closeMobileMenu();
        });
    });

    // Hamburger menu
    if (hamburgerBtn && tabsMobile) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            tabsMobile.classList.toggle('show');
        });
    }

    // Start interview
    startInterviewBtn.addEventListener('click', startInterview);
    
    // Profile filter checkboxes change
    if (profileFilterContainer) {
        const profileCheckboxes = profileFilterContainer.querySelectorAll('input[type="checkbox"]');
        profileCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleProfileFilterChange);
        });
    }

    // View results
    viewResultsBtn.addEventListener('click', () => {
        switchTab('results');
        displayResults();
    });

    // Excel Export/Import data
    exportDataBtn.addEventListener('click', exportData);
    importDataBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', importData);
    
    // Excel Export for assessments
    const exportDataExcelBtn = document.getElementById('export-data-excel');
    
    if (exportDataExcelBtn) {
        exportDataExcelBtn.addEventListener('click', exportAssessmentsToExcel);
    }
    
    // Excel Export/Import for questions
    const exportQuestionsExcelBtn = document.getElementById('export-questions-excel');
    const importQuestionsExcelBtn = document.getElementById('import-questions-excel');
    const importQuestionsExcelFileInput = document.getElementById('import-questions-excel-file');
    
    if (exportQuestionsExcelBtn) {
        exportQuestionsExcelBtn.addEventListener('click', exportQuestionsToExcel);
    }
    if (importQuestionsExcelBtn) {
        importQuestionsExcelBtn.addEventListener('click', () => importQuestionsExcelFileInput.click());
    }
    if (importQuestionsExcelFileInput) {
        importQuestionsExcelFileInput.addEventListener('change', importQuestionsFromExcel);
    }
    
    // Excel Export for results
    const exportResultsExcelBtn = document.getElementById('export-results-excel');
    if (exportResultsExcelBtn) {
        exportResultsExcelBtn.addEventListener('click', exportResultToExcel);
    }
    
    // Excel Export/Import for interview questionnaire
    const exportQuestionnaireBtn = document.getElementById('export-questionnaire');
    const importQuestionnaireBtn = document.getElementById('import-questionnaire');
    const importQuestionnaireFileInput = document.getElementById('import-questionnaire-file');
    
    if (exportQuestionnaireBtn) {
        exportQuestionnaireBtn.addEventListener('click', exportInterviewQuestionnaireToExcel);
    }
    if (importQuestionnaireBtn) {
        importQuestionnaireBtn.addEventListener('click', () => importQuestionnaireFileInput.click());
    }
    if (importQuestionnaireFileInput) {
        importQuestionnaireFileInput.addEventListener('change', importInterviewQuestionnaireFromExcel);
    }

    // Results select
    resultsSelect.addEventListener('change', displayResults);

    // Sync folder
    if (selectSyncFolderBtn) {
        selectSyncFolderBtn.addEventListener('click', selectSyncFolder);
    }
    if (headerSelectSyncFolderBtn) {
        headerSelectSyncFolderBtn.addEventListener('click', selectSyncFolder);
    }
    
    // Metadata editor toggle
    if (toggleMetadataBtn) {
        toggleMetadataBtn.addEventListener('click', toggleMetadataEditor);
    }
    
    // Add interview date button
    if (addInterviewDateBtn) {
        addInterviewDateBtn.addEventListener('click', addInterviewDate);
    }
    
    // Auto-save metadata on input changes
    if (editAppNameInput) {
        editAppNameInput.addEventListener('input', handleMetadataChange);
    }
    if (editInterviewNameInput) {
        editInterviewNameInput.addEventListener('input', handleMetadataChange);
    }
    if (editIntervieweesInput) {
        editIntervieweesInput.addEventListener('input', handleMetadataChange);
    }
    if (editGeneralCommentsInput) {
        editGeneralCommentsInput.addEventListener('input', handleMetadataChange);
    }
}

// Close mobile menu
function closeMobileMenu() {
    if (hamburgerBtn && tabsMobile) {
        hamburgerBtn.classList.remove('active');
        tabsMobile.classList.remove('show');
    }
}

// Tab switching
function switchTab(tabName) {
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });

    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabName) {
            content.classList.add('active');
        }
    });
    
    // Show/hide interview controls based on active tab
    const interviewControls = document.getElementById('interview-controls');
    if (interviewControls) {
        interviewControls.classList.toggle('hidden', tabName !== 'interview');
    }
    
    // Update body class for padding adjustment
    document.body.classList.toggle('interview-active', tabName === 'interview');
    
    // Auto-select current assessment in Results tab if one is being edited
    if (tabName === 'results' && currentAssessment && currentAssessment.name) {
        // Find the index of the current assessment in the assessments array
        // Match by both name and date to ensure uniqueness
        const currentIndex = assessments.findIndex(a => 
            a.name === currentAssessment.name && a.date === currentAssessment.date
        );
        if (currentIndex >= 0) {
            // Select it in the dropdown
            resultsSelect.value = currentIndex;
            // Display its results
            displayResults();
        }
    }
}

// Update tab visibility based on application state
function updateTabVisibility() {
    const interviewTab = document.querySelector('[data-tab="interview"]');
    const resultsTab = document.querySelector('[data-tab="results"]');
    
    // Show Interview tab only if an interview has been started (currentAssessment has a name)
    if (interviewTab) {
        if (currentAssessment && currentAssessment.name) {
            interviewTab.classList.remove('hidden');
        } else {
            interviewTab.classList.add('hidden');
        }
    }
    
    // Show Results tab only if there are saved assessments
    if (resultsTab) {
        if (assessments && assessments.length > 0) {
            resultsTab.classList.remove('hidden');
        } else {
            resultsTab.classList.add('hidden');
        }
    }
}

// Start Interview
function startInterview() {
    const appName = appNameInput.value.trim();
    const interviewName = interviewNameInput.value.trim();
    const intervieweesText = intervieweesInput.value.trim();

    if (!appName) {
        alert('Please enter an application name');
        return;
    }
    
    if (!interviewName) {
        alert('Please enter an interview name (e.g., team name, profile name, or group identifier)');
        return;
    }

    // Parse interviewees from text input (comma-separated or line-separated)
    let interviewees = [];
    if (intervieweesText) {
        // Split by comma or newline, trim whitespace, and filter empty values
        interviewees = intervieweesText
            .split(/[,\n]/)
            .map(name => name.trim())
            .filter(name => name.length > 0);
    }

    // Get selected profiles from checkboxes
    const selectedProfiles = [];
    if (profileFilterContainer) {
        const profileCheckboxes = profileFilterContainer.querySelectorAll('input[type="checkbox"]:checked');
        profileCheckboxes.forEach(checkbox => {
            selectedProfiles.push(checkbox.value);
        });
    }

    // Initialize current assessment with new metadata
    const now = new Date();
    currentAssessment = {
        name: appName,
        interviewName: interviewName,
        profile: 'all', // Default to all, will be filtered in interview
        date: now.toISOString(), // Last modified timestamp
        interviewDates: [now.toISOString()], // Array of interview dates (editable, can add more)
        interviewees: interviewees,
        selectedProfiles: selectedProfiles,
        generalComments: '', // Initialize empty general comments
        answers: {},
        comments: {},
        answeredBy: {},
        attachments: {},
        appVersion: APP_VERSION
    };
    
    // Populate metadata editor with current values
    populateMetadataEditor();

    // Reset profile filter checkboxes
    if (profileFilterContainer) {
        const profileCheckboxes = profileFilterContainer.querySelectorAll('input[type="checkbox"]');
        profileCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
    
    // Show all questions initially (no filter)
    filteredQuestions = getActiveQuestionsCatalog();

    // Render questions
    renderQuestions();
    updateProgress();
    
    // Update interview title to include both app and interview name
    interviewTitle.textContent = `Interview: ${appName} - ${interviewName}`;

    // Update tab visibility to show Interview tab
    updateTabVisibility();

    // Save the assessment immediately to create the interview file
    // This ensures the file exists even before any answers are filled
    saveInitialAssessment();

    // Switch to interview tab
    switchTab('interview');
}

// Save initial assessment when starting an interview (before any answers)
async function saveInitialAssessment() {
    try {
        // Show saving status
        updateAutoSaveStatus('saving');
        
        // Check if assessment with same name and interviewName exists
        const existingIndex = assessments.findIndex(a => 
            a.name === currentAssessment.name && 
            (a.interviewName || a.name) === (currentAssessment.interviewName || currentAssessment.name)
        );
        
        // Ensure appVersion is set on the current assessment
        if (!currentAssessment.appVersion) {
            currentAssessment.appVersion = APP_VERSION;
        }
        
        if (existingIndex >= 0) {
            assessments[existingIndex] = JSON.parse(JSON.stringify(currentAssessment));
        } else {
            assessments.push(JSON.parse(JSON.stringify(currentAssessment)));
        }

        await saveAssessments();
        updateSavedAssessmentsList();
        updateResultsSelect();
        
        // Show saved status
        updateAutoSaveStatus('saved');
        
        console.log('Initial assessment saved successfully');
    } catch (error) {
        console.error('Error saving initial assessment:', error);
        updateAutoSaveStatus('error', 'Failed to save');
    }
}

// Handle profile filter change
function handleProfileFilterChange() {
    // Get all selected profiles from checkboxes
    const selectedProfiles = [];
    if (profileFilterContainer) {
        const profileCheckboxes = profileFilterContainer.querySelectorAll('input[type="checkbox"]:checked');
        profileCheckboxes.forEach(checkbox => {
            selectedProfiles.push(checkbox.value);
        });
    }
    
    // Update current assessment's selected profiles for persistence
    if (currentAssessment) {
        currentAssessment.selectedProfiles = selectedProfiles;
        // Mark as actively editing
        markAsActivelyEditing();
        // Trigger auto-save
        triggerAutoSave();
    }
    
    if (selectedProfiles.length === 0) {
        // Show all questions if no profiles selected
        filteredQuestions = getActiveQuestionsCatalog();
    } else {
        // Filter questions by selected profiles - show questions that match ANY of the selected profiles
        filteredQuestions = getActiveQuestionsCatalog().filter(q => 
            selectedProfiles.some(profile => q.profiles.includes(profile))
        );
    }
    
    // Re-render questions
    renderQuestions();
    updateProgress();
}

// Toggle metadata editor visibility
function toggleMetadataEditor() {
    if (metadataSection && toggleMetadataBtn) {
        metadataSection.classList.toggle('collapsed');
        const toggleIcon = toggleMetadataBtn.querySelector('.toggle-icon');
        const toggleText = toggleMetadataBtn.querySelector('.toggle-text');
        
        if (metadataSection.classList.contains('collapsed')) {
            toggleIcon.textContent = '▶';
            toggleText.textContent = 'Edit Interview Metadata';
        } else {
            toggleIcon.textContent = '▼';
            toggleText.textContent = 'Hide Interview Metadata';
            // Populate with current values when opening
            populateMetadataEditor();
        }
    }
}

// Add a new interview date field
function addInterviewDate() {
    if (!interviewDatesContainer) return;
    
    const dateItem = document.createElement('div');
    dateItem.className = 'interview-date-item';
    
    const dateInput = document.createElement('input');
    dateInput.type = 'datetime-local';
    dateInput.className = 'form-control';
    
    // Add auto-save listener to the date input
    dateInput.addEventListener('change', handleMetadataChange);
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-date-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = () => {
        dateItem.remove();
        // Trigger auto-save when a date is removed
        handleMetadataChange();
    };
    
    dateItem.appendChild(dateInput);
    dateItem.appendChild(removeBtn);
    interviewDatesContainer.appendChild(dateItem);
}

// Populate metadata editor with current assessment values
function populateMetadataEditor() {
    if (!currentAssessment) return;
    
    if (editAppNameInput) {
        editAppNameInput.value = currentAssessment.name || '';
    }
    if (editInterviewNameInput) {
        editInterviewNameInput.value = currentAssessment.interviewName || '';
    }
    
    // Populate interview dates
    if (interviewDatesContainer) {
        interviewDatesContainer.innerHTML = ''; // Clear existing
        
        // Support both old single date and new multiple dates format
        let dates = [];
        if (currentAssessment.interviewDates && Array.isArray(currentAssessment.interviewDates)) {
            dates = currentAssessment.interviewDates;
        } else if (currentAssessment.interviewDate) {
            dates = [currentAssessment.interviewDate];
        } else if (currentAssessment.date) {
            dates = [currentAssessment.date];
        }
        
        // Add existing dates
        dates.forEach(dateValue => {
            const dateItem = document.createElement('div');
            dateItem.className = 'interview-date-item';
            
            const dateInput = document.createElement('input');
            dateInput.type = 'datetime-local';
            dateInput.className = 'form-control';
            
            if (dateValue) {
                const date = new Date(dateValue);
                // Format as YYYY-MM-DDTHH:MM
                const localDatetime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16);
                dateInput.value = localDatetime;
            }
            
            // Add auto-save listener to the date input
            dateInput.addEventListener('change', handleMetadataChange);
            
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-date-btn';
            removeBtn.textContent = 'Remove';
            removeBtn.onclick = () => {
                dateItem.remove();
                // Trigger auto-save when a date is removed
                handleMetadataChange();
            };
            
            dateItem.appendChild(dateInput);
            dateItem.appendChild(removeBtn);
            interviewDatesContainer.appendChild(dateItem);
        });
        
        // If no dates exist, add one empty field
        if (dates.length === 0) {
            addInterviewDate();
        }
    }
    
    if (editIntervieweesInput) {
        const interviewees = currentAssessment.interviewees || [];
        editIntervieweesInput.value = interviewees.join('\n');
    }
    if (editGeneralCommentsInput) {
        editGeneralCommentsInput.value = currentAssessment.generalComments || '';
    }
}

// Handle metadata field changes with auto-save
function handleMetadataChange() {
    if (!currentAssessment) {
        return;
    }
    
    // Update current assessment with edited values
    if (editAppNameInput) {
        currentAssessment.name = editAppNameInput.value.trim();
    }
    if (editInterviewNameInput) {
        currentAssessment.interviewName = editInterviewNameInput.value.trim();
    }
    
    // Collect all interview dates
    if (interviewDatesContainer) {
        const dateInputs = interviewDatesContainer.querySelectorAll('input[type="datetime-local"]');
        const dates = [];
        dateInputs.forEach(input => {
            if (input.value) {
                dates.push(new Date(input.value).toISOString());
            }
        });
        // Use current date as fallback to ensure at least one date is always set
        currentAssessment.interviewDates = dates.length > 0 ? dates : [new Date().toISOString()];
        
        // Also set interviewDate to first date for backward compatibility
        if (dates.length > 0) {
            currentAssessment.interviewDate = dates[0];
        }
    }
    
    if (editIntervieweesInput) {
        // Parse interviewees from textarea (line-separated)
        const intervieweesText = editIntervieweesInput.value.trim();
        currentAssessment.interviewees = intervieweesText
            .split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);
    }
    if (editGeneralCommentsInput) {
        currentAssessment.generalComments = editGeneralCommentsInput.value.trim();
    }
    
    // Update the interview title
    if (interviewTitle && currentAssessment.name && currentAssessment.interviewName) {
        interviewTitle.textContent = `Interview: ${currentAssessment.name} - ${currentAssessment.interviewName}`;
    }
    
    // Mark as actively editing
    markAsActivelyEditing();
    
    // Trigger auto-save
    triggerAutoSave();
}

// Render Questions
function renderQuestions() {
    questionsContainer.innerHTML = '';

    filteredQuestions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        
        // Determine theme grouping
        const prevQuestion = index > 0 ? filteredQuestions[index - 1] : null;
        const nextQuestion = index < filteredQuestions.length - 1 ? filteredQuestions[index + 1] : null;
        const isFirstInGroup = !prevQuestion || prevQuestion.theme !== question.theme;
        const isLastInGroup = !nextQuestion || nextQuestion.theme !== question.theme;
        
        // Apply grouping classes
        if (!isFirstInGroup && !isLastInGroup) {
            questionDiv.className += ' theme-group-middle';
        } else if (isFirstInGroup && !isLastInGroup) {
            questionDiv.className += ' theme-group-first';
        } else if (!isFirstInGroup && isLastInGroup) {
            questionDiv.className += ' theme-group-last';
        }
        
        // Show theme header only for first question in group
        const themeHeader = isFirstInGroup ? `<div class="question-theme-header">${question.theme}</div>` : '';
        
        // Generate profile badges for questions
        const profileBadges = question.profiles
            .filter(p => p !== 'all')
            .map(p => `<span class="profile-badge profile-${p}">${p}</span>`)
            .join(' ');
        
        // Generate profile selector dropdown - show all profiles since anyone may have the answer
        const applicableProfiles = question.profiles.filter(p => p !== 'all');
        const options = ALL_PROFILES.map(p => 
            `<option value="${p}">${p.charAt(0).toUpperCase() + p.slice(1)}</option>`
        ).join('');
        
        let profileRow = '';
        if (profileBadges) {
            profileRow = `
                <div class="comment-section collapsed">
                    <div class="comment-header">
                        <button class="comment-toggle" data-question-id="${question.id}">
                            <span class="toggle-icon">▶</span>
                            <span class="toggle-text">Add comment or files</span>
                        </button>
                        <div class="profile-row-inline">
                            <span class="question-weight">Weight: ${question.weight}</span>
                            <div class="profile-can-answer">Can be answered by: ${profileBadges}</div>
                        </div>
                        <div class="profile-selector">
                            <label for="profile-${question.id}" class="profile-selector-label">Answered by:</label>
                            <select id="profile-${question.id}" class="profile-select-input" data-question-id="${question.id}">
                                <option value="">Select...</option>
                                ${options}
                            </select>
                        </div>
                    </div>
                    <div class="comment-content">
                        <textarea id="comment-${question.id}" class="comment-input" data-question-id="${question.id}" placeholder="Add any notes or context for this question..." rows="2"></textarea>
                        <div class="attachment-controls">
                            <label class="btn-attachment-upload">
                                📎 Attach Files
                                <input type="file" id="file-${question.id}" data-question-id="${question.id}" multiple accept="image/*,.pdf,.doc,.docx,.txt" style="display: none;">
                            </label>
                            <span class="attachment-hint">or paste screenshots (Ctrl+V)</span>
                        </div>
                        <div id="attachments-${question.id}" class="attachments-container"></div>
                    </div>
                </div>
            `;
        }
        
        questionDiv.innerHTML = `
            ${themeHeader}
            <div class="question-content">
                <div class="question-text"><span class="question-id">${question.id}</span>${question.question}</div>
                <div class="answer-buttons">
                    <button class="answer-btn" data-question-id="${question.id}" data-answer="yes">
                        ✓ Yes
                    </button>
                    <button class="answer-btn" data-question-id="${question.id}" data-answer="no">
                        ✗ No
                    </button>
                </div>
            </div>
            ${profileRow}
        `;

        // Add click handlers for answer buttons
        const answerButtons = questionDiv.querySelectorAll('.answer-btn');
        answerButtons.forEach(btn => {
            btn.addEventListener('click', () => handleAnswer(btn));
        });

        // Add change handler for comment textarea
        const commentTextarea = questionDiv.querySelector('.comment-input');
        commentTextarea.addEventListener('input', () => handleComment(commentTextarea));
        
        // Add click handler for comment toggle
        const commentToggle = questionDiv.querySelector('.comment-toggle');
        const commentSection = questionDiv.querySelector('.comment-section');
        commentToggle.addEventListener('click', () => {
            commentSection.classList.toggle('collapsed');
            const toggleIcon = commentToggle.querySelector('.toggle-icon');
            const toggleText = commentToggle.querySelector('.toggle-text');
            if (commentSection.classList.contains('collapsed')) {
                toggleIcon.textContent = '▶';
                toggleText.textContent = 'Add comment or files';
            } else {
                toggleIcon.textContent = '▼';
                toggleText.textContent = 'Hide comment and files';
                commentTextarea.focus();
            }
        });
        
        // Add change handler for profile selector
        const profileSelect = questionDiv.querySelector('.profile-select-input');
        if (profileSelect) {
            profileSelect.addEventListener('change', () => handleProfileSelection(profileSelect));
        }
        
        // Add file input change handler
        const fileInput = questionDiv.querySelector(`#file-${question.id}`);
        if (fileInput) {
            fileInput.addEventListener('change', (e) => handleFileAttachment(e.target, question.id));
        }
        
        // Add paste event listener to the comment section for screenshots
        const commentContent = questionDiv.querySelector('.comment-content');
        if (commentContent) {
            commentContent.addEventListener('paste', (e) => handlePaste(e, question.id));
        }

        // Restore previous answer if exists
        if (currentAssessment.answers[question.id]) {
            const answer = currentAssessment.answers[question.id];
            const selectedBtn = questionDiv.querySelector(`[data-question-id="${question.id}"][data-answer="${answer}"]`);
            if (selectedBtn) {
                selectedBtn.classList.add(answer);
            }
        }

        // Restore previous comment if exists
        if (currentAssessment.comments && currentAssessment.comments[question.id]) {
            commentTextarea.value = currentAssessment.comments[question.id];
            // Expand the comment section if there's a comment
            commentSection.classList.remove('collapsed');
            const toggleIcon = commentToggle.querySelector('.toggle-icon');
            const toggleText = commentToggle.querySelector('.toggle-text');
            toggleIcon.textContent = '▼';
            toggleText.textContent = 'Hide comment and files';
        }
        
        // Check if there are attachments (will render after appending to DOM)
        const hasAttachments = currentAssessment.attachments && currentAssessment.attachments[question.id];
        if (hasAttachments && commentSection) {
            // Expand the comment section if there are attachments
            commentSection.classList.remove('collapsed');
            const toggleIcon = commentToggle.querySelector('.toggle-icon');
            const toggleText = commentToggle.querySelector('.toggle-text');
            toggleIcon.textContent = '▼';
            toggleText.textContent = 'Hide comment and files';
        }
        
        // Pre-select the "Answered by" dropdown
        if (profileSelect) {
            // First priority: use existing answeredBy value
            if (currentAssessment.answeredBy && currentAssessment.answeredBy[question.id]) {
                profileSelect.value = currentAssessment.answeredBy[question.id];
            } 
            // Second priority: pre-select with current profile filter if only one profile is selected
            else if (profileFilterContainer) {
                const selectedProfiles = Array.from(
                    profileFilterContainer.querySelectorAll('input[type="checkbox"]:checked')
                ).map(cb => cb.value);
                
                // If only one profile is selected, pre-select it
                if (selectedProfiles.length === 1 && ALL_PROFILES.includes(selectedProfiles[0])) {
                    profileSelect.value = selectedProfiles[0];
                }
            }
        }

        questionsContainer.appendChild(questionDiv);
        
        // Restore previous attachments AFTER appending to DOM
        if (hasAttachments) {
            renderAttachments(question.id);
        }
    });
}

// Handle Answer
function handleAnswer(button) {
    const questionId = button.dataset.questionId;
    const answer = button.dataset.answer;

    // Remove previous selection
    const questionDiv = button.closest('.question-item');
    const allButtons = questionDiv.querySelectorAll('.answer-btn');
    allButtons.forEach(btn => {
        btn.classList.remove('yes', 'no');
    });

    // Add new selection
    button.classList.add(answer);

    // Store answer
    currentAssessment.answers[questionId] = answer;
    
    // Initialize answeredBy if needed
    if (!currentAssessment.answeredBy) {
        currentAssessment.answeredBy = {};
    }
    
    // Store answeredBy if profile selector exists
    const profileSelect = questionDiv.querySelector('.profile-select-input');
    if (profileSelect) {
        // Question with profile selector
        if (profileSelect.value) {
            // Use the selected value from dropdown
            currentAssessment.answeredBy[questionId] = profileSelect.value;
        } else if (profileFilterContainer) {
            // No dropdown selection, but profile filter is set
            const selectedProfiles = Array.from(
                profileFilterContainer.querySelectorAll('input[type="checkbox"]:checked')
            ).map(cb => cb.value);
            
            // If only one profile is selected, use it and update dropdown
            if (selectedProfiles.length === 1 && ALL_PROFILES.includes(selectedProfiles[0])) {
                currentAssessment.answeredBy[questionId] = selectedProfiles[0];
                profileSelect.value = selectedProfiles[0]; // Update the dropdown
            }
        }
    } else {
        // Single-profile question - infer from question's profiles array
        const question = getActiveQuestionsCatalog().find(q => q.id === questionId);
        if (question) {
            const applicableProfiles = question.profiles.filter(p => p !== 'all');
            if (applicableProfiles.length === 1) {
                // Only one profile can answer this question
                currentAssessment.answeredBy[questionId] = applicableProfiles[0];
            }
        }
    }

    // Update progress
    updateProgress();
    
    // Mark as actively editing
    markAsActivelyEditing();
    
    // Trigger auto-save
    triggerAutoSave();
}

// Handle Profile Selection
function handleProfileSelection(select) {
    const questionId = select.dataset.questionId;
    const profile = select.value;

    // Initialize answeredBy object if it doesn't exist
    if (!currentAssessment.answeredBy) {
        currentAssessment.answeredBy = {};
    }

    // Store or remove profile selection
    if (profile) {
        currentAssessment.answeredBy[questionId] = profile;
    } else {
        delete currentAssessment.answeredBy[questionId];
    }
    
    // Mark as actively editing
    markAsActivelyEditing();
    
    // Trigger auto-save
    triggerAutoSave();
}

// Handle Comment
function handleComment(textarea) {
    const questionId = textarea.dataset.questionId;
    const comment = textarea.value.trim();

    // Initialize comments object if it doesn't exist
    if (!currentAssessment.comments) {
        currentAssessment.comments = {};
    }

    // Store or remove comment
    if (comment) {
        currentAssessment.comments[questionId] = comment;
    } else {
        delete currentAssessment.comments[questionId];
    }
    
    // Mark as actively editing
    markAsActivelyEditing();
    
    // Trigger auto-save
    triggerAutoSave();
}

// localStorage is no longer used - all data is persisted to sync folder only

// Storage quota checking removed - no longer needed with folder-only storage

// Handle File Attachment
async function handleFileAttachment(input, questionId) {
    const files = input.files;
    if (!files || files.length === 0) return;

    // Initialize attachments object if it doesn't exist
    if (!currentAssessment.attachments) {
        currentAssessment.attachments = {};
    }

    // Initialize array for this question if needed
    if (!currentAssessment.attachments[questionId]) {
        currentAssessment.attachments[questionId] = [];
    }

    // Process each file
    for (const file of files) {
        // Check file size (max 5MB per file)
        if (file.size > 5 * 1024 * 1024) {
            alert(`File "${file.name}" is too large. Maximum size is 5MB.`);
            continue;
        }

        try {
            const base64 = await fileToBase64(file);
            currentAssessment.attachments[questionId].push({
                name: file.name,
                type: file.type,
                size: file.size,
                data: base64,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error processing file:', error);
            alert(`Error processing file "${file.name}"`);
        }
    }

    // Clear input to allow re-uploading the same file
    input.value = '';

    // Re-render the question to show attachments
    renderAttachments(questionId);
    
    // Mark as actively editing
    markAsActivelyEditing();
    
    // Trigger auto-save
    triggerAutoSave();
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Handle paste event for image screenshots
function handlePaste(event, questionId) {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
                const input = document.createElement('input');
                input.type = 'file';
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                input.files = dataTransfer.files;
                handleFileAttachment(input, questionId);
            }
            break;
        }
    }
}

// Rename attachment
function renameAttachment(questionId, index) {
    if (!currentAssessment.attachments || !currentAssessment.attachments[questionId]) {
        return;
    }

    const attachment = currentAssessment.attachments[questionId][index];
    if (!attachment) return;

    // Extract file extension
    const lastDotIndex = attachment.name.lastIndexOf('.');
    const extension = lastDotIndex > -1 ? attachment.name.substring(lastDotIndex) : '';
    const nameWithoutExt = lastDotIndex > -1 ? attachment.name.substring(0, lastDotIndex) : attachment.name;

    // Prompt for new name
    const newName = prompt('Enter new file name (without extension):', nameWithoutExt);
    
    if (newName === null) {
        // User cancelled
        return;
    }
    
    if (newName.trim() === '') {
        alert('File name cannot be empty.');
        return;
    }

    // Sanitize the filename - remove/replace invalid characters
    let sanitizedName = newName.trim()
        // Replace invalid characters with underscore
        .replace(/[<>:"/\\|?*\x00-\x1F\x7F]/g, '_')
        // Replace multiple consecutive underscores with single underscore
        .replace(/_+/g, '_')
        // Remove leading/trailing underscores and dots
        .replace(/^[._]+|[._]+$/g, '');
    
    // Check for reserved Windows filenames
    const reservedNames = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i;
    if (reservedNames.test(sanitizedName)) {
        sanitizedName = '_' + sanitizedName;
    }
    
    // Ensure the name is not empty after sanitization
    if (sanitizedName === '') {
        alert('Invalid file name. Please use alphanumeric characters.');
        return;
    }
    
    // Update the attachment name with extension
    attachment.name = sanitizedName + extension;

    // Re-render attachments
    renderAttachments(questionId);
    
    // Mark as actively editing
    markAsActivelyEditing();
    
    // Trigger auto-save
    triggerAutoSave();
}

// Remove attachment
function removeAttachment(questionId, index) {
    if (!currentAssessment.attachments || !currentAssessment.attachments[questionId]) {
        return;
    }

    if (confirm('Are you sure you want to remove this attachment?')) {
        currentAssessment.attachments[questionId].splice(index, 1);
        
        // Remove the array if empty
        if (currentAssessment.attachments[questionId].length === 0) {
            delete currentAssessment.attachments[questionId];
        }

        // Re-render attachments
        renderAttachments(questionId);
        
        // Mark as actively editing
        markAsActivelyEditing();
        
        // Trigger auto-save
        triggerAutoSave();
    }
}

// Render attachments for a question
function renderAttachments(questionId) {
    const container = document.getElementById(`attachments-${questionId}`);
    if (!container) return;

    container.innerHTML = '';

    const attachments = currentAssessment.attachments?.[questionId];
    if (!attachments || attachments.length === 0) {
        return;
    }

    attachments.forEach((attachment, index) => {
        const attachmentDiv = document.createElement('div');
        attachmentDiv.className = 'attachment-item';
        
        const isImage = attachment.type.startsWith('image/');
        const icon = isImage ? '🖼️' : '📄';
        const sizeKB = Math.round(attachment.size / 1024);
        
        attachmentDiv.innerHTML = `
            <span class="attachment-icon">${icon}</span>
            <span class="attachment-name" title="${attachment.name}">${attachment.name}</span>
            <span class="attachment-size">(${sizeKB} KB)</span>
            ${isImage ? `<button class="btn-attachment-preview" data-question-id="${questionId}" data-index="${index}">👁️ Preview</button>` : ''}
            <button class="btn-attachment-rename" data-question-id="${questionId}" data-index="${index}">✏️ Rename</button>
            <button class="btn-attachment-download" data-question-id="${questionId}" data-index="${index}">⬇️ Download</button>
            <button class="btn-attachment-remove" data-question-id="${questionId}" data-index="${index}">🗑️</button>
        `;

        // Add event listeners
        const previewBtn = attachmentDiv.querySelector('.btn-attachment-preview');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => previewAttachment(questionId, index));
        }

        const renameBtn = attachmentDiv.querySelector('.btn-attachment-rename');
        renameBtn.addEventListener('click', () => renameAttachment(questionId, index));

        const downloadBtn = attachmentDiv.querySelector('.btn-attachment-download');
        downloadBtn.addEventListener('click', () => downloadAttachment(questionId, index));

        const removeBtn = attachmentDiv.querySelector('.btn-attachment-remove');
        removeBtn.addEventListener('click', () => removeAttachment(questionId, index));

        container.appendChild(attachmentDiv);
    });
}

// Preview attachment (for images)
function previewAttachment(questionId, index) {
    const attachment = currentAssessment.attachments?.[questionId]?.[index];
    if (!attachment) return;

    const modal = document.createElement('div');
    modal.className = 'attachment-preview-modal';
    modal.innerHTML = `
        <div class="attachment-preview-content">
            <div class="attachment-preview-header">
                <span>${attachment.name}</span>
                <button class="attachment-preview-close">&times;</button>
            </div>
            <div class="attachment-preview-body">
                <img src="${attachment.data}" alt="${attachment.name}">
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.attachment-preview-close');
    closeBtn.addEventListener('click', () => document.body.removeChild(modal));
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Download attachment
function downloadAttachment(questionId, index) {
    const attachment = currentAssessment.attachments?.[questionId]?.[index];
    if (!attachment) return;

    const link = document.createElement('a');
    link.href = attachment.data;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Update Progress
function updateProgress() {
    const totalQuestions = filteredQuestions.length;
    const answeredQuestions = Object.keys(currentAssessment.answers).length;
    const percentage = (answeredQuestions / totalQuestions) * 100;

    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${answeredQuestions} / ${totalQuestions}`;
}

// Calculate Maturity Scores
function calculateMaturityScores(assessment) {
    const scores = {};
    const themeData = {};

    // Initialize theme data
    QUESTIONS_CATALOG.themes.forEach(theme => {
        themeData[theme] = {
            totalWeight: 0,
            earnedWeight: 0
        };
    });

    // Calculate scores based on ALL answered questions
    // (not filtered by profile, since one assessment can have answers from multiple profiles)
    getActiveQuestionsCatalog().forEach(question => {
        const answer = assessment.answers[question.id];
        if (answer) {
            themeData[question.theme].totalWeight += question.weight;
            if (answer === 'yes') {
                themeData[question.theme].earnedWeight += question.weight;
            }
        }
    });

    // Convert to 1-5 scale
    Object.keys(themeData).forEach(theme => {
        const data = themeData[theme];
        if (data.totalWeight > 0) {
            const percentage = (data.earnedWeight / data.totalWeight) * 100;
            // Map 0-100% to 1-5 scale
            scores[theme] = Math.max(
                MATURITY_SCALE_MIN, 
                Math.min(
                    MATURITY_SCALE_MAX, 
                    Math.round((percentage / PERCENTAGE_TO_SCALE_DIVISOR) + SCALE_OFFSET)
                )
            );
        } else {
            scores[theme] = MATURITY_SCALE_MIN; // Default minimum score
        }
    });

    return scores;
}

// Save Assessment
async function saveAssessment() {
    if (Object.keys(currentAssessment.answers).length === 0) {
        alert('Please answer at least one question before saving');
        return;
    }

    // Check if assessment with same name and interviewName exists
    const existingIndex = assessments.findIndex(a => 
        a.name === currentAssessment.name && 
        (a.interviewName || a.name) === (currentAssessment.interviewName || currentAssessment.name)
    );
    
    // Ensure appVersion is set on the current assessment
    if (!currentAssessment.appVersion) {
        currentAssessment.appVersion = APP_VERSION;
    }
    
    if (existingIndex >= 0) {
        const interviewDesc = currentAssessment.interviewName 
            ? `${currentAssessment.name} - ${currentAssessment.interviewName}`
            : currentAssessment.name;
        if (confirm(`An assessment for "${interviewDesc}" already exists. Do you want to overwrite it?`)) {
            assessments[existingIndex] = JSON.parse(JSON.stringify(currentAssessment));
        } else {
            return;
        }
    } else {
        assessments.push(JSON.parse(JSON.stringify(currentAssessment)));
    }

    try {
        await saveAssessments();
        updateSavedAssessmentsList();
        updateResultsSelect();
        
        alert('Assessment saved successfully!');
    } catch (error) {
        // Error already shown to user in saveAssessments
        console.error('Failed to save assessment:', error);
        // Don't show success message on error
    }
}

// Local Storage Functions
async function saveAssessments(skipFolderSync = false) {
    // All data is now saved to sync folder only
    if (!skipFolderSync) {
        await syncToFolder();
    }
}

// Storage quota warning removed - no longer needed with folder-only storage

function loadAssessments() {
    // All data is loaded from sync folder only - no localStorage usage
    // The syncFromFolder function will populate assessments array
    // Initialize as empty array to prevent undefined errors
    if (!Array.isArray(assessments)) {
        assessments = [];
    }
    console.log('Assessments will be loaded from sync folder');
}

// Update Saved Assessments List
function updateSavedAssessmentsList() {
    if (assessments.length === 0) {
        savedAssessmentsDiv.innerHTML = '<p class="alert alert-info">No saved assessments yet.</p>';
        updateTabVisibility(); // Update tab visibility when no assessments
        return;
    }

    savedAssessmentsDiv.innerHTML = '<h3 style="margin-bottom: 1rem;">Saved Assessments</h3>';
    
    assessments.forEach((assessment, index) => {
        const div = document.createElement('div');
        div.className = 'assessment-item';
        
        const date = new Date(assessment.date).toLocaleDateString();
        const answeredCount = Object.keys(assessment.answers).length;
        
        // Build metadata display with interview information
        let metaInfo = [`Date: ${date}`, `Answers: ${answeredCount}`];
        
        // Add interview name if it exists and is different from app name
        if (assessment.interviewName && assessment.interviewName !== assessment.name) {
            metaInfo.push(`Interview: ${assessment.interviewName}`);
        }
        
        // Add interviewees count if available
        if (assessment.interviewees && assessment.interviewees.length > 0) {
            metaInfo.push(`Interviewees: ${assessment.interviewees.length}`);
        }
        
        div.innerHTML = `
            <div class="assessment-info">
                <div class="assessment-name">${assessment.name}${assessment.interviewName && assessment.interviewName !== assessment.name ? ' - ' + assessment.interviewName : ''}</div>
                <div class="assessment-meta">
                    ${metaInfo.join(' | ')}
                </div>
            </div>
            <div class="assessment-actions">
                <button class="btn btn-secondary btn-small" onclick="loadAssessment(${index})">
                    📝 Edit
                </button>
                <button class="btn btn-secondary btn-small" onclick="deleteAssessment(${index})">
                    🗑️ Delete
                </button>
            </div>
        `;
        
        savedAssessmentsDiv.appendChild(div);
    });
    
    updateTabVisibility(); // Update tab visibility when assessments are available
}

// Load Assessment for editing
function loadAssessment(index) {
    currentAssessment = JSON.parse(JSON.stringify(assessments[index]));
    
    // Ensure all expected fields exist with defaults for backward compatibility
    if (!currentAssessment.comments) {
        currentAssessment.comments = {};
    }
    if (!currentAssessment.answeredBy) {
        currentAssessment.answeredBy = {};
    }
    if (!currentAssessment.attachments) {
        currentAssessment.attachments = {};
    }
    if (!currentAssessment.appVersion) {
        currentAssessment.appVersion = APP_VERSION;
    }
    // New fields for v1.2.0 - ensure backward compatibility
    if (!currentAssessment.interviewName) {
        // For old assessments, use the name as interviewName
        currentAssessment.interviewName = currentAssessment.name || '';
    }
    if (!currentAssessment.interviewees) {
        currentAssessment.interviewees = [];
    }
    if (!currentAssessment.selectedProfiles) {
        currentAssessment.selectedProfiles = [];
    }
    if (!currentAssessment.generalComments) {
        currentAssessment.generalComments = '';
    }
    
    // Handle interview dates - support both old and new format
    if (!currentAssessment.interviewDates) {
        // Migrate from old single date format to new array format
        if (currentAssessment.interviewDate) {
            currentAssessment.interviewDates = [currentAssessment.interviewDate];
        } else if (currentAssessment.date) {
            currentAssessment.interviewDates = [currentAssessment.date];
        } else {
            currentAssessment.interviewDates = [];
        }
    }
    // Keep interviewDate for backward compatibility
    if (!currentAssessment.interviewDate && currentAssessment.interviewDates && currentAssessment.interviewDates.length > 0) {
        currentAssessment.interviewDate = currentAssessment.interviewDates[0];
    }
    
    appNameInput.value = currentAssessment.name || '';
    interviewNameInput.value = currentAssessment.interviewName || '';
    intervieweesInput.value = currentAssessment.interviewees ? currentAssessment.interviewees.join(', ') : '';
    
    // Restore profile filter checkboxes from saved state
    if (profileFilterContainer) {
        const profileCheckboxes = profileFilterContainer.querySelectorAll('input[type="checkbox"]');
        profileCheckboxes.forEach(checkbox => {
            // Check if this profile was selected in the saved assessment
            checkbox.checked = currentAssessment.selectedProfiles && 
                              currentAssessment.selectedProfiles.includes(checkbox.value);
        });
    }
    
    // Filter questions based on saved selected profiles
    if (currentAssessment.selectedProfiles && currentAssessment.selectedProfiles.length > 0) {
        filteredQuestions = getActiveQuestionsCatalog().filter(q => 
            currentAssessment.selectedProfiles.some(profile => q.profiles.includes(profile))
        );
    } else {
        // Show all questions if no profiles were selected
        filteredQuestions = getActiveQuestionsCatalog();
    }
    
    // Populate the metadata editor
    populateMetadataEditor();
    
    renderQuestions();
    updateProgress();
    
    // Update interview title to show both app and interview name
    const titleParts = [currentAssessment.name];
    if (currentAssessment.interviewName && currentAssessment.interviewName !== currentAssessment.name) {
        titleParts.push(currentAssessment.interviewName);
    }
    interviewTitle.textContent = `Interview: ${titleParts.join(' - ')}`;
    
    updateTabVisibility(); // Update tab visibility when loading an assessment
    
    switchTab('interview');
}

// Delete Assessment
async function deleteAssessment(index) {
    if (confirm('Are you sure you want to delete this assessment?')) {
        const assessment = assessments[index];
        
        // Delete the file from sync folder if sync is enabled
        if (syncEnabled && syncFolderHandle && assessment) {
            // Attempt to delete file, but don't block deletion if it fails
            // The orphaned file cleanup in syncToFolder will handle any remaining files
            await deleteAssessmentFile(assessment);
        }
        
        // Remove from local array
        assessments.splice(index, 1);
        
        // Save and update UI
        // Note: saveAssessments() will trigger syncToFolder() which includes
        // orphaned file cleanup, ensuring any files that weren't deleted above
        // will be cleaned up during the next sync
        saveAssessments();
        updateSavedAssessmentsList();
        updateResultsSelect();
    }
}

// Update Results Select
function updateResultsSelect() {
    resultsSelect.innerHTML = '<option value="">Choose an assessment...</option>';
    
    assessments.forEach((assessment, index) => {
        const option = document.createElement('option');
        option.value = index;
        // Include interview name in the dropdown
        const interviewName = assessment.interviewName && assessment.interviewName !== assessment.name 
            ? ` - ${assessment.interviewName}` 
            : '';
        option.textContent = `${assessment.name}${interviewName} (${new Date(assessment.date).toLocaleDateString()})`;
        resultsSelect.appendChild(option);
    });
}

// Display Results
function displayResults() {
    const selectedIndex = resultsSelect.value;
    
    const themeScoresDiv = document.getElementById('theme-scores');
    const chartContainer = document.querySelector('.chart-container');
    
    if (selectedIndex === '') {
        themeScoresDiv.innerHTML = '<p class="alert alert-info">Please select an assessment to view results.</p>';
        if (chartContainer) {
            chartContainer.style.display = 'none';
        }
        return;
    }
    
    if (chartContainer) {
        chartContainer.style.display = 'block';
    }
    
    const assessment = assessments[selectedIndex];
    const scores = calculateMaturityScores(assessment);
    
    // Display theme scores
    themeScoresDiv.innerHTML = '<h3 style="margin-bottom: 1rem;">Theme Maturity Scores</h3>';
    
    const maturityLabels = ['', 'Initial', 'Managed', 'Defined', 'Measured', 'Optimized'];
    
    Object.keys(scores).forEach(theme => {
        const score = scores[theme];
        const div = document.createElement('div');
        div.className = 'theme-score';
        div.innerHTML = `
            <span class="theme-name">${theme}</span>
            <div>
                <span class="theme-maturity">${score}/5</span>
                <span class="maturity-level">${maturityLabels[score]}</span>
            </div>
        `;
        themeScoresDiv.appendChild(div);
    });
    
    // Display detailed answers with comments
    displayDetailedAnswers(assessment);
    
    // Render radar chart
    renderRadarChart(scores);
}

// Helper function to escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Display detailed answers with comments
function displayDetailedAnswers(assessment) {
    const themeScoresDiv = document.getElementById('theme-scores');
    
    // Add assessment metadata section
    const metadataDiv = document.createElement('div');
    metadataDiv.className = 'assessment-metadata';
    metadataDiv.style.marginTop = '2rem';
    metadataDiv.style.padding = '1rem';
    metadataDiv.style.backgroundColor = '#f8fafc';
    metadataDiv.style.borderRadius = '8px';
    metadataDiv.style.marginBottom = '1rem';
    
    let metadataHtml = '<h3 style="margin-top: 0;">Assessment Information</h3>';
    metadataHtml += `<p><strong>Application:</strong> ${escapeHtml(assessment.name)}</p>`;
    
    if (assessment.interviewName && assessment.interviewName !== assessment.name) {
        metadataHtml += `<p><strong>Interview:</strong> ${escapeHtml(assessment.interviewName)}</p>`;
    }
    
    metadataHtml += `<p><strong>Date:</strong> ${new Date(assessment.date).toLocaleString()}</p>`;
    
    if (assessment.interviewees && assessment.interviewees.length > 0) {
        metadataHtml += `<p><strong>Interviewees:</strong> ${assessment.interviewees.map(name => escapeHtml(name)).join(', ')}</p>`;
    }
    
    if (assessment.selectedProfiles && assessment.selectedProfiles.length > 0) {
        metadataHtml += `<p><strong>Selected Profiles:</strong> ${assessment.selectedProfiles.join(', ')}</p>`;
    }
    
    metadataDiv.innerHTML = metadataHtml;
    themeScoresDiv.appendChild(metadataDiv);
    
    // Show only questions that were actually answered (not filtered by profile)
    // Since one assessment can have answers from multiple profiles
    const answeredQuestionIds = Object.keys(assessment.answers);
    const assessmentQuestions = getActiveQuestionsCatalog().filter(q => 
        answeredQuestionIds.includes(q.id)
    );
    
    // Add detailed answers section
    const detailsDiv = document.createElement('div');
    detailsDiv.innerHTML = '<h3 style="margin: 2rem 0 1rem 0;">Detailed Answers</h3>';
    themeScoresDiv.appendChild(detailsDiv);
    
    assessmentQuestions.forEach(question => {
        const answer = assessment.answers[question.id];
        const comment = assessment.comments ? assessment.comments[question.id] : null;
        const answeredBy = assessment.answeredBy ? assessment.answeredBy[question.id] : null;
        const attachments = assessment.attachments ? assessment.attachments[question.id] : null;
        
        if (answer) {
            const answerDiv = document.createElement('div');
            answerDiv.className = 'answer-detail';
            
            const answerIcon = answer === 'yes' ? '✓' : '✗';
            const answerClass = answer === 'yes' ? 'answer-yes' : 'answer-no';
            
            let commentHtml = '';
            if (comment) {
                commentHtml = `<div class="answer-comment"><strong>Comment:</strong> ${escapeHtml(comment)}</div>`;
            }
            
            let answeredByHtml = '';
            if (answeredBy) {
                answeredByHtml = `<span class="answered-by-badge profile-${answeredBy}">Answered by: ${answeredBy}</span>`;
            }
            
            let attachmentsHtml = '';
            if (attachments && attachments.length > 0) {
                const attachmentsList = attachments.map((attachment, index) => {
                    const isImage = attachment.type.startsWith('image/');
                    const icon = isImage ? '🖼️' : '📄';
                    const sizeKB = Math.round(attachment.size / 1024);
                    return `
                        <div class="result-attachment-item">
                            <span class="attachment-icon">${icon}</span>
                            <span class="attachment-name">${escapeHtml(attachment.name)}</span>
                            <span class="attachment-size">(${sizeKB} KB)</span>
                            <button class="btn-result-attachment-view" onclick="viewResultAttachment('${question.id}', ${index})">👁️ View</button>
                        </div>
                    `;
                }).join('');
                attachmentsHtml = `<div class="answer-attachments"><strong>Attachments:</strong>${attachmentsList}</div>`;
            }
            
            answerDiv.innerHTML = `
                <div class="answer-detail-header">
                    <span class="answer-theme-tag">${question.theme}</span>
                    <div>
                        ${answeredByHtml}
                        <span class="answer-indicator ${answerClass}">${answerIcon} ${answer.toUpperCase()}</span>
                    </div>
                </div>
                <div class="answer-question">${question.question}</div>
                ${commentHtml}
                ${attachmentsHtml}
            `;
            
            themeScoresDiv.appendChild(answerDiv);
        }
    });
}

// View attachment from results page
function viewResultAttachment(questionId, index) {
    const selectedIndex = resultsSelect.value;
    if (selectedIndex === '') return;
    
    const assessment = assessments[selectedIndex];
    const attachment = assessment.attachments?.[questionId]?.[index];
    if (!attachment) return;

    // If it's an image, show in preview modal
    if (attachment.type.startsWith('image/')) {
        const modal = document.createElement('div');
        modal.className = 'attachment-preview-modal';
        modal.innerHTML = `
            <div class="attachment-preview-content">
                <div class="attachment-preview-header">
                    <span>${escapeHtml(attachment.name)}</span>
                    <button class="attachment-preview-close">&times;</button>
                </div>
                <div class="attachment-preview-body">
                    <img src="${attachment.data}" alt="${escapeHtml(attachment.name)}">
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.attachment-preview-close');
        closeBtn.addEventListener('click', () => document.body.removeChild(modal));
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    } else {
        // For non-images, download the file
        const link = document.createElement('a');
        link.href = attachment.data;
        link.download = attachment.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Render Radar Chart
let radarChart = null;

function renderRadarChart(scores) {
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not available');
        return;
    }
    
    const canvas = document.getElementById('maturity-chart');
    if (!canvas) {
        console.warn('Canvas element not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (radarChart) {
        radarChart.destroy();
    }
    
    const labels = Object.keys(scores);
    const data = Object.values(scores);
    
    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Maturity Level',
                data: data,
                fill: true,
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderColor: 'rgb(37, 99, 235)',
                pointBackgroundColor: 'rgb(37, 99, 235)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(37, 99, 235)',
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            layout: {
                padding: {
                    top: 30,
                    bottom: 30,
                    left: 40,
                    right: 40
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    min: 0,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    },
                    pointLabels: {
                        font: {
                            size: 12
                        },
                        padding: 10
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Test Maturity Assessment Radar',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

// Export Data
function exportData() {
    if (assessments.length === 0) {
        alert('No assessments to export');
        return;
    }

    const dataStr = JSON.stringify(assessments, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `test-maturity-assessments-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Data exported successfully!');
}

// Import Data
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (!Array.isArray(importedData)) {
                alert('Invalid file format');
                return;
            }

            if (confirm('This will merge imported assessments with existing ones. Continue?')) {
                // Merge assessments, avoiding duplicates by name and interviewName
                importedData.forEach(imported => {
                    // Ensure backward compatibility for imported data
                    if (!imported.interviewName) {
                        imported.interviewName = imported.name;
                    }
                    if (!imported.interviewees) {
                        imported.interviewees = [];
                    }
                    if (!imported.selectedProfiles) {
                        imported.selectedProfiles = [];
                    }
                    
                    const existingIndex = assessments.findIndex(a => 
                        a.name === imported.name && 
                        (a.interviewName || a.name) === (imported.interviewName || imported.name)
                    );
                    if (existingIndex >= 0) {
                        assessments[existingIndex] = imported;
                    } else {
                        assessments.push(imported);
                    }
                });

                saveAssessments();
                updateSavedAssessmentsList();
                updateResultsSelect();
                alert('Data imported successfully!');
            }
        } catch (e) {
            alert('Error importing file: ' + e.message);
        }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Excel Export/Import Functions

// Export assessments to Excel
function exportAssessmentsToExcel() {
    if (assessments.length === 0) {
        alert('No assessments to export');
        return;
    }
    
    // Check if XLSX library is available
    if (typeof XLSX === 'undefined') {
        alert('Excel library not loaded. Please refresh the page and try again.');
        return;
    }

    try {
        const workbook = XLSX.utils.book_new();
        
        // Create summary sheet
        const summaryData = [
            ['Application Name', 'Interview Name', 'Date', 'Interviewees', 'Total Questions', 'Answered Questions']
        ];
        
        assessments.forEach(assessment => {
            const totalQuestions = getActiveQuestionsCatalog().length;
            const answeredQuestions = Object.keys(assessment.answers).length;
            const date = new Date(assessment.date).toLocaleDateString();
            const interviewName = assessment.interviewName || assessment.name;
            const intervieweesList = assessment.interviewees && assessment.interviewees.length > 0 
                ? assessment.interviewees.join(', ') 
                : '';
            summaryData.push([assessment.name, interviewName, date, intervieweesList, totalQuestions, answeredQuestions]);
        });
        
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
        
        // Create a sheet for each assessment
        assessments.forEach(assessment => {
            const assessmentData = [
                ['Assessment Information'],
                ['Application Name', assessment.name],
                ['Interview Name', assessment.interviewName || assessment.name],
                ['Date', new Date(assessment.date).toLocaleString()],
                ['Profile', assessment.profile],
                ['Interviewees', assessment.interviewees && assessment.interviewees.length > 0 ? assessment.interviewees.join(', ') : ''],
                ['Selected Profiles', assessment.selectedProfiles && assessment.selectedProfiles.length > 0 ? assessment.selectedProfiles.join(', ') : ''],
                [],
                ['Question ID', 'Theme', 'Question', 'Answer', 'Answered By', 'Comment', 'Weight', 'Category']
            ];
            
            // Get all answered questions
            const answeredQuestions = getActiveQuestionsCatalog().filter(q => 
                assessment.answers[q.id]
            );
            
            answeredQuestions.forEach(question => {
                const answer = assessment.answers[question.id];
                const answeredBy = assessment.answeredBy?.[question.id] || '';
                const comment = assessment.comments?.[question.id] || '';
                
                assessmentData.push([
                    question.id,
                    question.theme,
                    question.question,
                    answer,
                    answeredBy,
                    comment,
                    question.weight,
                    question.category || ''
                ]);
            });
            
            // Add maturity scores
            const scores = calculateMaturityScores(assessment);
            assessmentData.push([]);
            assessmentData.push(['Maturity Scores']);
            assessmentData.push(['Theme', 'Score', 'Level']);
            
            const maturityLabels = ['', 'Initial', 'Managed', 'Defined', 'Measured', 'Optimized'];
            Object.keys(scores).forEach(theme => {
                const score = scores[theme];
                assessmentData.push([theme, score, maturityLabels[score]]);
            });
            
            const sheet = XLSX.utils.aoa_to_sheet(assessmentData);
            
            // Auto-size columns
            const maxWidth = 100;
            const colWidths = [
                { wch: 15 },  // Question ID
                { wch: 30 },  // Theme
                { wch: 60 },  // Question
                { wch: 10 },  // Answer
                { wch: 15 },  // Answered By
                { wch: 40 },  // Comment
                { wch: 10 },  // Weight
                { wch: 20 }   // Category
            ];
            sheet['!cols'] = colWidths;
            
            // Sanitize sheet name (Excel has restrictions)
            let sheetName = assessment.name.substring(0, 31).replace(/[\\\/\?\*\[\]:<>'"]/g, '_');
            // Ensure sheet name is not empty
            if (!sheetName || sheetName.trim() === '') {
                sheetName = 'Assessment';
            }
            XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
        });
        
        // Generate and download file
        const filename = `test-maturity-assessments-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, filename);
        
        alert('Assessments exported to Excel successfully!');
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Error exporting to Excel: ' + error.message);
    }
}

// Export questions to Excel
function exportQuestionsToExcel() {
    // Check if XLSX library is available
    if (typeof XLSX === 'undefined') {
        alert('Excel library not loaded. Please refresh the page and try again.');
        return;
    }
    
    try {
        const questionsToExport = customQuestions || QUESTIONS_CATALOG.questions;
        
        const workbook = XLSX.utils.book_new();
        
        // Create questions sheet
        const questionsData = [
            ['Question ID', 'Theme', 'Profiles', 'Question', 'Category', 'Weight']
        ];
        
        questionsToExport.forEach(question => {
            questionsData.push([
                question.id,
                question.theme,
                question.profiles.join(', '),
                question.question,
                question.category || '',
                question.weight
            ]);
        });
        
        const sheet = XLSX.utils.aoa_to_sheet(questionsData);
        
        // Auto-size columns
        sheet['!cols'] = [
            { wch: 15 },  // Question ID
            { wch: 30 },  // Theme
            { wch: 30 },  // Profiles
            { wch: 80 },  // Question
            { wch: 25 },  // Category
            { wch: 10 }   // Weight
        ];
        
        XLSX.utils.book_append_sheet(workbook, sheet, 'Questions');
        
        // Generate and download file
        const filename = `test-maturity-questions-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, filename);
        
        alert('Questions exported to Excel successfully!');
    } catch (error) {
        console.error('Error exporting questions to Excel:', error);
        alert('Error exporting questions to Excel: ' + error.message);
    }
}

// Import questions from Excel
function importQuestionsFromExcel(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Get the first sheet
            const firstSheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            
            if (jsonData.length < 2) {
                alert('Excel file is empty or invalid');
                return;
            }
            
            const importedQuestions = [];
            
            // Parse questions (skip header row)
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!row || row.length === 0) continue;
                
                const questionId = (row[0] || '').toString().trim();
                const theme = (row[1] || '').toString().trim();
                const profilesStr = (row[2] || '').toString().trim();
                const questionText = (row[3] || '').toString().trim();
                const category = (row[4] || '').toString().trim();
                const weight = Number(row[5]);
                
                // Validate required fields
                if (!questionId || !theme || !profilesStr || !questionText) {
                    console.warn(`Skipping row ${i + 1}: missing required fields`);
                    continue;
                }
                
                // Validate theme
                if (!QUESTIONS_CATALOG.themes.includes(theme)) {
                    console.warn(`Skipping row ${i + 1}: invalid theme "${theme}"`);
                    continue;
                }
                
                // Parse profiles
                const profiles = profilesStr.split(',').map(p => p.trim().toLowerCase()).filter(p => p);
                if (profiles.length === 0) {
                    console.warn(`Skipping row ${i + 1}: no valid profiles`);
                    continue;
                }
                
                // Validate weight
                if (isNaN(weight) || weight < 1 || weight > 5) {
                    console.warn(`Skipping row ${i + 1}: invalid weight ${weight}`);
                    continue;
                }
                
                importedQuestions.push({
                    id: questionId,
                    theme: theme,
                    profiles: profiles,
                    question: questionText,
                    category: category,
                    weight: weight
                });
            }
            
            if (importedQuestions.length === 0) {
                alert('No valid questions found in the Excel file');
                return;
            }
            
            if (confirm(`Found ${importedQuestions.length} question(s). This will replace your custom question set with the imported questions in their Excel file order. Continue?`)) {
                // Replace the entire custom questions array with imported questions
                // This preserves the exact ordering from the Excel file
                customQuestions = importedQuestions;
                
                activeQuestions = customQuestions;
                saveCustomQuestions();
                renderQuestionsList();
                
                alert('Questions imported from Excel successfully!');
            }
        } catch (error) {
            console.error('Error importing questions from Excel:', error);
            alert('Error importing questions from Excel: ' + error.message);
        }
    };
    
    reader.readAsArrayBuffer(file);
    
    // Reset file input
    event.target.value = '';
}

// Export single assessment result to Excel
function exportResultToExcel() {
    const selectedIndex = resultsSelect.value;
    
    if (selectedIndex === '') {
        alert('Please select an assessment to export');
        return;
    }
    
    // Check if XLSX library is available
    if (typeof XLSX === 'undefined') {
        alert('Excel library not loaded. Please refresh the page and try again.');
        return;
    }
    
    try {
        const assessment = assessments[selectedIndex];
        const workbook = XLSX.utils.book_new();
        
        // Create assessment details sheet
        const detailsData = [
            ['Test Maturity Assessment Results'],
            [],
            ['Application Name', assessment.name],
            ['Interview Name', assessment.interviewName || assessment.name],
            ['Date', new Date(assessment.date).toLocaleString()],
            ['Profile', assessment.profile],
            ['Interviewees', assessment.interviewees && assessment.interviewees.length > 0 ? assessment.interviewees.join(', ') : ''],
            ['Selected Profiles', assessment.selectedProfiles && assessment.selectedProfiles.length > 0 ? assessment.selectedProfiles.join(', ') : ''],
            []
        ];
        
        // Add maturity scores
        const scores = calculateMaturityScores(assessment);
        detailsData.push(['Maturity Scores']);
        detailsData.push(['Theme', 'Score (1-5)', 'Maturity Level']);
        
        const maturityLabels = ['', 'Initial', 'Managed', 'Defined', 'Measured', 'Optimized'];
        Object.keys(scores).forEach(theme => {
            const score = scores[theme];
            detailsData.push([theme, score, maturityLabels[score]]);
        });
        
        detailsData.push([]);
        detailsData.push(['Detailed Answers']);
        detailsData.push(['Question ID', 'Theme', 'Question', 'Answer', 'Answered By', 'Comment', 'Weight', 'Category']);
        
        // Get all answered questions
        const answeredQuestions = getActiveQuestionsCatalog().filter(q => 
            assessment.answers[q.id]
        );
        
        answeredQuestions.forEach(question => {
            const answer = assessment.answers[question.id];
            const answeredBy = assessment.answeredBy?.[question.id] || '';
            const comment = assessment.comments?.[question.id] || '';
            
            detailsData.push([
                question.id,
                question.theme,
                question.question,
                String(answer || '').toUpperCase(),
                answeredBy,
                comment,
                question.weight,
                question.category || ''
            ]);
        });
        
        const sheet = XLSX.utils.aoa_to_sheet(detailsData);
        
        // Auto-size columns
        sheet['!cols'] = [
            { wch: 15 },  // Question ID
            { wch: 30 },  // Theme
            { wch: 60 },  // Question
            { wch: 10 },  // Answer
            { wch: 15 },  // Answered By
            { wch: 40 },  // Comment
            { wch: 10 },  // Weight
            { wch: 20 }   // Category
        ];
        
        XLSX.utils.book_append_sheet(workbook, sheet, 'Results');
        
        // Generate and download file
        const safeName = assessment.name.replace(/[^a-z0-9_-]/gi, '_');
        const filename = `assessment-${safeName}-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, filename);
        
        alert('Assessment exported to Excel successfully!');
    } catch (error) {
        console.error('Error exporting result to Excel:', error);
        alert('Error exporting result to Excel: ' + error.message);
    }
}

// Export current interview questionnaire to Excel (blank form to be filled)
function exportInterviewQuestionnaireToExcel() {
    if (!currentAssessment || !currentAssessment.name) {
        alert('No active interview. Please start an interview first.');
        return;
    }
    
    // Check if XLSX library is available
    if (typeof XLSX === 'undefined') {
        alert('Excel library not loaded. Please refresh the page and try again.');
        return;
    }
    
    try {
        const workbook = XLSX.utils.book_new();
        
        // Get the questions to export (filtered or all)
        const questionsToExport = filteredQuestions.length > 0 ? filteredQuestions : getActiveQuestionsCatalog();
        
        if (questionsToExport.length === 0) {
            alert('No questions available to export. Please start an interview first.');
            return;
        }
        
        // Create instructions sheet
        const instructionsData = [
            ['Interview Questionnaire - Instructions'],
            [],
            ['How to use this questionnaire:'],
            ['1. Fill in the "Answer" column with "Yes", "No", or leave it blank'],
            ['   To set up dropdown in Excel:'],
            ['   a) Select all cells in the Answer column (C2:C' + (questionsToExport.length + 1) + ')'],
            ['   b) Go to Data > Data Validation > List'],
            ['   c) In "Source", enter: =Options!$A$2:$A$3'],
            ['   d) Click OK'],
            [],
            ['2. Fill in "Answered By" column with a profile: developer, qa, devops, or manager'],
            ['   To set up dropdown in Excel:'],
            ['   a) Select all cells in the Answered By column (D2:D' + (questionsToExport.length + 1) + ')'],
            ['   b) Go to Data > Data Validation > List'],
            ['   c) In "Source", enter: =Options!$B$2:$B$5'],
            ['   d) Click OK'],
            [],
            ['3. Add any relevant comments in the "Comment" column'],
            ['4. For attachments: Add notes or descriptions in the "Attachment Notes" column'],
            ['   Note: Actual file attachments can only be added in the web application'],
            ['5. Save the file when complete'],
            ['6. Import this file back into the application using "Import Questionnaire" button'],
            [],
            ['Important Notes:'],
            ['- Do NOT modify the "Question ID" or "Question Text" columns'],
            ['- Valid Answer values: Yes, No, or blank (case-insensitive)'],
            ['- Valid Answered By values: developer, qa, devops, manager (case-insensitive)'],
            ['- "Answered By" is pre-filled with the first selected profile when available'],
            ['- The "Options" sheet contains the lists for dropdowns - do not delete it'],
            ['- For attachments: You can note file names or references, but actual files must be attached in the web app'],
            [],
            ['Interview Information:'],
            ['Application Name:', currentAssessment.name],
            ['Interview Name:', currentAssessment.interviewName || ''],
            ['Interview Date:', currentAssessment.interviewDates && currentAssessment.interviewDates.length > 0 
                ? new Date(currentAssessment.interviewDates[0]).toLocaleString() 
                : new Date().toLocaleString()],
            ['Interviewees:', currentAssessment.interviewees ? currentAssessment.interviewees.join(', ') : ''],
            ['Selected Profiles:', currentAssessment.selectedProfiles ? currentAssessment.selectedProfiles.join(', ') : ''],
            ['General Comments:', currentAssessment.generalComments || '']
        ];
        
        const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
        instructionsSheet['!cols'] = [{ wch: 25 }, { wch: 80 }];
        XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
        
        // Create questionnaire sheet with simplified columns
        const questionnaireData = [
            ['Question ID', 'Question Text', 'Answer', 'Answered By', 'Comment', 'Attachment Notes']
        ];
        
        // Determine default "Answered By" value (first selected profile)
        let defaultAnsweredBy = '';
        if (currentAssessment.selectedProfiles && currentAssessment.selectedProfiles.length > 0) {
            defaultAnsweredBy = currentAssessment.selectedProfiles[0];
        }
        
        questionsToExport.forEach(question => {
            // Get existing answer if any
            const existingAnswer = currentAssessment.answers[question.id] || '';
            const existingAnsweredBy = currentAssessment.answeredBy?.[question.id] || defaultAnsweredBy;
            const existingComment = currentAssessment.comments?.[question.id] || '';
            
            // Get attachment info
            let attachmentNotes = '';
            if (currentAssessment.attachments && currentAssessment.attachments[question.id]) {
                const attachments = currentAssessment.attachments[question.id];
                attachmentNotes = attachments.map(att => att.name).join(', ');
            }
            
            questionnaireData.push([
                question.id,
                question.question,
                existingAnswer,
                existingAnsweredBy,
                existingComment,
                attachmentNotes
            ]);
        });
        
        const questionnaireSheet = XLSX.utils.aoa_to_sheet(questionnaireData);
        
        // Auto-size columns
        questionnaireSheet['!cols'] = [
            { wch: 12 },  // Question ID
            { wch: 70 },  // Question Text
            { wch: 10 },  // Answer
            { wch: 15 },  // Answered By
            { wch: 40 },  // Comment
            { wch: 30 }   // Attachment Notes
        ];
        
        XLSX.utils.book_append_sheet(workbook, questionnaireSheet, 'Questionnaire');
        
        // Create options sheet with dropdown lists (added last for better user experience)
        const optionsData = [
            ['Answer Options', 'Profile Options'],
            ['Yes', 'developer'],
            ['No', 'qa'],
            ['', 'devops'],
            ['', 'manager']
        ];
        
        const optionsSheet = XLSX.utils.aoa_to_sheet(optionsData);
        optionsSheet['!cols'] = [{ wch: 15 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(workbook, optionsSheet, 'Options');
        
        // Generate filename
        const safeName = (currentAssessment.name || 'interview').replace(/[^a-z0-9_-]/gi, '_');
        const safeInterviewName = (currentAssessment.interviewName || '').replace(/[^a-z0-9_-]/gi, '_');
        const dateStr = new Date().toISOString().split('T')[0];
        const filename = safeInterviewName 
            ? `questionnaire-${safeName}-${safeInterviewName}-${dateStr}.xlsx`
            : `questionnaire-${safeName}-${dateStr}.xlsx`;
        
        XLSX.writeFile(workbook, filename);
        
        alert('Interview questionnaire exported to Excel successfully!\n\nFill in the "Answer" column with yes/no, and optionally add comments and answered-by information.\n\nImport the filled questionnaire back using the "Import Questionnaire" button.');
    } catch (error) {
        console.error('Error exporting questionnaire to Excel:', error);
        alert('Error exporting questionnaire to Excel: ' + error.message);
    }
}

// Import filled questionnaire from Excel
function importInterviewQuestionnaireFromExcel(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!currentAssessment || !currentAssessment.name) {
        alert('No active interview. Please start an interview first before importing a questionnaire.');
        event.target.value = '';
        return;
    }
    
    // Check if XLSX library is available
    if (typeof XLSX === 'undefined') {
        alert('Excel library not loaded. Please refresh the page and try again.');
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Look for the Questionnaire sheet
            if (!workbook.SheetNames.includes('Questionnaire')) {
                alert('Invalid questionnaire file: Missing "Questionnaire" sheet');
                return;
            }
            
            const sheet = workbook.Sheets['Questionnaire'];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
            
            if (jsonData.length < 2) {
                alert('Invalid questionnaire file: No data found');
                return;
            }
            
            // Validate header row - check if required columns exist
            const actualHeaders = jsonData[0];
            const requiredColumns = ['Question ID', 'Answer'];
            const missingColumns = requiredColumns.filter(col => !actualHeaders.includes(col));
            if (missingColumns.length > 0) {
                alert(`Invalid questionnaire file: Missing required columns: ${missingColumns.join(', ')}`);
                return;
            }
            
            // Get column indices
            const columnIndices = {};
            actualHeaders.forEach((header, index) => {
                columnIndices[header] = index;
            });
            
            // Process each row
            let importedCount = 0;
            let updatedCount = 0;
            let skippedCount = 0;
            const errors = [];
            
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!row || row.length === 0) continue;
                
                const questionId = (row[columnIndices['Question ID']] || '').toString().trim();
                const answer = (row[columnIndices['Answer']] || '').toString().trim().toLowerCase();
                const answeredBy = (row[columnIndices['Answered By']] || '').toString().trim().toLowerCase();
                const comment = (row[columnIndices['Comment']] || '').toString().trim();
                const attachmentNotes = (row[columnIndices['Attachment Notes']] || '').toString().trim();
                
                // Skip rows without question ID
                if (!questionId) {
                    skippedCount++;
                    continue;
                }
                
                // Skip rows with no meaningful data (no answer, comment, or attachment notes)
                if (!answer && !comment && !attachmentNotes) {
                    skippedCount++;
                    continue;
                }
                
                // Validate answer if provided
                if (answer && answer !== 'yes' && answer !== 'no') {
                    errors.push(`Row ${i + 1}: Invalid answer "${answer}" for question ${questionId}. Must be "yes" or "no".`);
                    skippedCount++;
                    continue;
                }
                
                // Validate answered by if provided
                if (answeredBy && !['developer', 'qa', 'devops', 'manager'].includes(answeredBy)) {
                    errors.push(`Row ${i + 1}: Invalid "Answered By" value "${answeredBy}" for question ${questionId}. Must be one of: developer, qa, devops, manager.`);
                    skippedCount++;
                    continue;
                }
                
                // Check if question exists in the current assessment's question set
                const question = getActiveQuestionsCatalog().find(q => q.id === questionId);
                if (!question) {
                    errors.push(`Row ${i + 1}: Question ID "${questionId}" not found in the current question set.`);
                    skippedCount++;
                    continue;
                }
                
                // Track if we're updating existing data
                let hasChanges = false;
                
                // Update answer if provided
                if (answer) {
                    const isUpdate = questionId in currentAssessment.answers;
                    if (isUpdate) {
                        updatedCount++;
                    } else {
                        importedCount++;
                    }
                    currentAssessment.answers[questionId] = answer;
                    hasChanges = true;
                }
                
                // Update answeredBy if provided
                if (answeredBy) {
                    if (!currentAssessment.answeredBy) {
                        currentAssessment.answeredBy = {};
                    }
                    currentAssessment.answeredBy[questionId] = answeredBy;
                    hasChanges = true;
                }
                
                // Handle comments and attachment notes together
                // Note: We use the comment from Excel (not preserve existing) since this is an import/update operation
                if (comment || attachmentNotes) {
                    if (!currentAssessment.comments) {
                        currentAssessment.comments = {};
                    }
                    
                    // Build the final comment from Excel data
                    let finalComment = comment || '';
                    
                    if (attachmentNotes) {
                        // If we have both comment and attachment notes, combine them
                        if (finalComment) {
                            finalComment += `\n\nAttachment notes: ${attachmentNotes}`;
                        } else {
                            // Only attachment notes, no comment
                            finalComment = `Attachment notes: ${attachmentNotes}`;
                        }
                    }
                    
                    currentAssessment.comments[questionId] = finalComment;
                    hasChanges = true;
                }
                
                // If no answer was provided but we have comments/metadata, count as imported
                if (!answer && hasChanges) {
                    importedCount++;
                }
            }
            
            // Show results
            let message = `Import completed:\n`;
            message += `- ${importedCount} new answer(s) or comment(s) imported\n`;
            message += `- ${updatedCount} existing answer(s) updated\n`;
            if (skippedCount > 0) {
                message += `- ${skippedCount} row(s) skipped\n`;
            }
            if (errors.length > 0) {
                message += `\nErrors:\n${errors.slice(0, 5).join('\n')}`;
                if (errors.length > 5) {
                    message += `\n... and ${errors.length - 5} more error(s)`;
                }
            }
            
            if (importedCount > 0 || updatedCount > 0) {
                // Re-render questions to show updated answers
                renderQuestions();
                updateProgress();
                
                // Mark as actively editing and trigger auto-save
                markAsActivelyEditing();
                triggerAutoSave();
                
                message += '\n\nNote: Attachment notes were imported as comments. Please add actual file attachments in the web application if needed.';
            }
            
            alert(message);
            
        } catch (error) {
            console.error('Error importing questionnaire from Excel:', error);
            alert('Error importing questionnaire from Excel: ' + error.message);
        }
    };
    
    reader.readAsArrayBuffer(file);
    
    // Reset file input
    event.target.value = '';
}

// Auto-save Functions

// Initialize auto-save status element
function initAutoSave() {
    autoSaveStatus = document.getElementById('auto-save-status');
    if (autoSaveStatus) {
        updateAutoSaveStatus('saved');
    }
}

// Update auto-save status display
function updateAutoSaveStatus(status, message = '') {
    if (!autoSaveStatus) return;
    
    // Remove all status classes
    autoSaveStatus.classList.remove('saving', 'saved', 'error');
    
    // Set the appropriate status class
    autoSaveStatus.classList.add(status);
    
    // Set the status message
    let statusText = '';
    switch(status) {
        case 'saving':
            statusText = 'Saving...';
            break;
        case 'saved':
            statusText = 'All changes saved';
            break;
        case 'error':
            statusText = message || 'Error saving';
            break;
        default:
            statusText = '';
    }
    
    autoSaveStatus.textContent = statusText;
}

// Trigger auto-save with debouncing
function triggerAutoSave() {
    if (!currentAssessment || !currentAssessment.name) {
        // No assessment to save yet
        return;
    }
    
    // Clear existing timeout
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }
    
    // Show saving status
    updateAutoSaveStatus('saving');
    
    // Set new timeout for auto-save (2 seconds after last change)
    autoSaveTimeout = setTimeout(() => {
        performAutoSave();
    }, 2000);
}

// Perform the actual auto-save
async function performAutoSave() {
    try {
        // Check if assessment with same name and interviewName exists
        const existingIndex = assessments.findIndex(a => 
            a.name === currentAssessment.name && 
            (a.interviewName || a.name) === (currentAssessment.interviewName || currentAssessment.name)
        );
        
        // Ensure appVersion is set on the current assessment
        if (!currentAssessment.appVersion) {
            currentAssessment.appVersion = APP_VERSION;
        }
        
        if (existingIndex >= 0) {
            assessments[existingIndex] = JSON.parse(JSON.stringify(currentAssessment));
        } else {
            assessments.push(JSON.parse(JSON.stringify(currentAssessment)));
        }

        await saveAssessments();
        updateSavedAssessmentsList();
        updateResultsSelect();
        
        updateAutoSaveStatus('saved');
    } catch (error) {
        console.error('Auto-save error:', error);
        
        // Provide specific feedback for quota errors
        if (error.name === 'QuotaExceededError') {
            updateAutoSaveStatus('error', 'Storage full');
        } else {
            updateAutoSaveStatus('error', 'Failed to save');
        }
    }
}

// Start periodic refresh from storage
// Periodic refresh removed - sync folder handles all updates via syncFromFolder

// Refresh function removed - data is only in sync folder, periodic sync handles updates

// Mark user as actively editing
function markAsActivelyEditing() {
    isActivelyEditing = true;
    
    // Clear existing idle timeout
    if (editingIdleTimeout) {
        clearTimeout(editingIdleTimeout);
    }
    
    // Set new idle timeout
    editingIdleTimeout = setTimeout(() => {
        isActivelyEditing = false;
        console.log('User is now idle, resuming normal sync');
        // Adjust sync interval back to idle rate
        if (syncEnabled && syncFolderHandle) {
            startPeriodicSync();
        }
    }, EDITING_IDLE_THRESHOLD);
    
    // If we just started editing, adjust sync interval
    if (syncEnabled && syncFolderHandle) {
        startPeriodicSync();
    }
}

// Helper function to check if user is currently editing a specific assessment
function isCurrentlyEditingAssessment(assessmentName, assessmentInterviewName = null) {
    return isActivelyEditing && 
           currentAssessment && 
           currentAssessment.name === assessmentName &&
           (currentAssessment.interviewName || currentAssessment.name) === (assessmentInterviewName || assessmentName);
}

// Filesystem Sync Functions

// Check if File System Access API is supported
function checkFileSystemAccessSupport() {
    if ('showDirectoryPicker' in window) {
        if (syncStatusDiv && !syncEnabled) {
            syncStatusDiv.innerHTML = '<p class="alert alert-info">📁 Please select a sync folder to get started.</p>';
        }
        if (selectSyncFolderBtn) {
            selectSyncFolderBtn.style.display = 'inline-block';
        }
    } else {
        if (syncStatusDiv) {
            syncStatusDiv.innerHTML = '<p class="alert alert-error">⚠️ This browser does not support file system access. Please use Chrome 86+ or Edge 86+.</p>';
        }
        if (selectSyncFolderBtn) {
            selectSyncFolderBtn.style.display = 'none';
        }
    }
}

// Show prompt to select sync folder (for first-time users)
function showSelectFolderPrompt() {
    if (syncStatusDiv) {
        syncStatusDiv.innerHTML = `
            <div class="alert alert-info">
                📁 <strong>Sync Folder Required</strong>
                <br>Please select a folder to store your assessments and questions.
                <button id="initial-select-sync-folder-btn" class="btn btn-primary" style="margin-top: 0.5rem;">Select Sync Folder</button>
            </div>
        `;
        const initialSelectBtn = document.getElementById('initial-select-sync-folder-btn');
        if (initialSelectBtn) {
            initialSelectBtn.addEventListener('click', selectSyncFolder);
        }
    }
}

// Select sync folder
async function selectSyncFolder() {
    try {
        // Request directory access
        const dirHandle = await window.showDirectoryPicker({
            mode: 'readwrite',
            startIn: 'documents'
        });
        
        syncFolderHandle = dirHandle;
        syncEnabled = true;
        
        // Save folder handle to IndexedDB (this persists the folder handle and name)
        await saveFolderHandleToIndexedDB(dirHandle);
        
        updateSyncStatus();
        
        // Initial sync from folder
        await syncFromFolder();
        
        // Start periodic sync
        startPeriodicSync();
        
        // Reload custom questions from the newly selected folder
        await loadCustomQuestions();
        
        alert(`Sync folder set to: ${dirHandle.name}\n\nAssessments will be automatically synced to this folder.`);
    } catch (error) {
        if (error.name === 'AbortError') {
            // User cancelled
            return;
        }
        console.error('Error selecting folder:', error);
        alert('Error selecting folder: ' + error.message);
    }
}

// Update sync status display
function updateSyncStatus() {
    if (!syncStatusDiv) return;
    
    if (syncEnabled && syncFolderHandle) {
        syncStatusDiv.innerHTML = `
            <div class="alert alert-success">
                ✅ Syncing to folder: <strong>${syncFolderHandle.name}</strong>
            </div>
        `;
    } else {
        checkFileSystemAccessSupport();
    }
    
    // Update header sync indicator
    updateHeaderSyncStatus();
}

// Update header sync status indicator
function updateHeaderSyncStatus(status = null) {
    if (!headerSyncIndicator) return;
    
    const folderNameElement = headerSyncIndicator.querySelector('.sync-folder-name');
    const statusTextElement = headerSyncIndicator.querySelector('.sync-status-text');
    
    // Remove all status classes
    headerSyncIndicator.classList.remove('sync-synced', 'sync-saving', 'sync-no-folder');
    
    if (syncEnabled && syncFolderHandle) {
        // Truncate folder name if longer than MAX_FOLDER_NAME_LENGTH characters
        const fullFolderName = syncFolderHandle.name;
        const isTruncated = fullFolderName.length > MAX_FOLDER_NAME_LENGTH;
        const displayName = isTruncated
            ? fullFolderName.slice(0, MAX_FOLDER_NAME_LENGTH) + '...' 
            : fullFolderName;
        
        // Set display name and tooltip (only when truncated to avoid redundant tooltips)
        folderNameElement.textContent = displayName;
        if (isTruncated) {
            folderNameElement.title = fullFolderName; // Tooltip with full name
        } else {
            folderNameElement.removeAttribute('title');
        }
        
        // Determine status
        if (status === 'saving' || status === 'refreshing') {
            headerSyncIndicator.classList.add('sync-saving');
            statusTextElement.textContent = status === 'saving' ? 'Saving...' : 'Refreshing...';
        } else {
            headerSyncIndicator.classList.add('sync-synced');
            statusTextElement.textContent = 'Synced';
        }
    } else {
        headerSyncIndicator.classList.add('sync-no-folder');
        folderNameElement.textContent = 'No sync folder';
        folderNameElement.removeAttribute('title'); // Remove tooltip when no folder
        statusTextElement.textContent = 'Not syncing';
    }
}

// Disable sync functionality removed - sync folder is now required

// Load sync settings from IndexedDB
async function loadSyncSettings() {
    // Try to restore the folder handle from IndexedDB
    const handle = await loadFolderHandleFromIndexedDB();
    
    if (handle) {
        // Verify we still have permission to access the folder
        const permission = await verifyFolderPermission(handle);
        
        if (permission) {
            // Successfully restored folder handle with valid permissions
            syncFolderHandle = handle;
            syncEnabled = true;
            
            updateSyncStatus();
            
            // Initial sync from folder
            await syncFromFolder();
            
            // Start periodic sync
            startPeriodicSync();
            
            // Reload custom questions now that sync folder is available
            await loadCustomQuestions();
            
            console.log(`Sync folder restored: ${handle.name}`);
        } else {
            // Permission denied or expired
            showReselectFolderMessage(handle.name, 'warning', '⚠️ Sync folder permission expired');
        }
    } else {
        // No folder handle found - user needs to select one
        showSelectFolderPrompt();
    }
}

// Helper function to show re-select folder message
function showReselectFolderMessage(folderName, alertType, message) {
    if (syncStatusDiv) {
        syncStatusDiv.innerHTML = `
            <div class="alert alert-${alertType}">
                ${message}: <strong>${folderName}</strong>
                <br>Please re-select the folder to resume sync.
                <button id="reselect-sync-folder-btn" class="btn btn-small" style="margin-top: 0.5rem;">Re-select Folder</button>
            </div>
        `;
        const reselectBtn = document.getElementById('reselect-sync-folder-btn');
        if (reselectBtn) {
            reselectBtn.addEventListener('click', selectSyncFolder);
        }
    }
}

// Verify folder permission
async function verifyFolderPermission(handle) {
    try {
        // Check if permission methods are available (they may not be in all browsers)
        if (!handle.queryPermission || !handle.requestPermission) {
            console.warn('Permission API not available, attempting to verify access with test operation');
            // Try to verify access by attempting to read the directory
            try {
                // Attempt to iterate directory entries (this will fail if no permission)
                const entries = handle.values();
                await entries.next(); // Try to get first entry
                return true; // If we got here, we have access
            } catch (testError) {
                console.error('Test operation failed, no access to folder:', testError);
                return false;
            }
        }
        
        // Query the permission state
        const options = { mode: 'readwrite' };
        
        // Check current permission state
        if ((await handle.queryPermission(options)) === 'granted') {
            return true;
        }
        
        // Try to request permission
        if ((await handle.requestPermission(options)) === 'granted') {
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error verifying folder permission:', error);
        // If permission check fails, assume we need to re-select
        return false;
    }
}

// Sync from folder (import all JSON files)
async function syncFromFolder() {
    if (!syncFolderHandle) return;
    
    try {
        // Update status to refreshing
        updateHeaderSyncStatus('refreshing');
        
        const importedAssessments = [];
        
        // Iterate through files in the directory
        for await (const entry of syncFolderHandle.values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                try {
                    const file = await entry.getFile();
                    const content = await file.text();
                    
                    // Parse and validate JSON structure
                    const data = JSON.parse(content);
                    
                    // Validate it's a valid assessment with required fields
                    if (data && 
                        typeof data.name === 'string' && 
                        typeof data.profile === 'string' && 
                        typeof data.answers === 'object' &&
                        data.date) {
                        // Store file metadata for comparison
                        data._fileLastModified = file.lastModified;
                        importedAssessments.push(data);
                    } else {
                        console.warn(`File ${entry.name} is not a valid assessment, skipping`);
                    }
                } catch (e) {
                    console.warn(`Error reading file ${entry.name}:`, e);
                }
            }
        }
        
        // Merge with existing assessments
        let merged = 0;
        let added = 0;
        let skipped = 0;
        let currentAssessmentUpdated = false;
        
        importedAssessments.forEach(imported => {
            const existingIndex = assessments.findIndex(a => 
                a.name === imported.name && 
                (a.interviewName || a.name) === (imported.interviewName || imported.name)
            );
            if (existingIndex >= 0) {
                // Check if the imported file is different
                // Compare using file modification time or content hash
                const existing = assessments[existingIndex];
                
                // IMPORTANT: Don't overwrite the currently edited assessment if user is actively editing it
                if (isCurrentlyEditingAssessment(imported.name, imported.interviewName)) {
                    console.log(`Skipping update for ${imported.name} - ${imported.interviewName || imported.name} - user is actively editing`);
                    skipped++;
                    return;
                }
                
                // Check if we should update based on file modification time or content differences
                let shouldUpdate = false;
                if (!existing._fileLastModified) {
                    // No previous file timestamp, update to get the timestamp
                    shouldUpdate = true;
                } else if (imported._fileLastModified > existing._fileLastModified) {
                    // File has been modified more recently
                    shouldUpdate = true;
                } else if (Object.keys(imported.answers).length !== Object.keys(existing.answers).length) {
                    // Different number of answers
                    shouldUpdate = true;
                } else {
                    // Check if any answers are different
                    for (const key in imported.answers) {
                        if (existing.answers[key] !== imported.answers[key]) {
                            shouldUpdate = true;
                            break;
                        }
                    }
                }
                
                if (shouldUpdate) {
                    // Use deep merge to preserve all fields from both versions
                    // This ensures attachments and other newer fields are not lost
                    assessments[existingIndex] = deepMergeAssessment(existing, imported);
                    merged++;
                    
                    // Update current assessment only if it's not being actively edited
                    if (currentAssessment && 
                        currentAssessment.name === imported.name && 
                        (currentAssessment.interviewName || currentAssessment.name) === (imported.interviewName || imported.name) &&
                        !isCurrentlyEditingAssessment(imported.name, imported.interviewName)) {
                        currentAssessment = deepMergeAssessment(currentAssessment, imported);
                        currentAssessmentUpdated = true;
                    }
                }
            } else {
                assessments.push(imported);
                added++;
            }
        });
        
        if (merged > 0 || added > 0) {
            // Skip folder sync to avoid infinite loop
            await saveAssessments(true);
            updateSavedAssessmentsList();
            updateResultsSelect();
            console.log(`Synced from folder: ${added} added, ${merged} updated, ${skipped} skipped`);
            
            // Refresh UI if current assessment was updated
            if (currentAssessmentUpdated && filteredQuestions.length > 0) {
                renderQuestions();
                updateProgress();
                console.log('Current assessment updated from file, UI refreshed');
            }
        }
        
        // Update status to synced
        updateHeaderSyncStatus();
    } catch (error) {
        console.error('Error syncing from folder:', error);
        // Update status back to default state
        updateHeaderSyncStatus();
    }
}

// Sync to folder (export all assessments as individual JSON files)
async function syncToFolder() {
    if (!syncFolderHandle || !syncEnabled) return;
    
    try {
        // Update status to saving
        updateHeaderSyncStatus('saving');
        
        // Track which files should exist
        const expectedFiles = new Set();
        
        for (const assessment of assessments) {
            // Create a safe filename including both app name and interview name
            const safeName = assessment.name.replace(/[^a-z0-9_-]/gi, '_');
            const safeInterviewName = (assessment.interviewName || assessment.name).replace(/[^a-z0-9_-]/gi, '_');
            const dateStr = new Date(assessment.date).toISOString().split('T')[0];
            // Include interview name in filename for better organization
            const filename = `assessment-${safeName}-${safeInterviewName}-${dateStr}.json`;
            
            expectedFiles.add(filename);
            
            // Create or update the file
            const fileHandle = await syncFolderHandle.getFileHandle(filename, { create: true });
            
            // Create a copy without internal metadata
            const dataToWrite = { ...assessment };
            delete dataToWrite._fileLastModified;
            
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(dataToWrite, null, 2));
            await writable.close();
            
            // Update the file modification timestamp in memory for future comparison
            const savedFile = await fileHandle.getFile();
            const assessmentIndex = assessments.findIndex(a => 
                a.name === assessment.name && 
                (a.interviewName || '') === (assessment.interviewName || '')
            );
            if (assessmentIndex >= 0) {
                assessments[assessmentIndex]._fileLastModified = savedFile.lastModified;
            }
        }
        
        // Clean up orphaned assessment files (files that no longer have a corresponding assessment)
        try {
            for await (const entry of syncFolderHandle.values()) {
                if (entry.kind === 'file' && 
                    entry.name.startsWith('assessment-') && 
                    entry.name.endsWith('.json') &&
                    !expectedFiles.has(entry.name)) {
                    // This is an orphaned assessment file, remove it
                    try {
                        await syncFolderHandle.removeEntry(entry.name);
                        console.log(`Removed orphaned assessment file: ${entry.name}`);
                    } catch (removeError) {
                        console.warn(`Could not remove orphaned file ${entry.name}:`, removeError);
                    }
                }
            }
        } catch (cleanupError) {
            console.warn('Error during orphaned files cleanup:', cleanupError);
        }
        
        console.log(`Synced ${assessments.length} assessments to folder`);
        
        // Update status to synced
        updateHeaderSyncStatus();
    } catch (error) {
        console.error('Error syncing to folder:', error);
        // Update status back to default state
        updateHeaderSyncStatus();
        
        // If permission denied, user might need to re-select folder
        if (error.name === 'NotAllowedError') {
            alert('Permission denied. Please re-select the sync folder.');
            disableSync();
        }
    }
}

// Delete assessment file from sync folder
async function deleteAssessmentFile(assessment) {
    if (!syncFolderHandle) return;
    
    try {
        // Create the filename that would have been used for this assessment
        const safeName = assessment.name.replace(/[^a-z0-9_-]/gi, '_');
        const safeInterviewName = (assessment.interviewName || assessment.name).replace(/[^a-z0-9_-]/gi, '_');
        const dateStr = new Date(assessment.date).toISOString().split('T')[0];
        const filename = `assessment-${safeName}-${safeInterviewName}-${dateStr}.json`;
        
        // Try to remove the file using the directory handle's removeEntry method
        await syncFolderHandle.removeEntry(filename);
        console.log(`Deleted assessment file: ${filename}`);
        
        // Also try to delete old format files (for backward compatibility)
        try {
            const oldFilename = `assessment-${safeName}-${dateStr}.json`;
            await syncFolderHandle.removeEntry(oldFilename);
            console.log(`Deleted old format assessment file: ${oldFilename}`);
        } catch (oldError) {
            // Ignore if old format file doesn't exist
        }
    } catch (error) {
        // File might not exist (NotFoundError) or permission error - log but don't fail
        if (error.name !== 'NotFoundError') {
            console.warn(`Could not delete assessment file:`, error);
        }
    }
}

// Start periodic sync
function startPeriodicSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
    }
    
    // Use smart sync intervals based on editing state
    const interval = isActivelyEditing ? SYNC_INTERVAL_ACTIVE : SYNC_INTERVAL_IDLE;
    
    console.log(`Starting periodic sync with ${interval}ms interval (${isActivelyEditing ? 'active editing' : 'idle'})`);
    
    // Sync with smart interval
    syncInterval = setInterval(async () => {
        if (syncEnabled && syncFolderHandle) {
            await syncFromFolder();
        }
    }, interval);
}

// Question Editor Functionality

// Constants for questions file
const QUESTIONS_FILENAME = 'custom-questions.json';

// Theme prefix mapping for auto-generating question IDs
const THEME_PREFIXES = {
    "Gouvernance & Organisation": "GO-",
    "Méthodes & Standardisation": "MS-",
    "Automatisation & CI/CD": "AC-",
    "Données de Test & Conformité": "DT-",
    "Environnements de test": "ET-",
    "Culture & Collaboration": "CC-"
};

// Function to find the next available question number for a theme
function getNextQuestionNumber(themePrefix) {
    const questionsArray = customQuestions || QUESTIONS_CATALOG.questions;
    let maxNumber = 0;
    
    // Regular expression to match question IDs with the theme prefix
    // Handles formats like "GO-22", "GO-22-DEV", "GO-22-QA", etc.
    // Properly escape all regex special characters in the prefix
    const escapedPrefix = themePrefix.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const prefixRegex = new RegExp(`^${escapedPrefix}(\\d+)`, 'i');
    
    questionsArray.forEach(question => {
        const match = question.id.match(prefixRegex);
        if (match && match[1]) {
            const number = parseInt(match[1], 10);
            if (!isNaN(number) && number > maxNumber) {
                maxNumber = number;
            }
        }
    });
    
    return maxNumber + 1;
}

// Initialize question editor
function initQuestionEditor() {
    const addQuestionBtn = document.getElementById('add-question-btn');
    const resetQuestionsBtn = document.getElementById('reset-questions-btn');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelModalBtn = document.getElementById('cancel-modal');
    const saveQuestionBtn = document.getElementById('save-question');
    const modal = document.getElementById('question-modal');
    const themeSelect = document.getElementById('question-theme');
    const questionIdInput = document.getElementById('question-id');
    
    // Populate theme dropdown
    if (themeSelect) {
        QUESTIONS_CATALOG.themes.forEach(theme => {
            const option = document.createElement('option');
            option.value = theme;
            option.textContent = theme;
            themeSelect.appendChild(option);
        });
        
        // Add event listener for theme selection to prefill question ID
        themeSelect.addEventListener('change', () => {
            if (questionIdInput && !questionIdInput.value.trim() && themeSelect.value) {
                const prefix = THEME_PREFIXES[themeSelect.value];
                if (prefix) {
                    const nextNumber = getNextQuestionNumber(prefix);
                    questionIdInput.value = `${prefix}${nextNumber}`;
                    questionIdInput.focus();
                    // Move cursor to end
                    questionIdInput.setSelectionRange(questionIdInput.value.length, questionIdInput.value.length);
                }
            }
        });
    }
    
    // Event listeners
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', () => openQuestionModal());
    }
    
    if (resetQuestionsBtn) {
        resetQuestionsBtn.addEventListener('click', resetToDefaultQuestions);
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeQuestionModal);
    }
    
    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', closeQuestionModal);
    }
    
    if (saveQuestionBtn) {
        saveQuestionBtn.addEventListener('click', saveQuestion);
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeQuestionModal();
            }
        });
    }
    
    // Load custom questions if they exist
    loadCustomQuestions();
}

// Load custom questions from sync folder
async function loadCustomQuestions() {
    // Load from sync folder only
    if (syncEnabled && syncFolderHandle) {
        const loaded = await loadQuestionsFromFolder();
        if (loaded) {
            customQuestions = loaded;
            activeQuestions = customQuestions;
            updateQuestionsStatus();
            renderQuestionsList();
            return;
        }
    }
    
    // Use default questions if no custom questions in folder
    activeQuestions = QUESTIONS_CATALOG.questions;
    updateQuestionsStatus();
    renderQuestionsList();
}

// Load questions from sync folder
async function loadQuestionsFromFolder() {
    if (!syncFolderHandle) return null;
    
    try {
        const fileHandle = await syncFolderHandle.getFileHandle(QUESTIONS_FILENAME);
        const file = await fileHandle.getFile();
        const content = await file.text();
        const data = JSON.parse(content);
        
        // Validate it's an array of questions with required properties
        if (Array.isArray(data) && data.length > 0) {
            // Validate each question has required fields
            const isValid = data.every(q => 
                q.id && q.theme && Array.isArray(q.profiles) && q.question && typeof q.weight === 'number'
            );
            
            if (isValid) {
                console.log(`Loaded ${data.length} custom questions from sync folder`);
                return data;
            } else {
                console.error('Invalid question data in custom questions file');
                return null;
            }
        }
    } catch (e) {
        // File doesn't exist or error reading it
        console.log('No custom questions file found in sync folder');
        return null;
    }
    
    return null;
}

// Save custom questions to sync folder
async function saveCustomQuestions() {
    if (!customQuestions) return;
    
    // Save to sync folder only
    if (syncEnabled && syncFolderHandle) {
        await saveQuestionsToFolder();
    } else {
        console.warn('Cannot save custom questions - please select a sync folder first');
        alert('Please select a sync folder to save custom questions.');
    }
    
    updateQuestionsStatus();
}

// Save questions to sync folder
async function saveQuestionsToFolder() {
    if (!syncFolderHandle || !customQuestions) return;
    
    try {
        const fileHandle = await syncFolderHandle.getFileHandle(QUESTIONS_FILENAME, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(customQuestions, null, 2));
        await writable.close();
        console.log('Custom questions saved to sync folder');
    } catch (error) {
        console.error('Error saving questions to folder:', error);
    }
}

// Update questions status message
function updateQuestionsStatus() {
    const statusDiv = document.getElementById('questions-status');
    if (!statusDiv) return;
    
    if (customQuestions) {
        statusDiv.className = 'alert alert-success';
        const statusText = document.createElement('span');
        statusText.textContent = ` Using custom question set (${customQuestions.length} questions). Changes are saved ${syncEnabled ? 'to sync folder and ' : ''}locally.`;
        statusDiv.innerHTML = '✅';
        statusDiv.appendChild(statusText);
    } else {
        statusDiv.className = 'alert alert-info';
        statusDiv.textContent = 'Using default questions. Click "Add Question" or edit existing questions to create a custom question set.';
    }
}

// Render questions list with drag and drop
function renderQuestionsList() {
    const container = document.getElementById('questions-list-container');
    if (!container) return;
    
    const questionsToDisplay = customQuestions || QUESTIONS_CATALOG.questions;
    
    container.innerHTML = '';
    
    questionsToDisplay.forEach((question, index) => {
        const item = document.createElement('div');
        item.className = 'question-editor-item';
        item.draggable = true;
        item.dataset.index = index;
        item.dataset.questionId = question.id;
        item.tabIndex = 0; // Make the item focusable
        
        const profileBadges = question.profiles
            .filter(p => p !== 'all')
            .map(p => `<span class="profile-badge profile-${p}">${p}</span>`)
            .join(' ');
        
        const customBadge = customQuestions ? '<span class="custom-badge">Custom</span>' : '';
        
        item.innerHTML = `
            <div class="question-editor-header">
                <div class="question-editor-header-left">
                    <span class="question-drag-handle">☰</span>
                    <span class="question-editor-id">${question.id}</span>
                    <span class="question-editor-theme">${question.theme}</span>
                    ${customBadge}
                </div>
                <div class="question-editor-actions">
                    <span class="question-editor-weight">Weight: ${question.weight}</span>
                    <button class="btn btn-small btn-secondary" onclick="duplicateQuestion('${question.id}')">📋 Duplicate</button>
                    <button class="btn btn-small btn-secondary" onclick="editQuestion('${question.id}')">✏️ Edit</button>
                    ${customQuestions ? `<button class="btn btn-small btn-danger" onclick="deleteQuestion('${question.id}')">🗑️</button>` : ''}
                </div>
            </div>
            <div class="question-editor-text">${question.question}</div>
            <div class="question-editor-meta">
                ${profileBadges}
                ${question.category ? `<span>Category: ${question.category}</span>` : ''}
            </div>
        `;
        
        // Drag and drop events (only for custom questions)
        if (customQuestions) {
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragover', handleDragOver);
            item.addEventListener('drop', handleDrop);
            item.addEventListener('dragenter', handleDragEnter);
            item.addEventListener('dragleave', handleDragLeave);
            item.addEventListener('dragend', handleDragEnd);
        } else {
            item.draggable = false;
            const dragHandle = item.querySelector('.question-drag-handle');
            if (dragHandle) {
                dragHandle.style.opacity = '0.3';
                dragHandle.style.cursor = 'not-allowed';
            }
        }
        
        container.appendChild(item);
    });
}

// Drag and drop handlers
let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (this !== draggedElement) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    if (draggedElement !== this) {
        const fromIndex = parseInt(draggedElement.dataset.index);
        const toIndex = parseInt(this.dataset.index);
        
        // Reorder the array
        const item = customQuestions.splice(fromIndex, 1)[0];
        customQuestions.splice(toIndex, 0, item);
        
        // Save and re-render
        saveCustomQuestions();
        renderQuestionsList();
    }
    
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.question-editor-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

// Open question modal for add or edit
function openQuestionModal(questionId = null) {
    const modal = document.getElementById('question-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('question-form');
    const idInput = document.getElementById('question-id');
    const idError = document.getElementById('id-error');
    
    // Reset form
    form.reset();
    idError.style.display = 'none';
    
    editingQuestionId = questionId;
    
    if (questionId) {
        // Edit mode
        modalTitle.textContent = 'Edit Question';
        const questionsArray = customQuestions || QUESTIONS_CATALOG.questions;
        const question = questionsArray.find(q => q.id === questionId);
        
        if (question) {
            idInput.value = question.id;
            idInput.disabled = true; // Can't change ID when editing
            document.getElementById('question-theme').value = question.theme;
            document.getElementById('question-text').value = question.question;
            document.getElementById('question-category').value = question.category || '';
            document.getElementById('question-weight').value = question.weight;
            
            // Set profile checkboxes
            const checkboxes = document.querySelectorAll('#question-profiles input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = question.profiles.includes(cb.value);
            });
        }
    } else {
        // Add mode
        modalTitle.textContent = 'Add Question';
        idInput.disabled = false;
        
        // Check "All" by default for new questions
        const allCheckbox = document.getElementById('profile-all');
        if (allCheckbox) {
            allCheckbox.checked = true;
        }
    }
    
    modal.style.display = 'flex';
}

// Close question modal
function closeQuestionModal() {
    const modal = document.getElementById('question-modal');
    modal.style.display = 'none';
    editingQuestionId = null;
}

// Find the correct insertion index for a new question based on theme and category
function findInsertionIndex(questions, newQuestion) {
    // Find the first question with the same theme
    const firstThemeIndex = questions.findIndex(q => q.theme === newQuestion.theme);
    
    // If no questions with this theme exist, add at the end
    if (firstThemeIndex === -1) {
        return questions.length;
    }
    
    // If no category is specified for the new question, insert at the beginning of the theme
    if (!newQuestion.category || newQuestion.category.trim() === '') {
        return firstThemeIndex;
    }
    
    // Find the first question with the same theme and category
    const firstCategoryIndex = questions.findIndex(q => 
        q.theme === newQuestion.theme && 
        q.category && 
        typeof q.category === 'string' &&
        q.category.includes(newQuestion.category)
    );
    
    // If a matching category is found, insert there
    if (firstCategoryIndex !== -1) {
        return firstCategoryIndex;
    }
    
    // Otherwise, insert at the beginning of the theme group
    return firstThemeIndex;
}

// Highlight and focus a question in the editor
function highlightAndFocusQuestion(questionId) {
    // Use setTimeout to ensure the DOM has been updated
    setTimeout(() => {
        const questionElement = document.querySelector(`[data-question-id="${questionId}"]`);
        if (questionElement) {
            // Add highlight class
            questionElement.classList.add('question-highlighted');
            
            // Scroll into view
            questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Focus the element
            questionElement.focus();
            
            // Remove highlight after animation completes (3 seconds)
            setTimeout(() => {
                questionElement.classList.remove('question-highlighted');
            }, 3000);
        }
    }, 100);
}

// Save question (add or update)
function saveQuestion() {
    const idInput = document.getElementById('question-id');
    const themeSelect = document.getElementById('question-theme');
    const textInput = document.getElementById('question-text');
    const categoryInput = document.getElementById('question-category');
    const weightInput = document.getElementById('question-weight');
    const idError = document.getElementById('id-error');
    const checkboxes = document.querySelectorAll('#question-profiles input[type="checkbox"]:checked');
    
    // Validation
    if (!idInput.value.trim()) {
        alert('Please enter a question ID');
        return;
    }
    
    if (!themeSelect.value) {
        alert('Please select a theme');
        return;
    }
    
    if (!textInput.value.trim()) {
        alert('Please enter question text');
        return;
    }
    
    if (checkboxes.length === 0) {
        alert('Please select at least one profile');
        return;
    }
    
    const questionId = idInput.value.trim();
    const profiles = Array.from(checkboxes).map(cb => cb.value);
    
    // Check for ID collision (only when adding or changing ID)
    if (!editingQuestionId || editingQuestionId !== questionId) {
        const questionsArray = customQuestions || QUESTIONS_CATALOG.questions;
        const existingQuestion = questionsArray.find(q => q.id === questionId);
        
        if (existingQuestion) {
            idError.textContent = `⚠️ Question ID "${questionId}" is already in use. Please choose a different ID.`;
            idError.style.display = 'block';
            idInput.focus();
            return;
        }
    }
    
    const questionData = {
        id: questionId,
        theme: themeSelect.value,
        profiles: profiles,
        question: textInput.value.trim(),
        category: categoryInput.value.trim() || '',
        weight: parseInt(weightInput.value)
    };
    
    // Validate weight
    if (isNaN(questionData.weight) || questionData.weight < 1 || questionData.weight > 5) {
        alert('Weight must be a number between 1 and 5');
        return;
    }
    
    // Create custom questions array if it doesn't exist
    if (!customQuestions) {
        // Clone default questions to create custom set
        customQuestions = JSON.parse(JSON.stringify(QUESTIONS_CATALOG.questions));
    }
    
    if (editingQuestionId) {
        // Update existing question
        const index = customQuestions.findIndex(q => q.id === editingQuestionId);
        if (index !== -1) {
            customQuestions[index] = questionData;
        }
    } else {
        // Add new question - insert at the correct position based on theme and category
        const insertionIndex = findInsertionIndex(customQuestions, questionData);
        customQuestions.splice(insertionIndex, 0, questionData);
    }
    
    // Update active questions
    activeQuestions = customQuestions;
    
    // Save and update UI
    saveCustomQuestions();
    renderQuestionsList();
    closeQuestionModal();
    
    // Highlight and focus the new question (only for newly added questions)
    if (!editingQuestionId) {
        highlightAndFocusQuestion(questionData.id);
    }
    
    alert(editingQuestionId ? 'Question updated successfully!' : 'Question added successfully!');
}

// Edit question
function editQuestion(questionId) {
    // If not using custom questions, clone default questions first
    if (!customQuestions) {
        if (confirm('Editing a question will create a custom question set. Continue?')) {
            customQuestions = JSON.parse(JSON.stringify(QUESTIONS_CATALOG.questions));
            activeQuestions = customQuestions;
            saveCustomQuestions();
            renderQuestionsList();
        } else {
            return;
        }
    }
    
    openQuestionModal(questionId);
}

// Delete question
function deleteQuestion(questionId) {
    if (!customQuestions) return;
    
    if (confirm('Are you sure you want to delete this question?')) {
        const index = customQuestions.findIndex(q => q.id === questionId);
        if (index !== -1) {
            customQuestions.splice(index, 1);
            activeQuestions = customQuestions;
            saveCustomQuestions();
            renderQuestionsList();
        }
    }
}

// Duplicate question
function duplicateQuestion(questionId) {
    // If not using custom questions, clone default questions first
    if (!customQuestions) {
        if (!confirm('Duplicating a question will create a custom question set. Continue?')) {
            return;
        }
        customQuestions = JSON.parse(JSON.stringify(QUESTIONS_CATALOG.questions));
        activeQuestions = customQuestions;
        saveCustomQuestions();
        renderQuestionsList();
    }
    
    // Find the original question
    const questionsArray = customQuestions || QUESTIONS_CATALOG.questions;
    const question = questionsArray.find(q => q.id === questionId);
    
    if (!question) {
        alert(`Question with ID '${questionId}' not found`);
        return;
    }
    
    // Open the add question modal with pre-filled data
    const modal = document.getElementById('question-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('question-form');
    const idInput = document.getElementById('question-id');
    const idError = document.getElementById('id-error');
    
    // Reset form
    form.reset();
    idError.style.display = 'none';
    
    // Set to add mode (not edit mode)
    editingQuestionId = null;
    modalTitle.textContent = 'Add Question';
    
    // Pre-fill all fields including suggested ID with -DUP suffix
    idInput.value = generateDuplicateId(questionId, questionsArray);
    idInput.disabled = false;
    document.getElementById('question-theme').value = question.theme;
    document.getElementById('question-text').value = question.question;
    document.getElementById('question-category').value = question.category || '';
    document.getElementById('question-weight').value = question.weight;
    
    // Set profile checkboxes
    const checkboxes = document.querySelectorAll('#question-profiles input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = question.profiles?.includes(cb.value) || false;
    });
    
    modal.style.display = 'flex';
}

// Generate a duplicate ID with -DUP suffix, handling conflicts
function generateDuplicateId(originalId, questionsArray) {
    // Collect all existing IDs into a Set for O(1) lookup performance
    const existingIds = new Set(questionsArray.map(q => q.id));
    
    // Start with base duplicate ID (originalId + "-DUP")
    let newId = `${originalId}-DUP`;
    let counter = 0;
    
    // Check if the ID already exists, if so, add numeric counter
    while (existingIds.has(newId)) {
        counter++;
        newId = `${originalId}-DUP-${counter}`;
    }
    
    return newId;
}

// Reset to default questions
async function resetToDefaultQuestions() {
    if (!confirm('This will delete all custom questions and restore the default question set. Are you sure?')) {
        return;
    }
    
    customQuestions = null;
    activeQuestions = QUESTIONS_CATALOG.questions;
    
    // Remove from sync folder if it exists
    if (syncEnabled && syncFolderHandle) {
        try {
            const fileHandle = await syncFolderHandle.getFileHandle(QUESTIONS_FILENAME);
            await fileHandle.remove();
            console.log('Custom questions file removed from sync folder');
        } catch (e) {
            // File might not exist, that's okay
            console.log('No custom questions file to remove from sync folder');
        }
    }
    
    updateQuestionsStatus();
    renderQuestionsList();
    
    alert('Questions reset to default successfully!');
}
