-- ============================================================
-- URBA-DRAIN AGADIR — Schéma de la Base de Données
-- Fichier  : 01_create_tables.sql
-- Équipe   : Augmenteds — ENSIASD Taroudant SIBD 2025-2026
-- Généré avec : Claude (Anthropic) — voir PROMPT_LOG.md P-003
-- ============================================================

-- Créer et sélectionner la base de données
CREATE DATABASE IF NOT EXISTS urba_drain_agadir
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE urba_drain_agadir;

-- ============================================================
-- TABLE 1 : ZONE
-- Rôle : Zones géographiques d'Agadir surveillées
-- ============================================================
CREATE TABLE ZONE (
    zone_id         INT AUTO_INCREMENT PRIMARY KEY,
    nom_zone        VARCHAR(100)    NOT NULL,
    quartier        VARCHAR(100)    NOT NULL,
    superficie_km2  DECIMAL(8,3)    NOT NULL,
    population      INT             DEFAULT 0,
    coord_lat       DECIMAL(10,7)   NOT NULL,
    coord_lng       DECIMAL(10,7)   NOT NULL,
    niveau_risque   ENUM('FAIBLE','MOYEN','ELEVE','CRITIQUE') DEFAULT 'FAIBLE',
    date_creation   DATE            NOT NULL,
    actif           BOOLEAN         DEFAULT TRUE
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 2 : POMPE
-- Rôle : Pompes virtuelles d'évacuation
-- Note : créée avant BOUCHE_EGOUT (relation FK)
-- ============================================================
CREATE TABLE POMPE (
    pompe_id        INT AUTO_INCREMENT PRIMARY KEY,
    zone_id         INT             NOT NULL,
    nom_pompe       VARCHAR(100)    NOT NULL,
    debit_max_Lmin  DECIMAL(10,2)   NOT NULL,
    statut          ENUM('INACTIVE','ACTIVE','PANNE','MAINTENANCE') DEFAULT 'INACTIVE',
    date_activation DATETIME        NULL,
    consommation_kw DECIMAL(8,2)    DEFAULT 0,
    coord_lat       DECIMAL(10,7)   NOT NULL,
    coord_lng       DECIMAL(10,7)   NOT NULL,
    automatique     BOOLEAN         DEFAULT TRUE,
    CONSTRAINT fk_pompe_zone FOREIGN KEY (zone_id)
        REFERENCES ZONE(zone_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 3 : BOUCHE_EGOUT
-- Rôle : Points d'évacuation pluviaux
-- ============================================================
CREATE TABLE BOUCHE_EGOUT (
    bouche_id           INT AUTO_INCREMENT PRIMARY KEY,
    zone_id             INT             NOT NULL,
    pompe_id            INT             NULL,
    adresse             VARCHAR(200)    NOT NULL,
    coord_lat           DECIMAL(10,7)   NOT NULL,
    coord_lng           DECIMAL(10,7)   NOT NULL,
    capacite_max_L      DECIMAL(10,2)   NOT NULL,
    taux_remplissage    DECIMAL(5,2)    DEFAULT 0.00,
    statut              ENUM('NORMAL','ALERTE','SATURE','BLOQUE') DEFAULT 'NORMAL',
    derniere_inspection DATE            NULL,
    CONSTRAINT fk_bouche_zone  FOREIGN KEY (zone_id)
        REFERENCES ZONE(zone_id)  ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_bouche_pompe FOREIGN KEY (pompe_id)
        REFERENCES POMPE(pompe_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 4 : CAPTEUR
-- Rôle : Capteurs physiques dans les bouches
-- ============================================================
CREATE TABLE CAPTEUR (
    capteur_id          INT AUTO_INCREMENT PRIMARY KEY,
    zone_id             INT             NOT NULL,
    bouche_id           INT             NOT NULL,
    type_capteur        ENUM('NIVEAU_EAU','DEBIT','PRESSION','TEMPERATURE') NOT NULL,
    modele              VARCHAR(100)    NULL,
    seuil_alerte        DECIMAL(10,2)   NOT NULL,
    seuil_critique      DECIMAL(10,2)   NOT NULL,
    statut              ENUM('ACTIF','INACTIF','PANNE','MAINTENANCE') DEFAULT 'ACTIF',
    derniere_mesure     DATETIME        NULL,
    date_installation   DATE            NOT NULL,
    CONSTRAINT fk_capteur_zone   FOREIGN KEY (zone_id)
        REFERENCES ZONE(zone_id)       ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_capteur_bouche FOREIGN KEY (bouche_id)
        REFERENCES BOUCHE_EGOUT(bouche_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 5 : MESURE
-- Rôle : Historique de toutes les mesures
-- ============================================================
CREATE TABLE MESURE (
    mesure_id       INT AUTO_INCREMENT PRIMARY KEY,
    capteur_id      INT             NOT NULL,
    valeur          DECIMAL(10,4)   NOT NULL,
    unite           VARCHAR(20)     NOT NULL,
    date_heure      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    qualite_signal  ENUM('BONNE','MOYENNE','MAUVAISE','HORS_LIGNE') DEFAULT 'BONNE',
    anomalie        BOOLEAN         DEFAULT FALSE,
    note            VARCHAR(200)    NULL,
    CONSTRAINT fk_mesure_capteur FOREIGN KEY (capteur_id)
        REFERENCES CAPTEUR(capteur_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_mesure_capteur_date (capteur_id, date_heure),
    INDEX idx_mesure_date (date_heure)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 6 : ALERTE
-- Rôle : Alertes générées automatiquement
-- ============================================================
CREATE TABLE ALERTE (
    alerte_id           INT AUTO_INCREMENT PRIMARY KEY,
    capteur_id          INT             NOT NULL,
    bouche_id           INT             NOT NULL,
    zone_id             INT             NOT NULL,
    niveau_alerte       ENUM('INFO','ELEVE','CRITIQUE','MOYEN','FAIBLE') NOT NULL,
    message             TEXT            NOT NULL,
    valeur_declenchante DECIMAL(10,2)   NOT NULL,
    date_heure          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    resolue             BOOLEAN         DEFAULT FALSE,
    date_resolution     DATETIME        NULL,
    CONSTRAINT fk_alerte_capteur FOREIGN KEY (capteur_id)
        REFERENCES CAPTEUR(capteur_id)     ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_alerte_bouche  FOREIGN KEY (bouche_id)
        REFERENCES BOUCHE_EGOUT(bouche_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_alerte_zone    FOREIGN KEY (zone_id)
        REFERENCES ZONE(zone_id)           ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_alerte_date    (date_heure),
    INDEX idx_alerte_resolue (resolue),
    INDEX idx_alerte_zone    (zone_id, resolue)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 7 : RESEAU_DRAINAGE
-- Rôle : Segments de tuyaux entre bouches
-- ============================================================
CREATE TABLE RESEAU_DRAINAGE (
    segment_id          INT AUTO_INCREMENT PRIMARY KEY,
    bouche_amont_id     INT             NOT NULL,
    bouche_aval_id      INT             NOT NULL,
    longueur_m          DECIMAL(8,2)    NOT NULL,
    diametre_cm         DECIMAL(6,2)    NOT NULL,
    debit_max_Lmin      DECIMAL(10,2)   NOT NULL,
    debit_actuel_Lmin   DECIMAL(10,2)   DEFAULT 0,
    goulot              BOOLEAN         DEFAULT FALSE,
    CONSTRAINT fk_segment_amont FOREIGN KEY (bouche_amont_id)
        REFERENCES BOUCHE_EGOUT(bouche_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_segment_aval  FOREIGN KEY (bouche_aval_id)
        REFERENCES BOUCHE_EGOUT(bouche_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_bouches_differentes CHECK (bouche_amont_id <> bouche_aval_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 8 : UTILISATEUR
-- Rôle : Comptes utilisateurs avec rôles RBAC
-- ============================================================
CREATE TABLE UTILISATEUR (
    user_id             INT AUTO_INCREMENT PRIMARY KEY,
    nom                 VARCHAR(100)    NOT NULL,
    email               VARCHAR(150)    NOT NULL UNIQUE,
    mot_de_passe_hash   VARCHAR(255)    NOT NULL,
    role                ENUM('ADMIN','OPERATEUR','TECHNICIEN','LECTEUR') DEFAULT 'LECTEUR',
    date_creation       DATETIME        DEFAULT CURRENT_TIMESTAMP,
    actif               BOOLEAN         DEFAULT TRUE,
    derniere_connexion  DATETIME        NULL,
    INDEX idx_user_email (email),
    INDEX idx_user_role  (role)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 9 : LOG_ACTIVITE
-- Rôle : Audit complet — INSERT ONLY (jamais UPDATE ni DELETE)
-- ============================================================
CREATE TABLE LOG_ACTIVITE (
    log_id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NULL,
    alerte_id       INT             NULL,
    action          VARCHAR(100)    NOT NULL,
    table_cible     VARCHAR(50)     NOT NULL,
    valeur_avant    TEXT            NULL,
    valeur_apres    TEXT            NULL,
    date_heure      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    ip_adresse      VARCHAR(45)     NULL,
    CONSTRAINT fk_log_user   FOREIGN KEY (user_id)
        REFERENCES UTILISATEUR(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_log_alerte FOREIGN KEY (alerte_id)
        REFERENCES ALERTE(alerte_id)    ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_log_date    (date_heure),
    INDEX idx_log_user    (user_id),
    INDEX idx_log_action  (action)
) ENGINE=InnoDB;

-- ============================================================
-- Vérification : afficher les tables créées
-- ============================================================
SHOW TABLES;
