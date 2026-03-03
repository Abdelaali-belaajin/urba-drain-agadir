# Urba Drain Agadir

Système de gestion intelligente du réseau pluvial urbain d'Agadir.

## Description

Application full-stack pour la surveillance et la gestion du réseau de drainage pluvial urbain. Le système permet de :
- Monitorer les niveaux d'eau via des capteurs en temps réel
- Gérer l'activation/désactivation des pompes de drainage
- Recevoir et traiter des alertes automatiques
- Visualiser l'état général du système sur un dashboard

## Stack Technique

### Backend
- **Flask** (Python) - Framework web
- **MySQL** - Base de données relationnelle
- **PyMySQL** - Connexion MySQL (SANS ORM)
- **Flask-CORS** - Gestion des CORS

### Frontend
- **React** - Interface utilisateur
- **Vite** - Build tool et dev server
- **React Router** - Navigation

## Structure du Projet

```
urba-drain-agadir/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── db.py
│   │   ├── routes/
│   │   │   ├── alerts.py
│   │   │   ├── pumps.py
│   │   │   └── sensors.py
│   │   └── services/
│   │       ├── alert_service.py
│   │       ├── pump_service.py
│   │       └── sensor_service.py
│   ├── db/
│   │   ├── schema/
│   │   ├── triggers/
│   │   ├── procedures/
│   │   └── seed/
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── docs/
└── README.md
```

## Installation

### Prérequis
- Python 3.8+
- Node.js 16+
- MySQL 8.0+

### Cloner le projet

```bash
git clone https://github.com/votre-username/urba-drain-agadir.git
cd urba-drain-agadir
```

### Configuration Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

### Configuration Base de Données

```bash
mysql -u root -p < db/schema/01_create_tables.sql
mysql -u root -p < db/triggers/01_critical_level_alert.sql
mysql -u root -p < db/procedures/01_auto_activate_pumps.sql
mysql -u root -p < db/seed/01_seed_data.sql
```

### Configuration Frontend

```bash
cd ../frontend
npm install
```

## Démarrage

### Backend
```bash
cd backend
python run.py
```
L'application démarre sur `http://localhost:5000`

### Frontend
```bash
cd frontend
npm run dev
```
Accédez à l'interface sur `http://localhost:3000`

## API Endpoints

**Alertes**
- GET /api/alerts
- POST /api/alerts
- PUT /api/alerts/:id/acknowledge

**Pompes**
- GET /api/pumps
- POST /api/pumps/:id/activate
- POST /api/pumps/:id/deactivate

**Capteurs**
- GET /api/sensors
- GET /api/sensors/:id/readings

## Base de Données

Tables principales : sensors, sensor_readings, pumps, alerts, pump_operations

Triggers : Création d'alertes, mise à jour capteurs, log des opérations

Procédures : Activation automatique des pompes, rapport de statut

## Configuration

Variables d'environnement (.env) :
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=urba_drain
SECRET_KEY=your-secret-key
DEBUG=True
```

## Fonctionnalités

- Connexion MySQL via PyMySQL
- Architecture modulaire (routes/services)
- Dashboard interactif
- Interface responsive
- Schéma relationnel avec triggers et procédures stockées

## Tests

```bash
cd backend && pytest
cd frontend && npm test
```

## Auteurs

Projet développé par les élèves ingénieurs de l'École Nationale Supérieure de Sciences des Données et d'Intelligence Artificielle pour la gestion du réseau pluvial urbain d'Agadir.

Version : 2.0
Date : Février 2026
