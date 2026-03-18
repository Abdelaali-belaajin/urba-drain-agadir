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
@require_min_role("OPERATEUR")
def get_alertes():
    q = Alerte.query
    r = request.args.get("resolue")
    if r is not None:
        q = q.filter_by(resolue=(r.lower() == "true"))
    return jsonify([a.to_dict() for a in q.order_by(Alerte.date_heure.desc()).all()]), 200

@alertes_bp.route("/<int:alerte_id>/resoudre", methods=["PUT"])
@jwt_required()
@require_min_role("OPERATEUR")
def resoudre_alerte(alerte_id):
    alerte = Alerte.query.get_or_404(alerte_id)
    if alerte.resolue:
        return jsonify({"error": "Alerte déjà résolue"}), 409
    alerte.resolue         = True
    alerte.date_resolution = datetime.utcnow()
    LogActivite.create(get_jwt_identity(), "RESOUDRE_ALERTE", "ALERTE",
                       valeur_apres=f"alerte_id={alerte_id}")
    db.session.commit()
    return jsonify(alerte.to_dict()), 200
