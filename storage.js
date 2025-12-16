// LocalStorage management for test maturity data
const Storage = {
    STORAGE_KEY: 'test-maturity-data',

    // Get all data from localStorage
    getData() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error('Error parsing stored data:', e);
                return this.getDefaultData();
            }
        }
        return this.getDefaultData();
    },

    // Get default empty data structure
    getDefaultData() {
        return {
            applications: [],
            interviews: {}
        };
    },

    // Save all data to localStorage
    saveData(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },

    // Get all applications
    getApplications() {
        const data = this.getData();
        return data.applications || [];
    },

    // Add a new application
    addApplication(name) {
        const data = this.getData();
        const appId = 'app_' + Date.now();
        const newApp = {
            id: appId,
            name: name,
            createdAt: new Date().toISOString()
        };
        data.applications.push(newApp);
        data.interviews[appId] = {};
        this.saveData(data);
        return newApp;
    },

    // Delete an application
    deleteApplication(appId) {
        const data = this.getData();
        data.applications = data.applications.filter(app => app.id !== appId);
        delete data.interviews[appId];
        this.saveData(data);
    },

    // Get interview answers for an application
    getInterviewAnswers(appId) {
        const data = this.getData();
        return data.interviews[appId] || {};
    },

    // Save answer for a question
    saveAnswer(appId, questionId, answer) {
        const data = this.getData();
        if (!data.interviews[appId]) {
            data.interviews[appId] = {};
        }
        data.interviews[appId][questionId] = {
            answer: answer,
            timestamp: new Date().toISOString()
        };
        this.saveData(data);
    },

    // Export all data as JSON
    exportData() {
        const data = this.getData();
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'test-maturity-data-' + new Date().toISOString().split('T')[0] + '.json';
        link.click();
        URL.revokeObjectURL(url);
    },

    // Import data from JSON
    importData(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            // Validate data structure
            if (!data.applications || !data.interviews) {
                throw new Error('Invalid data format');
            }
            this.saveData(data);
            return true;
        } catch (e) {
            console.error('Error importing data:', e);
            return false;
        }
    },

    // Clear all data
    clearData() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
};
