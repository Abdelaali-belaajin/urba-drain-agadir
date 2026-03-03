# 🚀 Guide de Démarrage Rapide - Urba Drain Agadir

## 📋 Commandes d'Installation

### 1️⃣ Configuration Backend

```powershell
# Aller dans le dossier backend
cd backend

# Créer l'environnement virtuel Python
python -m venv venv

# Activer l'environnement virtuel (Windows)
.\venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Créer le fichier .env à partir de l'exemple
copy .env.example .env

# ⚠️ IMPORTANT : Éditer le fichier .env avec vos paramètres MySQL
# notepad .env
```

### 2️⃣ Configuration Base de Données MySQL

```powershell
# Se connecter à MySQL en ligne de commande
mysql -u root -p

# Ou utiliser MySQL Workbench pour exécuter les scripts SQL suivants :
```

```sql
-- 1. Créer les tables


-- 2. Créer les triggers


-- 3. Créer les procédures


-- 4. Insérer les données de test

```

### 3️⃣ Configuration Frontend

```powershell
# Revenir à la racine puis aller dans frontend
cd ..\frontend

# Installer les dépendances Node.js
npm install
```

## ▶️ Démarrage de l'Application

### Terminal 1 : Backend Flask

```powershell
cd backend
.\venv\Scripts\activate
python run.py
```

✅ Backend démarré sur : http://localhost:5000

### Terminal 2 : Frontend React

```powershell
cd frontend
npm run dev
```

✅ Frontend démarré sur : http://localhost:3000

## 🧪 Vérification

### Tester le Backend
```powershell
# Tester l'API directement
curl http://localhost:5000/api/alerts
curl http://localhost:5000/api/pumps
curl http://localhost:5000/api/sensors
```

### Ouvrir l'Application
Ouvrir le navigateur : http://localhost:3000

## 📊 Structure des URLs

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000/api
  - Alertes : http://localhost:5000/api/alerts
  - Pompes : http://localhost:5000/api/pumps
  - Capteurs : http://localhost:5000/api/sensors

## 🛠️ Commandes Utiles

### Backend
```powershell
# Activer l'environnement virtuel
.\venv\Scripts\activate

# Désactiver l'environnement virtuel
deactivate

# Installer une nouvelle dépendance
pip install nom-package
pip freeze > requirements.txt

# Lancer les tests
pytest
```

### Frontend
```powershell
# Mode développement
npm run dev

# Build production
npm run build

# Prévisualiser le build
npm run preview
```

### Base de Données
```sql
-- Vérifier les données
USE urba_drain;
SELECT * FROM sensors;
SELECT * FROM pumps;
SELECT * FROM alerts;

-- Appeler une procédure stockée
CALL sp_system_status_report();
CALL sp_auto_activate_pumps('Centre-Ville', 2.0);

-- Vérifier les triggers
SHOW TRIGGERS;
```

## 🐛 Résolution de Problèmes

### Erreur de connexion MySQL
- Vérifier que MySQL est démarré
- Vérifier les paramètres dans `.env`
- Vérifier que la base `urba_drain` existe

### Port déjà utilisé
```powershell
# Backend - changer le port dans run.py
app.run(port=5001)

# Frontend - changer le port dans vite.config.js
server: { port: 3001 }
```

### Dépendances manquantes
```powershell
# Backend
pip install -r requirements.txt

# Frontend
rm -rf node_modules
npm install
```

## 📦 Variables d'Environnement

### Backend `.env`
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=urba_drain
SECRET_KEY=votre-clé-secrète
DEBUG=True
```

## 🎯 Prochaines Étapes

1. ✅ Configuration complète
2. ✅ Base de données créée
3. ✅ Backend et Frontend lancés
4. 🔄 Tester les fonctionnalités
5. 🔄 Personnaliser selon vos besoins
6. 🔄 Ajouter authentification (production)
7. 🔄 Déployer en production

---

**Bon développement ! 🚀**
