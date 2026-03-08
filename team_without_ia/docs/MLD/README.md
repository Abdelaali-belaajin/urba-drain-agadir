# Modèle Logique de Données (MLD)

## Système de Gestion du Réseau Pluvial Urbain d'Agadir

### Version : 2.0
### Date : Mars 2026
### Architecture : MVC + ORM (SQLAlchemy)



## Introduction

Le Modèle Logique de Données (MLD) traduit le MCD en schéma relationnel MySQL exploitable. Il intègre :
- 7 tables principales
- Contraintes d'intégrité référentielle
- Index optimisés pour les requêtes temps réel
- 3 triggers automatiques
- 2 procédures stockées métier

---

## Schéma Relationnel

### Vue d'ensemble

```
zone(id_zone, nom_zone, superficie, population, latitude, longitude, 
     niveau_risque, date_creation, date_modification)

capteur(id_capteur, reference, type_capteur, localisation, latitude, longitude,
        statut, seuil_alerte, seuil_critique, derniere_lecture, 
        date_installation, derniere_maintenance, date_creation, #id_zone)
  FK: id_zone → zone(id_zone)

lecture_capteur(id_lecture, valeur, unite, timestamp, qualite_signal, 
                anomalie, batterie_pct, #id_capteur)
  FK: id_capteur → capteur(id_capteur)

pompe(id_pompe, reference, nom, localisation, latitude, longitude, capacite,
      statut, mode_activation, heures_fonctionnement, derniere_activation,
      date_installation, derniere_maintenance, date_creation, #id_zone)
  FK: id_zone → zone(id_zone)

operation_pompe(id_operation, type_operation, timestamp, declencheur, 
                utilisateur, ancien_statut, nouveau_statut, remarques,
                #id_pompe, #id_alerte)
  FK: id_pompe → pompe(id_pompe)
  FK: id_alerte → alerte(id_alerte)

alerte(id_alerte, type_alerte, niveau_severite, statut, titre, message,
       timestamp_creation, timestamp_acquittement, timestamp_resolution,
       utilisateur_acquittement, actions_prises, #id_capteur, #id_pompe, #id_zone)
  FK: id_capteur → capteur(id_capteur)
  FK: id_pompe → pompe(id_pompe)
  FK: id_zone → zone(id_zone)

utilisateur(id_utilisateur, nom_utilisateur, email, mot_de_passe_hash, nom, prenom,
            role, telephone, actif, date_creation, derniere_connexion)
```

---

## Détail des Tables

### Table : zone

**Description :** Zone géographique du réseau de drainage

```sql
CREATE TABLE zone (
    id_zone INT AUTO_INCREMENT PRIMARY KEY,
    nom_zone VARCHAR(100) NOT NULL UNIQUE,
    superficie DECIMAL(10,2) CHECK (superficie > 0),
    population INT CHECK (population >= 0),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    niveau_risque ENUM('FAIBLE', 'MOYEN', 'ELEVE', 'CRITIQUE') DEFAULT 'MOYEN',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_zone_nom (nom_zone),
    INDEX idx_zone_risque (niveau_risque)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Volumétrie :** ~50 zones  
**Politique de suppression :** ON DELETE RESTRICT (protection)

---

### Table : capteur

**Description :** Capteur IoT de mesure (niveau, débit, pression)

```sql
CREATE TABLE capteur (
    id_capteur INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(50) NOT NULL UNIQUE,
    type_capteur ENUM('NIVEAU', 'DEBIT', 'PRESSION') NOT NULL,
    localisation TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    statut ENUM('ACTIF', 'INACTIF', 'MAINTENANCE', 'DEFAILLANT') DEFAULT 'ACTIF',
    seuil_alerte DECIMAL(5,2) CHECK (seuil_alerte > 0),
    seuil_critique DECIMAL(5,2) CHECK (seuil_critique > seuil_alerte),
    derniere_lecture DECIMAL(5,2),
    date_installation DATE NOT NULL,
    derniere_maintenance TIMESTAMP,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_zone INT NOT NULL,
    
    FOREIGN KEY (id_zone) REFERENCES zone(id_zone)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    
    INDEX idx_capteur_statut (statut),
    INDEX idx_capteur_type (type_capteur),
    INDEX idx_capteur_zone (id_zone),
    INDEX idx_capteur_reference (reference),
    UNIQUE INDEX unq_reference (reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Volumétrie :** ~500 capteurs  
**Fréquence lectures :** 5 minutes  
**Archivage :** Lectures > 90 jours

**Contrainte métier :**
```sql
ALTER TABLE capteur 
ADD CONSTRAINT chk_seuils 
CHECK (seuil_critique > seuil_alerte);
```

---

### Table : lecture_capteur

**Description :** Enregistrement de mesure capteur

```sql
CREATE TABLE lecture_capteur (
    id_lecture BIGINT AUTO_INCREMENT PRIMARY KEY,
    valeur DECIMAL(5,2) NOT NULL CHECK (valeur >= 0),
    unite VARCHAR(10) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    qualite_signal ENUM('EXCELLENT', 'BON', 'MOYEN', 'FAIBLE') DEFAULT 'BON',
    anomalie BOOLEAN DEFAULT FALSE,
    batterie_pct TINYINT CHECK (batterie_pct BETWEEN 0 AND 100),
    id_capteur INT NOT NULL,
    
    FOREIGN KEY (id_capteur) REFERENCES capteur(id_capteur)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    INDEX idx_lecture_capteur (id_capteur, timestamp),
    INDEX idx_lecture_timestamp (timestamp),
    INDEX idx_lecture_anomalie (anomalie)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  PARTITION BY RANGE (YEAR(timestamp)) (
      PARTITION p2024 VALUES LESS THAN (2025),
      PARTITION p2025 VALUES LESS THAN (2026),
      PARTITION p2026 VALUES LESS THAN (2027),
      PARTITION p2027 VALUES LESS THAN (2028),
      PARTITION p_future VALUES LESS THAN MAXVALUE
  );
```

**Volumétrie :** ~52M lectures/an → 262M sur 5 ans  
**Partitionnement :** Par année pour optimisation  
**Index composite :** (id_capteur, timestamp) pour requêtes temporelles

---

### Table : pompe

**Description :** Pompe de drainage

```sql
CREATE TABLE pompe (
    id_pompe INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(50) NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL,
    localisation TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    capacite DECIMAL(8,2) NOT NULL CHECK (capacite > 0),
    statut ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'PANNE') DEFAULT 'INACTIVE',
    mode_activation ENUM('MANUEL', 'AUTOMATIQUE', 'PLANIFIE') DEFAULT 'MANUEL',
    heures_fonctionnement INT DEFAULT 0 CHECK (heures_fonctionnement >= 0),
    derniere_activation TIMESTAMP,
    date_installation DATE NOT NULL,
    derniere_maintenance TIMESTAMP,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_zone INT NOT NULL,
    
    FOREIGN KEY (id_zone) REFERENCES zone(id_zone)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    
    INDEX idx_pompe_statut (statut),
    INDEX idx_pompe_mode (mode_activation),
    INDEX idx_pompe_zone (id_zone),
    INDEX idx_pompe_reference (reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Volumétrie :** ~300 pompes  
**Maintenance :** Tous les 500h ou 6 mois

---

### Table : operation_pompe

**Description :** Historique des opérations pompe

```sql
CREATE TABLE operation_pompe (
    id_operation BIGINT AUTO_INCREMENT PRIMARY KEY,
    type_operation ENUM('ACTIVATION', 'DESACTIVATION', 'MAINTENANCE') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    declencheur ENUM('MANUEL', 'AUTOMATIQUE', 'PLANIFIE', 'ALERTE') NOT NULL,
    utilisateur VARCHAR(100),
    ancien_statut VARCHAR(20),
    nouveau_statut VARCHAR(20),
    remarques TEXT,
    id_pompe INT NOT NULL,
    id_alerte INT,
    
    FOREIGN KEY (id_pompe) REFERENCES pompe(id_pompe)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (id_alerte) REFERENCES alerte(id_alerte)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    
    INDEX idx_operation_pompe (id_pompe, timestamp),
    INDEX idx_operation_timestamp (timestamp),
    INDEX idx_operation_type (type_operation),
    INDEX idx_operation_declencheur (declencheur)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Volumétrie :** ~876K opérations/an  
**Archivage :** > 1 an

---

### Table : alerte

**Description :** Alerte système (niveaux, pannes, maintenance)

```sql
CREATE TABLE alerte (
    id_alerte INT AUTO_INCREMENT PRIMARY KEY,
    type_alerte ENUM('NIVEAU_ELEVE', 'PANNE_CAPTEUR', 'PANNE_POMPE', 'MAINTENANCE') NOT NULL,
    niveau_severite ENUM('INFO', 'AVERTISSEMENT', 'CRITIQUE', 'URGENCE') DEFAULT 'INFO',
    statut ENUM('ACTIVE', 'ACQUITTEE', 'RESOLUE', 'IGNOREE') DEFAULT 'ACTIVE',
    titre VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    timestamp_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timestamp_acquittement TIMESTAMP,
    timestamp_resolution TIMESTAMP,
    utilisateur_acquittement VARCHAR(100),
    actions_prises TEXT,
    id_capteur INT,
    id_pompe INT,
    id_zone INT NOT NULL,
    
    FOREIGN KEY (id_capteur) REFERENCES capteur(id_capteur)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (id_pompe) REFERENCES pompe(id_pompe)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (id_zone) REFERENCES zone(id_zone)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    
    INDEX idx_alerte_statut (statut, timestamp_creation),
    INDEX idx_alerte_severite (niveau_severite),
    INDEX idx_alerte_type (type_alerte),
    INDEX idx_alerte_capteur (id_capteur),
    INDEX idx_alerte_pompe (id_pompe),
    INDEX idx_alerte_zone (id_zone),
    INDEX idx_alerte_timestamp (timestamp_creation)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Volumétrie :** ~36K alertes/an  
**Archivage :** > 2 ans

**Contraintes métier :**
```sql
ALTER TABLE alerte
ADD CONSTRAINT chk_alerte_resolue
CHECK (
    (statut = 'RESOLUE' AND timestamp_resolution IS NOT NULL) OR
    (statut != 'RESOLUE')
);

ALTER TABLE alerte
ADD CONSTRAINT chk_alerte_acquittee
CHECK (
    (statut IN ('ACQUITTEE', 'RESOLUE') AND utilisateur_acquittement IS NOT NULL) OR
    (statut IN ('ACTIVE', 'IGNOREE'))
);
```

---

### Table : utilisateur

**Description :** Compte utilisateur pour accès système

```sql
CREATE TABLE utilisateur (
    id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
    nom_utilisateur VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    role ENUM('ADMIN', 'OPERATEUR', 'TECHNICIEN', 'VIEWER') DEFAULT 'VIEWER',
    telephone VARCHAR(20),
    actif BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion TIMESTAMP,
    
    INDEX idx_utilisateur_nom (nom_utilisateur),
    INDEX idx_utilisateur_email (email),
    INDEX idx_utilisateur_role (role),
    INDEX idx_utilisateur_actif (actif)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Volumétrie :** ~100 utilisateurs  
**Sécurité :** Mot de passe hashé bcrypt

**Droits par rôle :**
- **ADMIN** : CRUD complet
- **OPERATEUR** : Gestion pompes, acquittement alertes
- **TECHNICIEN** : Maintenance, consultation
- **VIEWER** : Lecture seule

---

## Clés Étrangères et Contraintes

### Politique ON DELETE

| Table | Clé Étrangère | ON DELETE | Justification |
|-------|---------------|-----------|---------------|
| capteur | id_zone → zone | RESTRICT | Protection zone avec capteurs |
| lecture_capteur | id_capteur → capteur | CASCADE | Suppression lectures si capteur supprimé |
| pompe | id_zone → zone | RESTRICT | Protection zone avec pompes |
| operation_pompe | id_pompe → pompe | CASCADE | Suppression historique si pompe supprimée |
| operation_pompe | id_alerte → alerte | SET NULL | Conservation opération si alerte archivée |
| alerte | id_capteur → capteur | SET NULL | Conservation alerte si capteur supprimé |
| alerte | id_pompe → pompe | SET NULL | Conservation alerte si pompe supprimée |
| alerte | id_zone → zone | RESTRICT | Protection zone avec alertes |

### Contraintes CHECK

```sql
-- ZONE
ALTER TABLE zone ADD CONSTRAINT chk_zone_superficie CHECK (superficie > 0);
ALTER TABLE zone ADD CONSTRAINT chk_zone_population CHECK (population >= 0);

-- CAPTEUR
ALTER TABLE capteur ADD CONSTRAINT chk_capteur_seuils 
    CHECK (seuil_critique > seuil_alerte);

-- LECTURE_CAPTEUR
ALTER TABLE lecture_capteur ADD CONSTRAINT chk_lecture_valeur 
    CHECK (valeur >= 0);
ALTER TABLE lecture_capteur ADD CONSTRAINT chk_lecture_batterie 
    CHECK (batterie_pct BETWEEN 0 AND 100);

-- POMPE
ALTER TABLE pompe ADD CONSTRAINT chk_pompe_capacite 
    CHECK (capacite > 0);
ALTER TABLE pompe ADD CONSTRAINT chk_pompe_heures 
    CHECK (heures_fonctionnement >= 0);
```

---

## Index et Performance

### Index Primaires (PK)

Créés automatiquement sur toutes les tables (id_zone, id_capteur, id_lecture, id_pompe, id_operation, id_alerte, id_utilisateur)

### Index Secondaires

**Table : zone**
- `idx_zone_nom` (nom_zone) - Recherche par nom
- `idx_zone_risque` (niveau_risque) - Filtrage par risque

**Table : capteur**
- `idx_capteur_statut` (statut) - Filtrage capteurs actifs
- `idx_capteur_type` (type_capteur) - Recherche par type
- `idx_capteur_zone` (id_zone) - Agrégation par zone
- `idx_capteur_reference` (reference) - Recherche exacte
- `unq_reference` UNIQUE (reference) - Unicité

**Table : lecture_capteur**
- `idx_lecture_capteur` **(id_capteur, timestamp)** - INDEX COMPOSITE principal
- `idx_lecture_timestamp` (timestamp) - Requêtes temporelles
- `idx_lecture_anomalie` (anomalie) - Détection anomalies

**Table : pompe**
- `idx_pompe_statut` (statut) - Filtrage pompes actives
- `idx_pompe_mode` (mode_activation) - Filtrage par mode
- `idx_pompe_zone` (id_zone) - Agrégation par zone

**Table : operation_pompe**
- `idx_operation_pompe` **(id_pompe, timestamp)** - INDEX COMPOSITE
- `idx_operation_timestamp` (timestamp) - Historique
- `idx_operation_type` (type_operation) - Statistiques

**Table : alerte**
- `idx_alerte_statut` **(statut, timestamp_creation)** - INDEX COMPOSITE
- `idx_alerte_severite` (niveau_severite) - Filtrage par sévérité
- `idx_alerte_type` (type_alerte) - Filtrage par type
- `idx_alerte_timestamp` (timestamp_creation) - Tri chronologique

### Stratégies d'Optimisation

**Partitionnement :** `lecture_capteur` partitionné par année (RANGE PARTITION)  
**Archivage :** Tables historiques pour lectures > 90 jours  
**Cache :** Query cache activé, dernière_lecture dénormalisée  
**Analyse :** EXPLAIN systématique sur requêtes critiques

---

## Triggers

### Trigger 1 : critical_level_alert

**Objectif :** Création automatique d'alerte CRITIQUE si lecture > seuil_critique

```sql
DELIMITER $$

CREATE TRIGGER critical_level_alert
AFTER INSERT ON lecture_capteur
FOR EACH ROW
BEGIN
    DECLARE v_seuil_critique DECIMAL(5,2);
    DECLARE v_id_zone INT;
    
    SELECT seuil_critique, id_zone INTO v_seuil_critique, v_id_zone
    FROM capteur WHERE id_capteur = NEW.id_capteur;
    
    IF NEW.valeur > v_seuil_critique THEN
        INSERT INTO alerte (
            type_alerte, niveau_severite, statut, titre, message, id_capteur, id_zone
        ) VALUES (
            'NIVEAU_ELEVE',
            'CRITIQUE',
            'ACTIVE',
            CONCAT('Niveau critique détecté - Capteur ', NEW.id_capteur),
            CONCAT('Valeur mesurée: ', NEW.valeur, ' > Seuil: ', v_seuil_critique),
            NEW.id_capteur,
            v_id_zone
        );
    END IF;
END$$

DELIMITER ;
```

---

### Trigger 2 : update_last_reading

**Objectif :** Mise à jour automatique de derniere_lecture dans capteur

```sql
DELIMITER $$

CREATE TRIGGER update_last_reading
AFTER INSERT ON lecture_capteur
FOR EACH ROW
BEGIN
    UPDATE capteur
    SET derniere_lecture = NEW.valeur
    WHERE id_capteur = NEW.id_capteur;
END$$

DELIMITER ;
```

---

### Trigger 3 : log_pump_operations

**Objectif :** Traçabilité automatique des changements de statut pompe

```sql
DELIMITER $$

CREATE TRIGGER log_pump_operations
AFTER UPDATE ON pompe
FOR EACH ROW
BEGIN
    IF NEW.statut != OLD.statut THEN
        INSERT INTO operation_pompe (
            type_operation, declencheur, ancien_statut, nouveau_statut, id_pompe
        ) VALUES (
            CASE 
                WHEN NEW.statut = 'ACTIVE' THEN 'ACTIVATION'
                WHEN NEW.statut = 'INACTIVE' THEN 'DESACTIVATION'
                ELSE 'MAINTENANCE'
            END,
            CASE
                WHEN NEW.mode_activation = 'AUTOMATIQUE' THEN 'AUTOMATIQUE'
                ELSE 'MANUEL'
            END,
            OLD.statut,
            NEW.statut,
            NEW.id_pompe
        );
        
        UPDATE pompe
        SET derniere_activation = NOW()
        WHERE id_pompe = NEW.id_pompe AND NEW.statut = 'ACTIVE';
    END IF;
END$$

DELIMITER ;
```

---

## Procédures Stockées

### Procédure 1 : auto_activate_pumps

**Objectif :** Activation automatique pompes si 2+ capteurs zone > seuil_critique

```sql
DELIMITER $$

CREATE PROCEDURE auto_activate_pumps(IN p_id_zone INT)
BEGIN
    DECLARE v_capteurs_critiques INT;
    
    -- Compter capteurs en niveau critique dans la zone
    SELECT COUNT(*) INTO v_capteurs_critiques
    FROM capteur c
    JOIN lecture_capteur lc ON c.id_capteur = lc.id_capteur
    WHERE c.id_zone = p_id_zone
      AND c.statut = 'ACTIF'
      AND lc.valeur > c.seuil_critique
      AND lc.timestamp > DATE_SUB(NOW(), INTERVAL 10 MINUTE);
    
    -- Si 2+ capteurs critiques → activer pompes mode AUTOMATIQUE
    IF v_capteurs_critiques >= 2 THEN
        UPDATE pompe
        SET statut = 'ACTIVE',
            derniere_activation = NOW()
        WHERE id_zone = p_id_zone
          AND mode_activation = 'AUTOMATIQUE'
          AND statut IN ('INACTIVE', 'ACTIVE');
        
        -- Créer alerte système
        INSERT INTO alerte (
            type_alerte, niveau_severite, statut, titre, message, id_zone
        ) VALUES (
            'NIVEAU_ELEVE',
            'URGENCE',
            'ACTIVE',
            CONCAT('Activation pompes automatique - Zone ', p_id_zone),
            CONCAT(v_capteurs_critiques, ' capteurs en niveau critique détectés'),
            p_id_zone
        );
    END IF;
END$$

DELIMITER ;
```

**Appel :** `CALL auto_activate_pumps(zone_id);`

---

### Procédure 2 : system_status_report

**Objectif :** Génération rapport statut système (dashboard)

```sql
DELIMITER $$

CREATE PROCEDURE system_status_report()
BEGIN
    -- Statistiques capteurs
    SELECT 
        COUNT(*) AS total_capteurs,
        SUM(CASE WHEN statut = 'ACTIF' THEN 1 ELSE 0 END) AS capteurs_actifs,
        SUM(CASE WHEN statut = 'DEFAILLANT' THEN 1 ELSE 0 END) AS capteurs_defaillants
    FROM capteur;
    
    -- Statistiques pompes
    SELECT 
        COUNT(*) AS total_pompes,
        SUM(CASE WHEN statut = 'ACTIVE' THEN 1 ELSE 0 END) AS pompes_actives,
        SUM(CASE WHEN statut = 'PANNE' THEN 1 ELSE 0 END) AS pompes_en_panne
    FROM pompe;
    
    -- Alertes actives par sévérité
    SELECT 
        niveau_severite,
        COUNT(*) AS nombre_alertes
    FROM alerte
    WHERE statut = 'ACTIVE'
    GROUP BY niveau_severite;
    
    -- Zones à risque
    SELECT 
        z.nom_zone,
        z.niveau_risque,
        COUNT(DISTINCT a.id_alerte) AS alertes_actives
    FROM zone z
    LEFT JOIN alerte a ON z.id_zone = a.id_zone AND a.statut = 'ACTIVE'
    WHERE z.niveau_risque IN ('ELEVE', 'CRITIQUE')
    GROUP BY z.id_zone, z.nom_zone, z.niveau_risque
    ORDER BY z.niveau_risque DESC, alertes_actives DESC;
END$$

DELIMITER ;
```

**Appel :** `CALL system_status_report();`

---

## Normalisation

**Forme Normale 1 (1FN) :** ✓ Valeurs atomiques, clé primaire sur chaque table  
**Forme Normale 2 (2FN) :** ✓ Pas de dépendances partielles  
**Forme Normale 3 (3FN) :** ✓ Pas de dépendances transitives

---


---

**Document généré par :**  
École Nationale Supérieure de Sciences de Données et Intelligence Artificielle  
Mars 2026
