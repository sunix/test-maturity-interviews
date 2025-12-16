// Questions catalog with themes, profiles, and weights
const QUESTIONS_CATALOG = {
    themes: [
        "Test Strategy",
        "Test Automation",
        "Code Quality",
        "CI/CD Integration",
        "Test Data Management",
        "Performance Testing",
        "Security Testing",
        "Test Documentation"
    ],
    questions: [
        // Test Strategy
        {
            id: 1,
            theme: "Test Strategy",
            profiles: ["manager", "qa", "all"],
            question: "Does your team have a documented test strategy?",
            weight: 5
        },
        {
            id: 2,
            theme: "Test Strategy",
            profiles: ["manager", "qa", "all"],
            question: "Are test objectives clearly defined and aligned with business goals?",
            weight: 4
        },
        {
            id: 3,
            theme: "Test Strategy",
            profiles: ["qa", "developer", "all"],
            question: "Is there a clear definition of test coverage requirements?",
            weight: 4
        },
        {
            id: 4,
            theme: "Test Strategy",
            profiles: ["manager", "all"],
            question: "Are testing metrics tracked and reviewed regularly?",
            weight: 3
        },
        
        // Test Automation
        {
            id: 5,
            theme: "Test Automation",
            profiles: ["developer", "qa", "all"],
            question: "Do you have automated unit tests for critical functionality?",
            weight: 5
        },
        {
            id: 6,
            theme: "Test Automation",
            profiles: ["qa", "developer", "all"],
            question: "Are automated integration tests in place?",
            weight: 4
        },
        {
            id: 7,
            theme: "Test Automation",
            profiles: ["qa", "all"],
            question: "Do you have automated end-to-end tests?",
            weight: 4
        },
        {
            id: 8,
            theme: "Test Automation",
            profiles: ["developer", "qa", "all"],
            question: "Is test automation integrated into the development workflow?",
            weight: 5
        },
        {
            id: 9,
            theme: "Test Automation",
            profiles: ["qa", "developer", "all"],
            question: "Are automated tests maintained and updated with code changes?",
            weight: 4
        },
        
        // Code Quality
        {
            id: 10,
            theme: "Code Quality",
            profiles: ["developer", "all"],
            question: "Do you use static code analysis tools?",
            weight: 4
        },
        {
            id: 11,
            theme: "Code Quality",
            profiles: ["developer", "all"],
            question: "Are code reviews mandatory before merging?",
            weight: 5
        },
        {
            id: 12,
            theme: "Code Quality",
            profiles: ["developer", "all"],
            question: "Is code coverage measured and tracked?",
            weight: 3
        },
        {
            id: 13,
            theme: "Code Quality",
            profiles: ["developer", "all"],
            question: "Do you have coding standards and style guides?",
            weight: 3
        },
        {
            id: 14,
            theme: "Code Quality",
            profiles: ["developer", "all"],
            question: "Are code quality metrics part of your definition of done?",
            weight: 4
        },
        
        // CI/CD Integration
        {
            id: 15,
            theme: "CI/CD Integration",
            profiles: ["devops", "developer", "all"],
            question: "Are tests automatically run on every commit?",
            weight: 5
        },
        {
            id: 16,
            theme: "CI/CD Integration",
            profiles: ["devops", "all"],
            question: "Do you have automated deployment pipelines?",
            weight: 4
        },
        {
            id: 17,
            theme: "CI/CD Integration",
            profiles: ["devops", "developer", "all"],
            question: "Are test results visible in your CI/CD pipeline?",
            weight: 4
        },
        {
            id: 18,
            theme: "CI/CD Integration",
            profiles: ["devops", "all"],
            question: "Can you deploy to production with confidence based on automated tests?",
            weight: 5
        },
        {
            id: 19,
            theme: "CI/CD Integration",
            profiles: ["devops", "developer", "all"],
            question: "Do failed tests block deployment?",
            weight: 4
        },
        
        // Test Data Management
        {
            id: 20,
            theme: "Test Data Management",
            profiles: ["qa", "developer", "all"],
            question: "Do you have a strategy for managing test data?",
            weight: 4
        },
        {
            id: 21,
            theme: "Test Data Management",
            profiles: ["qa", "all"],
            question: "Are test data sets maintained separately from production data?",
            weight: 5
        },
        {
            id: 22,
            theme: "Test Data Management",
            profiles: ["qa", "developer", "all"],
            question: "Can test data be easily created and reset?",
            weight: 3
        },
        {
            id: 23,
            theme: "Test Data Management",
            profiles: ["qa", "all"],
            question: "Is sensitive data properly masked in test environments?",
            weight: 4
        },
        
        // Performance Testing
        {
            id: 24,
            theme: "Performance Testing",
            profiles: ["qa", "developer", "all"],
            question: "Do you conduct regular performance tests?",
            weight: 4
        },
        {
            id: 25,
            theme: "Performance Testing",
            profiles: ["qa", "all"],
            question: "Are performance benchmarks defined and monitored?",
            weight: 4
        },
        {
            id: 26,
            theme: "Performance Testing",
            profiles: ["qa", "devops", "all"],
            question: "Is performance testing integrated into CI/CD?",
            weight: 3
        },
        {
            id: 27,
            theme: "Performance Testing",
            profiles: ["qa", "developer", "all"],
            question: "Do you test under realistic load conditions?",
            weight: 4
        },
        
        // Security Testing
        {
            id: 28,
            theme: "Security Testing",
            profiles: ["devops", "qa", "all"],
            question: "Do you perform regular security scans?",
            weight: 5
        },
        {
            id: 29,
            theme: "Security Testing",
            profiles: ["devops", "developer", "all"],
            question: "Are security vulnerabilities tested as part of the development cycle?",
            weight: 5
        },
        {
            id: 30,
            theme: "Security Testing",
            profiles: ["devops", "all"],
            question: "Do you have automated security testing in your pipeline?",
            weight: 4
        },
        {
            id: 31,
            theme: "Security Testing",
            profiles: ["qa", "devops", "all"],
            question: "Are penetration tests conducted regularly?",
            weight: 3
        },
        
        // Test Documentation
        {
            id: 32,
            theme: "Test Documentation",
            profiles: ["qa", "all"],
            question: "Are test cases documented and maintained?",
            weight: 4
        },
        {
            id: 33,
            theme: "Test Documentation",
            profiles: ["qa", "developer", "all"],
            question: "Is test documentation kept up-to-date with changes?",
            weight: 3
        },
        {
            id: 34,
            theme: "Test Documentation",
            profiles: ["qa", "all"],
            question: "Are test results documented and accessible to stakeholders?",
            weight: 3
        },
        {
            id: 35,
            theme: "Test Documentation",
            profiles: ["manager", "qa", "all"],
            question: "Do you have documentation for test environment setup?",
            weight: 3
        }
    ]
};
