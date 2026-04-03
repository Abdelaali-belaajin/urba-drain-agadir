from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from db import db
from app.models.alerte import Alerte
from app.models.log_activite import LogActivite
from app.middleware.rbac import require_min_role

alertes_bp = Blueprint("alertes", __name__)

@alertes_bp.route("", methods=["GET"])
@jwt_required()
def get_alertes():
    """GET /alertes — accessible à tous les rôles authentifiés (LECTEUR+)"""
    q = Alerte.query
    r = request.args.get("resolue")
    if r is not None:
        q = q.filter_by(resolue=(r.lower() == "true"))
    return jsonify([a.to_dict() for a in q.order_by(Alerte.date_heure.desc()).all()]), 200

@alertes_bp.route("/<int:alerte_id>/resoudre", methods=["PUT"])
@jwt_required()
@require_min_role("TECHNICIEN")
def resoudre_alerte(alerte_id):
    """PUT /alertes/<id>/resoudre — TECHNICIEN+ uniquement"""
    alerte = Alerte.query.get_or_404(alerte_id)
    if alerte.resolue:
        return jsonify({"error": "Alerte déjà résolue"}), 409
    
    # SECURITY RULE: Cannot resolve if the capteur's physical value is still CRITIQUE
    from app.models.mesure import Mesure
    dernier_mesure = Mesure.query.filter_by(capteur_id=alerte.capteur_id).order_by(Mesure.date_heure.desc()).first()
    if dernier_mesure and alerte.capteur and dernier_mesure.valeur >= alerte.capteur.seuil_critique:
        return jsonify({"error": "Action bloquée : Le niveau d'eau physique (détecté par le capteur) est toujours CRITIQUE. Vous devez initier une décrue ou attendre l'évacuation avant de clôturer l'alerte."}), 409

    alerte.resolue         = True
    alerte.date_resolution = datetime.utcnow()
    LogActivite.create(int(get_jwt_identity()), "RESOUDRE_ALERTE", "ALERTE",
                       valeur_apres=f"alerte_id={alerte_id}")
    db.session.commit()
    return jsonify(alerte.to_dict()), 200
