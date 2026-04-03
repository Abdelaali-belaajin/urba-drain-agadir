from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.models.zone import Zone
from app.middleware.rbac import require_min_role

zones_bp = Blueprint("zones", __name__)

@zones_bp.route("", methods=["GET"])
@jwt_required()
@require_min_role("LECTEUR")
def get_zones():
    return jsonify([z.to_dict() for z in Zone.query.all()]), 200

@zones_bp.route("/<int:zone_id>", methods=["GET"])
@jwt_required()
@require_min_role("LECTEUR")
def get_zone(zone_id):
    return jsonify(Zone.query.get_or_404(zone_id).to_dict()), 200
