from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import db
from app.models.zone import Zone
from app.models.citoyen import Citoyen
from app.models.citoyen_alert_log import CitoyenAlertLog
from app.services import email_service
from app.middleware.rbac import require_role

citizen_alerts_bp = Blueprint("citizen_alerts", __name__)

@citizen_alerts_bp.route("/send-citizen-emails", methods=["POST"])
@jwt_required()
@require_role("ADMIN")
def manual_send_citizen_emails():
    """
    POST /alerts/send-citizen-emails
    Force l'envoi d'emails aux citoyens d'une zone (Manuellement).
    Input: { "zone_id": 1 }
    """
    data = request.get_json(silent=True) or {}
    zone_id = data.get("zone_id")

    if not zone_id:
        return jsonify({"success": False, "error": "zone_id est requis"}), 400

    zone = Zone.query.get(zone_id)
    if not zone:
        return jsonify({"success": False, "error": "Zone non trouvée"}), 404

    # RÈGLE MÉTIER STRICTE : Uniquement si CRITIQUE ou ELEVE
    if zone.niveau_risque not in ("CRITIQUE", "ELEVE"):
        return jsonify({
            "success": False, 
            "error": "Notification non autorisée : la zone n'est ni en état CRITIQUE ni en état ELEVE."
        }), 403

    # Pour un déclenchement manuel, on outrepasse la vérification anti-spam habituelle?
    
    citoyens = Citoyen.query.filter_by(zone_id=zone_id).all()
    if not citoyens:
        return jsonify({"success": False, "error": "Aucun citoyen trouvé pour cette zone"}), 404

    nb_envoyes = email_service.send_zone_alert_email(zone, citoyens)

    # On log quand même cette action manuelle
    new_log = CitoyenAlertLog(
        zone_id=zone_id,
        incident_token=f"MANUAL_{zone_id}_{email_service.datetime.utcnow().strftime('%Y-%m-%d_%H%M%S')}",
        nombre_envoyes=nb_envoyes
    )
    db.session.add(new_log)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": f"Emails envoyés avec succès à {nb_envoyes} citoyen(s)",
        "emails_sent": nb_envoyes
    }), 200
