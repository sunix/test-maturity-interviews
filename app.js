// Application state
let currentAssessment = {
    name: '',
    profile: '',
    date: '',
    answers: {}
};

let assessments = [];
let filteredQuestions = [];

// DOM Elements
const tabs = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const appNameInput = document.getElementById('app-name');
const profileSelect = document.getElementById('profile-select');
const startInterviewBtn = document.getElementById('start-interview');
const questionsContainer = document.getElementById('questions-container');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const saveInterviewBtn = document.getElementById('save-interview');
const viewResultsBtn = document.getElementById('view-results');
const exportDataBtn = document.getElementById('export-data');
const importDataBtn = document.getElementById('import-data');
const importFileInput = document.getElementById('import-file');
const savedAssessmentsDiv = document.getElementById('saved-assessments');
const resultsSelect = document.getElementById('results-select');
const resultsContainer = document.getElementById('results-container');
const interviewTitle = document.getElementById('interview-title');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAssessments();
    updateSavedAssessmentsList();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Tab navigation
    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Start interview
    startInterviewBtn.addEventListener('click', startInterview);

    // Save interview
    saveInterviewBtn.addEventListener('click', saveAssessment);

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
}

// Start Interview
function startInterview() {
    const appName = appNameInput.value.trim();
    const profile = profileSelect.value;

    if (!appName) {
        alert('Please enter an application/team name');
        return;
    }

    if (!profile) {
        alert('Please select a profile');
        return;
    }

    // Initialize current assessment
    currentAssessment = {
        name: appName,
        profile: profile,
        date: new Date().toISOString(),
        answers: {}
    };

    // Filter questions by profile
    filteredQuestions = QUESTIONS_CATALOG.questions.filter(q => 
        q.profiles.includes(profile) || q.profiles.includes('all')
    );

    // Render questions
    renderQuestions();
    updateProgress();
    
    // Update interview title
    interviewTitle.textContent = `Interview: ${appName} (${profile})`;

    // Switch to interview tab
    switchTab('interview');
}

// Render Questions
function renderQuestions() {
    questionsContainer.innerHTML = '';

    filteredQuestions.forEach(question => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        questionDiv.innerHTML = `
            <div class="question-header">
                <span class="question-theme">${question.theme}</span>
                <span class="question-weight">Weight: ${question.weight}</span>
            </div>
            <div class="question-text">${question.question}</div>
            <div class="answer-buttons">
                <button class="answer-btn" data-question-id="${question.id}" data-answer="yes">
                    ✓ Yes
                </button>
                <button class="answer-btn" data-question-id="${question.id}" data-answer="no">
                    ✗ No
                </button>
            </div>
        `;

        // Add click handlers for answer buttons
        const answerButtons = questionDiv.querySelectorAll('.answer-btn');
        answerButtons.forEach(btn => {
            btn.addEventListener('click', () => handleAnswer(btn));
        });

        // Restore previous answer if exists
        if (currentAssessment.answers[question.id]) {
            const answer = currentAssessment.answers[question.id];
            const selectedBtn = questionDiv.querySelector(`[data-question-id="${question.id}"][data-answer="${answer}"]`);
            if (selectedBtn) {
                selectedBtn.classList.add(answer);
            }
        }

        questionsContainer.appendChild(questionDiv);
    });
}

// Handle Answer
function handleAnswer(button) {
    const questionId = parseInt(button.dataset.questionId);
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

    // Update progress
    updateProgress();
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

    // Get filtered questions for this assessment
    const assessmentQuestions = QUESTIONS_CATALOG.questions.filter(q => 
        q.profiles.includes(assessment.profile) || q.profiles.includes('all')
    );

    // Calculate scores
    assessmentQuestions.forEach(question => {
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
            scores[theme] = Math.max(1, Math.min(5, Math.round((percentage / 20) + 0.5)));
        } else {
            scores[theme] = 1; // Default minimum score
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
function saveAssessments() {
    localStorage.setItem('testMaturityAssessments', JSON.stringify(assessments));
}

function loadAssessments() {
    const saved = localStorage.getItem('testMaturityAssessments');
    if (saved) {
        try {
            assessments = JSON.parse(saved);
            updateResultsSelect();
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
                    Profile: ${assessment.profile} | 
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
}

// Load Assessment for editing
function loadAssessment(index) {
    currentAssessment = { ...assessments[index] };
    
    appNameInput.value = currentAssessment.name;
    profileSelect.value = currentAssessment.profile;
    
    // Filter questions by profile
    filteredQuestions = QUESTIONS_CATALOG.questions.filter(q => 
        q.profiles.includes(currentAssessment.profile) || q.profiles.includes('all')
    );
    
    renderQuestions();
    updateProgress();
    interviewTitle.textContent = `Interview: ${currentAssessment.name} (${currentAssessment.profile})`;
    
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
    
    // Render radar chart
    renderRadarChart(scores);
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
