from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.middleware.rbac import require_role
from db import db
from sqlalchemy import text

logs_bp = Blueprint("logs", __name__)

@logs_bp.route("", methods=["GET"])
@jwt_required()
@require_role("ADMIN")
def get_logs():
    """
    GET /logs — Journal activité, lecture seule (ADMIN)
    Récupère les logs depuis la nouvelle table sécurisée LOG_SYSTEM.
    """
    limit  = min(request.args.get("limit", 100, type=int), 500)
    offset = request.args.get("offset", 0, type=int)

    sql = "SELECT id, action, description, user_id, role, ip_address, created_at FROM LOG_SYSTEM ORDER BY created_at DESC LIMIT :l OFFSET :o"
    res = db.session.execute(text(sql), {"l": limit, "o": offset}).fetchall()
    
    data = []
    for r in res:
        data.append({
            "log_id": r[0],
            "action": r[1],
            "details": r[2],
            "utilisateur_id": r[3],
            "role": r[4],
            "ip_address": r[5],
            "date_action": r[6].isoformat() if r[6] else None
        })
    
    return jsonify(data), 200


# ── QA-06 : Bloquer toute modification de LOG_ACTIVITE ──────────────────────
@logs_bp.route("", methods=["PUT", "PATCH", "DELETE"])
@logs_bp.route("/<int:log_id>", methods=["PUT", "PATCH", "DELETE"])
def block_write_logs(log_id=None):
    """LOG_ACTIVITE est INSERT ONLY — toute modification est interdite."""
    return jsonify({
        "error": "LOG_ACTIVITE est en INSERT ONLY. Les modifications sont interdites."
    }), 403
