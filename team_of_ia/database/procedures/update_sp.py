import sys
import os

sys.path.append('../../backend')
from app import create_app
from db import db
from sqlalchemy import text

app = create_app()
app.app_context().push()

try:
    db.session.execute(text("DROP PROCEDURE IF EXISTS sp_simuler_orage"))
    
    create_sp = """
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

        OPEN cur_capteurs;

        boucle_capteurs: LOOP
            FETCH cur_capteurs INTO v_capteur_id, v_seuil_critique, v_unite;

            IF v_finished THEN
                LEAVE boucle_capteurs;
            END IF;

            IF v_capteur_id IS NOT NULL THEN
                BEGIN
                    DECLARE v_current_taux DECIMAL(5,2);
                    
                    SELECT b.taux_remplissage INTO v_current_taux 
                    FROM BOUCHE_EGOUT b 
                    JOIN CAPTEUR c ON c.bouche_id = b.bouche_id 
                    WHERE c.capteur_id = v_capteur_id LIMIT 1;
                    
                    SET v_current_taux = IFNULL(v_current_taux, 0);
                    
                    SET v_current_taux = LEAST(v_current_taux + (p_intensite_mm_h * 0.8), 100.0);
                    
                    UPDATE BOUCHE_EGOUT b
                    JOIN CAPTEUR c ON c.bouche_id = b.bouche_id
                    SET b.taux_remplissage = v_current_taux
                    WHERE c.capteur_id = v_capteur_id;

                    SET v_valeur_sim = (v_seuil_critique / 85.0) * v_current_taux;

                    INSERT INTO MESURE (
                        capteur_id, valeur, unite,
                        date_heure, qualite_signal, anomalie, note
                    ) VALUES (
                        v_capteur_id,
                        v_valeur_sim,
                        IFNULL(v_unite, 'mm/h'),
                        NOW(),
                        'BONNE',
                        FALSE,
                        CONCAT('SIMULATION ORAGE — intensite=', p_intensite_mm_h, 'mm/h. Calc: ', v_current_taux, '%')
                    );

                    SET v_nb_alertes = v_nb_alertes + 1;
                END;
            END IF;

        END LOOP boucle_capteurs;

        CLOSE cur_capteurs;
        
        SET v_valeur_sim = (SELECT MAX(taux_remplissage) FROM BOUCHE_EGOUT WHERE zone_id = p_zone_id);
        SET v_valeur_sim = IFNULL(v_valeur_sim, 0);

        UPDATE ZONE
        SET niveau_risque = CASE
            WHEN v_valeur_sim >= 85.0 THEN 'CRITIQUE'
            WHEN v_valeur_sim >= 60.0 THEN 'ELEVE'
            WHEN v_valeur_sim >= 30.0 THEN 'MOYEN'
            ELSE 'FAIBLE'
        END
        WHERE zone_id = p_zone_id;

        SET v_nb_pompes = (SELECT COUNT(*) FROM POMPE WHERE zone_id = p_zone_id AND statut = 'ACTIVE');
        SET v_nb_pompes = IFNULL(v_nb_pompes, 0);

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
    END;
    """
    db.session.execute(text(create_sp))
    db.session.commit()
    print("Stored procedure updated successfully.")
except Exception as e:
    print(f"Error: {e}")
