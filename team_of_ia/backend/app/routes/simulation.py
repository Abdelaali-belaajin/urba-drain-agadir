from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import text
from datetime import datetime, timedelta
from db import db
from app.models.log_activite import LogActivite
from app.middleware.rbac import require_role

simulation_bp = Blueprint("simulation", __name__)


@simulation_bp.route("/orage", methods=["POST"])
@jwt_required()
@require_role("ADMIN")
def simuler_orage():
    """
    POST /simulation/orage
    Body : { "zone_id": 1, "intensite": 60 }

    Step 1: Try CALL sp_simuler_orage(zone_id, intensite).
    Step 2: If fails, manual fallback:
            - Get all capteurs in zone.
            - For each: INSERT INTO MESURE (valeur = intensite * 1.5, unite based on type).
            - Count measures, alerts, and active pumps for this zone.
    """
    mesures_count = 0
    data      = request.get_json(silent=True) or {}
    zone_id   = data.get("zone_id")
    intensite = data.get("intensite", 0)

    if zone_id is None:
        return jsonify({"success": False, "error": "zone_id est requis"}), 400
    
    zone_id   = int(zone_id)
    intensite = float(intensite)
    t_start   = datetime.utcnow()
    ts_before = datetime.utcnow() - timedelta(seconds=1)
    mode      = "normal"

    # --- Step 0: Safety Check (Option A) ---
    # Interdire une nouvelle simulation si la zone est déjà en crise (Alerte ou Pompe active)
    active_incident = db.session.execute(
        text("""
            SELECT 1 FROM ALERTE WHERE zone_id = :z AND resolue = FALSE
            UNION
            SELECT 1 FROM POMPE WHERE zone_id = :z AND statut = 'ACTIVE'
            LIMIT 1
        """),
        {"z": zone_id}
    ).fetchone()

    if active_incident:
        return jsonify({
            "success": False,
            "error": "Zone déjà en incident actif. Lancez une décrue ou attendez la normalisation avant une nouvelle simulation."
        }), 409

    # --- Step 1: Try Stored Procedure ---
    try:
        db.session.execute(
            text("CALL sp_simuler_orage(:zone_id, :intensite)"),
            {"zone_id": zone_id, "intensite": intensite}
        )
        db.session.commit()
    except Exception as sp_err:
        db.session.rollback()
        mode = "fallback"
        
        # --- Step 2: Fallback Logic ---
        # Get sensors for the zone
        capteurs = db.session.execute(
            text("SELECT capteur_id, type_capteur FROM CAPTEUR WHERE zone_id = :z"),
            {"z": zone_id}
        ).fetchall()

        if not capteurs:
            return jsonify({
                "success": False,
                "error": f"Aucun capteur trouvé pour la zone {zone_id}. Vérifiez la base de données."
            }), 404

        unit_map = {
            "NIVEAU_EAU": "m",
            "DEBIT": "L/s",
            "PRESSION": "bar",
            "TEMPERATURE": "°C"
        }

        for cap in capteurs:
            c_id = cap[0]
            c_type = cap[1]
            unite = unit_map.get(c_type, "mm/h")
            valeur = intensite * 1.5  # Forced above threshold for testing

            db.session.execute(
                text("""
                    INSERT INTO MESURE (capteur_id, valeur, unite, date_heure, anomalie)
                    VALUES (:cid, :val, :unit, NOW(), TRUE)
                """),
                {"cid": c_id, "val": valeur, "unit": unite}
            )
            mesures_count += 1
        
        db.session.commit()

    duree_ms = int((datetime.utcnow() - t_start).total_seconds() * 1000)

    # --- Step 3: Count results ---
    # Metrics since ts_before
    alertes_row = db.session.execute(
        text("SELECT COUNT(*) FROM ALERTE WHERE zone_id = :z AND date_heure >= :ts"),
        {"z": zone_id, "ts": ts_before}
    ).fetchone()

    pompes_row = db.session.execute(
        text("SELECT COUNT(*) FROM POMPE WHERE zone_id = :z AND statut = 'ACTIVE'"),
        {"z": zone_id}
    ).fetchone()

    # If mode was fallback, mesures_injectees is measured above. 
    # Otherwise, count from DB.
    if mode == "normal":
        mesures_row = db.session.execute(
            text("SELECT COUNT(*) FROM MESURE WHERE date_heure >= :ts AND capteur_id IN (SELECT capteur_id FROM CAPTEUR WHERE zone_id = :z)"),
            {"z": zone_id, "ts": ts_before}
        ).fetchone()
        mesures_injectees = mesures_row[0] if mesures_row else 0
    else:
        # We already counted them during insertion
        mesures_injectees = mesures_count

    alertes_generees = alertes_row[0] if alertes_row else 0
    pompes_activees  = pompes_row[0]  if pompes_row  else 0

    log1 = LogActivite(
        user_id=int(get_jwt_identity()),
        action="SIMULATION_ORAGE",
        table_cible="MESURE",
        valeur_apres=f"zone_id={zone_id}, mode={mode}, mesures={mesures_injectees}, alertes={alertes_generees}"
    )
    db.session.add(log1)
    db.session.commit()

    return jsonify({
        "success":           True,
        "mesures_injectees": mesures_injectees,
        "alertes_generees":  alertes_generees,
        "pompes_activees":   pompes_activees,
        "duree_ms":          duree_ms,
        "mode":              mode,
        "zone_id":           zone_id
    }), 200


@simulation_bp.route("/cheminement", methods=["POST"])
@jwt_required()
@require_role("ADMIN", "OPERATEUR")
def simuler_cheminement():
    """
    POST /simulation/cheminement
    Body : { "zone_id": 1 }
    """
    data    = request.get_json(silent=True) or {}
    zone_id = data.get("zone_id")

    if zone_id is None:
        return jsonify({"error": "zone_id est requis"}), 400

    try:
        result = db.session.execute(
            text("CALL sp_simuler_cheminement_eau(:zone_id)"),
            {"zone_id": int(zone_id)}
        )
        row = result.fetchone()
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erreur lors de la simulation", "detail": str(e)}), 500

    log2 = LogActivite(
        user_id=int(get_jwt_identity()),
        action="SIMULATION_CHEMINEMENT",
        table_cible="RESEAU_DRAINAGE",
        valeur_apres=f"zone_id={zone_id}"
    )
    db.session.add(log2)
    db.session.commit()

    response = {"message": f"Simulation cheminement terminée — zone {zone_id}"}
    if row:
        response.update({
            "segments_analyses": row[0],
            "goulots_detectes":  row[1],
            "etat_reseau":       row[2],
            "date_simulation":   str(row[3]),
        })

    return jsonify(response), 200

@simulation_bp.route("/decrue", methods=["POST"])
@jwt_required()
@require_role("ADMIN", "OPERATEUR")
def simuler_decrue():
    """
    POST /simulation/decrue
    Body : { "zone_id": 1 }
    """
    data = request.get_json(silent=True) or {}
    zone_id = data.get("zone_id")

    if zone_id is None:
        return jsonify({"success": False, "error": "zone_id est requis"}), 400
    try:
        db.session.execute(
            text("CALL sp_simuler_decrue(:zone_id)"),
            {"zone_id": int(zone_id)}
        )
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": "Erreur lors de la décrue", "detail": str(e)}), 500

    return jsonify({"success": True, "message": f"Décrue simulée avec succès pour la zone {zone_id}"}), 200

@simulation_bp.route("/reset", methods=["POST"])
@jwt_required()
@require_role("ADMIN")
def reset_system():
    """
    POST /simulation/reset
    Remet le système dans un état clean pour la soutenance.
    """
    try:
        # 1. Faire redescendre les capteurs / mesures à une valeur saine
        # On lit les capteurs d'abord pour éviter l'erreur MySQL 1442 (Mutating Table)
        capteurs = db.session.execute(text("SELECT capteur_id, type_capteur FROM CAPTEUR")).fetchall()
        for c in capteurs:
            unite = 'mm/h'
            if c.type_capteur == 'NIVEAU_EAU': unite = 'cm'
            elif c.type_capteur == 'DEBIT': unite = 'L/s'
            elif c.type_capteur == 'PRESSION': unite = 'bar'
            elif c.type_capteur == 'TEMPERATURE': unite = '°C'
            
            db.session.execute(text("""
                INSERT INTO MESURE (capteur_id, valeur, unite, date_heure, anomalie, note) 
                VALUES (:cid, 0, :unite, NOW(), FALSE, 'RESET SYSTEM')
            """), {"cid": c.capteur_id, "unite": unite})
        
        # 2. Remettre les bouches à NORMAL avec un faible taux_remplissage
        db.session.execute(text("UPDATE BOUCHE_EGOUT SET taux_remplissage = 10, statut = 'NORMAL'"))
        
        # 3. Remettre les zones à FAIBLE
        db.session.execute(text("UPDATE ZONE SET niveau_risque = 'FAIBLE'"))
        
        # 4. Désactiver les pompes
        db.session.execute(text("UPDATE POMPE SET statut = 'INACTIVE', automatique = TRUE"))

        # 5. Résoudre les alertes (les triggers l'autorisent car la mesure est revenue à 0)
        db.session.execute(text("UPDATE ALERTE SET resolue = TRUE, date_resolution = NOW() WHERE resolue = FALSE"))
        
        # 6. Log systeme immuable
        log3 = LogActivite(
            user_id=int(get_jwt_identity()),
            action="RESET_SYSTEM",
            table_cible="SYSTEM",
            valeur_apres="Système complètement réinitialisé (Prêt pour simulation)."
        )
        db.session.add(log3)
        
        db.session.commit()
        return jsonify({"success": True, "message": "Système réinitialisé avec succès"}), 200
    except Exception as e:
        db.session.rollback()
        # On affiche l'erreur SQL réelle comme demandé (sans masquer)
        return jsonify({"success": False, "error": str(e)}), 500

