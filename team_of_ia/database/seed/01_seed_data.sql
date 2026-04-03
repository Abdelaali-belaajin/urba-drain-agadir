-- ============================================================
-- URBA-DRAIN AGADIR — Données Réelles d'Agadir
-- Fichier  : 04_seed_data.sql
-- Équipe   : Augmenteds — ENSIASD Taroudant SIBD 2025-2026
-- Source quartiers : agadir.ma/fr/agadir-ville-durable/les-quartiers/
-- Source GPS       : OpenStreetMap + Wikipedia Agadir
-- ============================================================

USE urba_drain_agadir;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. ZONES — 12 vrais quartiers d'Agadir
-- Source : site officiel agadir.ma
-- ============================================================
INSERT INTO ZONE (nom_zone, quartier, superficie_km2, population, coord_lat, coord_lng, niveau_risque, date_creation, actif) VALUES
('Zone Hay Mohammadi',   'Hay Mohammadi',   3.800, 42000, 30.4430, -9.5550, 'ELEVE',    '2024-01-15', TRUE),
('Zone Talborjt',        'Talborjt',        2.500, 35000, 30.4265, -9.5940, 'MOYEN',    '2024-01-15', TRUE),
('Zone Bensergao',       'Bensergao',       8.200, 22000, 30.3850, -9.5750, 'FAIBLE',   '2024-01-15', TRUE),
('Zone Anza',            'Anza',            6.500, 30000, 30.4500, -9.6420, 'CRITIQUE', '2024-01-15', TRUE),
('Zone Al Massira',      'Al Massira',      4.100, 48000, 30.4100, -9.5550, 'MOYEN',    '2024-02-01', TRUE),
('Zone Tilila',          'Tilila',          2.800, 28000, 30.4080, -9.5300, 'ELEVE',    '2024-02-01', TRUE),
('Zone Adrar',           'Adrar',           3.200, 18000, 30.4200, -9.5150, 'FAIBLE',   '2024-02-01', TRUE),
('Zone Tikiouine',       'Tikiouine',      12.000, 25000, 30.3950, -9.5200, 'FAIBLE',   '2024-03-01', TRUE),
('Zone Bensergao Sud',   'Bensergao Sud',   5.500, 15000, 30.3700, -9.5750, 'MOYEN',    '2024-03-01', TRUE),
('Zone Al Houda',        'Al Houda',        2.200, 20000, 30.3950, -9.5450, 'MOYEN',    '2024-03-01', TRUE),
('Zone Founty',          'Founty',          3.600, 12000, 30.4000, -9.5950, 'FAIBLE',   '2024-04-01', TRUE),
('Zone Quartier Suisse', 'Quartier Suisse', 1.800,  8000, 30.4290, -9.6020, 'FAIBLE',   '2024-04-01', TRUE),
('Zone Dakhla',          'Dakhla',          2.100, 15000, 30.4150, -9.5550, 'MOYEN',    '2024-04-01', TRUE),
('Zone Les Amicales',    'Les Amicales',    1.500, 12000, 30.4300, -9.5850, 'ELEVE',    '2024-04-01', TRUE),
('Zone Charaf',          'Charaf',          2.200, 18000, 30.4350, -9.5720, 'FAIBLE',   '2024-04-01', TRUE),
('Zone Riad Salam',      'Riad Salam',      3.500, 30000, 30.4050, -9.5500, 'MOYEN',    '2024-04-01', TRUE),
('Zone Illigh',          'Illigh',          4.000,  8000, 30.4480, -9.5700, 'FAIBLE',   '2024-04-01', TRUE),
('Zone Taddart',         'Taddart',         2.800, 22000, 30.4550, -9.6200, 'CRITIQUE', '2024-04-01', TRUE),
('Zone Sonaba',          'Sonaba',          3.000, 10000, 30.3900, -9.5850, 'FAIBLE',   '2024-04-01', TRUE),
('Zone El Khiam',        'El Khiam',        1.800, 25000, 30.4180, -9.5650, 'ELEVE',    '2024-04-01', TRUE),
('Zone Q. Industriel',   'Quartier Industriel',5.500,5000, 30.4180, -9.5850,  'CRITIQUE', '2024-04-01', TRUE),
('Zone Najah',           'Najah',           2.600, 20000, 30.3980, -9.5550, 'MOYEN',    '2024-04-01', TRUE);

-- ============================================================
-- 2. POMPES — 13 pompes
-- ============================================================
INSERT INTO POMPE (zone_id, nom_pompe, debit_max_Lmin, statut, consommation_kw, coord_lat, coord_lng, automatique) VALUES
(1,  'P-HayMohammadi-01', 1800.00, 'INACTIVE', 0.00, 30.4382, -9.5792, TRUE),
(1,  'P-HayMohammadi-02', 1500.00, 'INACTIVE', 0.00, 30.4375, -9.5788, TRUE),
(2,  'P-Talborjt-01',     1200.00, 'INACTIVE', 0.00, 30.4202, -9.5982, TRUE),
(3,  'P-Bensergao-01',     900.00, 'INACTIVE', 0.00, 30.3902, -9.5702, TRUE),
(4,  'P-Anza-01',         2500.00, 'INACTIVE', 0.00, 30.4602, -9.6302, TRUE),
(4,  'P-Anza-02',         2000.00, 'INACTIVE', 0.00, 30.4598, -9.6298, FALSE),
(5,  'P-AlMassira-01',    1300.00, 'INACTIVE', 0.00, 30.4102, -9.5852, TRUE),
(6,  'P-Tilila-01',       1600.00, 'INACTIVE', 0.00, 30.4302, -9.5852, TRUE),
(6,  'P-Tilila-02',       1400.00, 'INACTIVE', 0.00, 30.4298, -9.5848, TRUE),
(7,  'P-Adrar-01',         800.00, 'INACTIVE', 0.00, 30.4452, -9.5652, TRUE),
(8,  'P-Tikiouine-01',     700.00, 'INACTIVE', 0.00, 30.3702, -9.5402, TRUE),
(10, 'P-AlHouda-01',      1100.00, 'INACTIVE', 0.00, 30.4152, -9.5782, TRUE),
(11, 'P-Founty-01',        600.00, 'INACTIVE', 0.00, 30.4052, -9.6052, TRUE),
(9,  'P-BensergaoSud-01',  800.00, 'INACTIVE', 0.00, 30.3802, -9.5702, TRUE),
(12, 'P-QuartierSuisse-01', 500.00, 'INACTIVE', 0.00, 30.4182, -9.6022, TRUE),
(13, 'P-Dakhla-01',        900.00, 'INACTIVE', 0.00, 30.4152, -9.5702, TRUE),
(14, 'P-Amicales-01',      850.00, 'INACTIVE', 0.00, 30.4252, -9.5852, TRUE),
(15, 'P-Charaf-01',       1100.00, 'INACTIVE', 0.00, 30.4352, -9.5752, TRUE),
(16, 'P-RiadSalam-01',    1200.00, 'INACTIVE', 0.00, 30.4052, -9.5552, TRUE),
(17, 'P-Illigh-01',        750.00, 'INACTIVE', 0.00, 30.4452, -9.5702, TRUE),
(18, 'P-Taddart-01',      1600.00, 'INACTIVE', 0.00, 30.4402, -9.6102, TRUE),
(19, 'P-Sonaba-01',        650.00, 'INACTIVE', 0.00, 30.3952, -9.5802, TRUE),
(20, 'P-ElKhiam-01',      1350.00, 'INACTIVE', 0.00, 30.4182, -9.5822, TRUE),
(21, 'P-QIndustriel-01',  2200.00, 'INACTIVE', 0.00, 30.4222, -9.5722, TRUE),
(22, 'P-Najah-01',        1000.00, 'INACTIVE', 0.00, 30.4022, -9.5652, TRUE);
-- ============================================================
-- 3. BOUCHES D'ÉGOUT — 16 bouches, adresses réelles Agadir
-- ============================================================
INSERT INTO BOUCHE_EGOUT (zone_id, pompe_id, adresse, coord_lat, coord_lng, capacite_max_L, taux_remplissage, statut, derniere_inspection) VALUES
(1,  1,  'Avenue des FAR, Hay Mohammadi, Agadir',         30.4381, -9.5791, 5000.00, 12.00, 'NORMAL', '2026-01-10'),
(1,  2,  'Rue Tildi, Hay Mohammadi, Agadir',              30.4378, -9.5787, 4500.00, 18.00, 'NORMAL', '2026-01-10'),
(2,  3,  'Boulevard Mohammed Cheikh Saadi, Talborjt',     30.4201, -9.5981, 3500.00, 28.00, 'NORMAL', '2026-01-15'),
(2,  3,  'Avenue du President Kennedy, Talborjt',         30.4199, -9.5979, 3000.00, 22.00, 'NORMAL', '2026-01-15'),
(3,  4,  'Route de Bensergao Km 4, Agadir',               30.3901, -9.5701, 6000.00,  8.00, 'NORMAL', '2026-02-01'),
(4,  5,  'Avenue du Port, Anza, Agadir',                  30.4601, -9.6301, 8000.00, 52.00, 'ALERTE', '2025-11-20'),
(4,  6,  'Zone Industrielle Anza, Rue des Conserves',     30.4597, -9.6297, 7500.00, 44.00, 'ALERTE', '2025-11-20'),
(5,  7,  'Boulevard Al Massira, Agadir',                  30.4101, -9.5851, 4000.00, 25.00, 'NORMAL', '2026-01-20'),
(5,  7,  'Rue Al Wifaq, Al Massira, Agadir',              30.4099, -9.5849, 3800.00, 20.00, 'NORMAL', '2026-01-20'),
(6,  8,  'Avenue Tilila, Agadir',                         30.4301, -9.5851, 4200.00, 35.00, 'NORMAL', '2026-01-08'),
(6,  9,  'Rue de la Mosquee, Tilila, Agadir',             30.4299, -9.5847, 4000.00, 30.00, 'NORMAL', '2026-01-08'),
(7,  10, 'Avenue Adrar pres Carrefour, Agadir',           30.4451, -9.5651, 3500.00, 10.00, 'NORMAL', '2026-02-10'),
(8,  11, 'Route de Tikiouine Km 14, Agadir',              30.3701, -9.5401, 5000.00,  6.00, 'NORMAL', '2026-02-05'),
(10, 12, 'Quartier Al Houda, Rue Principale, Agadir',     30.4151, -9.5781, 3200.00, 20.00, 'NORMAL', '2026-01-25'),
(11, 13, 'Boulevard du 20 Aout, Founty, Agadir',          30.4051, -9.6051, 3000.00,  9.00, 'NORMAL', '2026-02-15'),
(12, 15, 'Avenue des FAR, Quartier Suisse, Agadir',       30.4181, -9.6021, 2500.00,  5.00, 'NORMAL', '2026-02-20'),
(9,  14, 'Rue Bensergao Sud',                             30.3801, -9.5701, 3200.00, 10.00, 'NORMAL', '2026-01-10'),
(13, 16, 'Boulevard Dakhla',                              30.4151, -9.5701, 3600.00, 15.00, 'NORMAL', '2026-01-10'),
(14, 17, 'Rue Les Amicales',                              30.4251, -9.5851, 3400.00, 12.00, 'NORMAL', '2026-01-10'),
(15, 18, 'Avenue Charaf',                                 30.4351, -9.5751, 4000.00, 18.00, 'NORMAL', '2026-01-10'),
(16, 19, 'Boulevard Riad Salam',                          30.4051, -9.5551, 4500.00, 22.00, 'NORMAL', '2026-01-10'),
(17, 20, 'Rue Illigh',                                    30.4451, -9.5701, 3000.00,  8.00, 'NORMAL', '2026-01-10'),
(18, 21, 'Route Taddart',                                 30.4401, -9.6101, 5500.00, 28.00, 'NORMAL', '2026-01-10'),
(19, 22, 'Secteur Sonaba',                                30.3951, -9.5801, 2800.00,  6.00, 'NORMAL', '2026-01-10'),
(20, 23, 'Avenue El Khiam',                               30.4181, -9.5821, 4800.00, 25.00, 'NORMAL', '2026-01-10'),
(21, 24, 'Zone Industrielle Principale',                  30.4221, -9.5721, 7500.00, 35.00, 'NORMAL', '2026-01-10'),
(22, 25, 'Quartier Najah',                                30.4021, -9.5651, 4000.00, 20.00, 'NORMAL', '2026-01-10');

-- ============================================================
-- 4. CAPTEURS — 18 capteurs
-- ============================================================
INSERT INTO CAPTEUR (zone_id, bouche_id, type_capteur, modele, seuil_alerte, seuil_critique, statut, date_installation) VALUES
(1,  1,  'NIVEAU_EAU', 'HySense-NW200',   70.00,  90.00, 'ACTIF', '2024-03-01'),
(1,  1,  'DEBIT',      'FlowMeter-F5',   900.00,1400.00, 'ACTIF', '2024-03-01'),
(1,  2,  'NIVEAU_EAU', 'HySense-NW200',   65.00,  85.00, 'ACTIF', '2024-03-15'),
(2,  3,  'NIVEAU_EAU', 'HySense-NW100',   60.00,  80.00, 'ACTIF', '2024-03-20'),
(2,  4,  'DEBIT',      'FlowMeter-F3',   500.00, 850.00, 'ACTIF', '2024-03-20'),
(3,  5,  'NIVEAU_EAU', 'HySense-NW300',   75.00,  95.00, 'ACTIF', '2024-05-01'),
(4,  6,  'NIVEAU_EAU', 'InduSense-NW5',   80.00,  95.00, 'ACTIF', '2024-02-15'),
(4,  6,  'DEBIT',      'InduFlow-F10', 1500.00,2000.00, 'ACTIF', '2024-02-15'),
(4,  6,  'PRESSION',   'InduPress-P8',     3.00,   5.00, 'ACTIF', '2024-02-15'),
(4,  7,  'NIVEAU_EAU', 'InduSense-NW5',   78.00,  93.00, 'ACTIF', '2024-02-15'),
(4,  7,  'DEBIT',      'InduFlow-F10', 1400.00,1900.00, 'ACTIF', '2024-02-15'),
(5,  8,  'NIVEAU_EAU', 'HySense-NW200',   65.00,  85.00, 'ACTIF', '2024-04-01'),
(5,  9,  'DEBIT',      'FlowMeter-F5',   700.00,1100.00, 'ACTIF', '2024-04-01'),
(6,  10, 'NIVEAU_EAU', 'HySense-NW200',   68.00,  88.00, 'ACTIF', '2024-04-15'),
(6,  11, 'DEBIT',      'FlowMeter-F5',   750.00,1150.00, 'ACTIF', '2024-04-15'),
(7,  12, 'NIVEAU_EAU', 'HySense-NW100',   60.00,  80.00, 'ACTIF', '2024-05-10'),
(10, 14, 'NIVEAU_EAU', 'HySense-NW100',   62.00,  82.00, 'ACTIF', '2024-05-20'),
(8,  13, 'NIVEAU_EAU', 'HySense-NW100',   55.00,  75.00, 'ACTIF', '2024-06-01'),
(11, 15, 'NIVEAU_EAU', 'HySense-NW100',   50.00,  70.00, 'ACTIF', '2024-06-01'),
(12, 16, 'NIVEAU_EAU', 'HySense-NW100',   50.00,  70.00, 'ACTIF', '2024-06-01'),
(9,  17, 'NIVEAU_EAU', 'HySense-NW100',   50.00,  70.00, 'ACTIF', '2024-06-01'),
(13, 18, 'NIVEAU_EAU', 'HySense-NW100',   50.00,  70.00, 'ACTIF', '2024-06-01'),
(14, 19, 'NIVEAU_EAU', 'HySense-NW100',   50.00,  70.00, 'ACTIF', '2024-06-01'),
(15, 20, 'NIVEAU_EAU', 'HySense-NW100',   50.00,  70.00, 'ACTIF', '2024-06-01'),
(16, 21, 'NIVEAU_EAU', 'HySense-NW100',   50.00,  70.00, 'ACTIF', '2024-06-01'),
(17, 22, 'NIVEAU_EAU', 'HySense-NW100',   50.00,  70.00, 'ACTIF', '2024-06-01'),
(18, 23, 'NIVEAU_EAU', 'HySense-NW100',   50.00,  70.00, 'ACTIF', '2024-06-01'),
(19, 24, 'NIVEAU_EAU', 'HySense-NW100',   50.00,  70.00, 'ACTIF', '2024-06-01'),
(20, 25, 'NIVEAU_EAU', 'HySense-NW100',   50.00,  70.00, 'ACTIF', '2024-06-01'),
(21, 26, 'NIVEAU_EAU', 'HySense-NW100',   50.00,  70.00, 'ACTIF', '2024-06-01'),
(22, 27, 'NIVEAU_EAU', 'HySense-NW100',   50.00,  70.00, 'ACTIF', '2024-06-01');

-- ============================================================
-- 5. RÉSEAU DE DRAINAGE — 10 segments
-- ============================================================
INSERT INTO RESEAU_DRAINAGE (bouche_amont_id, bouche_aval_id, longueur_m, diametre_cm, debit_max_Lmin, debit_actuel_Lmin, goulot) VALUES
(1,  2,   95.00, 40.0, 1500.00,  180.00, FALSE),
(2,  3,  380.00, 50.0, 2000.00,  270.00, FALSE),
(3,  4,   65.00, 35.0, 1100.00,  242.00, FALSE),
(6,  7,   55.00, 55.0, 2500.00, 1100.00, FALSE),
(8,  9,   80.00, 40.0, 1500.00,  375.00, FALSE),
(10, 11,  72.00, 40.0, 1500.00,  525.00, FALSE),
(4,  8,  420.00, 60.0, 3000.00,  495.00, FALSE),
(7,  6,   45.00, 55.0, 2500.00,  880.00, FALSE),
(11, 10, 110.00, 40.0, 1500.00,  450.00, FALSE),
(14, 10, 200.00, 35.0, 1100.00,  220.00, FALSE);

-- ============================================================
-- 6. UTILISATEURS RBAC
-- ============================================================
INSERT INTO UTILISATEUR (nom, email, mot_de_passe_hash, role, date_creation, actif) VALUES
('Administrateur Systeme',  'admin@urba-drain-agadir.ma',       '$2b$12$LQv3c1yqBwlJjOGrjCLGxOQp8wJmMJN3UxAh5oLZBrGWL8vFmKyOi', 'ADMIN',      NOW(), TRUE),
('Ben Ali Youssef',         'operateur@urba-drain-agadir.ma',   '$2b$12$KQv3c1yqBwlJjOGrjCLGxOQp8wJmMJN3UxAh5oLZBrGWL8vFmKyOj', 'OPERATEUR',  NOW(), TRUE),
('Cherkaoui Fatima',        'technicien@urba-drain-agadir.ma',  '$2b$12$JQv3c1yqBwlJjOGrjCLGxOQp8wJmMJN3UxAh5oLZBrGWL8vFmKyOk', 'TECHNICIEN', NOW(), TRUE),
('Benali Karim',            'lecteur@urba-drain-agadir.ma',     '$2b$12$IQv3c1yqBwlJjOGrjCLGxOQp8wJmMJN3UxAh5oLZBrGWL8vFmKyOl', 'LECTEUR',    NOW(), TRUE);

-- ============================================================
-- 7. MESURES INITIALES NORMALES
-- ============================================================
INSERT INTO MESURE (capteur_id, valeur, unite, date_heure, qualite_signal, anomalie) VALUES
(1,  12.50, 'cm',    NOW() - INTERVAL 10 MINUTE, 'BONNE', FALSE),
(2, 108.00, 'L/min', NOW() - INTERVAL 10 MINUTE, 'BONNE', FALSE),
(3,  18.30, 'cm',    NOW() - INTERVAL 9  MINUTE, 'BONNE', FALSE),
(4,  28.10, 'cm',    NOW() - INTERVAL 8  MINUTE, 'BONNE', FALSE),
(5, 140.00, 'L/min', NOW() - INTERVAL 8  MINUTE, 'BONNE', FALSE),
(6,   8.00, 'cm',    NOW() - INTERVAL 7  MINUTE, 'BONNE', FALSE),
(7,  52.20, 'cm',    NOW() - INTERVAL 6  MINUTE, 'BONNE', FALSE),
(8, 780.00, 'L/min', NOW() - INTERVAL 6  MINUTE, 'BONNE', FALSE),
(9,   2.10, 'bar',   NOW() - INTERVAL 5  MINUTE, 'BONNE', FALSE),
(10, 44.00, 'cm',    NOW() - INTERVAL 5  MINUTE, 'BONNE', FALSE),
(11,700.00, 'L/min', NOW() - INTERVAL 4  MINUTE, 'BONNE', FALSE),
(12, 25.00, 'cm',    NOW() - INTERVAL 4  MINUTE, 'BONNE', FALSE),
(13,175.00, 'L/min', NOW() - INTERVAL 3  MINUTE, 'BONNE', FALSE),
(14, 35.00, 'cm',    NOW() - INTERVAL 3  MINUTE, 'BONNE', FALSE),
(15,375.00, 'L/min', NOW() - INTERVAL 2  MINUTE, 'BONNE', FALSE),
(16, 10.00, 'cm',    NOW() - INTERVAL 2  MINUTE, 'BONNE', FALSE),
(17, 20.00, 'cm',    NOW() - INTERVAL 1  MINUTE, 'BONNE', FALSE),
(18,  6.00, 'cm',    NOW() - INTERVAL 1  MINUTE, 'BONNE', FALSE);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Vérification finale
-- ============================================================
SELECT 'ZONES'           AS table_name, COUNT(*) AS nb_lignes FROM ZONE
UNION ALL SELECT 'POMPES',          COUNT(*) FROM POMPE
UNION ALL SELECT 'BOUCHES_EGOUT',   COUNT(*) FROM BOUCHE_EGOUT
UNION ALL SELECT 'CAPTEURS',        COUNT(*) FROM CAPTEUR
UNION ALL SELECT 'MESURES',         COUNT(*) FROM MESURE
UNION ALL SELECT 'RESEAU_DRAINAGE', COUNT(*) FROM RESEAU_DRAINAGE
UNION ALL SELECT 'UTILISATEURS',    COUNT(*) FROM UTILISATEUR
UNION ALL SELECT 'ALERTES',         COUNT(*) FROM ALERTE
UNION ALL SELECT 'LOG_ACTIVITE',    COUNT(*) FROM LOG_ACTIVITE;
