from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.models.capteur import Capteur
from app.middleware.rbac import require_min_role

capteurs_bp = Blueprint("capteurs", __name__)

@capteurs_bp.route("", methods=["GET"])
@jwt_required()
@require_min_role("TECHNICIEN")
def get_capteurs():
    """GET /capteurs — liste capteurs + dernière mesure (TECHNICIEN+)"""
    return jsonify([c.to_dict(with_last_mesure=True) for c in Capteur.query.all()]), 200
