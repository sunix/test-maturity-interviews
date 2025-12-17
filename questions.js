// Questions catalog with themes, profiles, and weights
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
        // Gouvernance & Organisation
        {
            id: "GO-14",
            theme: "Gouvernance & Organisation",
            profiles: ["manager", "developer", "devops", "all"],
            question: "Les releases sont-elles planifiées avec des dates de livraison claires et communiquées ?",
            category: "Communication & reporting",
            weight: 2
        },
        {
            id: "GO-17",
            theme: "Gouvernance & Organisation",
            profiles: ["manager", "qa", "devops", "all"],
            question: "Des rapports d'anomalies (hebdo, mensuels…) sont-ils générés automatiquement ou manuellement ?",
            category: "Communication & reporting",
            weight: 1
        },
        {
            id: "GO-18",
            theme: "Gouvernance & Organisation",
            profiles: ["manager", "qa", "devops", "all"],
            question: "Les rapports d'anomalies sont-ils mis à disposition des équipes consommatrices (Dev, QA, Métier) ?",
            category: "Communication & reporting, Communication",
            weight: 1
        },
        {
            id: "GO-10",
            theme: "Gouvernance & Organisation",
            profiles: ["manager", "qa", "all"],
            question: "Le processus de gestion des anomalies est-il formalisé, partagé et appliqué par toutes les équipes ?",
            category: "Defect management",
            weight: 2
        },
        {
            id: "GO-15",
            theme: "Gouvernance & Organisation",
            profiles: ["manager", "qa", "all"],
            question: "Une grille de priorisation des anomalies est-elle utilisée (criticité, sévérité, impact) ?",
            category: "Defect management",
            weight: 2
        },
        {
            id: "GO-22",
            theme: "Gouvernance & Organisation",
            profiles: ["manager", "developer", "all"],
            question: "L'équipe se réunit-elle régulièrement pour discuter des anomalies en cours ou critiques ?",
            category: "Defect management",
            weight: 2
        },
        {
            id: "GO-16",
            theme: "Gouvernance & Organisation",
            profiles: ["manager", "all"],
            question: "Un système centralisé de suivi des anomalies est-il utilisé par toutes les équipes (ex : Jira) ?",
            category: "Defect management, Test tools",
            weight: 2
        },
        {
            id: "GO-8",
            theme: "Gouvernance & Organisation",
            profiles: ["manager", "qa", "all"],
            question: "La stratégie de test est-elle validée par les parties prenantes (IT, QA, Métier) avant la phase de test ?",
            category: "Degree of involvement / Stakeholder commitment, Stakeholder commitment",
            weight: 2
        },
        {
            id: "GO-4",
            theme: "Gouvernance & Organisation",
            profiles: ["manager", "qa", "all"],
            question: "Un plan de tests est-il systématiquement établi pour chaque release ?",
            category: "Estimating and planning",
            weight: 2
        },
        {
            id: "GO-7",
            theme: "Gouvernance & Organisation",
            profiles: ["manager", "all"],
            question: "Les tests sont-ils planifiés suffisamment en amont dans le cycle projet ?",
            category: "Estimating and planning",
            weight: 2
        },
        {
            id: "GO-20",
            theme: "Gouvernance & Organisation",
            profiles: ["manager", "developer", "all"],
            question: "L'équipe suit-elle le temps moyen de résolution des anomalies (hors production) ?",
            category: "Metrics",
            weight: 2
        },
        {
            id: "GO-21",
            theme: "Gouvernance & Organisation",
            profiles: ["manager", "developer", "all"],
            question: "L'équipe suit-elle le temps moyen de résolution des anomalies issues de la production ?",
            category: "Metrics",
            weight: 2
        },
        {
            id: "GO-13",
            theme: "Gouvernance & Organisation",
            profiles: ["manager", "developer", "devops", "all"],
            question: "Disposez-vous d'une cartographie claire des versions déployées dans chaque environnement ?",
            category: "Test environment",
            weight: 2
        },
        {
            id: "GO-2",
            theme: "Gouvernance & Organisation",
            profiles: ["manager", "all"],
            question: "Les rôles et responsabilités liés au testing sont-ils clairement définis dans une documentation ou un RACI ?",
            category: "Test organization",
            weight: 3
        },
        {
            id: "GO-3",
            theme: "Gouvernance & Organisation",
            profiles: ["manager", "all"],
            question: "Les responsabilités testing sont-elles documentées et connues des parties prenantes ?",
            category: "Test organization",
            weight: 2
        },
        {
            id: "GO-6",
            theme: "Gouvernance & Organisation",
            profiles: ["manager", "all"],
            question: "Existe-t-il un comité Go/No-Go ou une instance qualité permettant de valider les jalons clés ?",
            category: "Test organization",
            weight: 3
        },
        {
            id: "GO-19",
            theme: "Gouvernance & Organisation",
            profiles: ["manager", "all"],
            question: "Existe-t-il une personne responsable du suivi des déploiements (planning, synchronisation, communication) ?",
            category: "Test organization",
            weight: 2
        },
        {
            id: "GO-12",
            theme: "Gouvernance & Organisation",
            profiles: ["manager", "developer", "all"],
            question: "Les versions applicatives (Fix Version / Affect Version) sont-elles systématiquement renseignées dans l'outil (ex. Jira) ?",
            category: "Test process management",
            weight: 2
        },
        {
            id: "GO-23",
            theme: "Gouvernance & Organisation",
            profiles: ["manager", "developer", "all"],
            question: "L'équipe organise-t-elle régulièrement des sessions de retour d'expérience (rétrospectives, post-mortems) permettant d'analyser ce qui a fonctionné ou non et d'intégrer les leçons apprises dans les pratiques de test ?",
            category: "Test process management, Defect management, Test process management",
            weight: 2
        },
        {
            id: "GO-11",
            theme: "Gouvernance & Organisation",
            profiles: ["manager", "all"],
            question: "Les pratiques de test sont-elles homogènes entre les équipes ou applications ?",
            category: "Test strategy, Methodology practice",
            weight: 2
        },
        {
            id: "GO-1",
            theme: "Gouvernance & Organisation",
            profiles: ["manager", "all"],
            question: "Une stratégie de test est-elle formalisée et disponible pour l'ensemble des équipes ?",
            category: "Test strategy, Test process management",
            weight: 3
        },
        {
            id: "GO-9",
            theme: "Gouvernance & Organisation",
            profiles: ["manager", "all"],
            question: "La documentation de test (plans, stratégies, cas, résultats) est-elle centralisée dans un espace unique ?",
            category: "Testware management",
            weight: 2
        },
        // Méthodes & Standardisation
        {
            id: "MS-17",
            theme: "Méthodes & Standardisation",
            profiles: ["developer", "all"],
            question: "Lorsqu'une anomalie est résolue, un test automatisé ou manuel est-il systématiquement ajouté pour éviter la régression ?",
            category: "Defect management",
            weight: 2
        },
        {
            id: "MS-18",
            theme: "Méthodes & Standardisation",
            profiles: ["qa", "all"],
            question: "Lorsqu'une anomalie est corrigée, un cas de test est-il systématiquement créé ou mis à jour pour couvrir cette régression ?",
            category: "Defect management",
            weight: 2
        },
        {
            id: "MS-22",
            theme: "Méthodes & Standardisation",
            profiles: ["devops", "all"],
            question: "La procédure de gestion des incidents environnement est-elle documentée ?",
            category: "Defect management",
            weight: 2
        },
        {
            id: "MS-14",
            theme: "Méthodes & Standardisation",
            profiles: ["developer", "all"],
            question: "La pratique BDD (ex : Gherkin) est-elle utilisée dans vos projets ?",
            category: "Methodology practice",
            weight: 1
        },
        {
            id: "MS-15",
            theme: "Méthodes & Standardisation",
            profiles: ["developer", "all"],
            question: "La pratique TDD est-elle utilisée (au moins partiellement) dans l'équipe ?",
            category: "Methodology practice",
            weight: 1
        },
        {
            id: "MS-8",
            theme: "Méthodes & Standardisation",
            profiles: ["developer", "all"],
            question: "La couverture de test (unitaires / intégration) est-elle mesurée automatiquement ?",
            category: "Metrics",
            weight: 3
        },
        {
            id: "MS-9",
            theme: "Méthodes & Standardisation",
            profiles: ["developer", "all"],
            question: "Un seuil minimal de couverture est-il défini et suivi ?",
            category: "Metrics",
            weight: 2
        },
        {
            id: "MS-12",
            theme: "Méthodes & Standardisation",
            profiles: ["qa", "all"],
            question: "Les KPI de tests (taux de réussite, couverture UAT, défauts majeurs…) sont-ils suivis ?",
            category: "Metrics",
            weight: 2
        },
        {
            id: "MS-25",
            theme: "Méthodes & Standardisation",
            profiles: ["qa", "all"],
            question: "Des actions concrètes (plans d'amélioration, ajustement de périmètre, renforcement de tests) sont-elles définies à partir de ces KPI de tests ?",
            category: "Metrics / Continuous improvement",
            weight: 2
        },
        {
            id: "MS-10",
            theme: "Méthodes & Standardisation",
            profiles: ["qa", "all"],
            question: "Les scénarios clés (notamment les parcours 'happy path') sont-ils validés par le Métier avant l'exécution des tests, et complétés par des scénarios alternatifs / d'erreur ?",
            category: "Stakeholder commitment",
            weight: 2
        },
        {
            id: "MS-2",
            theme: "Méthodes & Standardisation",
            profiles: ["qa", "all"],
            question: "Les scénarios de test sont-ils définis avant le développement afin d'aligner dev, QA et métier sur le comportement attendu ?",
            category: "Test case design",
            weight: 2
        },
        {
            id: "MS-3",
            theme: "Méthodes & Standardisation",
            profiles: ["qa", "all"],
            question: "Utilisez-vous des templates standardisés pour rédiger vos cas de test ?",
            category: "Test case design",
            weight: 2
        },
        {
            id: "MS-4",
            theme: "Méthodes & Standardisation",
            profiles: ["developer", "all"],
            question: "Les scénarios 'négatifs' (erreurs fonctionnelles, validations KO, contrôles métier) sont-ils systématiquement prévus lors de la conception des tests ?",
            category: "Test case design",
            weight: 2
        },
        {
            id: "MS-5",
            theme: "Méthodes & Standardisation",
            profiles: ["developer", "all"],
            question: "Les cas limites (valeurs extrêmes, comportements en bord de plage) sont-ils systématiquement testés ?",
            category: "Test case design",
            weight: 2
        },
        {
            id: "MS-13-DEV",
            theme: "Méthodes & Standardisation",
            profiles: ["developer", "all"],
            question: "Les critères d'acceptation fournis par QA/Métier sont-ils systématiquement implémentés dans les tests ?",
            category: "Test case design",
            weight: 2
        },
        {
            id: "MS-13-QA",
            theme: "Méthodes & Standardisation",
            profiles: ["qa", "all"],
            question: "Les critères d'acceptation sont-ils systématiquement définis avant développement ?",
            category: "Test case design",
            weight: 2
        },
        {
            id: "MS-21",
            theme: "Méthodes & Standardisation",
            profiles: ["devops", "all"],
            question: "Les processus de mise à jour des environnements sont-ils documentés et standardisés ?",
            category: "Test process management",
            weight: 2
        },
        {
            id: "MS-23",
            theme: "Méthodes & Standardisation",
            profiles: ["devops", "all"],
            question: "Des règles standard existent-elles pour la synchronisation des environnements (données, versions) ?",
            category: "Test process management",
            weight: 2
        },
        {
            id: "MS-24",
            theme: "Méthodes & Standardisation",
            profiles: ["devops", "all"],
            question: "Les environnements suivent-ils un cycle de vie clair (création, maintenance, archivage) ?",
            category: "Test process management",
            weight: 2
        },
        {
            id: "MS-1",
            theme: "Méthodes & Standardisation",
            profiles: ["developer", "all"],
            question: "Un cadre méthodologique de test (typologie, niveaux, règles de couverture) est-il défini et partagé avec les équipes ?",
            category: "Test strategy",
            weight: 3
        },
        {
            id: "MS-19",
            theme: "Méthodes & Standardisation",
            profiles: ["qa", "all"],
            question: "Les tests de recette suivent-ils un périmètre défini et partagé ?",
            category: "Test strategy",
            weight: 2
        },
        {
            id: "MS-20",
            theme: "Méthodes & Standardisation",
            profiles: ["qa", "all"],
            question: "Les tests UAT incluent-ils des scénarios end-to-end transverses ?",
            category: "Test strategy",
            weight: 2
        },
        {
            id: "MS-11",
            theme: "Méthodes & Standardisation",
            profiles: ["qa", "all"],
            question: "Les résultats des tests (SIT/UAT) sont-ils documentés et archivés ?",
            category: "Testware management",
            weight: 1
        },
        {
            id: "MS-16",
            theme: "Méthodes & Standardisation",
            profiles: ["developer", "all"],
            question: "Une documentation technique des tests (architecture des tests, schémas d'intégration, conventions d'automatisation) existe-t-elle et est-elle maintenue à jour ?",
            category: "Testware management",
            weight: 1
        },
        // Automatisation & CI/CD
        {
            id: "AC-5",
            theme: "Automatisation & CI/CD",
            profiles: ["developer", "all"],
            question: "Les tests sont-ils exécutés automatiquement à chaque build, push ou Pull Request ?",
            category: "CI/CD",
            weight: 3
        },
        {
            id: "AC-6",
            theme: "Automatisation & CI/CD",
            profiles: ["developer", "all"],
            question: "Le pipeline bloque-t-il la livraison en cas d'échec des tests ?",
            category: "CI/CD",
            weight: 3
        },
        {
            id: "AC-12",
            theme: "Automatisation & CI/CD",
            profiles: ["developer", "all"],
            question: "Toutes les Pull Requests nécessitent-elles une revue incluant l'analyse des résultats de test ?",
            category: "Communication & reporting",
            weight: 2
        },
        {
            id: "AC-13",
            theme: "Automatisation & CI/CD",
            profiles: ["developer", "qa", "all"],
            question: "Les rapports des tests automatisés sont-ils suffisamment clairs pour permettre de comprendre l'échec et de reproduire l'anomalie ?",
            category: "Communication & reporting",
            weight: 1
        },
        {
            id: "AC-2",
            theme: "Automatisation & CI/CD",
            profiles: ["developer", "all"],
            question: "La couverture unitaire est-elle mesurée automatiquement dans la CI ?",
            category: "Metrics",
            weight: 2
        },
        {
            id: "AC-1",
            theme: "Automatisation & CI/CD",
            profiles: ["developer", "all"],
            question: "Les tests unitaires sont-ils automatisés ?",
            category: "Test automation",
            weight: 3
        },
        {
            id: "AC-3",
            theme: "Automatisation & CI/CD",
            profiles: ["developer", "all"],
            question: "Les tests d'intégration sont-ils automatisés ?",
            category: "Test automation",
            weight: 3
        },
        {
            id: "AC-4",
            theme: "Automatisation & CI/CD",
            profiles: ["developer", "qa", "all"],
            question: "Des tests end-to-end automatisés existent-ils et couvrent-ils les scénarios critiques du périmètre (ex. parcours majeurs, happy path) ?",
            category: "Test automation",
            weight: 2
        },
        {
            id: "AC-8",
            theme: "Automatisation & CI/CD",
            profiles: ["developer", "all"],
            question: "Les tests automatisés sont-ils indépendants les uns des autres (pas d'ordre spécifique, pas de pollution) ?",
            category: "Test automation",
            weight: 2
        },
        {
            id: "AC-10",
            theme: "Automatisation & CI/CD",
            profiles: ["developer", "all"],
            question: "Une exécution régulière (nightly build) de la non-régression existe-t-elle ?",
            category: "Test automation",
            weight: 2
        },
        {
            id: "AC-14",
            theme: "Automatisation & CI/CD",
            profiles: ["developer", "all"],
            question: "Les tests non fonctionnels automatisés (performance, sécurité, charge) existent-ils ?",
            category: "Test automation",
            weight: 1
        },
        {
            id: "AC-16",
            theme: "Automatisation & CI/CD",
            profiles: ["devops", "all"],
            question: "Les vérifications préalables (smoke tests environnement) sont-elles automatisées ?",
            category: "Test automation",
            weight: 1
        },
        {
            id: "AC-19",
            theme: "Automatisation & CI/CD",
            profiles: ["qa", "all"],
            question: "Une partie de la non-régression est-elle automatisée ?",
            category: "Test automation",
            weight: 2
        },
        {
            id: "AC-7",
            theme: "Automatisation & CI/CD",
            profiles: ["developer", "all"],
            question: "Les tests automatisés sont-ils exécutables localement par un développeur sans dépendances externes ?",
            category: "Test environment",
            weight: 2
        },
        {
            id: "AC-17",
            theme: "Automatisation & CI/CD",
            profiles: ["devops", "all"],
            question: "Les environnements éphémères peuvent-ils être générés automatiquement (ex. CI/CD, kubernetes, sandbox) ?",
            category: "Test environment",
            weight: 1
        },
        {
            id: "AC-11",
            theme: "Automatisation & CI/CD",
            profiles: ["developer", "all"],
            question: "Un workflow Git standardisé (Gitflow, trunk-based…) est-il utilisé ?",
            category: "Test process management",
            weight: 1
        },
        {
            id: "AC-9",
            theme: "Automatisation & CI/CD",
            profiles: ["developer", "all"],
            question: "L'équipe utilise-t-elle des mocks/stubs pour isoler les dépendances externes ?",
            category: "Test tools",
            weight: 2
        },
        {
            id: "AC-15",
            theme: "Automatisation & CI/CD",
            profiles: ["devops", "all"],
            question: "Le provisioning des environnements (création, refresh) est-il automatisé ?",
            category: "Test tools",
            weight: 2
        },
        // Données de Test & Conformité
        {
            id: "DT-5",
            theme: "Données de Test & Conformité",
            profiles: ["manager", "qa", "devops", "all"],
            question: "Les données utilisées pour les tests sont-elles systématiquement anonymisées ou pseudonymisées conformément aux exigences RGPD et aux règles internes ?",
            category: "Compliance",
            weight: 3
        },
        {
            id: "DT-6",
            theme: "Données de Test & Conformité",
            profiles: ["devops", "all"],
            question: "Les exigences DORA sur la gestion des données sont-elles respectées ?",
            category: "Compliance",
            weight: 3
        },
        {
            id: "DT-7",
            theme: "Données de Test & Conformité",
            profiles: ["manager", "all"],
            question: "Les pratiques de gestion des données de test sont-elles alignées sur les exigences internes de conformité (ex. DORA, politiques groupe) ?",
            category: "Compliance",
            weight: 3
        },
        {
            id: "DT-12",
            theme: "Données de Test & Conformité",
            profiles: ["manager", "developer", "qa", "devops", "all"],
            question: "Des données de production sont-elles utilisées uniquement en PROD et PreProd (bench) ?",
            category: "Compliance",
            weight: 3
        },
        {
            id: "DT-2",
            theme: "Données de Test & Conformité",
            profiles: ["manager", "developer", "qa", "all"],
            question: "Les cas passants sont-ils correctement représentés dans les jeux de données ?",
            category: "Test case design",
            weight: 2
        },
        {
            id: "DT-3",
            theme: "Données de Test & Conformité",
            profiles: ["manager", "developer", "qa", "all"],
            question: "Les cas non passants (KO attendus) sont-ils prévus et intégrés ?",
            category: "Test case design",
            weight: 2
        },
        {
            id: "DT-4",
            theme: "Données de Test & Conformité",
            profiles: ["manager", "developer", "all"],
            question: "Les jeux de données couvrent ils l'exhaustivité des cas de test, les cas limites et les comportements extrêmes (valeurs atypiques, erreurs, cas rares) ?",
            category: "Test case design",
            weight: 2
        },
        {
            id: "DT-1",
            theme: "Données de Test & Conformité",
            profiles: ["manager", "devops", "all"],
            question: "Des jeux de données de test dédiés sont-ils disponibles ?",
            category: "Test data",
            weight: 3
        },
        {
            id: "DT-1-DEV",
            theme: "Données de Test & Conformité",
            profiles: ["developer", "all"],
            question: "Des jeux de données de test sont-ils disponibles pour les tests automatisés ?",
            category: "Test data",
            weight: 3
        },
        {
            id: "DT-1-QA",
            theme: "Données de Test & Conformité",
            profiles: ["qa", "all"],
            question: "Des jeux de données de test sont-ils disponibles pour vos campagnes de recette ?",
            category: "Test data",
            weight: 3
        },
        {
            id: "DT-14-ENV",
            theme: "Données de Test & Conformité",
            profiles: ["devops", "all"],
            question: "Les processus d'anonymisation ou de masquage sont-ils automatisés ou industrialisés ?",
            category: "Test tools",
            weight: 2
        },
        {
            id: "DT-8",
            theme: "Données de Test & Conformité",
            profiles: ["manager", "devops", "all"],
            question: "Le rafraîchissement des données est-il planifié ou automatisé ?",
            category: "Testware management",
            weight: 2
        },
        {
            id: "DT-9",
            theme: "Données de Test & Conformité",
            profiles: ["manager", "devops", "all"],
            question: "La provenance et le mode d'alimentation des jeux de données de test sont-ils clairement documentés ?",
            category: "Testware management",
            weight: 2
        },
        {
            id: "DT-10",
            theme: "Données de Test & Conformité",
            profiles: ["developer", "devops", "all"],
            question: "Les équipes environnements fournissent-elles des jeux versionnés (étiquetés, historisés par release / campagne) ?",
            category: "Testware management",
            weight: 2
        },
        {
            id: "DT-11",
            theme: "Données de Test & Conformité",
            profiles: ["manager", "developer", "devops", "all"],
            question: "Les jeux de données fournis sont-ils systématiquement reproductibles (possibilité de rejouer exactement le même jeu à l'identique) ?",
            category: "Testware management",
            weight: 3
        },
        {
            id: "DT-13",
            theme: "Données de Test & Conformité",
            profiles: ["developer", "qa", "devops", "all"],
            question: "Un jeu de données stable et figé est-il disponible pour rejouer des tests ?",
            category: "Testware management",
            weight: 3
        },
        // Environnements de test
        {
            id: "ET-5",
            theme: "Environnements de test",
            profiles: ["devops", "all"],
            question: "Une documentation claire et à jour des environnements existe-t-elle ?",
            category: "Communication",
            weight: 1
        },
        {
            id: "ET-6",
            theme: "Environnements de test",
            profiles: ["devops", "all"],
            question: "Un monitoring existe-t-il pour détecter anomalies, lenteurs, incidents ?",
            category: "Metrics",
            weight: 2
        },
        {
            id: "ET-1",
            theme: "Environnements de test",
            profiles: ["devops", "all"],
            question: "Plusieurs environnements de test existent-ils (DEV, SIT, UAT, PERF) ?",
            category: "Test environment",
            weight: 2
        },
        {
            id: "ET-2",
            theme: "Environnements de test",
            profiles: ["qa", "devops", "all"],
            question: "Les environnements sont-ils globalement stables lors des campagnes de tests ?",
            category: "Test environment",
            weight: 3
        },
        {
            id: "ET-3",
            theme: "Environnements de test",
            profiles: ["devops", "all"],
            question: "Les environnements sont-ils isolés (pas de conflits entre équipes/applications) ?",
            category: "Test environment",
            weight: 2
        },
        {
            id: "ET-4",
            theme: "Environnements de test",
            profiles: ["developer", "devops", "all"],
            question: "Les versions applicatives sont-elles alignées entre environnements (DEV/UAT/BENCH) ?",
            category: "Test environment",
            weight: 2
        },
        {
            id: "ET-8",
            theme: "Environnements de test",
            profiles: ["developer", "devops", "all"],
            question: "L'équipe de développement peut-elle déployer de manière autonome son application sur au moins un environnement de test (ex. DEV ou UAT) ?",
            category: "Test environment",
            weight: 1
        },
        {
            id: "ET-9",
            theme: "Environnements de test",
            profiles: ["qa", "devops", "all"],
            question: "La disponibilité des environnements est-elle garantie pendant les campagnes de tests ?",
            category: "Test environment",
            weight: 3
        },
        {
            id: "ET-11-DEV",
            theme: "Environnements de test",
            profiles: ["developer", "all"],
            question: "Les environnements permettent-ils aux développeurs d'exécuter l'ensemble des tests automatisés (unitaires, intégration, E2E) de manière fiable et sans contraintes techniques ?",
            category: "Test environment",
            weight: 2
        },
        {
            id: "ET-11-ENV",
            theme: "Environnements de test",
            profiles: ["devops", "all"],
            question: "Les environnements supportent-ils techniquement l'exécution fluide de l'ensemble des tests automatisés (CI/CD, E2E, intégration) sans restrictions ni dégradations ?",
            category: "Test environment",
            weight: 2
        },
        {
            id: "ET-11-QA",
            theme: "Environnements de test",
            profiles: ["qa", "all"],
            question: "Les environnements permettent-ils d'exécuter de façon fiable les scénarios de recette et UAT, sans instabilité ni dépendances bloquantes ?",
            category: "Test environment",
            weight: 2
        },
        {
            id: "ET-12",
            theme: "Environnements de test",
            profiles: ["developer", "devops", "all"],
            question: "Les environnements sont-ils suffisamment isolés pour éviter des interférences entre tests ?",
            category: "Test environment",
            weight: 2
        },
        {
            id: "ET-7",
            theme: "Environnements de test",
            profiles: ["devops", "all"],
            question: "Les mises à jour d'environnements suivent-elles un processus standardisé ?",
            category: "Test process management",
            weight: 2
        },
        // Culture & Collaboration
        {
            id: "CC-5-ENV",
            theme: "Culture & Collaboration",
            profiles: ["devops", "all"],
            question: "Les consignes, limitations et risques environnement sont-ils communiqués clairement ?",
            category: "Communication",
            weight: 1
        },
        {
            id: "CC-25-ENV",
            theme: "Culture & Collaboration",
            profiles: ["devops", "all"],
            question: "Communiquez-vous régulièrement avec les équipes Dev/QA/Métier sur l'état des environnements ?",
            category: "Communication",
            weight: 1
        },
        {
            id: "CC-2",
            theme: "Culture & Collaboration",
            profiles: ["manager", "qa", "all"],
            question: "Les résultats de tests sont-ils régulièrement partagés avec les parties prenantes (Dev, QA, Métier, Environnements) ?",
            category: "Communication, Communication & reporting",
            weight: 1
        },
        {
            id: "CC-15",
            theme: "Culture & Collaboration",
            profiles: ["qa", "all"],
            question: "Les retours utilisateurs et incidents de production sont-ils intégrés dans l'amélioration continue des tests (ajout de cas, ajustement de scénarios, évolution des critères d'acceptation) ?",
            category: "Continuous improvement",
            weight: 2
        },
        {
            id: "CC-17",
            theme: "Culture & Collaboration",
            profiles: ["manager", "all"],
            question: "Des postmortems ou retours d'expérience sont-ils réalisés suite à des incidents ?",
            category: "Defect management",
            weight: 2
        },
        {
            id: "CC-24-ENV",
            theme: "Culture & Collaboration",
            profiles: ["devops", "all"],
            question: "Les incidents d'environnement font-ils l'objet de postmortems ou REX ?",
            category: "Defect management",
            weight: 2
        },
        {
            id: "CC-4",
            theme: "Culture & Collaboration",
            profiles: ["manager", "qa", "all"],
            question: "Une communauté de pratique (guild, chapter, COP) dédiée au testing existe-t-elle et est-elle active ?",
            category: "Methodology practice",
            weight: 1
        },
        {
            id: "CC-8-MAN",
            theme: "Culture & Collaboration",
            profiles: ["manager", "all"],
            question: "Les équipes sous votre périmètre sont-elles ouvertes à adopter un framework ou des standards de test transverses ?",
            category: "Methodology practice",
            weight: 2
        },
        {
            id: "CC-9-DEV",
            theme: "Culture & Collaboration",
            profiles: ["developer", "all"],
            question: "L'équipe consacre-t-elle du temps à l'amélioration continue (technique, qualité, tests) ?",
            category: "Methodology practice",
            weight: 2
        },
        {
            id: "CC-9-MAN",
            theme: "Culture & Collaboration",
            profiles: ["manager", "all"],
            question: "L'équipe consacre-t-elle du temps à l'amélioration continue (technique, qualité, tests) ?",
            category: "Methodology practice",
            weight: 2
        },
        {
            id: "CC-9-QA",
            theme: "Culture & Collaboration",
            profiles: ["qa", "all"],
            question: "L'équipe consacre-t-elle du temps à l'amélioration continue (technique, qualité, tests) ?",
            category: "Methodology practice",
            weight: 2
        },
        {
            id: "CC-13",
            theme: "Culture & Collaboration",
            profiles: ["developer", "qa", "all"],
            question: "Existe-t-il une structure transverse (COP, guilde, chapter) dédiée au testing, avec des rituels réguliers organisés ?",
            category: "Methodology practice",
            weight: 1
        },
        {
            id: "CC-26-ENV",
            theme: "Culture & Collaboration",
            profiles: ["devops", "all"],
            question: "L'équipe Environnements participe-t-elle à des communautés ou cérémonies transverses (COP, guildes, chapters, rétros transverses) ?",
            category: "Methodology practice",
            weight: 1
        },
        {
            id: "CC-14",
            theme: "Culture & Collaboration",
            profiles: ["developer", "qa", "all"],
            question: "Les équipes participent-elles régulièrement à des rituels qualité (post-mortems, rétrospectives, revues, ateliers qualité) ?",
            category: "Methodology practice, Defect management / Methodology practice",
            weight: 1
        },
        {
            id: "CC-1",
            theme: "Culture & Collaboration",
            profiles: ["manager", "all"],
            question: "Les tests sont-ils clairement considérés comme une responsabilité partagée entre Dev, QA, Métier et Environnements (et pas seulement 'affaire de QA') ?",
            category: "Stakeholder commitment",
            weight: 3
        },
        {
            id: "CC-3",
            theme: "Culture & Collaboration",
            profiles: ["developer", "qa", "all"],
            question: "Les développeurs, QA et Métier collaborent-ils efficacement pour définir les critères d'acceptation ?",
            category: "Stakeholder commitment",
            weight: 2
        },
        {
            id: "CC-8-DEV",
            theme: "Culture & Collaboration",
            profiles: ["developer", "all"],
            question: "L'équipe de développement est-elle ouverte à adopter et appliquer un framework ou des standards de test transverses ?",
            category: "Stakeholder commitment",
            weight: 1
        },
        {
            id: "CC-8-ENV",
            theme: "Culture & Collaboration",
            profiles: ["devops", "all"],
            question: "L'équipe Environnements est-elle ouverte à intégrer ou supporter un framework ou des standards de test transverses utilisés par les équipes consommatrices ?",
            category: "Stakeholder commitment",
            weight: 1
        },
        {
            id: "CC-8-QA",
            theme: "Culture & Collaboration",
            profiles: ["qa", "all"],
            question: "L'équipe de QA/Métier est-elle ouverte à adopter et appliquer un framework ou des standards de test transverses ?",
            category: "Stakeholder commitment",
            weight: 1
        },
        {
            id: "CC-18",
            theme: "Culture & Collaboration",
            profiles: ["qa", "all"],
            question: "Le métier participe-t-il activement aux UAT (présence, exécution de scénarios, validation des résultats) ?",
            category: "Stakeholder commitment",
            weight: 3
        },
        {
            id: "CC-11-QA",
            theme: "Culture & Collaboration",
            profiles: ["qa", "all"],
            question: "L'équipe QA/Métier est-elle sereine lors des mises en production ?",
            category: "Stakeholder commitment / Test strategy",
            weight: 3
        },
        {
            id: "CC-16",
            theme: "Culture & Collaboration",
            profiles: ["devops", "all"],
            question: "Êtes-vous sereins lors des mises en production (vision infra/env) ?",
            category: "Stakeholder commitment / Test strategy",
            weight: 3
        },
        {
            id: "CC-11",
            theme: "Culture & Collaboration",
            profiles: ["manager", "all"],
            question: "Êtes-vous sereins lors des mises en production ?",
            category: "Stakeholder commitment, Test strategy",
            weight: 3
        },
        {
            id: "CC-7",
            theme: "Culture & Collaboration",
            profiles: ["manager", "all"],
            question: "Des rétrospectives régulières incluent-elles un volet qualité/test ?",
            category: "Test process management",
            weight: 1
        },
        {
            id: "CC-10",
            theme: "Culture & Collaboration",
            profiles: ["developer", "all"],
            question: "Les bonnes pratiques de testing (revue de code, guidelines test) sont-elles respectées ?",
            category: "Test process management",
            weight: 2
        },
        {
            id: "CC-15-ENV",
            theme: "Culture & Collaboration",
            profiles: ["devops", "all"],
            question: "Les retours des équipes consommatrices (Dev, QA, Métier) sont-ils intégrés dans l'amélioration des environnements ?",
            category: "Test process management",
            weight: 2
        },
        {
            id: "CC-12",
            theme: "Culture & Collaboration",
            profiles: ["developer", "all"],
            question: "L'équipe est-elle sereine lors des mises en production ?",
            category: "Test strategy, Stakeholder commitment",
            weight: 3
        },
        {
            id: "CC-5",
            theme: "Culture & Collaboration",
            profiles: ["manager", "all"],
            question: "Un plan de montée en compétence testing existe-t-il ?",
            category: "Training",
            weight: 1
        }
    ]
};