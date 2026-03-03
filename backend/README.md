# Guide de Développement Backend - Système de Gestion du Réseau Pluvial Urbain

## Vue d'ensemble

Ce dossier contient le backend de l'application de gestion du réseau pluvial urbain d'Agadir. L'application est construite avec Flask et communique avec une base de données MySQL pour gérer les capteurs IoT, les pompes de drainage et les alertes en temps réel.

## Pile Technologique Requise

### Technologies Obligatoires

- **Python** : Version 3.9 ou supérieure
- **Flask** : Framework web Python minimaliste et flexible
- **MySQL** : Version 8.0 ou supérieure pour la base de données
- **PyMySQL** : Connecteur Python pour MySQL (ou autre driver MySQL de votre choix)

### Technologies Recommandées (Optionnelles)

Vous êtes libres d'ajouter les bibliothèques suivantes selon vos besoins :

- **SQLAlchemy** : ORM Python pour faciliter les interactions avec la base de données
- **Flask-CORS** : Gestion des requêtes cross-origin depuis le frontend
- **Flask-JWT-Extended** : Authentification par tokens JWT
- **Marshmallow** : Sérialisation et validation des données
- **python-dotenv** : Gestion des variables d'environnement
- **Alembic** : Migrations de base de données
- **pytest** : Framework de tests unitaires et d'intégration
- **Flask-SocketIO** : Communication temps réel WebSocket (optionnel pour notifications)
- **Celery** : Gestion des tâches asynchrones (optionnel pour traitements lourds)

## Architecture de la Base de Données

L'application doit interagir avec une base de données MySQL contenant les tables suivantes :

### Tables Principales

1. **zone** : Zones géographiques du réseau de drainage
2. **capteur** : Capteurs IoT (niveau d'eau, débit, pression)
3. **lecture_capteur** : Enregistrements des mesures des capteurs
4. **pompe** : Pompes de drainage
5. **operation_pompe** : Historique des opérations sur les pompes
6. **alerte** : Alertes système (niveaux élevés, pannes, maintenance)
7. **utilisateur** : Comptes utilisateurs avec différents rôles

Pour le détail complet du schéma, consultez les fichiers :
- `docs/MCD/` : Modèle Conceptuel de Données
- `docs/MLD/` : Modèle Logique de Données avec schémas SQL

### Mécanismes Automatiques

La base de données inclut :
- **3 Triggers MySQL** : 
  - Création automatique d'alertes lors de dépassement de seuils critiques
  - Mise à jour de la dernière lecture dans la table capteur
  - Traçabilité automatique des changements de statut des pompes

- **2 Procédures Stockées** :
  - Activation automatique des pompes selon les conditions critiques
  - Génération de rapports de statut système

## Structure de Projet Suggérée

Vous êtes libres d'organiser votre code comme vous le souhaitez, mais voici une structure recommandée pour un projet Flask bien organisé :

```
backend/
├── app/
│   ├── __init__.py              # Factory Flask, initialisation de l'app
│   ├── config.py                # Configuration (dev, test, production)
│   ├── extensions.py            # Initialisation des extensions (CORS, JWT, etc.)
│   │
│   ├── models/                  # Modèles de données (si ORM utilisé)
│   │   ├── __init__.py
│   │   ├── zone.py
│   │   ├── capteur.py
│   │   ├── lecture.py
│   │   ├── pompe.py
│   │   ├── alerte.py
│   │   └── utilisateur.py
│   │
│   ├── routes/                  # Routes API (Blueprints Flask)
│   │   ├── __init__.py
│   │   ├── auth.py             # Authentification, login, logout
│   │   ├── zones.py            # CRUD zones
│   │   ├── capteurs.py         # CRUD capteurs
│   │   ├── lectures.py         # Récupération lectures capteurs
│   │   ├── pompes.py           # Gestion pompes (activation, désactivation)
│   │   ├── alertes.py          # Gestion alertes (acquittement, résolution)
│   │   └── utilisateurs.py     # Gestion utilisateurs
│   │
│   ├── services/                # Logique métier
│   │   ├── __init__.py
│   │   ├── zone_service.py
│   │   ├── capteur_service.py
│   │   ├── pompe_service.py
│   │   ├── alerte_service.py
│   │   └── auth_service.py
│   │
│   ├── schemas/                 # Schémas de validation (Marshmallow ou Pydantic)
│   │   ├── __init__.py
│   │   ├── zone_schema.py
│   │   ├── capteur_schema.py
│   │   ├── pompe_schema.py
│   │   └── alerte_schema.py
│   │
│   ├── utils/                   # Utilitaires et helpers
│   │   ├── __init__.py
│   │   ├── database.py         # Connexion DB, helpers requêtes
│   │   ├── decorators.py       # Décorateurs personnalisés (auth, roles)
│   │   └── validators.py       # Validations personnalisées
│   │
│   └── middleware/              # Middlewares personnalisés
│       ├── __init__.py
│       └── error_handler.py    # Gestion centralisée des erreurs
│
├── migrations/                  # Migrations Alembic (si utilisé)
│   └── versions/
│
├── tests/                       # Tests unitaires et d'intégration
│   ├── __init__.py
│   ├── conftest.py             # Configuration pytest
│   ├── test_zones.py
│   ├── test_capteurs.py
│   ├── test_pompes.py
│   └── test_alertes.py
│
├── .env                         # Variables d'environnement (NE PAS COMMITER)
├── .env.example                 # Exemple de configuration
├── .gitignore                   # Fichiers à ignorer par Git
├── requirements.txt             # Dépendances Python
├── run.py                       # Point d'entrée de l'application
└── README.md                    # Ce fichier
```

## Installation et Configuration

### Étape 1 : Environnement Virtuel

Créez et activez un environnement virtuel Python :

```bash
# Création de l'environnement virtuel
python -m venv venv

# Activation (Windows)
venv\Scripts\activate

# Activation (Linux/Mac)
source venv/bin/activate
```

### Étape 2 : Installation des Dépendances

Le fichier `requirements.txt` contient les dépendances de base. Vous pouvez ajouter d'autres bibliothèques selon vos besoins.

```bash
pip install -r requirements.txt
```

Si vous ajoutez de nouvelles dépendances, mettez à jour le fichier :

```bash
pip freeze > requirements.txt
```

### Étape 3 : Configuration de la Base de Données

Créez la base de données MySQL :

```sql
CREATE DATABASE urba_drain_agadir CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Exécutez les scripts SQL pour créer les tables, triggers et procédures stockées.

### Étape 4 : Variables d'Environnement

Créez un fichier `.env` à la racine du dossier backend (utilisez `.env.example` comme modèle) :

```env
# Configuration Flask
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=votre_clé_secrète_très_longue_et_aléatoire

# Configuration Base de Données
DB_HOST=localhost
DB_PORT=3306
DB_NAME=urba_drain_agadir
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe

# Configuration CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Configuration JWT (si utilisé)
JWT_SECRET_KEY=autre_clé_secrète_pour_jwt
JWT_ACCESS_TOKEN_EXPIRES=3600
```

### Étape 5 : Lancement de l'Application

```bash
python run.py
```

L'application devrait démarrer sur `http://localhost:5000` (ou le port configuré).

## Fonctionnalités Requises

### 1. Authentification et Autorisation

Implémentez un système d'authentification sécurisé avec gestion des rôles :

- **ADMIN** : Accès complet (CRUD utilisateurs, configuration système)
- **OPERATEUR** : Gestion des pompes, acquittement des alertes
- **TECHNICIEN** : Maintenance, consultation de l'historique
- **VIEWER** : Lecture seule (dashboards, rapports)

Technologies suggérées :
- JWT (JSON Web Tokens) pour l'authentification stateless
- Bcrypt pour le hashing des mots de passe
- Décorateurs pour protéger les routes selon les rôles

### 2. Gestion des Zones

API REST pour gérer les zones géographiques :

- `GET /api/zones` : Liste toutes les zones
- `GET /api/zones/:id` : Détails d'une zone spécifique
- `POST /api/zones` : Créer une nouvelle zone (ADMIN uniquement)
- `PUT /api/zones/:id` : Mettre à jour une zone (ADMIN uniquement)
- `DELETE /api/zones/:id` : Supprimer une zone (ADMIN uniquement)
- `GET /api/zones/:id/capteurs` : Capteurs d'une zone
- `GET /api/zones/:id/pompes` : Pompes d'une zone
- `GET /api/zones/:id/alertes` : Alertes actives d'une zone

### 3. Gestion des Capteurs

API pour monitorer les capteurs IoT :

- `GET /api/capteurs` : Liste tous les capteurs (avec filtrage par statut, type, zone)
- `GET /api/capteurs/:id` : Détails d'un capteur
- `POST /api/capteurs` : Enregistrer un nouveau capteur (ADMIN/TECHNICIEN)
- `PUT /api/capteurs/:id` : Mettre à jour un capteur
- `DELETE /api/capteurs/:id` : Supprimer un capteur
- `GET /api/capteurs/:id/lectures` : Historique des lectures (avec pagination)
- `POST /api/capteurs/:id/lectures` : Enregistrer une nouvelle lecture (IoT)
- `GET /api/capteurs/:id/lectures/latest` : Dernière lecture
- `PUT /api/capteurs/:id/maintenance` : Enregistrer une maintenance

### 4. Gestion des Lectures de Capteurs

API pour exploiter les données des capteurs :

- `GET /api/lectures` : Liste des lectures (avec filtres : capteur, date, anomalie)
- `GET /api/lectures/recent` : Lectures récentes (dernières 24h)
- `GET /api/lectures/anomalies` : Lectures avec anomalies détectées
- `GET /api/lectures/stats` : Statistiques (moyenne, min, max) par capteur/période

Considérations importantes :
- Cette table peut contenir des millions de lignes (52M lectures/an)
- Implémentez une pagination efficace
- Utilisez des index appropriés
- Envisagez un archivage des données anciennes

### 5. Gestion des Pompes

API pour contrôler les pompes de drainage :

- `GET /api/pompes` : Liste toutes les pompes (avec filtrage)
- `GET /api/pompes/:id` : Détails d'une pompe
- `POST /api/pompes` : Enregistrer une nouvelle pompe (ADMIN)
- `PUT /api/pompes/:id` : Mettre à jour une pompe
- `POST /api/pompes/:id/activate` : Activer une pompe (OPERATEUR/ADMIN)
- `POST /api/pompes/:id/deactivate` : Désactiver une pompe (OPERATEUR/ADMIN)
- `PUT /api/pompes/:id/mode` : Changer le mode (MANUEL/AUTOMATIQUE/PLANIFIE)
- `GET /api/pompes/:id/operations` : Historique des opérations
- `POST /api/pompes/:id/maintenance` : Enregistrer une maintenance (TECHNICIEN)

Points importants :
- Les pompes en mode AUTOMATIQUE peuvent être activées par les triggers
- Les pompes en mode MANUEL nécessitent une action utilisateur
- Traçabilité complète de toutes les opérations

### 6. Gestion des Alertes

API pour gérer les alertes système :

- `GET /api/alertes` : Liste des alertes (avec filtres : statut, sévérité, zone, date)
- `GET /api/alertes/active` : Alertes actives uniquement
- `GET /api/alertes/:id` : Détails d'une alerte
- `POST /api/alertes` : Créer une alerte manuelle (OPERATEUR/ADMIN)
- `PUT /api/alertes/:id/acknowledge` : Acquitter une alerte (OPERATEUR/ADMIN)
- `PUT /api/alertes/:id/resolve` : Résoudre une alerte (OPERATEUR/ADMIN)
- `PUT /api/alertes/:id/ignore` : Ignorer une alerte (ADMIN uniquement)
- `GET /api/alertes/stats` : Statistiques des alertes par période

Règles métier à implémenter :
- Escalade automatique : AVERTISSEMENT non acquittée 30min → CRITIQUE
- Notification : Alertes CRITIQUE → email aux ADMIN et OPERATEURS
- Acquittement obligatoire pour CRITIQUE/URGENCE

### 7. Dashboard et Rapports

API pour alimenter le tableau de bord :

- `GET /api/dashboard/overview` : Vue d'ensemble du système
  - Nombre de capteurs actifs/défaillants
  - Nombre de pompes actives/en panne
  - Alertes actives par sévérité
  - Zones à risque élevé

- `GET /api/dashboard/zones-map` : Données pour carte interactive
  - Coordonnées GPS de toutes les zones
  - Statut en temps réel (nombre d'alertes actives)
  - Niveau de risque par zone

- `GET /api/reports/system-status` : Rapport de statut système complet
  - Appelle la procédure stockée `system_status_report()`

- `GET /api/reports/zone/:id` : Rapport détaillé d'une zone
  - Historique des alertes
  - Performance des capteurs
  - Activité des pompes

### 8. Gestion des Utilisateurs

API pour la gestion des comptes :

- `POST /api/auth/register` : Créer un compte (ADMIN uniquement)
- `POST /api/auth/login` : Authentification
- `POST /api/auth/logout` : Déconnexion
- `POST /api/auth/refresh` : Rafraîchir le token JWT
- `GET /api/users` : Liste des utilisateurs (ADMIN uniquement)
- `GET /api/users/:id` : Profil utilisateur
- `PUT /api/users/:id` : Modifier profil
- `PUT /api/users/:id/password` : Changer mot de passe
- `PUT /api/users/:id/role` : Modifier rôle (ADMIN uniquement)
- `DELETE /api/users/:id` : Désactiver utilisateur (ADMIN uniquement)

## Règles de Gestion à Implémenter

### Règles Capteurs

1. **Lectures périodiques** : Accepter les lectures toutes les 5 minutes pour capteurs actifs
2. **Détection d'anomalies** : Si variation > 50% par rapport à lecture précédente → anomalie = TRUE
3. **Alertes de seuil** : 
   - valeur > seuil_alerte → créer alerte AVERTISSEMENT
   - valeur > seuil_critique → créer alerte CRITIQUE + déclencher activation pompes
4. **Batterie faible** : batterie_pct < 20% → alerte maintenance
5. **Capteur défaillant** : Absence de lecture > 30min → statut DEFAILLANT

### Règles Pompes

6. **Activation automatique** : Si 2+ capteurs d'une zone > seuil_critique → activer pompes en mode AUTOMATIQUE
7. **Désactivation automatique** : Si tous capteurs zone < seuil_alerte pendant 15min → désactiver
8. **Limite fonctionnement** : Empêcher fonctionnement continu > 8h (retourner erreur)
9. **Maintenance préventive** : Alerter tous les 500h ou 6 mois
10. **Mode manuel prioritaire** : Pompes en MANUEL ne peuvent être activées que par OPERATEUR/ADMIN
11. **Traçabilité** : Toute opération doit créer une entrée dans operation_pompe

### Règles Alertes

12. **Création automatique** : Les triggers créent automatiquement certaines alertes
13. **Escalade** : AVERTISSEMENT non acquittée 30min → passer à CRITIQUE (tâche planifiée)
14. **Acquittement obligatoire** : CRITIQUE/URGENCE doivent être acquittées
15. **Résolution** : Une alerte ne peut être RESOLUE que si conditions normales rétablies
16. **Notification** : Alertes CRITIQUE → envoyer email/notification push
17. **Historique** : Ne jamais supprimer les alertes, seulement changer le statut

### Règles Zones

18. **Niveau de risque** : Calculer automatiquement selon :
    - Nombre d'alertes critiques dans les 30 derniers jours
    - Fréquence d'activation des pompes
    - Données topographiques (si disponibles)

19. **Couverture minimale** : Une zone doit avoir minimum 2 capteurs actifs
20. **Capacité de pompage** : Capacité totale des pompes >= 1.5x débit maximal observé

## Gestion des Erreurs

Implémentez une gestion centralisée des erreurs avec des codes HTTP appropriés :

- `200 OK` : Succès
- `201 Created` : Ressource créée
- `400 Bad Request` : Données invalides
- `401 Unauthorized` : Non authentifié
- `403 Forbidden` : Non autorisé (rôle insuffisant)
- `404 Not Found` : Ressource introuvable
- `409 Conflict` : Conflit (ex: référence capteur déjà existante)
- `422 Unprocessable Entity` : Validation échouée
- `500 Internal Server Error` : Erreur serveur

Format de réponse d'erreur suggéré :

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Les données fournies sont invalides",
    "details": {
      "seuil_critique": "Doit être supérieur au seuil d'alerte"
    }
  }
}
```

## Tests

Implémentez des tests pour garantir la qualité du code :

### Tests Unitaires

Testez les fonctions individuelles (services, validations, utilitaires)

```python
# Exemple avec pytest
def test_detection_anomalie():
    # Test de la logique de détection d'anomalie
    lecture_precedente = 10.5
    lecture_actuelle = 18.2
    assert est_anomalie(lecture_actuelle, lecture_precedente) == True
```

### Tests d'Intégration

Testez les routes API complètes avec une base de données de test

```python
def test_create_alerte_critique(client, auth_token):
    response = client.post(
        '/api/alertes',
        json={
            'type_alerte': 'NIVEAU_ELEVE',
            'niveau_severite': 'CRITIQUE',
            'titre': 'Niveau critique détecté',
            'id_zone': 1
        },
        headers={'Authorization': f'Bearer {auth_token}'}
    )
    assert response.status_code == 201
    assert response.json['niveau_severite'] == 'CRITIQUE'
```

### Tests de Bout en Bout

Simulez des scénarios complets (ex: capteur détecte niveau critique → alerte créée → pompe activée)

## Performance et Optimisation

### Optimisation des Requêtes

- Utilisez les index définis dans le MLD
- Limitez le nombre de jointures
- Implémentez une pagination efficace (LIMIT/OFFSET ou curseur)
- Utilisez SELECT avec colonnes spécifiques plutôt que SELECT *

### Mise en Cache

Envisagez d'utiliser un système de cache (Redis, Memcached) pour :
- Dernières lectures de capteurs (accès fréquent)
- Statistiques du dashboard
- Données de référence (zones, seuils)

### Tâches Asynchrones

Pour les opérations longues, utilisez Celery ou des workers asynchrones :
- Envoi de notifications email
- Génération de rapports volumineux
- Archivage de données anciennes
- Calcul de statistiques complexes

## Sécurité

### Bonnes Pratiques

1. **Validation des entrées** : Validez et nettoyez toutes les données utilisateur
2. **Protection CSRF** : Activez la protection CSRF pour les formulaires
3. **Limitation de débit** : Limitez le nombre de requêtes par IP (rate limiting)
4. **Logs sécurisés** : Ne loguez jamais de mots de passe ou tokens
5. **Connexions HTTPS** : Utilisez HTTPS en production
6. **Variables d'environnement** : Ne committez jamais le fichier .env
7. **Dépendances à jour** : Mettez régulièrement à jour les bibliothèques
8. **Gestion des secrets** : Utilisez des clés secrètes fortes et aléatoires

### SQL Injection

Si vous utilisez des requêtes SQL brutes (sans ORM), utilisez toujours des requêtes paramétrées :

```python
# MAUVAIS - Vulnérable à l'injection SQL
query = f"SELECT * FROM capteur WHERE id = {capteur_id}"

# BON - Utilisation de paramètres
query = "SELECT * FROM capteur WHERE id = %s"
cursor.execute(query, (capteur_id,))
```

## Logging

Implémentez un système de logging approprié :

```python
import logging

# Configuration du logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Utilisation
logger.info("Pompe activée automatiquement - Zone 3")
logger.warning("Capteur 42 - Batterie faible (15%)")
logger.error("Échec de connexion à la base de données")
```

## Documentation API

Documentez votre API pour faciliter l'intégration avec le frontend :

- Utilisez Swagger/OpenAPI avec Flask-RESTX ou flasgger
- Alternative : Documentation manuelle avec Postman Collections
- Incluez des exemples de requêtes et réponses
- Documentez tous les codes d'erreur possibles

## Déploiement

### Serveur de Production

Options recommandées :
- **Gunicorn** : Serveur WSGI Python performant
- **Nginx** : Reverse proxy pour servir l'API
- **Supervisor** : Gestion des processus

Configuration Gunicorn :

```bash
gunicorn --workers 4 --bind 0.0.0.0:5000 run:app
```

### Variables d'Environnement en Production

Créez un fichier `.env` pour la production avec :
- `FLASK_ENV=production`
- Clés secrètes fortes et uniques
- Informations de connexion DB sécurisées
- Désactivation du mode debug

### Monitoring

Implémentez un monitoring en production :
- Logs applicatifs (fichiers, Sentry)
- Métriques de performance (temps de réponse, nombre de requêtes)
- Alertes en cas d'erreurs critiques
- Surveillance de la base de données

## Points d'Attention Particuliers

### Gestion des Lectures de Capteurs

Cette table contiendra des millions de lignes. Considérations :

1. **Insertion en batch** : Acceptez plusieurs lectures simultanément
2. **Partitionnement** : La table est partitionnée par année (voir MLD)
3. **Archivage** : Implémentez un archivage automatique des lectures > 90 jours
4. **Agrégation** : Pré-calculez des statistiques horaires/journalières

### Activation Automatique des Pompes

L'activation automatique peut être gérée de deux façons :

**Option 1 : Via Procédure Stockée**
- Appelée par un job cron toutes les 5 minutes
- Vérifie les conditions et active les pompes
- Utilise `CALL auto_activate_pumps(zone_id)`

**Option 2 : Via Logique Applicative**
- À chaque nouvelle lecture critique, vérifier les conditions
- Activer les pompes via l'API si nécessaire
- Plus de contrôle, mais plus de complexité

### Escalade des Alertes

Implémentez une tâche planifiée (Celery Beat ou cron) qui :
- S'exécute toutes les 5 minutes
- Vérifie les alertes AVERTISSEMENT non acquittées depuis > 30min
- Les passe automatiquement en CRITIQUE
- Envoie des notifications

## Ressources et Documentation

### Documentation Flask
- Flask Documentation : https://flask.palletsprojects.com/
- Flask Mega-Tutorial : https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-i-hello-world

### Documentation SQLAlchemy (si utilisé)
- SQLAlchemy Documentation : https://docs.sqlalchemy.org/

### Bonnes Pratiques Python
- PEP 8 Style Guide : https://pep8.org/
- Clean Code Python : https://github.com/zedr/clean-code-python

### Sécurité
- OWASP Top 10 : https://owasp.org/www-project-top-ten/

## Support et Questions

Pour toute question concernant la conception de la base de données, consultez :
- `docs/MCD/README.md` : Modèle Conceptuel détaillé
- `docs/MLD/README.md` : Schémas SQL et contraintes
- `docs/Cahier_Recette_QA/README.md` : Tests et validation

## Liberté de Développement

Ce guide fournit des recommandations et des exigences minimales, mais vous êtes encouragés à :

- Choisir l'architecture qui vous convient le mieux (avec ou sans ORM)
- Ajouter des bibliothèques supplémentaires si nécessaire
- Implémenter des fonctionnalités bonus (WebSocket, cache, etc.)
- Organiser le code selon vos préférences
- Utiliser des patterns de conception appropriés (Factory, Repository, etc.)

L'important est de respecter :
1. Les technologies imposées (Flask, MySQL)
2. Le schéma de base de données défini
3. Les règles de gestion métier
4. Les bonnes pratiques de sécurité et de performance

Bon développement et n'hésitez pas à être créatifs dans votre implémentation.
Amaali Oussama 
