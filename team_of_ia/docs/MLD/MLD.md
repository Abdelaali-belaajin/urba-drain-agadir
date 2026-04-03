# MLD — Modèle Logique de Données
## Urba-Drain Agadir · ENSIASD Taroudant · SIBD 2025-2026

> **Base** : `01_create_tables.sql` (schéma exact)
> **Notation** : **PK** clé primaire · *FK* clé étrangère · `UK` unicité · `NN` NOT NULL

---

## Schémas relationnels

### ZONE
```
ZONE (
    zone_id         INT             PK  AUTO_INCREMENT,
    nom_zone        VARCHAR(100)    NN,
    quartier        VARCHAR(100)    NN,
    superficie_km2  DECIMAL(8,3)    NN,
    population      INT             DEFAULT 0,
    coord_lat       DECIMAL(10,7)   NN,
    coord_lng       DECIMAL(10,7)   NN,
    niveau_risque   ENUM('FAIBLE','MOYEN','ELEVE','CRITIQUE')  DEFAULT 'FAIBLE',
    date_creation   DATE            NN,
    actif           BOOLEAN         DEFAULT TRUE
)
ENGINE = InnoDB · CHARSET = utf8mb4
```
*Seed : 22 zones — Hay Mohammadi, Talborjt, Bensergao, Anza, Al Massira, Tilila, Adrar, Tikiouine, Bensergao Sud, Al Houda, Founty, Quartier Suisse, Dakhla, Les Amicales, Charaf, Riad Salam, Illigh, Taddart, Sonaba, El Khiam, Quartier Industriel, Najah*

---

### POMPE
```
POMPE (
    pompe_id        INT             PK  AUTO_INCREMENT,
    zone_id         INT             NN  FK → ZONE(zone_id)  ON DELETE RESTRICT  ON UPDATE CASCADE,
    nom_pompe       VARCHAR(100)    NN,
    debit_max_Lmin  DECIMAL(10,2)   NN,
    statut          ENUM('INACTIVE','ACTIVE','PANNE','MAINTENANCE')  DEFAULT 'INACTIVE',
    date_activation DATETIME,
    consommation_kw DECIMAL(8,2)    DEFAULT 0,
    coord_lat       DECIMAL(10,7)   NN,
    coord_lng       DECIMAL(10,7)   NN,
    automatique     BOOLEAN         DEFAULT TRUE
)
ENGINE = InnoDB
```
*Seed : 13 pompes · Zones 1,1,2,3,4,4,5,6,6,7,8,10,11*
*Remarque : pompe_id=6 (P-Anza-02) a `automatique = FALSE`*

---

### BOUCHE_EGOUT
```
BOUCHE_EGOUT (
    bouche_id           INT             PK  AUTO_INCREMENT,
    zone_id             INT             NN  FK → ZONE(zone_id)   ON DELETE RESTRICT  ON UPDATE CASCADE,
    pompe_id            INT                 FK → POMPE(pompe_id)  ON DELETE SET NULL  ON UPDATE CASCADE,
    adresse             VARCHAR(200)    NN,
    coord_lat           DECIMAL(10,7)   NN,
    coord_lng           DECIMAL(10,7)   NN,
    capacite_max_L      DECIMAL(10,2)   NN,
    taux_remplissage    DECIMAL(5,2)    DEFAULT 0.00,
    statut              ENUM('NORMAL','ALERTE','SATURE','BLOQUE')  DEFAULT 'NORMAL',
    derniere_inspection DATE
)
ENGINE = InnoDB
```
*Seed : 16 bouches avec adresses réelles d'Agadir*
*Remarque : bouche_id=16 (Quartier Suisse) a `pompe_id = NULL`*

---

### CAPTEUR
```
CAPTEUR (
    capteur_id          INT             PK  AUTO_INCREMENT,
    zone_id             INT             NN  FK → ZONE(zone_id)          ON DELETE RESTRICT  ON UPDATE CASCADE,
    bouche_id           INT             NN  FK → BOUCHE_EGOUT(bouche_id) ON DELETE RESTRICT  ON UPDATE CASCADE,
    type_capteur        ENUM('NIVEAU_EAU','DEBIT','PRESSION','TEMPERATURE')  NN,
    modele              VARCHAR(100),
    seuil_alerte        DECIMAL(10,2)   NN,
    seuil_critique      DECIMAL(10,2)   NN,
    statut              ENUM('ACTIF','INACTIF','PANNE','MAINTENANCE')  DEFAULT 'ACTIF',
    derniere_mesure     DATETIME,
    date_installation   DATE            NN
)
ENGINE = InnoDB
```
*Seed : 18 capteurs · Modèles : HySense-NW100/200/300, FlowMeter-F3/F5, InduSense-NW5, InduFlow-F10, InduPress-P8*

---

### MESURE
```
MESURE (
    mesure_id       INT             PK  AUTO_INCREMENT,
    capteur_id      INT             NN  FK → CAPTEUR(capteur_id)  ON DELETE RESTRICT  ON UPDATE CASCADE,
    valeur          DECIMAL(10,4)   NN,
    unite           VARCHAR(20)     NN,
    date_heure      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    qualite_signal  ENUM('BONNE','MOYENNE','MAUVAISE','HORS_LIGNE')  DEFAULT 'BONNE',
    anomalie        BOOLEAN         DEFAULT FALSE,
    note            VARCHAR(200),

    INDEX idx_mesure_capteur_date (capteur_id, date_heure),
    INDEX idx_mesure_date         (date_heure)
)
ENGINE = InnoDB
```
*Seed : 18 mesures initiales normales · Unités : cm, L/min, bar*
*L'INSERT déclenche automatiquement `trg_creation_alerte`*

---

### ALERTE
```
ALERTE (
    alerte_id           INT             PK  AUTO_INCREMENT,
    capteur_id          INT             NN  FK → CAPTEUR(capteur_id)      ON DELETE RESTRICT  ON UPDATE CASCADE,
    bouche_id           INT             NN  FK → BOUCHE_EGOUT(bouche_id)   ON DELETE RESTRICT  ON UPDATE CASCADE,
    zone_id             INT             NN  FK → ZONE(zone_id)             ON DELETE RESTRICT  ON UPDATE CASCADE,
    niveau_alerte       ENUM('INFO','WARNING','CRITICAL','EMERGENCY')  NN,
    message             TEXT            NN,
    valeur_declenchante DECIMAL(10,2)   NN,
    date_heure          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    resolue             BOOLEAN         DEFAULT FALSE,
    date_resolution     DATETIME,

    INDEX idx_alerte_date    (date_heure),
    INDEX idx_alerte_resolue (resolue),
    INDEX idx_alerte_zone    (zone_id, resolue)
)
ENGINE = InnoDB
```
*Créée exclusivement par `trg_creation_alerte` (AFTER INSERT MESURE)*

---

### RESEAU_DRAINAGE
```
RESEAU_DRAINAGE (
    segment_id          INT             PK  AUTO_INCREMENT,
    bouche_amont_id     INT             NN  FK → BOUCHE_EGOUT(bouche_id)  ON DELETE RESTRICT  ON UPDATE CASCADE,
    bouche_aval_id      INT             NN  FK → BOUCHE_EGOUT(bouche_id)  ON DELETE RESTRICT  ON UPDATE CASCADE,
    longueur_m          DECIMAL(8,2)    NN,
    diametre_cm         DECIMAL(6,2)    NN,
    debit_max_Lmin      DECIMAL(10,2)   NN,
    debit_actuel_Lmin   DECIMAL(10,2)   DEFAULT 0,
    goulot              BOOLEAN         DEFAULT FALSE,

    CONSTRAINT chk_bouches_differentes CHECK (bouche_amont_id <> bouche_aval_id)
)
ENGINE = InnoDB
```
*Seed : 10 segments · Longueurs 45–420 m · Diamètres 35–60 cm*
*`goulot` recalculé par `sp_simuler_cheminement_eau` si débit > 85 % du max*

---

### UTILISATEUR
```
UTILISATEUR (
    user_id             INT             PK  AUTO_INCREMENT,
    nom                 VARCHAR(100)    NN,
    email               VARCHAR(150)    NN  UK,
    mot_de_passe_hash   VARCHAR(255)    NN,
    role                ENUM('ADMIN','OPERATEUR','TECHNICIEN','LECTEUR')  DEFAULT 'LECTEUR',
    date_creation       DATETIME        DEFAULT CURRENT_TIMESTAMP,
    actif               BOOLEAN         DEFAULT TRUE,
    derniere_connexion  DATETIME,

    INDEX idx_user_email (email),
    INDEX idx_user_role  (role)
)
ENGINE = InnoDB
```
*Seed : 4 utilisateurs — admin, operateur, technicien, lecteur · Hash bcrypt ($2b$12$…)*

---

### LOG_ACTIVITE *(INSERT ONLY)*
```
LOG_ACTIVITE (
    log_id          INT             PK  AUTO_INCREMENT,
    user_id         INT                 FK → UTILISATEUR(user_id)  ON DELETE SET NULL  ON UPDATE CASCADE,
    alerte_id       INT                 FK → ALERTE(alerte_id)     ON DELETE SET NULL  ON UPDATE CASCADE,
    action          VARCHAR(100)    NN,
    table_cible     VARCHAR(50)     NN,
    valeur_avant    TEXT,
    valeur_apres    TEXT,
    date_heure      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    ip_adresse      VARCHAR(45),

    INDEX idx_log_date   (date_heure),
    INDEX idx_log_user   (user_id),
    INDEX idx_log_action (action)
)
ENGINE = InnoDB
```
*Alimentée par `trg_activation_pompe` (action=`POMPE_ACTIVEE_AUTO`) et `trg_log_pompe` (action=`POMPE_<STATUT>`)*

---

## Matrice des clés étrangères

| Contrainte | Table | Colonne | Réf. Table | Réf. Colonne | ON DELETE | ON UPDATE |
|------------|-------|---------|------------|--------------|-----------|-----------|
| fk_pompe_zone | POMPE | zone_id | ZONE | zone_id | RESTRICT | CASCADE |
| fk_bouche_zone | BOUCHE_EGOUT | zone_id | ZONE | zone_id | RESTRICT | CASCADE |
| fk_bouche_pompe | BOUCHE_EGOUT | pompe_id | POMPE | pompe_id | **SET NULL** | CASCADE |
| fk_capteur_zone | CAPTEUR | zone_id | ZONE | zone_id | RESTRICT | CASCADE |
| fk_capteur_bouche | CAPTEUR | bouche_id | BOUCHE_EGOUT | bouche_id | RESTRICT | CASCADE |
| fk_mesure_capteur | MESURE | capteur_id | CAPTEUR | capteur_id | RESTRICT | CASCADE |
| fk_alerte_capteur | ALERTE | capteur_id | CAPTEUR | capteur_id | RESTRICT | CASCADE |
| fk_alerte_bouche | ALERTE | bouche_id | BOUCHE_EGOUT | bouche_id | RESTRICT | CASCADE |
| fk_alerte_zone | ALERTE | zone_id | ZONE | zone_id | RESTRICT | CASCADE |
| fk_segment_amont | RESEAU_DRAINAGE | bouche_amont_id | BOUCHE_EGOUT | bouche_id | RESTRICT | CASCADE |
| fk_segment_aval | RESEAU_DRAINAGE | bouche_aval_id | BOUCHE_EGOUT | bouche_id | RESTRICT | CASCADE |
| fk_log_user | LOG_ACTIVITE | user_id | UTILISATEUR | user_id | **SET NULL** | CASCADE |
| fk_log_alerte | LOG_ACTIVITE | alerte_id | ALERTE | alerte_id | **SET NULL** | CASCADE |

---

## Ordre de création (respectant les dépendances FK)

```
1. ZONE              ← aucune dépendance
2. POMPE             ← ZONE
3. BOUCHE_EGOUT      ← ZONE, POMPE
4. CAPTEUR           ← ZONE, BOUCHE_EGOUT
5. MESURE            ← CAPTEUR
6. ALERTE            ← CAPTEUR, BOUCHE_EGOUT, ZONE
7. RESEAU_DRAINAGE   ← BOUCHE_EGOUT (×2 — amont & aval)
8. UTILISATEUR       ← aucune dépendance
9. LOG_ACTIVITE      ← UTILISATEUR, ALERTE
```

---

## Index et justification

| Table | Nom index | Colonnes | Rôle |
|-------|-----------|----------|------|
| MESURE | idx_mesure_capteur_date | (capteur_id, date_heure) | Historique temporel par capteur |
| MESURE | idx_mesure_date | (date_heure) | Historique global |
| ALERTE | idx_alerte_date | (date_heure) | Tri chronologique |
| ALERTE | idx_alerte_resolue | (resolue) | Filtre actives / résolues |
| ALERTE | idx_alerte_zone | (zone_id, resolue) | KPI alertes par zone |
| UTILISATEUR | idx_user_email | (email) | Authentification JWT |
| UTILISATEUR | idx_user_role | (role) | RBAC |
| LOG_ACTIVITE | idx_log_date | (date_heure) | Audit chronologique |
| LOG_ACTIVITE | idx_log_user | (user_id) | Traçabilité par utilisateur |
| LOG_ACTIVITE | idx_log_action | (action) | Filtrage par type d'action |

---

## Triggers (code source)

### `trg_creation_alerte` — AFTER INSERT ON MESURE
```sql
-- 02_trg_creation_alerte.sql
-- Si valeur >= seuil_critique → ALERTE 'CRITICAL' + bouche SATURE
-- Si valeur >= seuil_alerte  → ALERTE 'WARNING'  + bouche ALERTE (si NORMAL)
-- Dans les deux cas : UPDATE CAPTEUR SET derniere_mesure = NEW.date_heure
```

### `trg_activation_pompe` — AFTER UPDATE ON BOUCHE_EGOUT
```sql
-- 01_trg_activation_pompe.sql
-- Si NEW.taux_remplissage > 85% AND pompe_id IS NOT NULL
--   → UPDATE POMPE SET statut='ACTIVE' WHERE statut='INACTIVE' AND automatique=TRUE
--   → INSERT LOG_ACTIVITE (action='POMPE_ACTIVEE_AUTO')
-- Si NEW.taux_remplissage < 30% AND OLD >= 30%
--   → UPDATE POMPE SET statut='INACTIVE' WHERE statut='ACTIVE' AND automatique=TRUE
```

### `trg_log_pompe` — AFTER UPDATE ON POMPE
```sql
-- 03_trg_log_pompe.sql
-- Si NEW.statut <> OLD.statut
--   → INSERT LOG_ACTIVITE (action=CONCAT('POMPE_', NEW.statut), table_cible='POMPE')
```

---

## Procédure stockée

### `sp_simuler_cheminement_eau(IN p_zone_id INT)`
```sql
-- 01_sp_simuler_cheminement.sql
-- Curseur sur RESEAU_DRAINAGE de la zone
-- Pour chaque segment :
--   debit_calcule = (taux_remplissage_amont / 100) * debit_max
--   UPDATE RESEAU_DRAINAGE SET debit_actuel_Lmin = debit_calcule
--   Si debit_calcule > 85% * debit_max → goulot = TRUE
-- Résultat : segments_analyses, goulots_detectes, etat_reseau (RESEAU_OK|ATTENTION|CRITIQUE)
```

---

## Données de référence (seed)

| Table | Nb lignes | Détail |
|-------|-----------|--------|
| ZONE | 22 | Vrais quartiers d'Agadir |
| POMPE | 13 | Zones 1,1,2,3,4,4,5,6,6,7,8,10,11 |
| BOUCHE_EGOUT | 16 | Adresses réelles — capac. 2500–8000 L |
| CAPTEUR | 18 | Modèles HySense, FlowMeter, InduSense… |
| MESURE | 18 | 1 mesure initiale par capteur |
| RESEAU_DRAINAGE | 10 | Segments 45–420 m, ∅ 35–60 cm |
| UTILISATEUR | 4 | ADMIN, OPERATEUR, TECHNICIEN, LECTEUR |
| ALERTE | 0 | Générées à la demande par triggers |
| LOG_ACTIVITE | 0 | Générée à la demande par triggers |

---

*Urba-Drain Agadir · Équipe Augmenteds · ENSIASD Taroudant · SIBD 2025-2026*
