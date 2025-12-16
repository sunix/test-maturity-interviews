// Main application logic
const App = {
    currentApp: null,
    currentProfile: 'all',

    init() {
        this.setupTabs();
        this.setupApplications();
        this.setupInterview();
        this.setupResults();
        this.setupImportExport();
        this.loadApplications();
    },

    // Tab navigation
    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                
                // Update active states
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                btn.classList.add('active');
                document.getElementById(tabName + '-tab').classList.add('active');

                // Refresh content when switching tabs
                if (tabName === 'interview') {
                    this.loadInterview();
                } else if (tabName === 'results') {
                    this.loadResults();
                }
            });
        });
    },

    // Application management
    setupApplications() {
        const addBtn = document.getElementById('add-app-btn');
        const nameInput = document.getElementById('app-name');

        addBtn.addEventListener('click', () => {
            const name = nameInput.value.trim();
            if (name) {
                Storage.addApplication(name);
                nameInput.value = '';
                this.loadApplications();
            }
        });

        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addBtn.click();
            }
        });
    },

    loadApplications() {
        const apps = Storage.getApplications();
        const appsList = document.getElementById('apps-list');
        const interviewSelect = document.getElementById('interview-app-select');
        const resultsSelect = document.getElementById('results-app-select');

        // Update apps list
        if (apps.length === 0) {
            appsList.innerHTML = '<div class="empty-state">No applications yet. Add one to get started!</div>';
        } else {
            appsList.innerHTML = apps.map(app => `
                <div class="app-card">
                    <h3>${this.escapeHtml(app.name)}</h3>
                    <p>Created: ${new Date(app.createdAt).toLocaleDateString()}</p>
                    <button class="btn btn-danger" onclick="App.deleteApp('${app.id}')">Delete</button>
                </div>
            `).join('');
        }

        // Update selects
        const options = apps.map(app => 
            `<option value="${app.id}">${this.escapeHtml(app.name)}</option>`
        ).join('');
        
        interviewSelect.innerHTML = '<option value="">-- Select Application --</option>' + options;
        resultsSelect.innerHTML = '<option value="">-- Select Application --</option>' + options;
    },

    deleteApp(appId) {
        if (confirm('Are you sure you want to delete this application and all its interview data?')) {
            Storage.deleteApplication(appId);
            this.loadApplications();
        }
    },

    // Interview management
    setupInterview() {
        const appSelect = document.getElementById('interview-app-select');
        const profileFilter = document.getElementById('profile-filter');

        // Populate profile filter
        profileFilter.innerHTML = '<option value="all">All Profiles</option>' +
            QUESTIONS_CATALOG.profiles.map(profile => 
                `<option value="${profile}">${profile}</option>`
            ).join('');

        appSelect.addEventListener('change', () => {
            this.currentApp = appSelect.value;
            this.loadInterview();
        });

        profileFilter.addEventListener('change', () => {
            this.currentProfile = profileFilter.value;
            this.loadInterview();
        });
    },

    loadInterview() {
        const container = document.getElementById('questions-container');
        
        if (!this.currentApp) {
            container.innerHTML = '<div class="empty-state">Please select an application to start the interview</div>';
            return;
        }

        const answers = Storage.getInterviewAnswers(this.currentApp);
        let questions = QUESTIONS_CATALOG.questions;

        // Filter by profile if needed
        if (this.currentProfile !== 'all') {
            questions = questions.filter(q => q.profile === this.currentProfile);
        }

        if (questions.length === 0) {
            container.innerHTML = '<div class="empty-state">No questions available for this profile</div>';
            return;
        }

        container.innerHTML = questions.map(q => {
            const answer = answers[q.id];
            const yesSelected = answer && answer.answer === true ? 'selected yes' : '';
            const noSelected = answer && answer.answer === false ? 'selected no' : '';

            return `
                <div class="question-card">
                    <div class="question-text">${this.escapeHtml(q.question)}</div>
                    <div class="question-meta">
                        <span class="badge badge-theme">${this.escapeHtml(q.theme)}</span>
                        <span class="badge badge-profile">${this.escapeHtml(q.profile)}</span>
                        <span class="badge badge-weight">Weight: ${q.weight}</span>
                    </div>
                    <div class="answer-buttons">
                        <button class="answer-btn yes ${yesSelected}" 
                                onclick="App.saveAnswer('${q.id}', true)">
                            ✓ Yes
                        </button>
                        <button class="answer-btn no ${noSelected}" 
                                onclick="App.saveAnswer('${q.id}', false)">
                            ✗ No
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    saveAnswer(questionId, answer) {
        if (!this.currentApp) return;
        Storage.saveAnswer(this.currentApp, questionId, answer);
        this.loadInterview();
    },

    // Results management
    setupResults() {
        const resultsSelect = document.getElementById('results-app-select');
        resultsSelect.addEventListener('change', () => {
            this.loadResults();
        });
    },

    loadResults() {
        const appId = document.getElementById('results-app-select').value;
        const scoresContainer = document.getElementById('maturity-scores');
        const canvas = document.getElementById('radar-chart');

        if (!appId) {
            scoresContainer.innerHTML = '<div class="empty-state">Please select an application to view results</div>';
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        const scores = Maturity.calculateAllThemes(appId);
        const overall = Maturity.calculateOverallMaturity(appId);

        // Display scores
        scoresContainer.innerHTML = `
            <div class="score-card" style="border-left-color: #764ba2;">
                <span class="score-label">Overall Maturity</span>
                <span class="score-value">${overall} / 5.0</span>
            </div>
            ${Object.entries(scores).map(([theme, score]) => `
                <div class="score-card">
                    <span class="score-label">${this.escapeHtml(theme)}</span>
                    <span class="score-value">${score} / 5</span>
                </div>
            `).join('')}
        `;

        // Draw radar chart
        RadarChart.draw('radar-chart', scores);
    },

    // Import/Export management
    setupImportExport() {
        const exportBtn = document.getElementById('export-btn');
        const importBtn = document.getElementById('import-btn');
        const importFile = document.getElementById('import-file');
        const clearBtn = document.getElementById('clear-data-btn');

        exportBtn.addEventListener('click', () => {
            Storage.exportData();
        });

        importBtn.addEventListener('click', () => {
            const file = importFile.files[0];
            if (!file) {
                alert('Please select a file to import');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const success = Storage.importData(e.target.result);
                if (success) {
                    alert('Data imported successfully!');
                    this.loadApplications();
                    importFile.value = '';
                } else {
                    alert('Error importing data. Please check the file format.');
                }
            };
            reader.readAsText(file);
        });

        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                Storage.clearData();
                this.loadApplications();
                alert('All data has been cleared.');
            }
        });
    },

    // Utility function to escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
