# 🌧️ Urba Drain Agadir

Système de gestion intelligente du réseau pluvial urbain d'Agadir.

## 📋 Description

Application full-stack pour la surveillance et la gestion du réseau de drainage pluvial urbain. Le système permet de :
- Monitorer les niveaux d'eau via des capteurs en temps réel
- Gérer l'activation/désactivation des pompes de drainage
- Recevoir et traiter des alertes automatiques
- Visualiser l'état général du système sur un dashboard

## 🛠️ Stack Technique

### Backend
- **Flask** (Python) - Framework web
- **MySQL** - Base de données relationnelle
- **PyMySQL** - Connexion MySQL (SANS ORM)
- **Flask-CORS** - Gestion des CORS

### Frontend
- **React** - Interface utilisateur
- **Vite** - Build tool et dev server
- **React Router** - Navigation

## 📁 Structure du Projet

```
urba-drain-agadir/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Factory Flask
│   │   ├── config.py            # Configuration
│   │   ├── db.py                # Connexion MySQL (PyMySQL)
│   │   ├── routes/              # Routes API
│   │   │   ├── alerts.py
│   │   │   ├── pumps.py
│   │   │   └── sensors.py
│   │   └── services/            # Logique métier
│   │       ├── alert_service.py
│   │       ├── pump_service.py
│   │       └── sensor_service.py
│   │
│   ├── db/
│   │   ├── schema/              # Scripts CREATE TABLE
│   │   ├── triggers/            # 3 triggers MySQL
│   │   ├── procedures/          # 2 procédures stockées
│   │   └── seed/                # Données de test
│   │
│   ├── requirements.txt
│   └── run.py                   # Point d'entrée
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js        # Client API
│   │   ├── components/
│   │   │   ├── AlertList.jsx
│   │   │   ├── PumpList.jsx
│   │   │   └── SensorList.jsx
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│   ├── MCD/
│   ├── MLD/
│   ├── Rapport_IA/
│   └── Cahier_Recette_QA/
│
└── README.md
```

## 🚀 Installation

### 1. Prérequis

- Python 3.8+
- Node.js 16+
- MySQL 8.0+

### 2. Cloner le projet

```bash
git clone https://github.com/votre-username/urba-drain-agadir.git
cd urba-drain-agadir
```

### 3. Configuration Backend

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement (Windows)
venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Créer le fichier .env
copy .env.example .env
# Éditer .env avec vos paramètres MySQL
```

### 4. Configuration Base de Données

```bash
# Se connecter à MySQL
mysql -u root -p

# Exécuter les scripts dans l'ordre
mysql -u root -p < db/schema/01_create_tables.sql
mysql -u root -p < db/triggers/01_critical_level_alert.sql
mysql -u root -p < db/triggers/02_update_last_reading.sql
mysql -u root -p < db/triggers/03_log_pump_operations.sql
mysql -u root -p < db/procedures/01_auto_activate_pumps.sql
mysql -u root -p < db/procedures/02_system_status_report.sql
mysql -u root -p < db/seed/01_seed_data.sql
```

### 5. Configuration Frontend

```bash
cd ../frontend

# Installer les dépendances
npm install
```

## ▶️ Démarrage

### Backend (Terminal 1)

```bash
cd backend
venv\Scripts\activate  # Windows
python run.py
```

Le serveur démarre sur `http://localhost:5000`

### Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

L'interface est accessible sur `http://localhost:3000`

## 📡 API Endpoints

### Alertes

- `GET /api/alerts` - Liste toutes les alertes
- `GET /api/alerts/:id` - Détails d'une alerte
- `POST /api/alerts` - Créer une alerte
- `PUT /api/alerts/:id/acknowledge` - Acquitter une alerte

### Pompes

- `GET /api/pumps` - Liste toutes les pompes
- `GET /api/pumps/:id` - Détails d'une pompe
- `POST /api/pumps/:id/activate` - Activer une pompe
- `POST /api/pumps/:id/deactivate` - Désactiver une pompe

### Capteurs

- `GET /api/sensors` - Liste tous les capteurs
- `GET /api/sensors/:id` - Détails d'un capteur
- `GET /api/sensors/:id/readings` - Lectures d'un capteur

## 🗄️ Base de Données

### Tables Principales

- **sensors** - Capteurs de niveau d'eau/débit
- **sensor_readings** - Lectures des capteurs
- **pumps** - Pompes de drainage
- **alerts** - Alertes système
- **pump_operations** - Historique opérations pompes

### Triggers

1. **trg_check_critical_level** - Crée une alerte si niveau critique
2. **trg_update_sensor_last_reading** - MAJ dernière lecture capteur
3. **trg_log_pump_operation** - Enregistre les opérations pompes

### Procédures Stockées

1. **sp_auto_activate_pumps** - Active pompes selon niveau d'eau
2. **sp_system_status_report** - Rapport de statut système

## 🔧 Configuration

### Variables d'Environnement Backend (.env)

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=urba_drain
SECRET_KEY=your-secret-key
DEBUG=True
```


## 📊 Fonctionnalités

### Backend
- ✅ Connexion MySQL via PyMySQL (sans ORM)
- ✅ Requêtes SQL manuelles
- ✅ Architecture modulaire (routes/services)
- ✅ Gestion des erreurs
- ✅ CORS activé

### Frontend
- ✅ Dashboard interactif
- ✅ Visualisation des alertes
- ✅ Contrôle des pompes
- ✅ Monitoring des capteurs
- ✅ Interface responsive

### Base de Données
- ✅ Schéma relationnel complet
- ✅ 3 triggers automatiques
- ✅ 2 procédures stockées
- ✅ Données de test

## 🧪 Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```


## 👥 Auteurs

Projet développé pour la gestion du réseau pluvial urbain d'Agadir.
est cree par les eleves ingenieurs de l'ecole nationale superieur de siences de donnes et l'intelignece artificielle

---

**Version**: 1.0.0  
**Date**: Février 2026
