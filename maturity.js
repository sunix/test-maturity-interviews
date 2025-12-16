// Maturity calculation logic
const Maturity = {
    // Calculate maturity score for a theme (1-5 scale)
    calculateThemeMaturity(answers, theme) {
        const themeQuestions = QUESTIONS_CATALOG.questions.filter(q => q.theme === theme);
        
        if (themeQuestions.length === 0) {
            return 0;
        }

        let totalWeight = 0;
        let earnedWeight = 0;

        themeQuestions.forEach(question => {
            totalWeight += question.weight;
            const answer = answers[question.id];
            if (answer && answer.answer === true) {
                earnedWeight += question.weight;
            }
        });

        if (totalWeight === 0) {
            return 0;
        }

        // Calculate percentage and map to 1-5 scale
        const percentage = (earnedWeight / totalWeight) * 100;
        
        // Map percentage to maturity level
        if (percentage >= 90) return 5;
        if (percentage >= 70) return 4;
        if (percentage >= 50) return 3;
        if (percentage >= 30) return 2;
        if (percentage > 0) return 1;
        return 0;
    },

    // Calculate all theme maturities for an application
    calculateAllThemes(appId) {
        const answers = Storage.getInterviewAnswers(appId);
        const scores = {};

        QUESTIONS_CATALOG.themes.forEach(theme => {
            scores[theme] = this.calculateThemeMaturity(answers, theme);
        });

        return scores;
    },

    // Get overall maturity (average of all themes)
    calculateOverallMaturity(appId) {
        const scores = this.calculateAllThemes(appId);
        const themeScores = Object.values(scores);
        
        if (themeScores.length === 0) {
            return 0;
        }

        const sum = themeScores.reduce((acc, score) => acc + score, 0);
        return (sum / themeScores.length).toFixed(1);
    },

    // Get maturity level description
    getMaturityLevel(score) {
        if (score >= 4.5) return 'Excellent';
        if (score >= 3.5) return 'Good';
        if (score >= 2.5) return 'Fair';
        if (score >= 1.5) return 'Poor';
        if (score > 0) return 'Initial';
        return 'Not Assessed';
    }
};
