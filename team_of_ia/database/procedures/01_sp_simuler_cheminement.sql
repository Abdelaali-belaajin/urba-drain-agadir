
USE urba_drain_agadir;

DELIMITER $$

-- ============================================================
-- PROCÉDURE 1 : sp_simuler_cheminement_eau
-- Paramètre  : p_zone_id INT
-- Rôle : Parcourir tous les segments du réseau d'une zone,
--        calculer les débits et identifier les goulots
--        (segments où débit_actuel > 85% du débit_max)
-- ============================================================
CREATE PROCEDURE sp_simuler_cheminement_eau(IN p_zone_id INT)
BEGIN
    -- Variables pour le curseur
    DECLARE v_segment_id        INT;
    DECLARE v_bouche_amont      INT;
    DECLARE v_bouche_aval       INT;
    DECLARE v_debit_max         DECIMAL(10,2);
    DECLARE v_debit_actuel      DECIMAL(10,2);
    DECLARE v_taux_amont        DECIMAL(5,2);
    DECLARE v_debit_calcule     DECIMAL(10,2);
    DECLARE v_est_goulot        BOOLEAN;
    DECLARE v_nb_goulots        INT DEFAULT 0;
    DECLARE v_nb_segments       INT DEFAULT 0;
    DECLARE v_finished          BOOLEAN DEFAULT FALSE;

    -- Curseur sur tous les segments de la zone
    DECLARE cur_segments CURSOR FOR
        SELECT rd.segment_id,
               rd.bouche_amont_id,
               rd.bouche_aval_id,
               rd.debit_max_Lmin,
               rd.debit_actuel_Lmin,
               ba.taux_remplissage
        FROM   RESEAU_DRAINAGE rd
        JOIN   BOUCHE_EGOUT    ba ON ba.bouche_id = rd.bouche_amont_id
        WHERE  ba.zone_id = p_zone_id;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_finished = TRUE;

    -- Réinitialiser les goulots de la zone avant de recalculer
    UPDATE RESEAU_DRAINAGE rd
    JOIN   BOUCHE_EGOUT ba ON ba.bouche_id = rd.bouche_amont_id
    SET    rd.goulot = FALSE
    WHERE  ba.zone_id = p_zone_id;

    OPEN cur_segments;

    boucle_segments: LOOP
        FETCH cur_segments INTO
            v_segment_id, v_bouche_amont, v_bouche_aval,
            v_debit_max, v_debit_actuel, v_taux_amont;

        IF v_finished THEN
            LEAVE boucle_segments;
        END IF;

        SET v_nb_segments = v_nb_segments + 1;

        -- Calculer le débit actuel basé sur le taux de remplissage
        -- Formule : débit proportionnel au taux de remplissage
        SET v_debit_calcule = (v_taux_amont / 100.0) * v_debit_max;

        -- Mettre à jour le débit actuel du segment
        UPDATE RESEAU_DRAINAGE
        SET    debit_actuel_Lmin = v_debit_calcule
        WHERE  segment_id = v_segment_id;

        -- Identifier les goulots (débit > 85% du max)
        IF v_debit_calcule > (v_debit_max * 0.85) THEN
            SET v_est_goulot = TRUE;
            SET v_nb_goulots = v_nb_goulots + 1;

            UPDATE RESEAU_DRAINAGE
            SET    goulot = TRUE
            WHERE  segment_id = v_segment_id;
        ELSE
            SET v_est_goulot = FALSE;
        END IF;

    END LOOP boucle_segments;

    CLOSE cur_segments;

    -- Résultat de la simulation
    SELECT
        v_nb_segments   AS segments_analyses,
        v_nb_goulots    AS goulots_detectes,
        CASE
            WHEN v_nb_goulots = 0 THEN 'RESEAU_OK'
            WHEN v_nb_goulots <= 2 THEN 'ATTENTION'
            ELSE 'CRITIQUE'
        END             AS etat_reseau,
        NOW()           AS date_simulation;

    -- Afficher les goulots détectés
    IF v_nb_goulots > 0 THEN
        SELECT
            rd.segment_id,
            ba_amont.adresse    AS bouche_amont,
            ba_aval.adresse     AS bouche_aval,
            rd.debit_max_Lmin,
            rd.debit_actuel_Lmin,
            ROUND((rd.debit_actuel_Lmin / rd.debit_max_Lmin) * 100, 1) AS pourcentage_saturation
        FROM  RESEAU_DRAINAGE rd
        JOIN  BOUCHE_EGOUT ba_amont ON ba_amont.bouche_id = rd.bouche_amont_id
        JOIN  BOUCHE_EGOUT ba_aval  ON ba_aval.bouche_id  = rd.bouche_aval_id
        WHERE rd.goulot = TRUE
        AND   ba_amont.zone_id = p_zone_id
        ORDER BY pourcentage_saturation DESC;
    END IF;

END$$
