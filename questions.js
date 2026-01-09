// Questions catalog with themes, profiles, and weights
// This is a demo question set with 5 questions per theme (30 total)
// For production use, teams should create custom question sets tailored to their needs
const QUESTIONS_CATALOG = {
    themes: [
        "Gouvernance & Organisation",
        "Méthodes & Standardisation",
        "Automatisation & CI/CD",
        "Données de Test & Conformité",
        "Environnements de test",
        "Culture & Collaboration"
    ],
    questions: [
      {
        "id": "GO-1",
        "theme": "Gouvernance & Organisation",
        "profiles": [
          "manager",
          "all"
        ],
        "question": "Une stratégie de test est-elle formalisée et disponible pour l'ensemble des équipes ?",
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
        "question": "Les rôles et responsabilités liés au testing sont-ils clairement définis dans une documentation ou un RACI ?",
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
        "question": "Un plan de tests est-il systématiquement établi pour chaque release ?",
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
        "question": "Le processus de gestion des anomalies est-il formalisé, partagé et appliqué par toutes les équipes ?",
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
        "question": "L'équipe organise-t-elle régulièrement des sessions de retour d'expérience (rétrospectives, post-mortems) ?",
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
        "question": "Un cadre méthodologique de test (typologie, niveaux, règles de couverture) est-il défini et partagé avec les équipes ?",
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
        "question": "Les scénarios de test sont-ils définis avant le développement afin d'aligner dev, QA et métier sur le comportement attendu ?",
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
        "question": "La couverture de test (unitaires / intégration) est-elle mesurée automatiquement ?",
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
        "question": "Les tests UAT incluent-ils des scénarios end-to-end transverses ?",
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
        "question": "Lorsqu'une anomalie est résolue, un test automatisé ou manuel est-il systématiquement ajouté pour éviter la régression ?",
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
        "question": "Les tests unitaires sont-ils automatisés ?",
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
        "question": "Des tests end-to-end automatisés existent-ils et couvrent-ils les scénarios critiques du périmètre (ex. parcours majeurs, happy path) ?",
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
        "question": "Les tests sont-ils exécutés automatiquement à chaque build, push ou Pull Request ?",
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
        "question": "Le pipeline bloque-t-il la livraison en cas d'échec des tests ?",
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
        "question": "Les tests non fonctionnels automatisés (performance, sécurité, charge) existent-ils ?",
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
        "question": "Des jeux de données de test dédiés sont-ils disponibles ?",
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
        "question": "Les jeux de données couvrent-ils l'exhaustivité des cas de test, les cas limites et les comportements extrêmes (valeurs atypiques, erreurs, cas rares) ?",
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
        "question": "Les données utilisées pour les tests sont-elles systématiquement anonymisées ou pseudonymisées conformément aux exigences RGPD et aux règles internes ?",
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
        "question": "Le rafraîchissement des données est-il planifié ou automatisé ?",
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
        "question": "Les jeux de données fournis sont-ils systématiquement reproductibles (possibilité de rejouer exactement le même jeu à l'identique) ?",
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
        "question": "Plusieurs environnements de test existent-ils (DEV, SIT, UAT, PERF) ?",
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
        "question": "Les environnements sont-ils globalement stables lors des campagnes de tests ?",
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
        "question": "Les environnements sont-ils isolés (pas de conflits entre équipes/applications) ?",
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
        "question": "Un monitoring existe-t-il pour détecter anomalies, lenteurs, incidents ?",
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
        "question": "La disponibilité des environnements est-elle garantie pendant les campagnes de tests ?",
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
        "question": "Les tests sont-ils clairement considérés comme une responsabilité partagée entre Dev, QA, Métier et Environnements (et pas seulement 'affaire de QA') ?",
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
        "question": "Les développeurs, QA et Métier collaborent-ils efficacement pour définir les critères d'acceptation ?",
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
        "question": "Des postmortems ou retours d'expérience sont-ils réalisés suite à des incidents ?",
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
        "question": "L'équipe consacre-t-elle du temps à l'amélioration continue (technique, qualité, tests) ?",
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
        "question": "Êtes-vous sereins lors des mises en production ?",
        "category": "Stakeholder commitment",
        "weight": 3
      }
    ]
};
