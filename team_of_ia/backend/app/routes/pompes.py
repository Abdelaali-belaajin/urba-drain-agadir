from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from db import db
from app.models.pompe import Pompe
from app.models.log_activite import LogActivite
from app.middleware.rbac import require_min_role

pompes_bp = Blueprint("pompes", __name__)

@pompes_bp.route("", methods=["GET"])
@jwt_required()
@require_min_role("OPERATEUR")
def get_pompes():
    return jsonify([p.to_dict() for p in Pompe.query.all()]), 200

@pompes_bp.route("/<int:pompe_id>/toggle", methods=["PUT"])
@jwt_required()
@require_min_role("OPERATEUR")
def toggle_pompe(pompe_id):
    pompe = Pompe.query.get_or_404(pompe_id)
    if pompe.statut in ("PANNE", "MAINTENANCE"):
        return jsonify({"error": f"Impossible de modifier une pompe en {pompe.statut}"}), 409
    ancien = pompe.statut
    if pompe.statut == "ACTIVE":
        pompe.statut          = "INACTIVE"
        pompe.date_activation = None
    else:
        pompe.statut          = "ACTIVE"
        pompe.date_activation = datetime.utcnow()
    LogActivite.create(get_jwt_identity(), f"TOGGLE_POMPE",  "POMPE",
                       valeur_avant=ancien, valeur_apres=pompe.statut)
    db.session.commit()
    return jsonify(pompe.to_dict()), 200
