from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.log_activite import LogActivite
from app.middleware.rbac import require_role

logs_bp = Blueprint("logs", __name__)


@logs_bp.route("", methods=["GET"])
@jwt_required()
@require_role("ADMIN")
def get_logs():
    """
    GET /logs — Journal activité, lecture seule (ADMIN)
    QA-06 : PUT/DELETE sur cette table sont bloqués ci-dessous.

    Params : ?user_id=<int>  ?limit=<int>  ?offset=<int>
    """
    user_id_filter = request.args.get("user_id", type=int)
    limit          = min(request.args.get("limit", 100, type=int), 500)
    offset         = request.args.get("offset", 0, type=int)

    q = LogActivite.query.order_by(LogActivite.date_heure.desc())
    if user_id_filter:
        q = q.filter_by(user_id=user_id_filter)

    return jsonify([l.to_dict() for l in q.limit(limit).offset(offset).all()]), 200


# ── QA-06 : Bloquer toute modification de LOG_ACTIVITE ──────────────────────
@logs_bp.route("", methods=["PUT", "PATCH", "DELETE"])
@logs_bp.route("/<int:log_id>", methods=["PUT", "PATCH", "DELETE"])
def block_write_logs(log_id=None):
    """LOG_ACTIVITE est INSERT ONLY — toute modification est interdite."""
    return jsonify({
        "error": "LOG_ACTIVITE est en INSERT ONLY. Les modifications sont interdites."
    }), 403
