// Questions catalog with themes, profiles, and weights
// This is a demo question set with 5 questions per theme (30 total)
// For production use, teams should create custom question sets tailored to their needs
// Multi-language support: themes and questions can have translations in 'fr' and 'en'
const QUESTIONS_CATALOG = {
    themes: [
        {
            fr: "Gouvernance & Organisation",
            en: "Governance & Organization"
        },
        {
            fr: "Méthodes & Standardisation",
            en: "Methods & Standardization"
        },
        {
            fr: "Automatisation & CI/CD",
            en: "Automation & CI/CD"
        },
        {
            fr: "Données de Test & Conformité",
            en: "Test Data & Compliance"
        },
        {
            fr: "Environnements de test",
            en: "Test Environments"
        },
        {
            fr: "Culture & Collaboration",
            en: "Culture & Collaboration"
        }
    ],
    questions: [
      {
        "id": "GO-1",
        "theme": "Gouvernance & Organisation",
        "profiles": [
          "manager",
          "all"
        ],
        "question": {
          "fr": "Une stratégie de test est-elle formalisée et disponible pour l'ensemble des équipes ?",
          "en": "Is a test strategy formalized and available to all teams?"
        },
        "category": "Test strategy",
        "weight": 3
      },
      {
        "id": "GO-2-MAN",
        "theme": "Gouvernance & Organisation",
        "profiles": [
          "manager",
          "all"
        ],
        "question": {
          "fr": "Les rôles et responsabilités liés au testing sont-ils clairement définis dans une documentation ou un RACI ?",
          "en": "Are testing roles and responsibilities clearly defined in documentation or a RACI matrix?"
        },
        "category": "Test organization",
        "weight": 3
      },
      {
        "id": "GO-3-MAN",
        "theme": "Gouvernance & Organisation",
        "profiles": [
          "manager",
          "qa",
          "all"
        ],
        "question": {
          "fr": "Un plan de tests est-il systématiquement établi pour chaque release ?",
          "en": "Is a test plan systematically established for each release?"
        },
        "category": "Estimating and planning",
        "weight": 2
      },
      {
        "id": "GO-4-ALL",
        "theme": "Gouvernance & Organisation",
        "profiles": [
          "all",
          "developer",
          "qa",
          "devops",
          "manager"
        ],
        "question": {
          "fr": "Le processus de gestion des anomalies est-il formalisé, partagé et appliqué par toutes les équipes ?",
          "en": "Is the defect management process formalized, shared, and applied by all teams?"
        },
        "category": "Defect management",
        "weight": 2
      },
      {
        "id": "GO-5-MAN",
        "theme": "Gouvernance & Organisation",
        "profiles": [
          "manager",
          "developer",
          "all"
        ],
        "question": {
          "fr": "L'équipe organise-t-elle régulièrement des sessions de retour d'expérience (rétrospectives, post-mortems) ?",
          "en": "Does the team regularly conduct feedback sessions (retrospectives, post-mortems)?"
        },
        "category": "Test process management",
        "weight": 2
      },
      {
        "id": "MS-1",
        "theme": "Méthodes & Standardisation",
        "profiles": [
          "developer",
          "all"
        ],
        "question": {
          "fr": "Un cadre méthodologique de test (typologie, niveaux, règles de couverture) est-il défini et partagé avec les équipes ?",
          "en": "Is a test methodology framework (typology, levels, coverage rules) defined and shared with teams?"
        },
        "category": "Test strategy",
        "weight": 3
      },
      {
        "id": "MS-2-DEV",
        "theme": "Méthodes & Standardisation",
        "profiles": [
          "all",
          "developer",
          "qa"
        ],
        "question": {
          "fr": "Les scénarios de test sont-ils définis avant le développement afin d'aligner dev, QA et métier sur le comportement attendu ?",
          "en": "Are test scenarios defined before development to align dev, QA, and business on expected behavior?"
        },
        "category": "Test case design",
        "weight": 2
      },
      {
        "id": "MS-3-DEV",
        "theme": "Méthodes & Standardisation",
        "profiles": [
          "developer",
          "all"
        ],
        "question": {
          "fr": "La couverture de test (unitaires / intégration) est-elle mesurée automatiquement ?",
          "en": "Is test coverage (unit / integration) automatically measured?"
        },
        "category": "Metrics",
        "weight": 3
      },
      {
        "id": "MS-4-QA",
        "theme": "Méthodes & Standardisation",
        "profiles": [
          "qa",
          "all"
        ],
        "question": {
          "fr": "Les tests UAT incluent-ils des scénarios end-to-end transverses ?",
          "en": "Do UAT tests include cross-functional end-to-end scenarios?"
        },
        "category": "Test strategy",
        "weight": 2
      },
      {
        "id": "MS-5-ALL",
        "theme": "Méthodes & Standardisation",
        "profiles": [
          "developer",
          "all"
        ],
        "question": {
          "fr": "Lorsqu'une anomalie est résolue, un test automatisé ou manuel est-il systématiquement ajouté pour éviter la régression ?",
          "en": "When a defect is resolved, is an automated or manual test systematically added to prevent regression?"
        },
        "category": "Defect management",
        "weight": 2
      },
      {
        "id": "AC-1",
        "theme": "Automatisation & CI/CD",
        "profiles": [
          "developer",
          "all"
        ],
        "question": {
          "fr": "Les tests unitaires sont-ils automatisés ?",
          "en": "Are unit tests automated?"
        },
        "category": "Test automation",
        "weight": 3
      },
      {
        "id": "AC-2-DEV",
        "theme": "Automatisation & CI/CD",
        "profiles": [
          "developer",
          "qa",
          "all"
        ],
        "question": {
          "fr": "Des tests end-to-end automatisés existent-ils et couvrent-ils les scénarios critiques du périmètre (ex. parcours majeurs, happy path) ?",
          "en": "Do automated end-to-end tests exist and cover critical scenarios (e.g., major paths, happy path)?"
        },
        "category": "Test automation",
        "weight": 2
      },
      {
        "id": "AC-3-DEV",
        "theme": "Automatisation & CI/CD",
        "profiles": [
          "developer",
          "all"
        ],
        "question": {
          "fr": "Les tests sont-ils exécutés automatiquement à chaque build, push ou Pull Request ?",
          "en": "Are tests automatically executed with every build, push, or Pull Request?"
        },
        "category": "CI/CD",
        "weight": 3
      },
      {
        "id": "AC-4-DEV",
        "theme": "Automatisation & CI/CD",
        "profiles": [
          "developer",
          "all"
        ],
        "question": {
          "fr": "Le pipeline bloque-t-il la livraison en cas d'échec des tests ?",
          "en": "Does the pipeline block delivery in case of test failures?"
        },
        "category": "CI/CD",
        "weight": 3
      },
      {
        "id": "AC-5-ALL",
        "theme": "Automatisation & CI/CD",
        "profiles": [
          "all",
          "developer",
          "devops"
        ],
        "question": {
          "fr": "Les tests non fonctionnels automatisés (performance, sécurité, charge) existent-ils ?",
          "en": "Do automated non-functional tests (performance, security, load) exist?"
        },
        "category": "Test automation",
        "weight": 1
      },
      {
        "id": "DT-1",
        "theme": "Données de Test & Conformité",
        "profiles": [
          "manager",
          "devops",
          "all"
        ],
        "question": {
          "fr": "Des jeux de données de test dédiés sont-ils disponibles ?",
          "en": "Are dedicated test data sets available?"
        },
        "category": "Test data",
        "weight": 3
      },
      {
        "id": "DT-2-DEV",
        "theme": "Données de Test & Conformité",
        "profiles": [
          "manager",
          "developer",
          "qa",
          "all"
        ],
        "question": {
          "fr": "Les jeux de données couvrent-ils l'exhaustivité des cas de test, les cas limites et les comportements extrêmes (valeurs atypiques, erreurs, cas rares) ?",
          "en": "Do the data sets cover all test cases, edge cases, and extreme behaviors (outliers, errors, rare cases)?"
        },
        "category": "Test case design",
        "weight": 2
      },
      {
        "id": "DT-3-ENV",
        "theme": "Données de Test & Conformité",
        "profiles": [
          "manager",
          "qa",
          "devops",
          "all"
        ],
        "question": {
          "fr": "Les données utilisées pour les tests sont-elles systématiquement anonymisées ou pseudonymisées conformément aux exigences RGPD et aux règles internes ?",
          "en": "Is test data systematically anonymized or pseudonymized in compliance with GDPR requirements and internal rules?"
        },
        "category": "Compliance",
        "weight": 3
      },
      {
        "id": "DT-4-MAN",
        "theme": "Données de Test & Conformité",
        "profiles": [
          "manager",
          "devops",
          "all"
        ],
        "question": {
          "fr": "Le rafraîchissement des données est-il planifié ou automatisé ?",
          "en": "Is data refresh planned or automated?"
        },
        "category": "Testware management",
        "weight": 2
      },
      {
        "id": "DT-5-ALL",
        "theme": "Données de Test & Conformité",
        "profiles": [
          "manager",
          "developer",
          "devops",
          "all"
        ],
        "question": {
          "fr": "Les jeux de données fournis sont-ils systématiquement reproductibles (possibilité de rejouer exactement le même jeu à l'identique) ?",
          "en": "Are the provided data sets systematically reproducible (ability to replay exactly the same data set)?"
        },
        "category": "Testware management",
        "weight": 3
      },
      {
        "id": "ET-1",
        "theme": "Environnements de test",
        "profiles": [
          "devops",
          "all"
        ],
        "question": {
          "fr": "Plusieurs environnements de test existent-ils (DEV, SIT, UAT, PERF) ?",
          "en": "Do multiple test environments exist (DEV, SIT, UAT, PERF)?"
        },
        "category": "Test environment",
        "weight": 2
      },
      {
        "id": "ET-2-ENV",
        "theme": "Environnements de test",
        "profiles": [
          "qa",
          "devops",
          "all"
        ],
        "question": {
          "fr": "Les environnements sont-ils globalement stables lors des campagnes de tests ?",
          "en": "Are environments generally stable during test campaigns?"
        },
        "category": "Test environment",
        "weight": 3
      },
      {
        "id": "ET-3-ENV",
        "theme": "Environnements de test",
        "profiles": [
          "devops",
          "all"
        ],
        "question": {
          "fr": "Les environnements sont-ils isolés (pas de conflits entre équipes/applications) ?",
          "en": "Are environments isolated (no conflicts between teams/applications)?"
        },
        "category": "Test environment",
        "weight": 2
      },
      {
        "id": "ET-4-ENV",
        "theme": "Environnements de test",
        "profiles": [
          "devops",
          "all"
        ],
        "question": {
          "fr": "Un monitoring existe-t-il pour détecter anomalies, lenteurs, incidents ?",
          "en": "Does monitoring exist to detect anomalies, slowdowns, incidents?"
        },
        "category": "Metrics",
        "weight": 2
      },
      {
        "id": "ET-5-QA",
        "theme": "Environnements de test",
        "profiles": [
          "qa",
          "devops",
          "all"
        ],
        "question": {
          "fr": "La disponibilité des environnements est-elle garantie pendant les campagnes de tests ?",
          "en": "Is environment availability guaranteed during test campaigns?"
        },
        "category": "Test environment",
        "weight": 3
      },
      {
        "id": "CC-1",
        "theme": "Culture & Collaboration",
        "profiles": [
          "manager",
          "all"
        ],
        "question": {
          "fr": "Les tests sont-ils clairement considérés comme une responsabilité partagée entre Dev, QA, Métier et Environnements (et pas seulement 'affaire de QA') ?",
          "en": "Are tests clearly considered a shared responsibility between Dev, QA, Business, and Environments (not just 'QA's concern')?"
        },
        "category": "Stakeholder commitment",
        "weight": 3
      },
      {
        "id": "CC-2-DEV",
        "theme": "Culture & Collaboration",
        "profiles": [
          "developer",
          "qa",
          "all"
        ],
        "question": {
          "fr": "Les développeurs, QA et Métier collaborent-ils efficacement pour définir les critères d'acceptation ?",
          "en": "Do developers, QA, and business stakeholders collaborate effectively to define acceptance criteria?"
        },
        "category": "Stakeholder commitment",
        "weight": 2
      },
      {
        "id": "CC-3-MAN",
        "theme": "Culture & Collaboration",
        "profiles": [
          "manager",
          "all"
        ],
        "question": {
          "fr": "Des postmortems ou retours d'expérience sont-ils réalisés suite à des incidents ?",
          "en": "Are post-mortems or feedback sessions conducted following incidents?"
        },
        "category": "Defect management",
        "weight": 2
      },
      {
        "id": "CC-4-MAN",
        "theme": "Culture & Collaboration",
        "profiles": [
          "manager",
          "all"
        ],
        "question": {
          "fr": "L'équipe consacre-t-elle du temps à l'amélioration continue (technique, qualité, tests) ?",
          "en": "Does the team dedicate time to continuous improvement (technical, quality, tests)?"
        },
        "category": "Methodology practice",
        "weight": 2
      },
      {
        "id": "CC-5-ALL",
        "theme": "Culture & Collaboration",
        "profiles": [
          "manager",
          "all"
        ],
        "question": {
          "fr": "Êtes-vous sereins lors des mises en production ?",
          "en": "Are you confident during production deployments?"
        },
        "category": "Stakeholder commitment",
        "weight": 3
      }
    ]
};
