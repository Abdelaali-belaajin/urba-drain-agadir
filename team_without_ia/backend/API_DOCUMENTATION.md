# API Documentation - Système de Drainage Urbain Agadir

**Version** : 1.0  
**Base URL** : `http://localhost:5000`  
**Date** : 10 Mars 2026

---

## Table des Matières

1. [Configuration et Démarrage](#configuration-et-démarrage)
2. [Format des Réponses](#format-des-réponses)
3. [Endpoints Zones](#endpoints-zones)
4. [Endpoints Capteurs](#endpoints-capteurs)
5. [Endpoints Pompes](#endpoints-pompes)
6. [Codes d'Erreur](#codes-derreur)
7. [Exemples d'Utilisation](#exemples-dutilisation)

---

## Configuration et Démarrage

### Prérequis Backend

- Python 3.9+
- MySQL 8.0+
- Packages : Flask, PyMySQL, flask-cors, python-dotenv

### Installation

```bash
cd team_without_ia/backend
python -m pip install -r requirements.txt
```

### Configuration

Créez un fichier `.env` dans `team_without_ia/backend/` :

```env
# Configuration MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=drainage_surveillance

# Flask Configuration
SECRET_KEY=votre-secret-key-ici
DEBUG=True

# CORS Origins (séparés par virgule)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Lancer le Backend

```bash
python run.py
```

Le serveur démarre sur : **http://localhost:5000**

### Endpoint de Santé

**GET** `/health`

Vérifie que l'API fonctionne.

**Réponse** :
```json
{
  "status": "healthy",
  "message": "API Drainage Urbain Agadir - Service opérationnel"
}
```

---

## Format des Réponses

### Réponse Succès (GET)

```json
{
  "success": true,
  "data": { ... }
}
```

### Réponse Succès (Liste avec compteur)

```json
{
  "success": true,
  "count": 15,
  "data": [ ... ]
}
```

### Réponse Succès (POST/PUT/DELETE)

```json
{
  "success": true,
  "message": "Zone created successfully",
  "id_zone": 9
}
```

### Réponse Erreur

```json
{
  "error": "Zone introuvable"
}
```

---

## Endpoints Zones

### 1. Liste toutes les zones

**GET** `/api/zones`

Récupère la liste de toutes les zones de drainage.

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "id_zone": 1,
      "nom_zone": "Zone Nord - Quartier Industriel",
      "superficie": 145.50,
      "population": 12500,
      "latitude": 30.42701234,
      "longitude": -9.59812345,
      "niveau_risque": "ELEVE"
    },
    {
      "id_zone": 2,
      "nom_zone": "Zone Sud - Centre Ville",
      "superficie": 89.30,
      "population": 45000,
      "latitude": 30.41234567,
      "longitude": -9.60123456,
      "niveau_risque": "CRITIQUE"
    }
  ]
}
```

---

### 2. Détails d'une zone

**GET** `/api/zones/{id}`

Récupère les détails d'une zone spécifique avec statistiques (nombre de capteurs et pompes).

**Paramètres** :
- `id` (integer, requis) : ID de la zone

**Exemple** :
```
GET /api/zones/1
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "id_zone": 1,
    "nom_zone": "Zone Nord - Quartier Industriel",
    "superficie": 145.50,
    "population": 12500,
    "niveau_risque": "ELEVE",
    "nombre_capteurs": 3,
    "nombre_pompes": 2
  }
}
```

**Erreur (404)** :
```json
{
  "error": "Zone introuvable"
}
```

---

### 3. Créer une zone

**POST** `/api/zones`

Crée une nouvelle zone de drainage.

**Headers** :
```
Content-Type: application/json
```

**Body** :
```json
{
  "nom_zone": "Zone Test",
  "superficie": 150.5,
  "population": 8000,
  "latitude": 30.42500000,
  "longitude": -9.59500000,
  "niveau_risque": "MOYEN"
}
```

**Champs Requis** :
- `nom_zone` (string) : Nom de la zone
- `superficie` (float) : Superficie en km² (doit être > 0)
- `population` (integer) : Population dans la zone (>= 0)
- `niveau_risque` (enum) : Niveau de risque

**Valeurs valides pour `niveau_risque`** :
- `FAIBLE`
- `MOYEN`
- `ELEVE`
- `CRITIQUE`

**Champs Optionnels** :
- `latitude` (float) : Coordonnée GPS
- `longitude` (float) : Coordonnée GPS

**Réponse (201 Created)** :
```json
{
  "success": true,
  "message": "Zone created successfully",
  "id_zone": 9
}
```

**Erreur (400 Bad Request)** - Champ manquant :
```json
{
  "error": "Missing field: nom_zone"
}
```

**Erreur (400 Bad Request)** - Valeur invalide :
```json
{
  "error": "Invalid niveau_risque"
}
```

---

### 4. Modifier une zone

**PUT** `/api/zones/{id}`

Modifie une zone existante. Seuls les champs fournis seront mis à jour.

**Headers** :
```
Content-Type: application/json
```

**Body** (tous les champs sont optionnels) :
```json
{
  "nom_zone": "Nouveau Nom",
  "superficie": 200.0,
  "population": 10000,
  "niveau_risque": "CRITIQUE"
}
```

**Réponse (200 OK)** :
```json
{
  "success": true,
  "message": "Zone updated successfully"
}
```

**Erreur (404)** :
```json
{
  "error": "Zone introuvable"
}
```

---

### 5. Supprimer une zone

**DELETE** `/api/zones/{id}`

Supprime une zone de la base de données.

**⚠️ Contrainte** : Impossible de supprimer une zone qui contient des capteurs ou des pompes actifs.

**Exemple** :
```
DELETE /api/zones/9
```

**Réponse (200 OK)** :
```json
{
  "success": true,
  "message": "Zone deleted successfully"
}
```

**Erreur (400 Bad Request)** - Zone avec capteurs/pompes :
```json
{
  "error": "Cannot delete zone with active capteurs or pompes"
}
```

---

## Endpoints Capteurs

### 1. Liste tous les capteurs

**GET** `/api/capteurs`

Récupère la liste de tous les capteurs IoT avec possibilité de filtrage.

**Query Parameters** (optionnels) :
- `type` (string) : Type de capteur (NIVEAU, DEBIT, PRESSION)
- `statut` (string) : Statut du capteur (ACTIF, INACTIF, MAINTENANCE, DEFAILLANT)
- `critique` (boolean) : `true` pour obtenir uniquement les capteurs critiques

**Exemples** :
```
GET /api/capteurs
GET /api/capteurs?type=NIVEAU
GET /api/capteurs?statut=ACTIF
GET /api/capteurs?type=NIVEAU&statut=ACTIF
GET /api/capteurs?critique=true
```

**Réponse** :
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id_capteur": 1,
      "reference": "CAP-NIV-001",
      "type_capteur": "NIVEAU",
      "statut": "ACTIF",
      "localisation": "Collecteur principal Nord, rue Ibn Batouta",
      "derniere_lecture": 2.70,
      "seuil_critique": 4.00,
      "nom_zone": "Zone Nord - Quartier Industriel"
    },
    {
      "id_capteur": 11,
      "reference": "CAP-NIV-007",
      "type_capteur": "NIVEAU",
      "statut": "ACTIF",
      "localisation": "Galerie commerciale centre, sous-sol niveau -2",
      "derniere_lecture": 2.60,
      "seuil_critique": 2.50,
      "nom_zone": "Zone Centre - Commerce"
    }
  ]
}
```

---

### 2. Capteurs critiques

**GET** `/api/capteurs?critique=true`

Retourne uniquement les capteurs dont la dernière lecture dépasse le seuil critique.

**Réponse** :
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id_capteur": 11,
      "reference": "CAP-NIV-007",
      "type_capteur": "NIVEAU",
      "derniere_lecture": 2.60,
      "seuil_critique": 2.50,
      "nom_zone": "Zone Centre - Commerce"
    }
  ]
}
```

**⚠️ Important** : Ces capteurs déclenchent automatiquement des alertes via les triggers MySQL.

---

### 3. Détails d'un capteur

**GET** `/api/capteurs/{id}`

Récupère toutes les informations d'un capteur spécifique.

**Exemple** :
```
GET /api/capteurs/1
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "id_capteur": 1,
    "reference": "CAP-NIV-001",
    "type_capteur": "NIVEAU",
    "localisation": "Collecteur principal Nord, rue Ibn Batouta",
    "latitude": 30.42750000,
    "longitude": -9.59780000,
    "statut": "ACTIF",
    "seuil_alerte": 2.50,
    "seuil_critique": 4.00,
    "derniere_lecture": 2.70,
    "date_installation": "2023-01-15",
    "derniere_maintenance": "2024-12-01 07:00:00",
    "id_zone": 1,
    "nom_zone": "Zone Nord - Quartier Industriel"
  }
}
```

---

### 4. Créer un capteur

**POST** `/api/capteurs`

Crée un nouveau capteur IoT dans le système.

**Headers** :
```
Content-Type: application/json
```

**Body** :
```json
{
  "reference": "CAP-TEST-999",
  "type_capteur": "NIVEAU",
  "localisation": "Zone Test Postman",
  "id_zone": 1,
  "seuil_alerte": 2.0,
  "seuil_critique": 3.5,
  "date_installation": "2026-03-10"
}
```

**Champs Requis** :
- `reference` (string) : Référence unique du capteur
- `type_capteur` (enum) : Type de mesure
- `localisation` (string) : Description de l'emplacement
- `id_zone` (integer) : ID de la zone parente
- `seuil_alerte` (float) : Seuil d'avertissement
- `seuil_critique` (float) : Seuil critique (déclenche alerte automatique)
- `date_installation` (date) : Format YYYY-MM-DD

**Valeurs valides pour `type_capteur`** :
- `NIVEAU` : Mesure du niveau d'eau
- `DEBIT` : Mesure du débit
- `PRESSION` : Mesure de la pression

**Réponse (201 Created)** :
```json
{
  "success": true,
  "message": "Capteur created successfully",
  "id_capteur": 16
}
```

**Erreur (400)** - Type invalide :
```json
{
  "error": "Invalid type_capteur"
}
```

---

### 5. Modifier un capteur

**PUT** `/api/capteurs/{id}`

Modifie les paramètres d'un capteur existant.

**Headers** :
```
Content-Type: application/json
```

**Body** (tous les champs sont optionnels) :
```json
{
  "statut": "MAINTENANCE",
  "seuil_alerte": 2.5,
  "seuil_critique": 4.0,
  "localisation": "Nouvelle localisation"
}
```

**Valeurs valides pour `statut`** :
- `ACTIF` : Capteur opérationnel
- `INACTIF` : Capteur désactivé
- `MAINTENANCE` : En cours de maintenance
- `DEFAILLANT` : Capteur en panne

**Réponse (200 OK)** :
```json
{
  "success": true,
  "message": "Capteur updated successfully"
}
```

---

### 6. Désactiver un capteur

**DELETE** `/api/capteurs/{id}`

Désactive un capteur (soft delete). Le capteur n'est pas supprimé mais passe en statut INACTIF.

**Exemple** :
```
DELETE /api/capteurs/5
```

**Réponse (200 OK)** :
```json
{
  "success": true,
  "message": "Capteur deactivated successfully"
}
```

---

## Endpoints Pompes

### 1. Liste toutes les pompes

**GET** `/api/pompes`

Récupère la liste de toutes les pompes de drainage.

**Query Parameters** (optionnels) :
- `statut` (string) : Filtrer par statut (ACTIVE, INACTIVE, MAINTENANCE, PANNE)

**Exemples** :
```
GET /api/pompes
GET /api/pompes?statut=ACTIVE
GET /api/pompes?statut=INACTIVE
```

**Réponse** :
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "id_pompe": 1,
      "reference": "PMP-001",
      "nom": "Pompe Nord P1",
      "statut": "ACTIVE",
      "capacite": 350.00,
      "mode_activation": "AUTOMATIQUE",
      "derniere_activation": "2025-03-02 06:00:00",
      "nom_zone": "Zone Nord - Quartier Industriel"
    },
    {
      "id_pompe": 2,
      "reference": "PMP-002",
      "nom": "Pompe Nord P2",
      "statut": "INACTIVE",
      "capacite": 350.00,
      "mode_activation": "AUTOMATIQUE",
      "derniere_activation": "2025-02-20 14:00:00",
      "nom_zone": "Zone Nord - Quartier Industriel"
    }
  ]
}
```

---

### 2. Détails d'une pompe

**GET** `/api/pompes/{id}`

Récupère toutes les informations d'une pompe spécifique.

**Exemple** :
```
GET /api/pompes/1
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "id_pompe": 1,
    "reference": "PMP-001",
    "nom": "Pompe Nord P1",
    "localisation": "Station pompage Nord, Bd Industriel",
    "latitude": 30.42900000,
    "longitude": -9.59600000,
    "capacite": 350.00,
    "statut": "ACTIVE",
    "mode_activation": "AUTOMATIQUE",
    "heures_fonctionnement": 2450,
    "derniere_activation": "2025-03-02 06:00:00",
    "date_installation": "2022-05-10",
    "derniere_maintenance": "2025-01-15 07:00:00",
    "id_zone": 1,
    "nom_zone": "Zone Nord - Quartier Industriel"
  }
}
```

---

### 3. Activer une pompe

**POST** `/api/pompes/{id}/activer`

Active une pompe de drainage et enregistre l'opération dans l'historique.

**Headers** :
```
Content-Type: application/json
```

**Body** (optionnel) :
```json
{
  "utilisateur": "operateur1"
}
```

**Comportement** :
- Si `utilisateur` fourni → Déclencheur = **MANUEL**
- Si `utilisateur` absent → Déclencheur = **AUTOMATIQUE**

**Ce qui se passe** :
1. Statut de la pompe → `ACTIVE`
2. `derniere_activation` → Date/heure actuelle
3. Insertion dans la table `operation_pompe` avec type `ACTIVATION`

**Réponse (200 OK)** :
```json
{
  "success": true,
  "message": "Pompe activated successfully"
}
```

**Exemple avec utilisateur** :
```bash
POST /api/pompes/2/activer
Body: { "utilisateur": "operateur1" }
```

**Exemple automatique** :
```bash
POST /api/pompes/3/activer
Body: {}
```

---

### 4. Désactiver une pompe

**POST** `/api/pompes/{id}/desactiver`

Désactive une pompe de drainage.

**Headers** :
```
Content-Type: application/json
```

**Body** (optionnel) :
```json
{
  "utilisateur": "operateur1"
}
```

**Ce qui se passe** :
1. Statut de la pompe → `INACTIVE`
2. Insertion dans la table `operation_pompe` avec type `DESACTIVATION`

**Réponse (200 OK)** :
```json
{
  "success": true,
  "message": "Pompe deactivated successfully"
}
```

---

## Codes d'Erreur

### Codes HTTP

| Code | Signification | Exemple |
|------|---------------|---------|
| 200 | OK | Requête réussie |
| 201 | Created | Ressource créée avec succès |
| 400 | Bad Request | Données invalides ou champ manquant |
| 404 | Not Found | Ressource introuvable |
| 500 | Internal Server Error | Erreur serveur/base de données |

### Exemples d'Erreurs

**404 - Ressource non trouvée** :
```json
{
  "error": "Zone introuvable"
}
```

**400 - Champ manquant** :
```json
{
  "error": "Missing field: nom_zone"
}
```

**400 - Valeur invalide** :
```json
{
  "error": "Invalid niveau_risque"
}
```

**400 - Contrainte** :
```json
{
  "error": "Cannot delete zone with active capteurs or pompes"
}
```

**500 - Erreur base de données** :
```json
{
  "error": "Duplicate entry 'CAP-NIV-001' for key 'reference'"
}
```

---

## Exemples d'Utilisation

### JavaScript (fetch)

#### GET - Liste des zones
```javascript
fetch('http://localhost:5000/api/zones')
  .then(response => response.json())
  .then(data => {
    console.log(data.data); // Array de zones
  })
  .catch(error => console.error('Erreur:', error));
```

#### POST - Créer une zone
```javascript
fetch('http://localhost:5000/api/zones', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nom_zone: "Zone Test",
    superficie: 150.5,
    population: 8000,
    niveau_risque: "MOYEN"
  })
})
  .then(response => response.json())
  .then(data => {
    console.log('ID créé:', data.id_zone);
  })
  .catch(error => console.error('Erreur:', error));
```

#### PUT - Modifier un capteur
```javascript
fetch('http://localhost:5000/api/capteurs/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    statut: "MAINTENANCE"
  })
})
  .then(response => response.json())
  .then(data => {
    console.log(data.message);
  });
```

#### POST - Activer pompe
```javascript
fetch('http://localhost:5000/api/pompes/1/activer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    utilisateur: "operateur1"
  })
})
  .then(response => response.json())
  .then(data => {
    console.log(data.message);
  });
```

---

### React avec Axios

#### Installation
```bash
npm install axios
```

#### Configuration API (src/api/config.js)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
```

#### Services Zones (src/api/zones.js)
```javascript
import api from './config';

// GET toutes les zones
export const getZones = () => api.get('/zones');

// GET zone par ID
export const getZone = (id) => api.get(`/zones/${id}`);

// POST créer zone
export const createZone = (data) => api.post('/zones', data);

// PUT modifier zone
export const updateZone = (id, data) => api.put(`/zones/${id}`, data);

// DELETE supprimer zone
export const deleteZone = (id) => api.delete(`/zones/${id}`);
```

#### Services Capteurs (src/api/capteurs.js)
```javascript
import api from './config';

// GET tous les capteurs
export const getCapteurs = (params) => api.get('/capteurs', { params });

// GET capteurs par type
export const getCapteursByType = (type) => 
  api.get('/capteurs', { params: { type } });

// GET capteurs critiques
export const getCapteursCritiques = () => 
  api.get('/capteurs', { params: { critique: 'true' } });

// GET capteur par ID
export const getCapteur = (id) => api.get(`/capteurs/${id}`);

// POST créer capteur
export const createCapteur = (data) => api.post('/capteurs', data);

// PUT modifier capteur
export const updateCapteur = (id, data) => api.put(`/capteurs/${id}`, data);

// DELETE désactiver capteur
export const deleteCapteur = (id) => api.delete(`/capteurs/${id}`);
```

#### Services Pompes (src/api/pompes.js)
```javascript
import api from './config';

// GET toutes les pompes
export const getPompes = (statut) => 
  api.get('/pompes', { params: { statut } });

// GET pompe par ID
export const getPompe = (id) => api.get(`/pompes/${id}`);

// POST activer pompe
export const activerPompe = (id, utilisateur) => 
  api.post(`/pompes/${id}/activer`, { utilisateur });

// POST désactiver pompe
export const desactiverPompe = (id, utilisateur) => 
  api.post(`/pompes/${id}/desactiver`, { utilisateur });
```

#### Utilisation dans un Composant
```javascript
import React, { useEffect, useState } from 'react';
import { getZones, createZone } from './api/zones';

function ZonesList() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      const response = await getZones();
      setZones(response.data.data);
    } catch (error) {
      console.error('Erreur chargement zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateZone = async () => {
    try {
      await createZone({
        nom_zone: "Nouvelle Zone",
        superficie: 100,
        population: 5000,
        niveau_risque: "MOYEN"
      });
      loadZones(); // Recharger la liste
    } catch (error) {
      console.error('Erreur création zone:', error);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h2>Zones de Drainage</h2>
      <button onClick={handleCreateZone}>Créer Zone</button>
      <ul>
        {zones.map(zone => (
          <li key={zone.id_zone}>
            {zone.nom_zone} - Risque: {zone.niveau_risque}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ZonesList;
```

---

## Configuration CORS

Le backend est configuré pour accepter les requêtes depuis :
- `http://localhost:5173` (Vite - React)
- `http://localhost:3000` (Create React App)

Si vous utilisez un autre port, modifiez le fichier `.env` :
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:VOTRE_PORT
```

Puis redémarrez le serveur Flask.

---

## Base de Données

### Tables Utilisées

- **zone** : Zones géographiques de drainage
- **capteur** : Capteurs IoT (niveau, débit, pression)
- **lecture_capteur** : Historique des mesures
- **pompe** : Pompes de drainage
- **operation_pompe** : Historique des activations/désactivations
- **alerte** : Alertes système
- **utilisateur** : Comptes utilisateurs

### Triggers Automatiques

Le système utilise des triggers MySQL pour automatiser certaines opérations :

**critical_level_alert** : Crée automatiquement une alerte quand une lecture dépasse le seuil critique

**update_last_reading** : Met à jour automatiquement le champ `derniere_lecture` dans la table `capteur`

**log_pump_operations** : Enregistre automatiquement les changements de statut des pompes dans `operation_pompe`

---

## Récapitulatif des Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/health` | Vérifier santé API |
| **ZONES** |
| GET | `/api/zones` | Liste toutes les zones |
| GET | `/api/zones/{id}` | Détails d'une zone |
| POST | `/api/zones` | Créer une zone |
| PUT | `/api/zones/{id}` | Modifier une zone |
| DELETE | `/api/zones/{id}` | Supprimer une zone |
| **CAPTEURS** |
| GET | `/api/capteurs` | Liste capteurs (filtres: type, statut, critique) |
| GET | `/api/capteurs/{id}` | Détails d'un capteur |
| POST | `/api/capteurs` | Créer un capteur |
| PUT | `/api/capteurs/{id}` | Modifier un capteur |
| DELETE | `/api/capteurs/{id}` | Désactiver un capteur |
| **POMPES** |
| GET | `/api/pompes` | Liste pompes (filtre: statut) |
| GET | `/api/pompes/{id}` | Détails d'une pompe |
| POST | `/api/pompes/{id}/activer` | Activer une pompe |
| POST | `/api/pompes/{id}/desactiver` | Désactiver une pompe |

---

## Tests avec Postman

### Collection Postman

Créez une collection avec ces endpoints :

**GET Health Check**
```
GET http://localhost:5000/health
```

**GET Toutes les zones**
```
GET http://localhost:5000/api/zones
```

**POST Créer zone**
```
POST http://localhost:5000/api/zones
Body (JSON):
{
  "nom_zone": "Zone Test Postman",
  "superficie": 150.5,
  "population": 8000,
  "niveau_risque": "MOYEN"
}
```

**GET Capteurs critiques**
```
GET http://localhost:5000/api/capteurs?critique=true
```

**POST Activer pompe**
```
POST http://localhost:5000/api/pompes/1/activer
Body (JSON):
{
  "utilisateur": "operateur1"
}
```

---

## Support et Contact

Pour toute question technique concernant les APIs :

- **Documentation Backend** : `team_without_ia/backend/README.md`
- **Base de données** : `team_without_ia/docs/Data_Base/drainage_surveillance.sql`
- **Schéma MCD** : `team_without_ia/docs/MCD/`
- **Schéma MLD** : `team_without_ia/docs/MLD/`

---

**Dernière mise à jour** : 10 Mars 2026  
**Version** : 1.0
