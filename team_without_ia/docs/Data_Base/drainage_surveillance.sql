-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mer. 04 mars 2026 à 23:26
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `drainage_surveillance`
--

DELIMITER $$
--
-- Procédures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `auto_activate_pumps` (IN `p_id_zone` INT)   BEGIN
    DECLARE v_capteurs_critiques INT;

    SELECT COUNT(*) INTO v_capteurs_critiques
    FROM capteur c
    JOIN lecture_capteur lc ON c.id_capteur = lc.id_capteur
    WHERE c.id_zone = p_id_zone
      AND c.statut = 'ACTIF'
      AND lc.valeur > c.seuil_critique
      AND lc.timestamp > DATE_SUB(NOW(), INTERVAL 10 MINUTE);

    IF v_capteurs_critiques >= 2 THEN
        UPDATE pompe
        SET statut = 'ACTIVE', derniere_activation = NOW()
        WHERE id_zone = p_id_zone
          AND mode_activation = 'AUTOMATIQUE'
          AND statut IN ('INACTIVE', 'ACTIVE');

        INSERT INTO alerte (
            type_alerte, niveau_severite, statut, titre, message, id_zone
        ) VALUES (
            'NIVEAU_ELEVE', 'URGENCE', 'ACTIVE',
            CONCAT('Activation pompes automatique - Zone ', p_id_zone),
            CONCAT(v_capteurs_critiques, ' capteurs en niveau critique détectés'),
            p_id_zone
        );
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `system_status_report` ()   BEGIN
    SELECT COUNT(*) AS total_capteurs,
        SUM(CASE WHEN statut = 'ACTIF' THEN 1 ELSE 0 END) AS capteurs_actifs,
        SUM(CASE WHEN statut = 'DEFAILLANT' THEN 1 ELSE 0 END) AS capteurs_defaillants
    FROM capteur;

    SELECT COUNT(*) AS total_pompes,
        SUM(CASE WHEN statut = 'ACTIVE' THEN 1 ELSE 0 END) AS pompes_actives,
        SUM(CASE WHEN statut = 'PANNE' THEN 1 ELSE 0 END) AS pompes_en_panne
    FROM pompe;

    SELECT niveau_severite, COUNT(*) AS nombre_alertes
    FROM alerte WHERE statut = 'ACTIVE'
    GROUP BY niveau_severite;

    SELECT z.nom_zone, z.niveau_risque,
        COUNT(DISTINCT a.id_alerte) AS alertes_actives
    FROM zone z
    LEFT JOIN alerte a ON z.id_zone = a.id_zone AND a.statut = 'ACTIVE'
    WHERE z.niveau_risque IN ('ELEVE', 'CRITIQUE')
    GROUP BY z.id_zone, z.nom_zone, z.niveau_risque
    ORDER BY z.niveau_risque DESC, alertes_actives DESC;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `alerte`
--

CREATE TABLE `alerte` (
  `id_alerte` int(11) NOT NULL,
  `type_alerte` enum('NIVEAU_ELEVE','PANNE_CAPTEUR','PANNE_POMPE','MAINTENANCE') NOT NULL,
  `niveau_severite` enum('INFO','AVERTISSEMENT','CRITIQUE','URGENCE') DEFAULT 'INFO',
  `statut` enum('ACTIVE','ACQUITTEE','RESOLUE','IGNOREE') DEFAULT 'ACTIVE',
  `titre` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `timestamp_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  `timestamp_acquittement` timestamp NULL DEFAULT NULL,
  `timestamp_resolution` timestamp NULL DEFAULT NULL,
  `utilisateur_acquittement` varchar(100) DEFAULT NULL,
  `actions_prises` text DEFAULT NULL,
  `id_capteur` int(11) DEFAULT NULL,
  `id_pompe` int(11) DEFAULT NULL,
  `id_zone` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `alerte`
--

INSERT INTO `alerte` (`id_alerte`, `type_alerte`, `niveau_severite`, `statut`, `titre`, `message`, `timestamp_creation`, `timestamp_acquittement`, `timestamp_resolution`, `utilisateur_acquittement`, `actions_prises`, `id_capteur`, `id_pompe`, `id_zone`) VALUES
(1, 'NIVEAU_ELEVE', 'CRITIQUE', 'ACTIVE', 'Niveau critique Founty', 'Capteur CAP-NIV-007 : valeur 2.60m > seuil 2.50m', '2025-03-02 05:30:00', NULL, NULL, NULL, NULL, 11, 9, 5),
(2, 'NIVEAU_ELEVE', 'URGENCE', 'ACTIVE', 'Inondation imminente Hay Mohammadi', 'Capteur CAP-NIV-003 : valeur 2.95m > seuil 3.00m', '2025-03-02 04:00:00', NULL, NULL, NULL, NULL, 4, 4, 2),
(3, 'PANNE_CAPTEUR', 'AVERTISSEMENT', 'ACTIVE', 'Capteur CAP-NIV-004 défaillant', 'Capteur hors ligne depuis 18 jours', '2025-02-13 09:00:00', NULL, NULL, NULL, NULL, 5, NULL, 2),
(4, 'PANNE_POMPE', 'CRITIQUE', 'ACTIVE', 'Pompe PMP-010 en panne', 'Défaillance moteur détectée, pompe arrêtée', '2025-02-15 11:30:00', NULL, NULL, NULL, NULL, NULL, 10, 5),
(5, 'MAINTENANCE', 'INFO', 'RESOLUE', 'Maintenance programmée PMP-003', 'Maintenance préventive effectuée avec succès', '2025-02-28 07:00:00', '2025-02-28 07:30:00', '2025-03-01 12:00:00', 'technicien1', 'Remplacement joint hydraulique, vérification moteur, test OK', NULL, 3, 1),
(6, 'NIVEAU_ELEVE', 'AVERTISSEMENT', 'RESOLUE', 'Niveau élevé Talborjt après pluies', 'Niveau remonté à 3.80m, pompes activées', '2025-02-20 18:00:00', '2025-02-20 18:15:00', '2025-02-21 06:00:00', 'operateur1', 'Activation pompes P1 et P2, surveillance renforcée 6h', 1, 1, 1),
(7, 'PANNE_POMPE', 'AVERTISSEMENT', 'ACQUITTEE', 'Pompe PMP-007 en mode secours', 'Pompe planifiée non démarrée à l heure prévue', '2025-02-25 19:30:00', '2025-02-25 20:00:00', NULL, 'operateur2', NULL, NULL, 7, 3),
(8, 'MAINTENANCE', 'INFO', 'ACTIVE', 'Maintenance capteur CAP-DEB-002', 'Capteur en maintenance, données indisponibles', '2025-03-01 08:00:00', NULL, NULL, NULL, NULL, 8, NULL, 3),
(9, 'NIVEAU_ELEVE', 'CRITIQUE', 'ACTIVE', 'Niveau critique détecté - Capteur 11', 'Valeur mesurée: 2.55 > Seuil: 2.50', '2026-03-04 22:24:34', NULL, NULL, NULL, NULL, 11, NULL, 5),
(10, 'NIVEAU_ELEVE', 'CRITIQUE', 'ACTIVE', 'Niveau critique détecté - Capteur 11', 'Valeur mesurée: 2.60 > Seuil: 2.50', '2026-03-04 22:24:34', NULL, NULL, NULL, NULL, 11, NULL, 5);

-- --------------------------------------------------------

--
-- Structure de la table `capteur`
--

CREATE TABLE `capteur` (
  `id_capteur` int(11) NOT NULL,
  `reference` varchar(50) NOT NULL,
  `type_capteur` enum('NIVEAU','DEBIT','PRESSION') NOT NULL,
  `localisation` text NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `statut` enum('ACTIF','INACTIF','MAINTENANCE','DEFAILLANT') DEFAULT 'ACTIF',
  `seuil_alerte` decimal(5,2) DEFAULT NULL CHECK (`seuil_alerte` > 0),
  `seuil_critique` decimal(5,2) DEFAULT NULL,
  `derniere_lecture` decimal(5,2) DEFAULT NULL,
  `date_installation` date NOT NULL,
  `derniere_maintenance` timestamp NULL DEFAULT NULL,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_zone` int(11) NOT NULL
) ;

--
-- Déchargement des données de la table `capteur`
--

INSERT INTO `capteur` (`id_capteur`, `reference`, `type_capteur`, `localisation`, `latitude`, `longitude`, `statut`, `seuil_alerte`, `seuil_critique`, `derniere_lecture`, `date_installation`, `derniere_maintenance`, `date_creation`, `id_zone`) VALUES
(1, 'CAP-NIV-001', 'NIVEAU', 'Collecteur principal Talborjt, Avenue Hassan II', 30.42112300, -9.59834500, 'ACTIF', 2.50, 4.00, 2.85, '2023-01-15', '2024-12-01 07:00:00', '2026-03-04 22:24:34', 1),
(2, 'CAP-NIV-002', 'NIVEAU', 'Bassin rétention Talborjt, Place Assalam', 30.42045600, -9.59912300, 'ACTIF', 2.50, 4.00, 1.92, '2023-01-15', '2024-11-15 08:00:00', '2026-03-04 22:24:34', 1),
(3, 'CAP-DEB-001', 'DEBIT', 'Sortie collecteur Talborjt vers Oued Tildi', 30.42156700, -9.59756700, 'ACTIF', 8.00, 12.00, 11.20, '2023-02-10', '2024-10-20 09:00:00', '2026-03-04 22:24:34', 1),
(4, 'CAP-NIV-003', 'NIVEAU', 'Hay Mohammadi, Boulevard Mohammed V', 30.41289000, -9.60078900, 'ACTIF', 1.80, 3.00, 3.15, '2022-06-20', '2025-01-10 07:30:00', '2026-03-04 22:24:34', 2),
(5, 'CAP-NIV-004', 'NIVEAU', 'Souk El Had, réseau souterrain principal', 30.41178900, -9.60145600, 'DEFAILLANT', 1.80, 3.00, NULL, '2022-06-20', '2024-08-05 13:00:00', '2026-03-04 22:24:34', 2),
(6, 'CAP-PRE-001', 'PRESSION', 'Station pompage Hay Mohammadi, rue Atlas', 30.41323400, -9.60034500, 'ACTIF', 5.00, 8.00, 5.65, '2022-07-01', '2025-02-01 08:00:00', '2026-03-04 22:24:34', 2),
(7, 'CAP-NIV-005', 'NIVEAU', 'Anza, Avenue Prince Moulay Abdellah', 30.38812300, -9.56189000, 'ACTIF', 2.00, 3.50, 1.35, '2023-05-12', '2024-09-15 10:00:00', '2026-03-04 22:24:34', 3),
(8, 'CAP-DEB-002', 'DEBIT', 'Canal irrigation Anza Nord', 30.38934500, -9.56123400, 'MAINTENANCE', 7.00, 11.00, NULL, '2023-05-12', '2025-03-01 08:00:00', '2026-03-04 22:24:34', 3),
(9, 'CAP-NIV-006', 'NIVEAU', 'Port d\'Agadir, quai de pêche principal', 30.41523400, -9.61734500, 'ACTIF', 3.00, 5.00, 2.45, '2021-11-20', '2024-07-10 09:00:00', '2026-03-04 22:24:34', 4),
(10, 'CAP-PRE-002', 'PRESSION', 'Port commercial, conduite principale', 30.41478900, -9.61823400, 'ACTIF', 6.00, 9.00, NULL, '2021-11-20', '2024-07-10 13:00:00', '2026-03-04 22:24:34', 4),
(11, 'CAP-NIV-007', 'NIVEAU', 'Founty, promenade de la plage', 30.39167800, -9.60412300, 'ACTIF', 1.50, 2.50, 2.75, '2023-09-01', '2025-01-20 08:00:00', '2026-03-04 22:24:34', 5),
(12, 'CAP-NIV-008', 'NIVEAU', 'Founty Marina, parking sous-sol', 30.39223400, -9.60378900, 'ACTIF', 1.50, 2.50, 1.48, '2023-09-01', '2025-01-20 09:00:00', '2026-03-04 22:24:34', 5),
(13, 'CAP-DEB-003', 'DEBIT', 'Tilila, exutoire principal Oued Souss', 30.43512300, -9.58089000, 'ACTIF', 5.00, 9.00, 4.55, '2024-01-08', NULL, '2026-03-04 22:24:34', 6),
(14, 'CAP-NIV-009', 'NIVEAU', 'Zone industrielle Tassila, collecteur usines', 30.35723400, -9.54523400, 'ACTIF', 1.20, 2.00, 1.05, '2022-03-15', '2024-06-01 07:00:00', '2026-03-04 22:24:34', 7),
(15, 'CAP-NIV-010', 'NIVEAU', 'Dcheira El Jihadia, Avenue Al Qods', 30.37934500, -9.56745600, 'ACTIF', 2.80, 4.50, 2.65, '2022-09-10', '2024-11-01 08:00:00', '2026-03-04 22:24:34', 8);

-- --------------------------------------------------------

--
-- Structure de la table `lecture_capteur`
--

CREATE TABLE `lecture_capteur` (
  `id_lecture` bigint(20) NOT NULL,
  `valeur` decimal(5,2) NOT NULL CHECK (`valeur` >= 0),
  `unite` varchar(10) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `qualite_signal` enum('EXCELLENT','BON','MOYEN','FAIBLE') DEFAULT 'BON',
  `anomalie` tinyint(1) DEFAULT 0,
  `batterie_pct` tinyint(4) DEFAULT NULL CHECK (`batterie_pct` between 0 and 100),
  `id_capteur` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `lecture_capteur`
--

INSERT INTO `lecture_capteur` (`id_lecture`, `valeur`, `unite`, `timestamp`, `qualite_signal`, `anomalie`, `batterie_pct`, `id_capteur`) VALUES
(1, 1.85, 'm', '2025-03-02 06:00:00', 'EXCELLENT', 0, 92, 1),
(2, 1.90, 'm', '2025-03-02 06:05:00', 'EXCELLENT', 0, 92, 1),
(3, 2.10, 'm', '2025-03-02 06:10:00', 'BON', 0, 91, 1),
(4, 2.45, 'm', '2025-03-02 06:15:00', 'BON', 0, 91, 1),
(5, 2.70, 'm', '2025-03-02 06:20:00', 'BON', 1, 90, 1),
(6, 1.60, 'm', '2025-03-02 06:00:00', 'BON', 0, 88, 2),
(7, 1.65, 'm', '2025-03-02 06:05:00', 'BON', 0, 88, 2),
(8, 1.72, 'm', '2025-03-02 06:10:00', 'BON', 0, 87, 2),
(9, 7.50, 'm3/s', '2025-03-02 06:00:00', 'EXCELLENT', 0, 95, 3),
(10, 8.20, 'm3/s', '2025-03-02 06:05:00', 'EXCELLENT', 0, 95, 3),
(11, 9.10, 'm3/s', '2025-03-02 06:10:00', 'BON', 0, 94, 3),
(12, 10.80, 'm3/s', '2025-03-02 06:15:00', 'BON', 0, 94, 3),
(13, 2.40, 'm', '2025-03-02 03:00:00', 'BON', 0, 78, 4),
(14, 2.65, 'm', '2025-03-02 03:30:00', 'BON', 0, 78, 4),
(15, 2.80, 'm', '2025-03-02 04:00:00', 'MOYEN', 1, 77, 4),
(16, 2.95, 'm', '2025-03-02 04:30:00', 'MOYEN', 1, 76, 4),
(17, 4.20, 'bar', '2025-03-02 06:00:00', 'EXCELLENT', 0, 99, 6),
(18, 4.85, 'bar', '2025-03-02 06:05:00', 'EXCELLENT', 0, 99, 6),
(19, 5.30, 'bar', '2025-03-02 06:10:00', 'BON', 0, 98, 6),
(20, 1.20, 'm', '2025-03-02 06:00:00', 'BON', 0, 85, 7),
(21, 1.25, 'm', '2025-03-02 06:05:00', 'BON', 0, 85, 7),
(22, 1.18, 'm', '2025-03-02 06:10:00', 'BON', 0, 84, 7),
(23, 2.10, 'm', '2025-03-02 06:00:00', 'EXCELLENT', 0, 96, 9),
(24, 2.15, 'm', '2025-03-02 06:05:00', 'EXCELLENT', 0, 96, 9),
(25, 2.20, 'm', '2025-03-02 06:10:00', 'EXCELLENT', 0, 95, 9),
(26, 2.30, 'm', '2025-03-02 05:00:00', 'BON', 0, 72, 11),
(27, 2.55, 'm', '2025-03-02 05:30:00', 'BON', 1, 71, 11),
(28, 2.60, 'm', '2025-03-02 06:00:00', 'MOYEN', 1, 70, 11),
(29, 1.30, 'm', '2025-03-02 06:00:00', 'BON', 0, 82, 12),
(30, 1.35, 'm', '2025-03-02 06:05:00', 'BON', 0, 82, 12),
(31, 3.80, 'm3/s', '2025-03-02 06:00:00', 'FAIBLE', 0, 65, 13),
(32, 4.20, 'm3/s', '2025-03-02 06:05:00', 'FAIBLE', 0, 64, 13),
(33, 0.85, 'm', '2025-03-02 06:00:00', 'BON', 0, 91, 14),
(34, 0.90, 'm', '2025-03-02 06:05:00', 'BON', 0, 91, 14),
(35, 2.20, 'm', '2025-03-02 06:00:00', 'EXCELLENT', 0, 97, 15),
(36, 2.30, 'm', '2025-03-02 06:05:00', 'EXCELLENT', 0, 97, 15);

--
-- Déclencheurs `lecture_capteur`
--
DELIMITER $$
CREATE TRIGGER `critical_level_alert` AFTER INSERT ON `lecture_capteur` FOR EACH ROW BEGIN
    DECLARE v_seuil_critique DECIMAL(5,2);
    DECLARE v_id_zone INT;

    SELECT seuil_critique, id_zone INTO v_seuil_critique, v_id_zone
    FROM capteur WHERE id_capteur = NEW.id_capteur;

    IF NEW.valeur > v_seuil_critique THEN
        INSERT INTO alerte (
            type_alerte, niveau_severite, statut, titre, message, id_capteur, id_zone
        ) VALUES (
            'NIVEAU_ELEVE', 'CRITIQUE', 'ACTIVE',
            CONCAT('Niveau critique détecté - Capteur ', NEW.id_capteur),
            CONCAT('Valeur mesurée: ', NEW.valeur, ' > Seuil: ', v_seuil_critique),
            NEW.id_capteur, v_id_zone
        );
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_last_reading` AFTER INSERT ON `lecture_capteur` FOR EACH ROW BEGIN
    UPDATE capteur
    SET derniere_lecture = NEW.valeur
    WHERE id_capteur = NEW.id_capteur;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `operation_pompe`
--

CREATE TABLE `operation_pompe` (
  `id_operation` bigint(20) NOT NULL,
  `type_operation` enum('ACTIVATION','DESACTIVATION','MAINTENANCE') NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `declencheur` enum('MANUEL','AUTOMATIQUE','PLANIFIE','ALERTE') NOT NULL,
  `utilisateur` varchar(100) DEFAULT NULL,
  `ancien_statut` varchar(20) DEFAULT NULL,
  `nouveau_statut` varchar(20) DEFAULT NULL,
  `remarques` text DEFAULT NULL,
  `id_pompe` int(11) NOT NULL,
  `id_alerte` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `operation_pompe`
--

INSERT INTO `operation_pompe` (`id_operation`, `type_operation`, `timestamp`, `declencheur`, `utilisateur`, `ancien_statut`, `nouveau_statut`, `remarques`, `id_pompe`, `id_alerte`) VALUES
(1, 'ACTIVATION', '2025-02-20 18:20:00', 'ALERTE', 'operateur1', 'INACTIVE', 'ACTIVE', 'Activation suite alerte inondation Talborjt', 1, 6),
(2, 'DESACTIVATION', '2025-02-21 06:05:00', 'MANUEL', 'operateur1', 'ACTIVE', 'INACTIVE', 'Niveau revenu à la normale Talborjt', 1, 6),
(3, 'ACTIVATION', '2025-02-20 18:25:00', 'ALERTE', 'operateur1', 'INACTIVE', 'ACTIVE', 'Renfort PMP-002 sur alerte Talborjt', 2, 6),
(4, 'DESACTIVATION', '2025-02-21 06:10:00', 'MANUEL', 'operateur1', 'ACTIVE', 'INACTIVE', 'Fin alerte quartier Talborjt', 2, 6),
(5, 'MAINTENANCE', '2025-03-01 07:00:00', 'PLANIFIE', 'technicien1', 'INACTIVE', 'MAINTENANCE', 'Début maintenance préventive PMP-003', 3, 5),
(6, 'ACTIVATION', '2025-03-02 01:00:00', 'AUTOMATIQUE', NULL, 'INACTIVE', 'ACTIVE', 'Activation automatique - capteurs critiques Hay Mohammadi', 4, 2),
(7, 'ACTIVATION', '2025-03-02 01:30:00', 'AUTOMATIQUE', NULL, 'INACTIVE', 'ACTIVE', 'Renfort automatique Hay Mohammadi', 5, 2),
(8, 'ACTIVATION', '2025-03-02 03:00:00', 'AUTOMATIQUE', NULL, 'INACTIVE', 'ACTIVE', 'Activation automatique Founty front de mer', 9, 1),
(9, 'DESACTIVATION', '2025-02-16 07:00:00', 'ALERTE', 'technicien2', 'ACTIVE', 'PANNE', 'Arrêt d urgence : défaillance moteur Founty Marina', 10, 4),
(10, 'ACTIVATION', '2025-03-01 22:00:00', 'PLANIFIE', NULL, 'INACTIVE', 'ACTIVE', 'Démarrage planifié nuit Port d Agadir', 8, NULL),
(11, 'ACTIVATION', '2025-03-02 04:00:00', 'AUTOMATIQUE', NULL, 'INACTIVE', 'ACTIVE', 'Activation automatique Dcheira El Jihadia', 12, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `pompe`
--

CREATE TABLE `pompe` (
  `id_pompe` int(11) NOT NULL,
  `reference` varchar(50) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `localisation` text NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `capacite` decimal(8,2) NOT NULL CHECK (`capacite` > 0),
  `statut` enum('ACTIVE','INACTIVE','MAINTENANCE','PANNE') DEFAULT 'INACTIVE',
  `mode_activation` enum('MANUEL','AUTOMATIQUE','PLANIFIE') DEFAULT 'MANUEL',
  `heures_fonctionnement` int(11) DEFAULT 0 CHECK (`heures_fonctionnement` >= 0),
  `derniere_activation` timestamp NULL DEFAULT NULL,
  `date_installation` date NOT NULL,
  `derniere_maintenance` timestamp NULL DEFAULT NULL,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_zone` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `pompe`
--

INSERT INTO `pompe` (`id_pompe`, `reference`, `nom`, `localisation`, `latitude`, `longitude`, `capacite`, `statut`, `mode_activation`, `heures_fonctionnement`, `derniere_activation`, `date_installation`, `derniere_maintenance`, `date_creation`, `id_zone`) VALUES
(1, 'PMP-001', 'Pompe Talborjt P1', 'Station pompage Talborjt, Rue Allal Ben Abdellah', 30.42145600, -9.59801200, 450.00, 'ACTIVE', 'AUTOMATIQUE', 2450, '2025-03-02 06:00:00', '2022-05-10', '2025-01-15 07:00:00', '2026-03-04 22:24:34', 1),
(2, 'PMP-002', 'Pompe Talborjt P2', 'Station pompage Talborjt, module secondaire', 30.42098900, -9.59845600, 450.00, 'INACTIVE', 'AUTOMATIQUE', 1890, '2025-02-20 14:00:00', '2022-05-10', '2024-12-10 08:00:00', '2026-03-04 22:24:34', 1),
(3, 'PMP-003', 'Pompe Secours Talborjt', 'Station Talborjt, sortie secours Oued Tildi', 30.42189000, -9.59756700, 300.00, 'MAINTENANCE', 'MANUEL', 980, '2025-02-28 10:00:00', '2022-05-10', '2025-03-01 07:00:00', '2026-03-04 22:24:34', 1),
(4, 'PMP-004', 'Pompe Hay Mohammadi P1', 'Station centrale Hay Mohammadi, Avenue FAR', 30.41356700, -9.60023400, 600.00, 'ACTIVE', 'AUTOMATIQUE', 5600, '2025-03-02 01:00:00', '2021-08-15', '2025-02-10 09:00:00', '2026-03-04 22:24:34', 2),
(5, 'PMP-005', 'Pompe Hay Mohammadi P2', 'Station centrale, module de renfort', 30.41323400, -9.59989000, 600.00, 'ACTIVE', 'AUTOMATIQUE', 5420, '2025-03-02 01:30:00', '2021-08-15', '2025-02-10 10:00:00', '2026-03-04 22:24:34', 2),
(6, 'PMP-006', 'Pompe Souk El Had', 'Station Souk El Had, parking souterrain', 30.41189000, -9.60167800, 350.00, 'INACTIVE', 'MANUEL', 1200, '2025-01-15 17:00:00', '2021-08-15', '2025-01-16 07:00:00', '2026-03-04 22:24:34', 2),
(7, 'PMP-007', 'Pompe Anza R1', 'Station résidentielle Anza, Bd Prince Moulay Abdellah', 30.38878900, -9.56156700, 380.00, 'INACTIVE', 'PLANIFIE', 1560, '2025-02-25 20:00:00', '2023-03-20', '2024-09-20 09:00:00', '2026-03-04 22:24:34', 3),
(8, 'PMP-008', 'Pompe Port Agadir P1', 'Station portuaire, secteur conserveries', 30.41567800, -9.61689000, 550.00, 'ACTIVE', 'AUTOMATIQUE', 7800, '2025-03-01 22:00:00', '2020-11-01', '2024-12-20 08:00:00', '2026-03-04 22:24:34', 4),
(9, 'PMP-009', 'Pompe Founty C1', 'Station Founty, promenade balnéaire', 30.39223400, -9.60389000, 400.00, 'ACTIVE', 'AUTOMATIQUE', 3200, '2025-03-02 03:00:00', '2023-07-05', '2025-01-25 07:00:00', '2026-03-04 22:24:34', 5),
(10, 'PMP-010', 'Pompe Founty Marina', 'Station Marina Founty, module B', 30.39189000, -9.60423400, 400.00, 'PANNE', 'AUTOMATIQUE', 3100, '2025-02-15 11:00:00', '2023-07-05', '2025-02-16 07:00:00', '2026-03-04 22:24:34', 5),
(11, 'PMP-011', 'Pompe Tassila I1', 'Station industrielle Tassila, zone usines', 30.35756700, -9.54489000, 180.00, 'INACTIVE', 'PLANIFIE', 320, '2024-12-10 07:00:00', '2022-01-15', '2024-11-15 08:00:00', '2026-03-04 22:24:34', 7),
(12, 'PMP-012', 'Pompe Dcheira P1', 'Station Dcheira El Jihadia, Avenue Al Qods', 30.37967800, -9.56712300, 500.00, 'ACTIVE', 'AUTOMATIQUE', 4100, '2025-03-02 04:00:00', '2022-07-20', '2025-02-20 10:00:00', '2026-03-04 22:24:34', 8);

--
-- Déclencheurs `pompe`
--
DELIMITER $$
CREATE TRIGGER `log_pump_operations` AFTER UPDATE ON `pompe` FOR EACH ROW BEGIN
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
            OLD.statut, NEW.statut, NEW.id_pompe
        );
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

CREATE TABLE `utilisateur` (
  `id_utilisateur` int(11) NOT NULL,
  `nom_utilisateur` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mot_de_passe_hash` varchar(255) NOT NULL,
  `nom` varchar(100) DEFAULT NULL,
  `prenom` varchar(100) DEFAULT NULL,
  `role` enum('ADMIN','OPERATEUR','TECHNICIEN','VIEWER') DEFAULT 'VIEWER',
  `telephone` varchar(20) DEFAULT NULL,
  `actif` tinyint(1) DEFAULT 1,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  `derniere_connexion` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `utilisateur`
--

INSERT INTO `utilisateur` (`id_utilisateur`, `nom_utilisateur`, `email`, `mot_de_passe_hash`, `nom`, `prenom`, `role`, `telephone`, `actif`, `date_creation`, `derniere_connexion`) VALUES
(1, 'admin_sys', 'admin@drainage.ma', '$2b$12$hashed_admin_password_here', 'Alaoui', 'Mohammed', 'ADMIN', '+212661000001', 1, '2026-03-04 22:24:33', '2025-03-01 08:30:00'),
(2, 'operateur1', 'oper1@drainage.ma', '$2b$12$hashed_oper1_password_here', 'Bennani', 'Fatima', 'OPERATEUR', '+212661000002', 1, '2026-03-04 22:24:33', '2025-03-02 09:15:00'),
(3, 'operateur2', 'oper2@drainage.ma', '$2b$12$hashed_oper2_password_here', 'Idrissi', 'Youssef', 'OPERATEUR', '+212661000003', 1, '2026-03-04 22:24:33', '2025-03-02 14:45:00'),
(4, 'technicien1', 'tech1@drainage.ma', '$2b$12$hashed_tech1_password_here', 'El Fassi', 'Karim', 'TECHNICIEN', '+212661000004', 1, '2026-03-04 22:24:33', '2025-02-28 11:00:00'),
(5, 'technicien2', 'tech2@drainage.ma', '$2b$12$hashed_tech2_password_here', 'Chakir', 'Nadia', 'TECHNICIEN', '+212661000005', 1, '2026-03-04 22:24:33', '2025-03-01 16:20:00'),
(6, 'viewer_mairie', 'mairie@commune-agadir.ma', '$2b$12$hashed_view_password_here', 'Tazi', 'Rachid', 'VIEWER', '+212661000006', 1, '2026-03-04 22:24:33', '2025-02-20 10:00:00'),
(7, 'viewer_pref', 'prefecture@gov.ma', '$2b$12$hashed_pref_password_here', 'Ouali', 'Samira', 'VIEWER', '+212661000007', 0, '2026-03-04 22:24:33', NULL),
(8, 'admin_backup', 'admin2@drainage.ma', '$2b$12$hashed_admin2_password_here', 'Rami', 'Hassan', 'ADMIN', '+212661000008', 1, '2026-03-04 22:24:33', '2025-03-02 07:00:00');

-- --------------------------------------------------------

--
-- Structure de la table `zone`
--

CREATE TABLE `zone` (
  `id_zone` int(11) NOT NULL,
  `nom_zone` varchar(100) NOT NULL,
  `superficie` decimal(10,2) DEFAULT NULL CHECK (`superficie` > 0),
  `population` int(11) DEFAULT NULL CHECK (`population` >= 0),
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `niveau_risque` enum('FAIBLE','MOYEN','ELEVE','CRITIQUE') DEFAULT 'MOYEN',
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_modification` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `zone`
--

INSERT INTO `zone` (`id_zone`, `nom_zone`, `superficie`, `population`, `latitude`, `longitude`, `niveau_risque`, `date_creation`, `date_modification`) VALUES
(1, 'Talborjt - Centre Historique', 125.80, 35000, 30.42078900, -9.59865400, 'CRITIQUE', '2026-03-04 22:24:33', '2026-03-04 22:24:33'),
(2, 'Hay Mohammadi - Zone Commerciale', 180.50, 58000, 30.41234500, -9.60123400, 'ELEVE', '2026-03-04 22:24:33', '2026-03-04 22:24:33'),
(3, 'Anza - Quartier Résidentiel', 245.30, 42000, 30.38765400, -9.56234500, 'MOYEN', '2026-03-04 22:24:33', '2026-03-04 22:24:33'),
(4, 'Port d\'Agadir - Zone Portuaire', 310.00, 3500, 30.41456700, -9.61789000, 'FAIBLE', '2026-03-04 22:24:33', '2026-03-04 22:24:33'),
(5, 'Founty - Front de Mer', 95.40, 28000, 30.39123400, -9.60456700, 'MOYEN', '2026-03-04 22:24:33', '2026-03-04 22:24:33'),
(6, 'Tilila - Quartier Populaire', 165.70, 72000, 30.43456700, -9.58123400, 'ELEVE', '2026-03-04 22:24:33', '2026-03-04 22:24:33'),
(7, 'Quartier Industriel Tassila', 520.50, 8500, 30.35678900, -9.54567800, 'MOYEN', '2026-03-04 22:24:33', '2026-03-04 22:24:33'),
(8, 'Dcheira - Extension Sud', 285.90, 48000, 30.37890100, -9.56789000, 'CRITIQUE', '2026-03-04 22:24:33', '2026-03-04 22:24:33');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `alerte`
--
ALTER TABLE `alerte`
  ADD PRIMARY KEY (`id_alerte`),
  ADD KEY `idx_alerte_statut` (`statut`,`timestamp_creation`),
  ADD KEY `idx_alerte_severite` (`niveau_severite`),
  ADD KEY `idx_alerte_type` (`type_alerte`),
  ADD KEY `idx_alerte_capteur` (`id_capteur`),
  ADD KEY `idx_alerte_pompe` (`id_pompe`),
  ADD KEY `idx_alerte_zone` (`id_zone`),
  ADD KEY `idx_alerte_timestamp` (`timestamp_creation`);

--
-- Index pour la table `capteur`
--
ALTER TABLE `capteur`
  ADD PRIMARY KEY (`id_capteur`),
  ADD UNIQUE KEY `reference` (`reference`),
  ADD UNIQUE KEY `unq_reference` (`reference`),
  ADD KEY `idx_capteur_statut` (`statut`),
  ADD KEY `idx_capteur_type` (`type_capteur`),
  ADD KEY `idx_capteur_zone` (`id_zone`),
  ADD KEY `idx_capteur_reference` (`reference`);

--
-- Index pour la table `lecture_capteur`
--
ALTER TABLE `lecture_capteur`
  ADD PRIMARY KEY (`id_lecture`),
  ADD KEY `idx_lecture_capteur` (`id_capteur`,`timestamp`),
  ADD KEY `idx_lecture_timestamp` (`timestamp`),
  ADD KEY `idx_lecture_anomalie` (`anomalie`);

--
-- Index pour la table `operation_pompe`
--
ALTER TABLE `operation_pompe`
  ADD PRIMARY KEY (`id_operation`),
  ADD KEY `id_alerte` (`id_alerte`),
  ADD KEY `idx_operation_pompe` (`id_pompe`,`timestamp`),
  ADD KEY `idx_operation_timestamp` (`timestamp`),
  ADD KEY `idx_operation_type` (`type_operation`),
  ADD KEY `idx_operation_declencheur` (`declencheur`);

--
-- Index pour la table `pompe`
--
ALTER TABLE `pompe`
  ADD PRIMARY KEY (`id_pompe`),
  ADD UNIQUE KEY `reference` (`reference`),
  ADD KEY `idx_pompe_statut` (`statut`),
  ADD KEY `idx_pompe_mode` (`mode_activation`),
  ADD KEY `idx_pompe_zone` (`id_zone`),
  ADD KEY `idx_pompe_reference` (`reference`);

--
-- Index pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD PRIMARY KEY (`id_utilisateur`),
  ADD UNIQUE KEY `nom_utilisateur` (`nom_utilisateur`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_utilisateur_nom` (`nom_utilisateur`),
  ADD KEY `idx_utilisateur_email` (`email`),
  ADD KEY `idx_utilisateur_role` (`role`),
  ADD KEY `idx_utilisateur_actif` (`actif`);

--
-- Index pour la table `zone`
--
ALTER TABLE `zone`
  ADD PRIMARY KEY (`id_zone`),
  ADD UNIQUE KEY `nom_zone` (`nom_zone`),
  ADD KEY `idx_zone_nom` (`nom_zone`),
  ADD KEY `idx_zone_risque` (`niveau_risque`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `alerte`
--
ALTER TABLE `alerte`
  MODIFY `id_alerte` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `capteur`
--
ALTER TABLE `capteur`
  MODIFY `id_capteur` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `lecture_capteur`
--
ALTER TABLE `lecture_capteur`
  MODIFY `id_lecture` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT pour la table `operation_pompe`
--
ALTER TABLE `operation_pompe`
  MODIFY `id_operation` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `pompe`
--
ALTER TABLE `pompe`
  MODIFY `id_pompe` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  MODIFY `id_utilisateur` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `zone`
--
ALTER TABLE `zone`
  MODIFY `id_zone` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `alerte`
--
ALTER TABLE `alerte`
  ADD CONSTRAINT `alerte_ibfk_1` FOREIGN KEY (`id_capteur`) REFERENCES `capteur` (`id_capteur`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `alerte_ibfk_2` FOREIGN KEY (`id_pompe`) REFERENCES `pompe` (`id_pompe`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `alerte_ibfk_3` FOREIGN KEY (`id_zone`) REFERENCES `zone` (`id_zone`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `capteur`
--
ALTER TABLE `capteur`
  ADD CONSTRAINT `capteur_ibfk_1` FOREIGN KEY (`id_zone`) REFERENCES `zone` (`id_zone`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `lecture_capteur`
--
ALTER TABLE `lecture_capteur`
  ADD CONSTRAINT `lecture_capteur_ibfk_1` FOREIGN KEY (`id_capteur`) REFERENCES `capteur` (`id_capteur`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `operation_pompe`
--
ALTER TABLE `operation_pompe`
  ADD CONSTRAINT `operation_pompe_ibfk_1` FOREIGN KEY (`id_pompe`) REFERENCES `pompe` (`id_pompe`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `operation_pompe_ibfk_2` FOREIGN KEY (`id_alerte`) REFERENCES `alerte` (`id_alerte`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `pompe`
--
ALTER TABLE `pompe`
  ADD CONSTRAINT `pompe_ibfk_1` FOREIGN KEY (`id_zone`) REFERENCES `zone` (`id_zone`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
