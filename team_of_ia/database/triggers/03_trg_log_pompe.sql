USE urba_drain_agadir;

DELIMITER $$
-- ============================================================
-- TRIGGER 3 : trg_log_pompe
-- Déclenché : AFTER UPDATE sur POMPE
-- Rôle : Enregistrer chaque changement de statut de pompe
--        dans LOG_ACTIVITE (audit de sécurité)
-- ============================================================
CREATE TRIGGER trg_log_pompe
AFTER UPDATE ON POMPE
FOR EACH ROW
BEGIN
    -- Logger uniquement si le statut a changé
    IF NEW.statut <> OLD.statut THEN
        INSERT INTO LOG_ACTIVITE (
            user_id, alerte_id, action, table_cible,
            valeur_avant, valeur_apres, date_heure
        ) VALUES (
            NULL,
            NULL,
            CONCAT('POMPE_', NEW.statut),
            'POMPE',
            CONCAT('pompe_id=', OLD.pompe_id,
                   ' statut=', OLD.statut),
            CONCAT('pompe_id=', NEW.pompe_id,
                   ' statut=', NEW.statut,
                   ' zone_id=', NEW.zone_id),
            NOW()
        );
    END IF;

END$$

DELIMITER ;

-- ============================================================
-- Vérification : afficher les triggers créés
-- ============================================================
SHOW TRIGGERS;