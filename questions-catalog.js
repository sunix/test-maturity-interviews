// Static questions catalog for test maturity assessment
const QUESTIONS_CATALOG = {
    themes: [
        'Test Strategy',
        'Test Automation',
        'Test Infrastructure',
        'Code Quality',
        'CI/CD Integration'
    ],
    profiles: [
        'Developer',
        'QA Engineer',
        'DevOps',
        'Manager'
    ],
    questions: [
        // Test Strategy
        {
            id: 'q1',
            theme: 'Test Strategy',
            profile: 'Manager',
            question: 'Does your team have a documented test strategy?',
            weight: 3
        },
        {
            id: 'q2',
            theme: 'Test Strategy',
            profile: 'QA Engineer',
            question: 'Are test objectives clearly defined for each release?',
            weight: 2
        },
        {
            id: 'q3',
            theme: 'Test Strategy',
            profile: 'Developer',
            question: 'Do you understand what level of testing is expected for your code?',
            weight: 2
        },
        {
            id: 'q4',
            theme: 'Test Strategy',
            profile: 'Manager',
            question: 'Are testing metrics tracked and reviewed regularly?',
            weight: 3
        },
        {
            id: 'q5',
            theme: 'Test Strategy',
            profile: 'QA Engineer',
            question: 'Is there a clear definition of "done" that includes testing?',
            weight: 2
        },

        // Test Automation
        {
            id: 'q6',
            theme: 'Test Automation',
            profile: 'Developer',
            question: 'Do you write unit tests for your code?',
            weight: 3
        },
        {
            id: 'q7',
            theme: 'Test Automation',
            profile: 'QA Engineer',
            question: 'Are integration tests automated?',
            weight: 3
        },
        {
            id: 'q8',
            theme: 'Test Automation',
            profile: 'QA Engineer',
            question: 'Are end-to-end tests automated?',
            weight: 2
        },
        {
            id: 'q9',
            theme: 'Test Automation',
            profile: 'Developer',
            question: 'Do automated tests run before code is committed?',
            weight: 2
        },
        {
            id: 'q10',
            theme: 'Test Automation',
            profile: 'QA Engineer',
            question: 'Is test automation coverage measured and tracked?',
            weight: 2
        },
        {
            id: 'q11',
            theme: 'Test Automation',
            profile: 'Developer',
            question: 'Are API tests automated?',
            weight: 2
        },

        // Test Infrastructure
        {
            id: 'q12',
            theme: 'Test Infrastructure',
            profile: 'DevOps',
            question: 'Do you have dedicated test environments?',
            weight: 3
        },
        {
            id: 'q13',
            theme: 'Test Infrastructure',
            profile: 'DevOps',
            question: 'Can test environments be easily provisioned?',
            weight: 2
        },
        {
            id: 'q14',
            theme: 'Test Infrastructure',
            profile: 'QA Engineer',
            question: 'Are test data management practices in place?',
            weight: 2
        },
        {
            id: 'q15',
            theme: 'Test Infrastructure',
            profile: 'DevOps',
            question: 'Is test infrastructure version controlled?',
            weight: 2
        },
        {
            id: 'q16',
            theme: 'Test Infrastructure',
            profile: 'QA Engineer',
            question: 'Are test results stored and easily accessible?',
            weight: 2
        },

        // Code Quality
        {
            id: 'q17',
            theme: 'Code Quality',
            profile: 'Developer',
            question: 'Do you perform code reviews?',
            weight: 3
        },
        {
            id: 'q18',
            theme: 'Code Quality',
            profile: 'Developer',
            question: 'Are static code analysis tools used?',
            weight: 2
        },
        {
            id: 'q19',
            theme: 'Code Quality',
            profile: 'Developer',
            question: 'Is code coverage measured?',
            weight: 2
        },
        {
            id: 'q20',
            theme: 'Code Quality',
            profile: 'Developer',
            question: 'Are coding standards enforced?',
            weight: 2
        },
        {
            id: 'q21',
            theme: 'Code Quality',
            profile: 'Manager',
            question: 'Are technical debt and quality issues tracked?',
            weight: 2
        },

        // CI/CD Integration
        {
            id: 'q22',
            theme: 'CI/CD Integration',
            profile: 'DevOps',
            question: 'Are tests integrated into CI/CD pipeline?',
            weight: 3
        },
        {
            id: 'q23',
            theme: 'CI/CD Integration',
            profile: 'DevOps',
            question: 'Do builds fail when tests fail?',
            weight: 3
        },
        {
            id: 'q24',
            theme: 'CI/CD Integration',
            profile: 'Developer',
            question: 'Are test results visible to the entire team?',
            weight: 2
        },
        {
            id: 'q25',
            theme: 'CI/CD Integration',
            profile: 'DevOps',
            question: 'Are deployment gates based on test results?',
            weight: 2
        },
        {
            id: 'q26',
            theme: 'CI/CD Integration',
            profile: 'QA Engineer',
            question: 'Are automated tests run on every commit?',
            weight: 2
        },
        {
            id: 'q27',
            theme: 'CI/CD Integration',
            profile: 'DevOps',
            question: 'Is there monitoring of test execution time?',
            weight: 1
        }
    ]
};
