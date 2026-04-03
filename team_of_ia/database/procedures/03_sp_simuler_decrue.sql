USE urba_drain_agadir;

DELIMITER $$

-- ============================================================
-- PROCÉDURE 3 : sp_simuler_decrue
-- Paramètres : p_zone_id INT
-- Rôle : Simuler la décrue sur une zone de manière ROBUSTE :
--        - Baisse progressive (ex: -30%)
--        - Prévention des valeurs négatives via GREATEST
--        - Idempotence (ne crashe pas si appelé 10 fois)
--        - Insertion de mesures pour forcer la clôture des alertes
-- ============================================================
DROP PROCEDURE IF EXISTS sp_simuler_decrue$$

CREATE PROCEDURE sp_simuler_decrue(
    IN p_zone_id INT
)
BEGIN
    DECLARE v_capteur_id        INT;
    DECLARE v_unite             VARCHAR(20);
    DECLARE v_finished          BOOLEAN DEFAULT FALSE;
    DECLARE v_max_taux          DECIMAL(5,2);

    -- Curseur sur tous les capteurs actifs de la zone
    DECLARE cur_capteurs CURSOR FOR
        SELECT c.capteur_id,
               CASE c.type_capteur
                   WHEN 'NIVEAU_EAU'  THEN 'cm'
                   WHEN 'DEBIT'       THEN 'L/min'
                   WHEN 'PRESSION'    THEN 'bar'
                   WHEN 'TEMPERATURE' THEN 'C'
               END AS unite
        FROM   CAPTEUR c
        WHERE  c.zone_id = p_zone_id
        AND    c.statut  = 'ACTIF';

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_finished = TRUE;

    -- 1. Baisser le taux de remplissage des bouches de la zone
    -- Utilisation de GREATEST pour empêcher de descendre sous 0%
    UPDATE BOUCHE_EGOUT 
    SET taux_remplissage = GREATEST(0, taux_remplissage - 30.0)
    WHERE zone_id = p_zone_id;

    -- 2. Insérer une mesure "de retour à la normale" (valeur = 0)
    -- Le trigger trg_creation_alerte (désormais corrigé) l'utilisera sans planter
    OPEN cur_capteurs;

    boucle_capteurs: LOOP
        FETCH cur_capteurs INTO v_capteur_id, v_unite;

        IF v_finished THEN
            LEAVE boucle_capteurs;
        END IF;

        INSERT INTO MESURE (
            capteur_id, valeur, unite,
            date_heure, qualite_signal, anomalie, note
        ) VALUES (
            v_capteur_id,
            0.0,
            IFNULL(v_unite, 'mm/h'),
            NOW(),
            'BONNE',
            FALSE,
            'SIMULATION DECRUE'
        );

    END LOOP boucle_capteurs;

    CLOSE cur_capteurs;

    -- 3. Mettre à jour le statut de la pompe (Double sécurité idempotente)
    -- Même si le trigger trg_activation_pompe gère normalement l'update de bouche_egout,
    -- on s'assure qu'absolument rien ne reste "ACTIVE" si le taux plonge sous 30%.
    UPDATE POMPE p
    JOIN BOUCHE_EGOUT b ON p.pompe_id = b.pompe_id
    SET p.statut = 'INACTIVE'
    WHERE p.zone_id = p_zone_id
      AND p.statut = 'ACTIVE'
      AND b.taux_remplissage < 30.0;

    -- Cas spécial : S'il y a des pompes non assignées spécifiquement à une bouche (fallback), 
    -- on les éteint aussi si le max de la zone est bas.
    SET v_max_taux = (SELECT MAX(taux_remplissage) FROM BOUCHE_EGOUT WHERE zone_id = p_zone_id);
    SET v_max_taux = IFNULL(v_max_taux, 0);

    IF v_max_taux < 30.0 THEN
        UPDATE POMPE 
        SET statut = 'INACTIVE' 
        WHERE zone_id = p_zone_id AND statut = 'ACTIVE';
    END IF;

    -- 4. Évaluer et mettre à jour le niveau_risque global de la zone
    UPDATE ZONE
    SET niveau_risque = CASE
        WHEN v_max_taux >= 85.0 THEN 'CRITIQUE'
        WHEN v_max_taux >= 60.0 THEN 'ELEVE'
        WHEN v_max_taux >= 30.0 THEN 'MOYEN'
        ELSE 'FAIBLE'
    END
    WHERE zone_id = p_zone_id;

END$$

DELIMITER ;
