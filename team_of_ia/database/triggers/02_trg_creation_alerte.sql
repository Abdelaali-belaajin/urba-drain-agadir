
USE urba_drain_agadir;

DELIMITER $$

-- ============================================================
-- TRIGGER 1 : trg_creation_alerte
-- Déclenché : AFTER INSERT sur MESURE
-- Rôle : Si la valeur mesurée dépasse le seuil du capteur,
--        créer automatiquement une ALERTE
-- ============================================================
CREATE TRIGGER trg_creation_alerte
AFTER INSERT ON MESURE
FOR EACH ROW
BEGIN
    DECLARE v_seuil_alerte   DECIMAL(10,2);
    DECLARE v_seuil_critique DECIMAL(10,2);
    DECLARE v_bouche_id      INT;
    DECLARE v_zone_id        INT;
    DECLARE v_niveau         VARCHAR(20);
    DECLARE v_message        TEXT;

    -- Récupérer les seuils et infos du capteur
    SELECT c.seuil_alerte, c.seuil_critique, c.bouche_id, c.zone_id
    INTO   v_seuil_alerte, v_seuil_critique, v_bouche_id, v_zone_id
    FROM   CAPTEUR c
    WHERE  c.capteur_id = NEW.capteur_id;

    -- Mettre à jour la date de dernière mesure du capteur
    UPDATE CAPTEUR
    SET    derniere_mesure = NEW.date_heure
    WHERE  capteur_id = NEW.capteur_id;

    -- Vérifier si la valeur dépasse un seuil
    IF NEW.valeur >= v_seuil_critique THEN
        SET v_niveau  = 'CRITICAL';
        SET v_message = CONCAT(
            'CRITIQUE : Capteur ', NEW.capteur_id,
            ' — Valeur ', NEW.valeur, ' ', NEW.unite,
            ' dépasse le seuil critique de ', v_seuil_critique, ' ', NEW.unite
        );

        -- Mettre à jour le statut de la bouche
        UPDATE BOUCHE_EGOUT
        SET    statut = 'SATURE'
        WHERE  bouche_id = v_bouche_id;

        INSERT INTO ALERTE (
            capteur_id, bouche_id, zone_id,
            niveau_alerte, message, valeur_declenchante, date_heure
        ) VALUES (
            NEW.capteur_id, v_bouche_id, v_zone_id,
            v_niveau, v_message, NEW.valeur, NEW.date_heure
        );

    ELSEIF NEW.valeur >= v_seuil_alerte THEN
        SET v_niveau  = 'WARNING';
        SET v_message = CONCAT(
            'ATTENTION : Capteur ', NEW.capteur_id,
            ' — Valeur ', NEW.valeur, ' ', NEW.unite,
            ' dépasse le seuil alerte de ', v_seuil_alerte, ' ', NEW.unite
        );

        -- Mettre à jour le statut de la bouche
        UPDATE BOUCHE_EGOUT
        SET    statut = 'ALERTE'
        WHERE  bouche_id = v_bouche_id
        AND    statut = 'NORMAL';

        INSERT INTO ALERTE (
            capteur_id, bouche_id, zone_id,
            niveau_alerte, message, valeur_declenchante, date_heure
        ) VALUES (
            NEW.capteur_id, v_bouche_id, v_zone_id,
            v_niveau, v_message, NEW.valeur, NEW.date_heure
        );
    END IF;

END$$
