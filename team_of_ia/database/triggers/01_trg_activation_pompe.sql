USE urba_drain_agadir;

DELIMITER $$

-- ============================================================
-- TRIGGER 2 : trg_activation_pompe
-- Déclenché : AFTER UPDATE sur BOUCHE_EGOUT
-- Rôle : Si le taux de remplissage dépasse 85%,
--        activer automatiquement la pompe associée
-- ============================================================
CREATE TRIGGER trg_activation_pompe
AFTER UPDATE ON BOUCHE_EGOUT
FOR EACH ROW
BEGIN
    DECLARE v_seuil_activation DECIMAL(5,2) DEFAULT 85.00;

    -- Activer la pompe si taux > 85% ET pompe disponible ET automatique
    IF NEW.taux_remplissage > v_seuil_activation
       AND NEW.taux_remplissage <> OLD.taux_remplissage
       AND NEW.pompe_id IS NOT NULL
    THEN
        UPDATE POMPE
        SET    statut          = 'ACTIVE',
               date_activation = NOW()
        WHERE  pompe_id    = NEW.pompe_id
        AND    statut       = 'INACTIVE'
        AND    automatique  = TRUE;

        -- Log automatique de l'activation
        IF ROW_COUNT() > 0 THEN
            INSERT INTO LOG_ACTIVITE (
                user_id, alerte_id, action, table_cible,
                valeur_avant, valeur_apres, date_heure
            ) VALUES (
                NULL, NULL,
                'POMPE_ACTIVEE_AUTO',
                'POMPE',
                'INACTIVE',
                CONCAT('ACTIVE — Bouche ', NEW.bouche_id,
                       ' taux=', NEW.taux_remplissage, '%'),
                NOW()
            );
        END IF;
    END IF;

    -- Désactiver la pompe si taux revient en dessous de 30%
    IF NEW.taux_remplissage < 30.00
       AND OLD.taux_remplissage >= 30.00
       AND NEW.pompe_id IS NOT NULL
    THEN
        UPDATE POMPE
        SET    statut = 'INACTIVE'
        WHERE  pompe_id   = NEW.pompe_id
        AND    statut      = 'ACTIVE'
        AND    automatique = TRUE;
    END IF;

END$$