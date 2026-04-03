USE urba_drain_agadir;

DELIMITER $$

-- ============================================================
-- TRIGGER 1 : trg_creation_alerte
-- Déclenché : AFTER INSERT sur MESURE
-- Rôle : Gère les alertes sans planter si aucune donnée n'est trouvée (1329)
-- ============================================================
DROP TRIGGER IF EXISTS trg_creation_alerte$$

CREATE TRIGGER trg_creation_alerte
AFTER INSERT ON MESURE
FOR EACH ROW
trg_block: BEGIN
    DECLARE v_seuil_alerte   DECIMAL(10,2);
    DECLARE v_seuil_critique DECIMAL(10,2);
    DECLARE v_bouche_id      INT;
    DECLARE v_zone_id        INT;
    
    DECLARE v_alerte_active_id INT DEFAULT NULL;
    DECLARE v_alerte_niveau  VARCHAR(20) DEFAULT NULL;
    
    DECLARE v_niveau         VARCHAR(20);
    DECLARE v_message        TEXT;

    -- 1. Infos capteur sécurisées
    -- Remplacement du SELECT INTO par des SET = (SELECT ...) pour éviter l'erreur 1329 No Data
    SET v_seuil_alerte   = (SELECT seuil_alerte   FROM CAPTEUR WHERE capteur_id = NEW.capteur_id LIMIT 1);
    SET v_seuil_critique = (SELECT seuil_critique FROM CAPTEUR WHERE capteur_id = NEW.capteur_id LIMIT 1);
    SET v_bouche_id      = (SELECT bouche_id      FROM CAPTEUR WHERE capteur_id = NEW.capteur_id LIMIT 1);
    SET v_zone_id        = (SELECT zone_id        FROM CAPTEUR WHERE capteur_id = NEW.capteur_id LIMIT 1);

    -- GARDE FOU : si le capteur est introuvable, stop tout (évite les erreurs sur les relations nulles)
    IF v_seuil_alerte IS NULL OR v_bouche_id IS NULL THEN
        -- MySQL n'autorisant pas LEAVE trg_block global sur certains types de blocks, 
        -- nous ne faisons rien si l'ID n'est pas rempli.
        SET v_niveau = NULL;
    ELSE
        -- 2. MaJ derniere mesure
        UPDATE CAPTEUR SET derniere_mesure = NEW.date_heure WHERE capteur_id = NEW.capteur_id;
        
        -- 3. ANTI-SPAM: verifier si on a deja une alerte NON resolue
        -- Sécurisé via SET = (SELECT)
        SET v_alerte_active_id = (SELECT alerte_id FROM ALERTE WHERE capteur_id = NEW.capteur_id AND resolue = FALSE LIMIT 1);
        
        IF v_alerte_active_id IS NOT NULL THEN
            SET v_alerte_niveau = (SELECT niveau_alerte FROM ALERTE WHERE alerte_id = v_alerte_active_id LIMIT 1);
        END IF;

        -- 4. DECISION METIER
        IF NEW.valeur < v_seuil_alerte THEN
            -- Retour a la normale: auto_resolution
            IF v_alerte_active_id IS NOT NULL THEN
                UPDATE ALERTE SET resolue = TRUE, date_resolution = NOW() 
                WHERE alerte_id = v_alerte_active_id;
                
                UPDATE BOUCHE_EGOUT SET statut = 'NORMAL' WHERE bouche_id = v_bouche_id;
            END IF;

        ELSEIF NEW.valeur >= v_seuil_critique THEN
            -- Degre Critique
            IF v_alerte_active_id IS NULL THEN
                SET v_niveau  = 'CRITIQUE';
                SET v_message = CONCAT('CRITIQUE : Capteur ', NEW.capteur_id, ' — Valeur ', NEW.valeur, ' ', NEW.unite, ' depasse le seuil critique.');
                UPDATE BOUCHE_EGOUT SET statut = 'SATURE' WHERE bouche_id = v_bouche_id;
                INSERT INTO ALERTE (capteur_id, bouche_id, zone_id, niveau_alerte, message, valeur_declenchante, date_heure) 
                VALUES (NEW.capteur_id, v_bouche_id, v_zone_id, v_niveau, v_message, NEW.valeur, NEW.date_heure);
            ELSE
                -- Escalade si on etait en warning
                IF v_alerte_niveau = 'ELEVE' THEN
                    UPDATE BOUCHE_EGOUT SET statut = 'SATURE' WHERE bouche_id = v_bouche_id;
                    UPDATE ALERTE 
                    SET niveau_alerte = 'CRITIQUE', 
                        message = CONCAT('ESCALADE CRITIQUE : Nouvelle Valeur ', NEW.valeur, ' ', NEW.unite)
                    WHERE alerte_id = v_alerte_active_id;
                END IF;
            END IF;

        ELSEIF NEW.valeur >= v_seuil_alerte THEN
            -- Degre Warning
            IF v_alerte_active_id IS NULL THEN
                SET v_niveau  = 'ELEVE';
                SET v_message = CONCAT('ATTENTION : Capteur ', NEW.capteur_id, ' — Valeur ', NEW.valeur, ' ', NEW.unite, ' depasse le seuil alerte.');
                UPDATE BOUCHE_EGOUT SET statut = 'ALERTE' WHERE bouche_id = v_bouche_id AND statut = 'NORMAL';
                INSERT INTO ALERTE (capteur_id, bouche_id, zone_id, niveau_alerte, message, valeur_declenchante, date_heure) 
                VALUES (NEW.capteur_id, v_bouche_id, v_zone_id, v_niveau, v_message, NEW.valeur, NEW.date_heure);
            END IF;
        END IF;

    END IF;

END$$

DELIMITER ;
