USE urba_drain_agadir;

DELIMITER $$

-- ============================================================
-- PROCÉDURE 2 : sp_simuler_orage
-- Paramètres : p_zone_id INT, p_intensite_mm_h DECIMAL
-- Rôle : Simuler un orage violent sur une zone —
--        générer N mesures critiques simultanées
--        pour tester la charge (scénario QA : 500 alertes)
-- ============================================================
CREATE PROCEDURE sp_simuler_orage(
    IN p_zone_id        INT,
    IN p_intensite_mm_h DECIMAL(6,2)
)
BEGIN
    DECLARE v_capteur_id        INT;
    DECLARE v_seuil_critique    DECIMAL(10,2);
    DECLARE v_valeur_sim        DECIMAL(10,4);
    DECLARE v_unite             VARCHAR(20);
    DECLARE v_nb_alertes        INT DEFAULT 0;
    DECLARE v_nb_pompes         INT DEFAULT 0;
    DECLARE v_finished          BOOLEAN DEFAULT FALSE;

    -- Curseur sur tous les capteurs actifs de la zone
    DECLARE cur_capteurs CURSOR FOR
        SELECT c.capteur_id, c.seuil_critique,
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

    -- Mettre à jour le niveau de risque de la zone
    UPDATE ZONE
    SET    niveau_risque = CASE
               WHEN p_intensite_mm_h >= 50 THEN 'CRITIQUE'
               WHEN p_intensite_mm_h >= 30 THEN 'ELEVE'
               ELSE 'MOYEN'
           END
    WHERE  zone_id = p_zone_id;

    OPEN cur_capteurs;

    boucle_capteurs: LOOP
        FETCH cur_capteurs INTO v_capteur_id, v_seuil_critique, v_unite;

        IF v_finished THEN
            LEAVE boucle_capteurs;
        END IF;

        -- Calculer la valeur simulée
        -- Formule : seuil_critique × (1 + intensité/100)
        SET v_valeur_sim = v_seuil_critique * (1 + (p_intensite_mm_h / 100));

        -- Insérer la mesure simulée (déclenchera trg_creation_alerte)
        INSERT INTO MESURE (
            capteur_id, valeur, unite,
            date_heure, qualite_signal, anomalie, note
        ) VALUES (
            v_capteur_id,
            v_valeur_sim,
            v_unite,
            NOW(),
            'BONNE',
            FALSE,
            CONCAT('SIMULATION ORAGE — intensite=', p_intensite_mm_h, 'mm/h')
        );

        SET v_nb_alertes = v_nb_alertes + 1;

        -- Mettre à jour le taux de remplissage des bouches
        UPDATE BOUCHE_EGOUT b
        JOIN   CAPTEUR c ON c.bouche_id = b.bouche_id
        SET    b.taux_remplissage = LEAST(
                   b.taux_remplissage + (p_intensite_mm_h * 0.8),
                   100.0
               )
        WHERE  c.capteur_id = v_capteur_id;

    END LOOP boucle_capteurs;

    CLOSE cur_capteurs;

    -- Compter les pompes activées pendant la simulation
    SELECT COUNT(*) INTO v_nb_pompes
    FROM   POMPE
    WHERE  zone_id = p_zone_id
    AND    statut  = 'ACTIVE';

    -- Résultat de la simulation
    SELECT
        p_zone_id           AS zone_simulee,
        p_intensite_mm_h    AS intensite_mm_h,
        v_nb_alertes        AS nb_mesures_inserees,
        v_nb_pompes         AS nb_pompes_activees,
        (SELECT COUNT(*) FROM ALERTE
         WHERE zone_id = p_zone_id
         AND   resolue = FALSE
         AND   date_heure >= NOW() - INTERVAL 1 MINUTE)
                            AS alertes_actives,
        (SELECT COUNT(*) FROM RESEAU_DRAINAGE rd
         JOIN   BOUCHE_EGOUT ba ON ba.bouche_id = rd.bouche_amont_id
         WHERE  ba.zone_id = p_zone_id AND rd.goulot = TRUE)
                            AS goulots_detectes,
        NOW()               AS date_simulation;

END$$

DELIMITER ;

-- ============================================================
-- Vérification : afficher les procédures créées
-- ============================================================
SHOW PROCEDURE STATUS WHERE Db = 'urba_drain_agadir';
