from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import text
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

    Appelle sp_simuler_orage(zone_id, intensite_mm_h).
    QA-04 : 500 alertes en < 5s pour intensite >= 60 mm/h.
    """
    data      = request.get_json(silent=True) or {}
    zone_id   = data.get("zone_id")
    intensite = data.get("intensite", 0)

    if zone_id is None:
        return jsonify({"error": "zone_id est requis"}), 400
    if not isinstance(intensite, (int, float)) or intensite < 0:
        return jsonify({"error": "intensite doit être un nombre positif (mm/h)"}), 400

    try:
        # Paramètres préparés — jamais de f-string SQL
        result = db.session.execute(
            text("CALL sp_simuler_orage(:zone_id, :intensite)"),
            {"zone_id": int(zone_id), "intensite": float(intensite)}
        )
        # Récupérer le résultat de la procédure (SELECT final)
        row = result.fetchone()
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erreur lors de la simulation", "detail": str(e)}), 500

    LogActivite.create(
        get_jwt_identity(), "SIMULATION_ORAGE", "MESURE",
        valeur_apres=f"zone_id={zone_id}, intensite={intensite} mm/h"
    )
    db.session.commit()

    # Construire la réponse depuis le résultat de la SP
    response = {
        "message":          f"Simulation orage terminée — zone {zone_id}, intensité {intensite} mm/h",
        "zone_simulee":     zone_id,
        "intensite_mm_h":   intensite,
    }
    if row:
        keys = result.keys() if hasattr(result, "keys") else []
        response.update(dict(zip(keys, row)) if keys else {})

    return jsonify(response), 200


@simulation_bp.route("/cheminement", methods=["POST"])
@jwt_required()
@require_role("ADMIN", "OPERATEUR")
def simuler_cheminement():
    """
    POST /simulation/cheminement
    Body : { "zone_id": 1 }

    Appelle sp_simuler_cheminement_eau(zone_id).
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

    LogActivite.create(
        get_jwt_identity(), "SIMULATION_CHEMINEMENT", "RESEAU_DRAINAGE",
        valeur_apres=f"zone_id={zone_id}"
    )
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
