# Modèle Conceptuel de Données (MCD)

## Système de Gestion du Réseau Pluvial Urbain d'Agadir

### Version : 2.0
### Date : Mars 2026
### Architecture : MVC + ORM (SQLAlchemy)

---


## Dictionnaire de Données

### Entité : ZONE

**Description :** Représente une zone géographique du réseau de drainage urbain (quartier, secteur).

| Attribut | Type | Contraintes | Description |
|----------|------|-------------|-------------|
| `id_zone` | INT | PK, AUTO_INCREMENT | Identifiant unique de la zone |
| `nom_zone` | VARCHAR(100) | NOT NULL, UNIQUE | Nom de la zone (ex: "Quartier Talborjt") |
| `superficie` | DECIMAL(10,2) | > 0 | Superficie en km² |
| `population` | INT | >= 0 | Population estimée de la zone |
| `latitude` | DECIMAL(10,8) | | Coordonnée GPS latitude |
| `longitude` | DECIMAL(11,8) | | Coordonnée GPS longitude |
| `niveau_risque` | ENUM | FAIBLE, MOYEN, ELEVE, CRITIQUE | Niveau de risque inondation |
| `date_creation` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date de création |
| `date_modification` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Date de modification |

**Contraintes métier :**
- Chaque zone doit avoir au minimum 2 capteurs actifs pour assurer la redondance
- Le niveau de risque est calculé en fonction du nombre d'alertes critiques et de la fréquence d'activation des pompes

---

### Entité : CAPTEUR

**Description :** Dispositif IoT installé sur le réseau pour mesurer le niveau d'eau, le débit ou la pression.

| Attribut | Type | Contraintes | Description |
|----------|------|-------------|-------------|
| `id_capteur` | INT | PK, AUTO_INCREMENT | Identifiant unique du capteur |
| `reference` | VARCHAR(50) | NOT NULL, UNIQUE | Référence technique (ex: "CAP-TL-001") |
| `type_capteur` | ENUM | NIVEAU, DEBIT, PRESSION | Type de mesure effectuée |
| `localisation` | TEXT | NOT NULL | Adresse précise d'installation |
| `latitude` | DECIMAL(10,8) | | Coordonnée GPS latitude |
| `longitude` | DECIMAL(11,8) | | Coordonnée GPS longitude |
| `statut` | ENUM | ACTIF, INACTIF, MAINTENANCE, DEFAILLANT | État opérationnel |
| `seuil_alerte` | DECIMAL(5,2) | > 0 | Seuil déclenchant une alerte |
| `seuil_critique` | DECIMAL(5,2) | > seuil_alerte | Seuil critique |
| `derniere_lecture` | DECIMAL(5,2) | | Dernière valeur mesurée |
| `date_installation` | DATE | NOT NULL | Date d'installation |
| `derniere_maintenance` | TIMESTAMP | | Date de dernière maintenance |
| `date_creation` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date de création |
| `id_zone` | INT | FK → ZONE | Zone d'appartenance |

**Contraintes métier :**
- `seuil_critique` > `seuil_alerte`
- Un capteur ACTIF doit avoir des lectures récentes (< 24h)
- Génération d'alerte de maintenance si batterie < 20%

---

### Entité : LECTURE_CAPTEUR

**Description :** Enregistrement d'une mesure effectuée par un capteur à un instant donné.

| Attribut | Type | Contraintes | Description |
|----------|------|-------------|-------------|
| `id_lecture` | INT | PK, AUTO_INCREMENT | Identifiant unique de la lecture |
| `valeur` | DECIMAL(5,2) | NOT NULL, >= 0 | Valeur mesurée |
| `unite` | VARCHAR(10) | NOT NULL | Unité (cm, m³/h, bar) |
| `timestamp` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date et heure de mesure |
| `qualite_signal` | ENUM | EXCELLENT, BON, MOYEN, FAIBLE | Qualité du signal |
| `anomalie` | BOOLEAN | DEFAULT FALSE | Détection d'anomalie |
| `batterie_pct` | TINYINT | 0-100 | Niveau batterie capteur |
| `id_capteur` | INT | FK → CAPTEUR | Capteur ayant effectué la mesure |

**Contraintes métier :**
- Une lecture est effectuée toutes les 5 minutes pour les capteurs actifs
- Si variation > 50% par rapport à lecture précédente → anomalie = TRUE
- Index composite sur (id_capteur, timestamp) pour optimisation

---

### Entité : POMPE

**Description :** Pompe de drainage pour évacuer l'eau en cas de niveaux élevés.

| Attribut | Type | Contraintes | Description |
|----------|------|-------------|-------------|
| `id_pompe` | INT | PK, AUTO_INCREMENT | Identifiant unique de la pompe |
| `reference` | VARCHAR(50) | NOT NULL, UNIQUE | Référence technique |
| `nom` | VARCHAR(100) | NOT NULL | Nom de la pompe |
| `localisation` | TEXT | NOT NULL | Adresse d'installation |
| `latitude` | DECIMAL(10,8) | | Coordonnée GPS latitude |
| `longitude` | DECIMAL(11,8) | | Coordonnée GPS longitude |
| `capacite` | DECIMAL(8,2) | NOT NULL, > 0 | Capacité en m³/h |
| `statut` | ENUM | ACTIVE, INACTIVE, MAINTENANCE, PANNE | État opérationnel |
| `mode_activation` | ENUM | MANUEL, AUTOMATIQUE, PLANIFIE | Mode de fonctionnement |
| `heures_fonctionnement` | INT | >= 0 | Total heures de fonctionnement |
| `derniere_activation` | TIMESTAMP | | Date dernière activation |
| `date_installation` | DATE | NOT NULL | Date d'installation |
| `derniere_maintenance` | TIMESTAMP | | Date dernière maintenance |
| `date_creation` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date de création |
| `id_zone` | INT | FK → ZONE | Zone d'appartenance |

**Contraintes métier :**
- Une pompe ne peut fonctionner en continu plus de 8 heures
- Alerte de maintenance tous les 500 heures ou 6 mois
- Mode MANUEL prioritaire sur AUTOMATIQUE

---

### Entité : OPERATION_POMPE

**Description :** Historique de toutes les opérations effectuées sur les pompes.

| Attribut | Type | Contraintes | Description |
|----------|------|-------------|-------------|
| `id_operation` | INT | PK, AUTO_INCREMENT | Identifiant unique de l'opération |
| `type_operation` | ENUM | ACTIVATION, DESACTIVATION, MAINTENANCE | Type d'opération |
| `timestamp` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date et heure |
| `declencheur` | ENUM | MANUEL, AUTOMATIQUE, PLANIFIE, ALERTE | Origine de l'opération |
| `utilisateur` | VARCHAR(100) | | Utilisateur (si manuel) |
| `ancien_statut` | VARCHAR(20) | | Statut avant opération |
| `nouveau_statut` | VARCHAR(20) | | Statut après opération |
| `remarques` | TEXT | | Observations |
| `id_pompe` | INT | FK → POMPE | Pompe concernée |
| `id_alerte` | INT | FK → ALERTE, nullable | Alerte ayant déclenché |

**Contraintes métier :**
- Traçabilité complète : toute opération doit être enregistrée
- Index composite sur (id_pompe, timestamp)

---

### Entité : ALERTE

**Description :** Alerte générée automatiquement ou manuellement en cas de situation anormale.

| Attribut | Type | Contraintes | Description |
|----------|------|-------------|-------------|
| `id_alerte` | INT | PK, AUTO_INCREMENT | Identifiant unique |
| `type_alerte` | ENUM | NIVEAU_ELEVE, PANNE_CAPTEUR, PANNE_POMPE, MAINTENANCE | Type d'alerte |
| `niveau_severite` | ENUM | INFO, AVERTISSEMENT, CRITIQUE, URGENCE | Niveau de sévérité |
| `statut` | ENUM | ACTIVE, ACQUITTEE, RESOLUE, IGNOREE | État de l'alerte |
| `titre` | VARCHAR(200) | NOT NULL | Titre court |
| `message` | TEXT | NOT NULL | Description détaillée |
| `timestamp_creation` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date création |
| `timestamp_acquittement` | TIMESTAMP | | Date acquittement |
| `timestamp_resolution` | TIMESTAMP | | Date résolution |
| `utilisateur_acquittement` | VARCHAR(100) | | Utilisateur ayant acquitté |
| `actions_prises` | TEXT | | Actions entreprises |
| `id_capteur` | INT | FK → CAPTEUR, nullable | Capteur source |
| `id_pompe` | INT | FK → POMPE, nullable | Pompe concernée |
| `id_zone` | INT | FK → ZONE | Zone concernée |

**Contraintes métier :**
- Une alerte RESOLUE doit avoir timestamp_resolution NOT NULL
- Une alerte ACQUITTEE doit avoir utilisateur_acquittement NOT NULL
- Escalade : AVERTISSEMENT non acquittée 30min → CRITIQUE
- Index composite sur (statut, timestamp_creation)

---

### Entité : UTILISATEUR

**Description :** Compte utilisateur pour accéder au système de gestion.

| Attribut | Type | Contraintes | Description |
|----------|------|-------------|-------------|
| `id_utilisateur` | INT | PK, AUTO_INCREMENT | Identifiant unique |
| `nom_utilisateur` | VARCHAR(50) | NOT NULL, UNIQUE | Login |
| `email` | VARCHAR(100) | NOT NULL, UNIQUE | Adresse email |
| `mot_de_passe_hash` | VARCHAR(255) | NOT NULL | Mot de passe hashé (bcrypt) |
| `nom` | VARCHAR(100) | | Nom complet |
| `prenom` | VARCHAR(100) | | Prénom |
| `role` | ENUM | ADMIN, OPERATEUR, TECHNICIEN, VIEWER | Rôle |
| `telephone` | VARCHAR(20) | | Numéro de téléphone |
| `actif` | BOOLEAN | DEFAULT TRUE | Compte actif/inactif |
| `date_creation` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date création compte |
| `derniere_connexion` | TIMESTAMP | | Date dernière connexion |

**Droits par rôle :**
- **ADMIN** : Tous les droits (CRUD utilisateurs, configuration)
- **OPERATEUR** : Activation/désactivation pompes, acquittement alertes
- **TECHNICIEN** : Maintenance, consultation historique
- **VIEWER** : Consultation uniquement (dashboards, rapports)

---

## Relations et Cardinalités

### ZONE ↔ CAPTEUR (1:N)

- **Cardinalité** : Une zone contient 0 à N capteurs. Un capteur appartient à 1 et 1 seule zone.
- **Règle métier** : Chaque capteur doit être rattaché à une zone pour le suivi territorial.
- **Intégrité** : ON DELETE RESTRICT (impossible de supprimer une zone avec capteurs)

### CAPTEUR ↔ LECTURE_CAPTEUR (1:N)

- **Cardinalité** : Un capteur effectue 0 à N lectures. Une lecture provient d'1 seul capteur.
- **Règle métier** : Historisation de toutes les mesures pour analyse temporelle.
- **Intégrité** : ON DELETE CASCADE (suppression en cascade des lectures)

### ZONE ↔ POMPE (1:N)

- **Cardinalité** : Une zone contient 0 à N pompes. Une pompe appartient à 1 seule zone.
- **Règle métier** : Les pompes sont déployées dans des zones à risque.
- **Intégrité** : ON DELETE RESTRICT

### POMPE ↔ OPERATION_POMPE (1:N)

- **Cardinalité** : Une pompe subit 0 à N opérations. Une opération concerne 1 pompe.
- **Règle métier** : Traçabilité complète de l'historique d'activité.
- **Intégrité** : ON DELETE CASCADE

### CAPTEUR/POMPE ↔ ALERTE (N:1 optionnelle)

- **Cardinalité** : Un capteur/pompe génère 0 à N alertes. Une alerte provient de 0 ou 1 capteur/pompe.
- **Règle métier** : Alertes automatiques (seuil, panne) ou manuelles.
- **Intégrité** : ON DELETE SET NULL

### ZONE ↔ ALERTE (1:N)

- **Cardinalité** : Une zone génère 0 à N alertes. Une alerte concerne 1 zone.
- **Règle métier** : Géolocalisation obligatoire des alertes.
- **Intégrité** : ON DELETE RESTRICT

### ALERTE ↔ OPERATION_POMPE (1:N optionnelle)

- **Cardinalité** : Une alerte déclenche 0 à N opérations. Une opération peut être déclenchée par 0 ou 1 alerte.
- **Règle métier** : Activation automatique des pompes sur alerte critique.
- **Intégrité** : ON DELETE SET NULL

### UTILISATEUR ↔ ALERTE (N:N)

- **Cardinalité** : Un utilisateur gère 0 à N alertes. Une alerte peut être gérée par 0 à N utilisateurs.
- **Règle métier** : Plusieurs utilisateurs peuvent intervenir (acquittement, résolution).

---

## Contraintes d'Intégrité

### Contraintes de Domaine

```sql
-- ZONE
CHECK (superficie > 0)
CHECK (population >= 0)

-- CAPTEUR
CHECK (seuil_critique > seuil_alerte)

-- LECTURE_CAPTEUR
CHECK (valeur >= 0)
CHECK (batterie_pct BETWEEN 0 AND 100)

-- POMPE
CHECK (capacite > 0)
CHECK (heures_fonctionnement >= 0)
```

### Contraintes Référentielles

- Toutes les clés étrangères avec ON UPDATE CASCADE
- Politique de suppression adaptée (RESTRICT, CASCADE, SET NULL)
- Index sur toutes les clés étrangères

### Contraintes de Validation

- Capteur ACTIF → lectures récentes (< 24h)
- Alerte RESOLUE → timestamp_resolution NOT NULL
- Alerte ACQUITTEE → utilisateur_acquittement NOT NULL
- Pompe AUTOMATIQUE → activation possible par trigger
- Pompe MANUEL → intervention utilisateur obligatoire

---

## Règles de Gestion

### Gestion des Capteurs

**RG01** - Lecture périodique : Chaque capteur actif enregistre une lecture toutes les 5 minutes.

**RG02** - Détection anomalies : Variation > 50% → anomalie = TRUE.

**RG03** - Seuil d'alerte : valeur > seuil_alerte → alerte AVERTISSEMENT.

**RG04** - Seuil critique : valeur > seuil_critique → alerte CRITIQUE + activation pompes.

**RG05** - Batterie faible : batterie_pct < 20% → alerte maintenance.

**RG06** - Capteur défaillant : Absence lecture > 30min → statut DEFAILLANT.

### Gestion des Pompes

**RG07** - Activation automatique : 2+ capteurs zone > seuil critique → activation pompes zone.

**RG08** - Désactivation automatique : Tous capteurs zone < seuil alerte 15min → désactivation.

**RG09** - Limite fonctionnement : Max 8h continu, repos 30min minimum.

**RG10** - Maintenance préventive : Alerte tous les 500h ou 6 mois.

**RG11** - Mode manuel prioritaire : MANUEL → activation/désactivation par OPERATEUR/ADMIN uniquement.

**RG12** - Traçabilité : Toute opération → enregistrement OPERATION_POMPE.

### Gestion des Alertes

**RG13** - Création automatique : Triggers sur dépassement seuils ou pannes.

**RG14** - Escalade : AVERTISSEMENT non acquittée 30min → CRITIQUE.

**RG15** - Acquittement obligatoire : CRITIQUE/URGENCE → acquittement OPERATEUR/ADMIN.

**RG16** - Résolution : Conditions normales rétablies uniquement.

**RG17** - Notification : CRITIQUE → email ADMIN + OPERATEUR.

**RG18** - Historique : Pas de suppression, archivage après résolution.

### Gestion des Zones

**RG19** - Niveau de risque : Calcul basé sur alertes 30j, fréquence activation pompes, topographie.

**RG20** - Couverture minimale : Minimum 2 capteurs actifs par zone.

**RG21** - Capacité pompage : Capacité totale >= 1.5x débit maximal observé.

---

## Normalisation

### Forme Normale 1 (1FN)

✓ Tous les attributs contiennent des valeurs atomiques  
✓ Pas de groupes répétitifs  
✓ Chaque table possède une clé primaire

### Forme Normale 2 (2FN)

✓ Toutes les tables sont en 1FN  
✓ Tous les attributs non-clés dépendent entièrement de la clé primaire  
✓ Pas de dépendances partielles

### Forme Normale 3 (3FN)

✓ Toutes les tables sont en 2FN  
✓ Pas de dépendances transitives  
Note : Certaines dénormalisations contrôlées pour optimisation (ex: derniere_lecture dans CAPTEUR)

---

#

### Stratégie d'Archivage

- **LECTURE_CAPTEUR** : 90 jours en base chaude, archivage mensuel
- **OPERATION_POMPE** : 1 an en base chaude
- **ALERTE** : 2 ans puis archivage
- Partitionnement par mois pour LECTURE_CAPTEUR

---



---

**Document généré par :**  
École Nationale Supérieure de Sciences de Données et Intelligence Artificielle  
Mars 2026

