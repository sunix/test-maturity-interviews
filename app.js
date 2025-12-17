// Application state
let currentAssessment = {
    name: '',
    profile: '',
    date: '',
    answers: {},
    comments: {},
    answeredBy: {} // Track which profile answered each question
};

let assessments = [];
let filteredQuestions = [];

// Filesystem sync state
let syncFolderHandle = null;
let syncEnabled = false;
let syncInterval = null;

// Auto-save state
let autoSaveTimeout = null;
let autoSaveStatus = null;
let refreshInterval = null;

// Active editing state for smart sync
let isActivelyEditing = false;
let editingIdleTimeout = null;
const EDITING_IDLE_THRESHOLD = 5000; // Consider idle after 5 seconds of no changes
const SYNC_INTERVAL_ACTIVE = 15000; // 15 seconds during active editing
const SYNC_INTERVAL_IDLE = 5000; // 5 seconds when idle

// Constants for maturity calculation
const MATURITY_SCALE_MIN = 1;
const MATURITY_SCALE_MAX = 5;
const PERCENTAGE_TO_SCALE_DIVISOR = 20; // Maps 0-100% to 0-5 range
const SCALE_OFFSET = 0.5; // Ensures proper rounding to maturity levels

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
const startInterviewBtn = document.getElementById('start-interview');
const profileFilter = document.getElementById('profile-filter');
const questionsContainer = document.getElementById('questions-container');
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
    startPeriodicRefresh();
    updateHeaderSyncStatus(); // Initialize header sync status
    updateTabVisibility(); // Initialize tab visibility
    
    // Load sync settings asynchronously (doesn't block other initialization)
    await loadSyncSettings();
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
    
    // Profile filter change
    if (profileFilter) {
        profileFilter.addEventListener('change', handleProfileFilterChange);
    }

    // View results
    viewResultsBtn.addEventListener('click', () => {
        switchTab('results');
        displayResults();
    });

    // Export/Import data
    exportDataBtn.addEventListener('click', exportData);
    importDataBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', importData);

    // Results select
    resultsSelect.addEventListener('change', displayResults);

    // Sync folder
    if (selectSyncFolderBtn) {
        selectSyncFolderBtn.addEventListener('click', selectSyncFolder);
    }
    if (headerSelectSyncFolderBtn) {
        headerSelectSyncFolderBtn.addEventListener('click', selectSyncFolder);
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

    if (!appName) {
        alert('Please enter an application/team name');
        return;
    }

    // Initialize current assessment without profile
    currentAssessment = {
        name: appName,
        profile: 'all', // Default to all, will be filtered in interview
        date: new Date().toISOString(),
        answers: {},
        comments: {},
        answeredBy: {}
    };

    // Reset profile filter
    if (profileFilter) {
        profileFilter.value = '';
    }
    
    // Show all questions initially (no filter)
    filteredQuestions = QUESTIONS_CATALOG.questions;

    // Render questions
    renderQuestions();
    updateProgress();
    
    // Update interview title
    interviewTitle.textContent = `Interview: ${appName}`;

    // Update tab visibility to show Interview tab
    updateTabVisibility();

    // Switch to interview tab
    switchTab('interview');
}

// Handle profile filter change
function handleProfileFilterChange() {
    const selectedProfile = profileFilter.value;
    
    if (!selectedProfile) {
        // Show all questions
        filteredQuestions = QUESTIONS_CATALOG.questions;
    } else {
        // Filter questions by selected profile
        filteredQuestions = QUESTIONS_CATALOG.questions.filter(q => 
            q.profiles.includes(selectedProfile)
        );
    }
    
    // Re-render questions
    renderQuestions();
    updateProgress();
}

// Render Questions
function renderQuestions() {
    questionsContainer.innerHTML = '';

    filteredQuestions.forEach(question => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        
        // Generate profile badges for questions
        const profileBadges = question.profiles
            .filter(p => p !== 'all')
            .map(p => `<span class="profile-badge profile-${p}">${p}</span>`)
            .join(' ');
        
        // Generate profile selector dropdown for questions with multiple applicable profiles
        const applicableProfiles = question.profiles.filter(p => p !== 'all');
        let profileRow = '';
        if (applicableProfiles.length > 1) {
            const options = applicableProfiles.map(p => 
                `<option value="${p}">${p.charAt(0).toUpperCase() + p.slice(1)}</option>`
            ).join('');
            profileRow = `
                <div class="profile-row">
                    <div class="profile-can-answer">Can be answered by: ${profileBadges}</div>
                    <div class="profile-selector">
                        <label for="profile-${question.id}" class="profile-selector-label">Answered by:</label>
                        <select id="profile-${question.id}" class="profile-select-input" data-question-id="${question.id}">
                            <option value="">Select...</option>
                            ${options}
                        </select>
                    </div>
                </div>
            `;
        } else if (profileBadges) {
            profileRow = `
                <div class="profile-row">
                    <div class="profile-can-answer">Can be answered by: ${profileBadges}</div>
                </div>
            `;
        }
        
        questionDiv.innerHTML = `
            <div class="question-header">
                <div class="question-header-left">
                    <span class="question-id">${question.id}</span>
                    <span class="question-theme">${question.theme}</span>
                </div>
                <span class="question-weight">Weight: ${question.weight}</span>
            </div>
            <div class="question-text">${question.question}</div>
            ${profileRow}
            <div class="answer-buttons">
                <button class="answer-btn" data-question-id="${question.id}" data-answer="yes">
                    ✓ Yes
                </button>
                <button class="answer-btn" data-question-id="${question.id}" data-answer="no">
                    ✗ No
                </button>
            </div>
            <div class="comment-section collapsed">
                <button class="comment-toggle" data-question-id="${question.id}">
                    <span class="toggle-icon">▶</span>
                    <span class="toggle-text">Add comment</span>
                </button>
                <div class="comment-content">
                    <textarea id="comment-${question.id}" class="comment-input" data-question-id="${question.id}" placeholder="Add any notes or context for this question..." rows="2"></textarea>
                </div>
            </div>
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
                toggleText.textContent = 'Add comment';
            } else {
                toggleIcon.textContent = '▼';
                toggleText.textContent = 'Hide comment';
                commentTextarea.focus();
            }
        });
        
        // Add change handler for profile selector
        const profileSelect = questionDiv.querySelector('.profile-select-input');
        if (profileSelect) {
            profileSelect.addEventListener('change', () => handleProfileSelection(profileSelect));
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
            toggleText.textContent = 'Hide comment';
        }
        
        // Pre-select the "Answered by" dropdown
        if (profileSelect) {
            // First priority: use existing answeredBy value
            if (currentAssessment.answeredBy && currentAssessment.answeredBy[question.id]) {
                profileSelect.value = currentAssessment.answeredBy[question.id];
            } 
            // Second priority: pre-select with current profile filter if it's applicable to this question
            else if (profileFilter && profileFilter.value && applicableProfiles.includes(profileFilter.value)) {
                profileSelect.value = profileFilter.value;
            }
        }

        questionsContainer.appendChild(questionDiv);
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
        // Multi-profile question
        if (profileSelect.value) {
            // Use the selected value from dropdown
            currentAssessment.answeredBy[questionId] = profileSelect.value;
        } else if (profileFilter && profileFilter.value) {
            // No dropdown selection, but profile filter is set - use filter value and update dropdown
            const question = QUESTIONS_CATALOG.questions.find(q => q.id === questionId);
            if (question) {
                const applicableProfiles = question.profiles.filter(p => p !== 'all');
                if (applicableProfiles.includes(profileFilter.value)) {
                    currentAssessment.answeredBy[questionId] = profileFilter.value;
                    profileSelect.value = profileFilter.value; // Update the dropdown
                }
            }
        }
    } else {
        // Single-profile question - infer from question's profiles array
        const question = QUESTIONS_CATALOG.questions.find(q => q.id === questionId);
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
    QUESTIONS_CATALOG.questions.forEach(question => {
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
function saveAssessment() {
    if (Object.keys(currentAssessment.answers).length === 0) {
        alert('Please answer at least one question before saving');
        return;
    }

    // Check if assessment with same name exists
    const existingIndex = assessments.findIndex(a => a.name === currentAssessment.name);
    
    if (existingIndex >= 0) {
        if (confirm('An assessment with this name already exists. Do you want to overwrite it?')) {
            assessments[existingIndex] = { ...currentAssessment };
        } else {
            return;
        }
    } else {
        assessments.push({ ...currentAssessment });
    }

    saveAssessments();
    updateSavedAssessmentsList();
    updateResultsSelect();
    
    alert('Assessment saved successfully!');
}

// Local Storage Functions
async function saveAssessments(skipFolderSync = false) {
    localStorage.setItem('testMaturityAssessments', JSON.stringify(assessments));
    // Also sync to folder if enabled (unless we're already syncing)
    if (!skipFolderSync && syncEnabled && syncFolderHandle) {
        await syncToFolder();
    }
}

function loadAssessments() {
    const saved = localStorage.getItem('testMaturityAssessments');
    if (saved) {
        try {
            assessments = JSON.parse(saved);
            updateResultsSelect();
            updateTabVisibility(); // Update tab visibility after loading assessments
        } catch (e) {
            console.error('Error loading assessments:', e);
            assessments = [];
        }
    }
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
        
        div.innerHTML = `
            <div class="assessment-info">
                <div class="assessment-name">${assessment.name}</div>
                <div class="assessment-meta">
                    Date: ${date} | 
                    Answers: ${answeredCount}
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
    currentAssessment = { ...assessments[index] };
    
    appNameInput.value = currentAssessment.name;
    
    // Reset profile filter
    if (profileFilter) {
        profileFilter.value = '';
    }
    
    // Show all questions (user can filter if needed)
    filteredQuestions = QUESTIONS_CATALOG.questions;
    
    renderQuestions();
    updateProgress();
    interviewTitle.textContent = `Interview: ${currentAssessment.name}`;
    
    updateTabVisibility(); // Update tab visibility when loading an assessment
    
    switchTab('interview');
}

// Delete Assessment
function deleteAssessment(index) {
    if (confirm('Are you sure you want to delete this assessment?')) {
        assessments.splice(index, 1);
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
        option.textContent = `${assessment.name} - ${new Date(assessment.date).toLocaleDateString()}`;
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
    
    // Show only questions that were actually answered (not filtered by profile)
    // Since one assessment can have answers from multiple profiles
    const answeredQuestionIds = Object.keys(assessment.answers);
    const assessmentQuestions = QUESTIONS_CATALOG.questions.filter(q => 
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
            `;
            
            themeScoresDiv.appendChild(answerDiv);
        }
    });
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
                        }
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
                // Merge assessments, avoiding duplicates by name
                importedData.forEach(imported => {
                    const existingIndex = assessments.findIndex(a => a.name === imported.name);
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
    if (!currentAssessment.name) {
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
        if (Object.keys(currentAssessment.answers).length === 0) {
            // No answers yet, nothing to save
            if (autoSaveStatus) {
                autoSaveStatus.textContent = '';
                autoSaveStatus.classList.remove('saving', 'saved', 'error');
            }
            return;
        }

        // Check if assessment with same name exists
        const existingIndex = assessments.findIndex(a => a.name === currentAssessment.name);
        
        if (existingIndex >= 0) {
            assessments[existingIndex] = { ...currentAssessment };
        } else {
            assessments.push({ ...currentAssessment });
        }

        await saveAssessments();
        updateSavedAssessmentsList();
        updateResultsSelect();
        
        updateAutoSaveStatus('saved');
    } catch (error) {
        console.error('Auto-save error:', error);
        updateAutoSaveStatus('error', 'Failed to save');
    }
}

// Start periodic refresh from storage
function startPeriodicRefresh() {
    // Refresh every 10 seconds to pick up changes from other tabs/windows
    refreshInterval = setInterval(() => {
        refreshFromStorage();
    }, 10000);
    
    // Clean up interval when page unloads
    window.addEventListener('beforeunload', () => {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
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
}

// Refresh assessments from localStorage (for multi-tab/window sync)
function refreshFromStorage() {
    const saved = localStorage.getItem('testMaturityAssessments');
    if (saved) {
        try {
            const loadedAssessments = JSON.parse(saved);
            
            // Simple length check first for efficiency
            if (assessments.length !== loadedAssessments.length) {
                assessments = loadedAssessments;
                updateSavedAssessmentsList();
                updateResultsSelect();
                console.log('Refreshed assessments from storage');
                return;
            }
            
            // Check for updates by comparing dates
            let hasChanges = false;
            for (let i = 0; i < loadedAssessments.length; i++) {
                if (!assessments[i] || assessments[i].date !== loadedAssessments[i].date) {
                    hasChanges = true;
                    break;
                }
            }
            
            if (hasChanges) {
                assessments = loadedAssessments;
                updateSavedAssessmentsList();
                updateResultsSelect();
                console.log('Refreshed assessments from storage');
            }
        } catch (e) {
            console.error('Error refreshing assessments:', e);
        }
    }
}

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
function isCurrentlyEditingAssessment(assessmentName) {
    return isActivelyEditing && 
           currentAssessment && 
           currentAssessment.name === assessmentName;
}

// Filesystem Sync Functions

// Check if File System Access API is supported
function checkFileSystemAccessSupport() {
    if ('showDirectoryPicker' in window) {
        if (syncStatusDiv) {
            syncStatusDiv.innerHTML = '<p class="alert alert-info">📁 Filesystem sync available. Select a folder to enable automatic sync.</p>';
        }
        if (selectSyncFolderBtn) {
            selectSyncFolderBtn.style.display = 'inline-block';
        }
    } else {
        if (syncStatusDiv) {
            syncStatusDiv.innerHTML = '<p class="alert alert-warning">⚠️ Filesystem sync not supported in this browser. Use Export/Import instead.</p>';
        }
        if (selectSyncFolderBtn) {
            selectSyncFolderBtn.style.display = 'none';
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
        
        // Save folder handle to IndexedDB (proper way to persist FileSystemDirectoryHandle)
        await saveFolderHandleToIndexedDB(dirHandle);
        
        // Also save folder name and enabled flag to localStorage for quick checks
        localStorage.setItem('syncFolderName', dirHandle.name);
        localStorage.setItem('syncEnabled', 'true');
        
        updateSyncStatus();
        
        // Initial sync from folder
        await syncFromFolder();
        
        // Start periodic sync
        startPeriodicSync();
        
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
                ✅ Sync enabled to folder: <strong>${syncFolderHandle.name}</strong>
                <button id="disable-sync-btn" class="btn btn-small" style="margin-left: 1rem;">Disable Sync</button>
            </div>
        `;
        // Add event listener to the button
        const disableSyncBtn = document.getElementById('disable-sync-btn');
        if (disableSyncBtn) {
            disableSyncBtn.addEventListener('click', disableSync);
        }
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
        // Determine status
        if (status === 'saving' || status === 'refreshing') {
            headerSyncIndicator.classList.add('sync-saving');
            folderNameElement.textContent = syncFolderHandle.name;
            statusTextElement.textContent = status === 'saving' ? 'Saving...' : 'Refreshing...';
        } else {
            headerSyncIndicator.classList.add('sync-synced');
            folderNameElement.textContent = syncFolderHandle.name;
            statusTextElement.textContent = 'Synced';
        }
    } else {
        headerSyncIndicator.classList.add('sync-no-folder');
        folderNameElement.textContent = 'No sync folder';
        statusTextElement.textContent = 'Not syncing';
    }
}

// Disable sync
async function disableSync() {
    syncEnabled = false;
    syncFolderHandle = null;
    
    // Remove from IndexedDB
    await removeFolderHandleFromIndexedDB();
    
    localStorage.removeItem('syncFolderName');
    localStorage.removeItem('syncEnabled');
    
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
    
    updateSyncStatus();
    alert('Folder sync disabled');
}

// Load sync settings from localStorage and IndexedDB
async function loadSyncSettings() {
    const syncEnabledStr = localStorage.getItem('syncEnabled');
    const folderName = localStorage.getItem('syncFolderName');
    
    if (syncEnabledStr === 'true' && folderName) {
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
                
                console.log(`Sync folder restored: ${folderName}`);
            } else {
                // Permission denied or expired
                showReselectFolderMessage(folderName, 'warning', '⚠️ Sync folder permission expired');
            }
        } else {
            // No handle found in IndexedDB (legacy or first load)
            showReselectFolderMessage(folderName, 'info', '📁 Previous sync folder');
        }
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
            const existingIndex = assessments.findIndex(a => a.name === imported.name);
            if (existingIndex >= 0) {
                // Check if the imported file is different
                // Compare using file modification time or content hash
                const existing = assessments[existingIndex];
                
                // IMPORTANT: Don't overwrite the currently edited assessment if user is actively editing it
                if (isCurrentlyEditingAssessment(imported.name)) {
                    console.log(`Skipping update for ${imported.name} - user is actively editing`);
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
                    assessments[existingIndex] = imported;
                    merged++;
                    
                    // Update current assessment only if it's not being actively edited
                    if (currentAssessment && 
                        currentAssessment.name === imported.name && 
                        !isCurrentlyEditingAssessment(imported.name)) {
                        currentAssessment = { ...imported };
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
        
        for (const assessment of assessments) {
            // Create a safe filename
            const safeName = assessment.name.replace(/[^a-z0-9_-]/gi, '_');
            const dateStr = new Date(assessment.date).toISOString().split('T')[0];
            const filename = `assessment-${safeName}-${dateStr}.json`;
            
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
            const assessmentIndex = assessments.findIndex(a => a.name === assessment.name);
            if (assessmentIndex >= 0) {
                assessments[assessmentIndex]._fileLastModified = savedFile.lastModified;
            }
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
