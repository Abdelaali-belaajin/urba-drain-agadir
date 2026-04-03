-- ============================================================
-- URBA-DRAIN AGADIR — Extension Système d'Alerte Citoyen
-- Fichier  : 02_create_citoyens.sql
-- ============================================================

USE urba_drain_agadir;

-- TABLE : CITOYEN
-- Rôle : Habitants abonnés aux alertes de leur zone
CREATE TABLE IF NOT EXISTS CITOYEN (
    citoyen_id      INT AUTO_INCREMENT PRIMARY KEY,
    nom             VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    zone_id         INT             NOT NULL,
    date_inscription DATETIME        DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_citoyen_zone FOREIGN KEY (zone_id)
        REFERENCES ZONE(zone_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- TABLE : CITOYEN_ALERT_LOG
-- Rôle : Journal d'envoi pour éviter le spam (anti-répétition)
CREATE TABLE IF NOT EXISTS CITOYEN_ALERT_LOG (
    log_id          INT AUTO_INCREMENT PRIMARY KEY,
    zone_id         INT             NOT NULL,
    date_envoi      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    incident_token  VARCHAR(100)    NOT NULL, -- Permet d'identifier un incident unique (ex: zone_id + date + risque)
    nombre_envoyes  INT             DEFAULT 0,
    CONSTRAINT fk_alert_log_zone FOREIGN KEY (zone_id)
        REFERENCES ZONE(zone_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_alert_token (incident_token)
) ENGINE=InnoDB;

-- Données de test (Optionnel mais recommandé pour la démo)
INSERT IGNORE INTO CITOYEN (nom, email, zone_id) VALUES 
('Youssef Amrani', 'youssef.test@agadir.ma', 1), -- Tilila
('Siham Bennis', 'siham.test@gmail.com', 1),    -- Tilila
('Karim Mansouri', 'karim.drain@outlook.fr', 2), -- Anza
('Fatima Zahra', 'fatima.citoyen@inwi.ma', 3);   -- Talborjt
