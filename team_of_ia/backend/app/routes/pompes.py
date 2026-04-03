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
def get_pompes():
    """GET /pompes — accessible à tous les rôles authentifiés (LECTEUR+)"""
    return jsonify([p.to_dict() for p in Pompe.query.all()]), 200

@pompes_bp.route("/<int:pompe_id>/toggle", methods=["PUT"])
@jwt_required()
@require_min_role("TECHNICIEN")
def toggle_pompe(pompe_id):
    """PUT /pompes/<id>/toggle — TECHNICIEN+ uniquement"""
    pompe = Pompe.query.get_or_404(pompe_id)
    if pompe.statut in ("PANNE", "MAINTENANCE"):
        return jsonify({"error": f"Impossible de modifier une pompe en {pompe.statut}"}), 409
    ancien = pompe.statut
    if pompe.statut == "ACTIVE":
        # SECURITY RULE: Cannot turn OFF automatic pump if an alert is active on this zone
        if pompe.automatique and pompe.zone:
            unresolved_alertes = [a for a in pompe.zone.alertes if not a.resolue]
            if unresolved_alertes:
                return jsonify({"error": "Action bloquée : Une alerte est en cours sur cette zone. Désactivez le mode automatique pour forcer l'arrêt de la pompe."}), 409
                
        pompe.statut          = "INACTIVE"
        pompe.date_activation = None
    else:
        pompe.statut          = "ACTIVE"
        pompe.date_activation = datetime.utcnow()
    LogActivite.create(int(get_jwt_identity()), "TOGGLE_POMPE", "POMPE",
                       valeur_avant=ancien, valeur_apres=pompe.statut)
    db.session.commit()
    return jsonify(pompe.to_dict()), 200
@pompes_bp.route("/<int:pompe_id>/signaler", methods=["POST"])
@jwt_required()
@require_min_role("ADMIN")
def signaler_panne(pompe_id):
    """POST /pompes/<id>/signaler — ADMIN uniquement"""
    from app.models.utilisateur import Utilisateur
    from app.models.message import Message

    pompe = Pompe.query.get_or_404(pompe_id)
    user_id = int(get_jwt_identity())
    
    # 1. Trouver tous les techniciens actifs
    techniciens = Utilisateur.query.filter_by(role="TECHNICIEN", actif=True).all()
    
    if not techniciens:
        return jsonify({"message": "Aucun technicien disponible pour recevoir l'alerte"}), 404

    # 2. Créer un message pour chaque technicien
    zone_name = pompe.zone.quartier if pompe.zone else f"Zone {pompe.zone_id}"
    for t in techniciens:
        msg = Message(
            expediteur_id=user_id,
            destinataire_id=t.user_id,
            sujet=f"🔧 Panne urgente : {pompe.nom_pompe}",
            contenu=f"L'administrateur signale une panne critique sur la pompe {pompe.nom_pompe} située à {zone_name}. Intervention requise immédiatement."
        )
        db.session.add(msg)
    
    LogActivite.create(user_id, "SIGNALER_PANNE", "POMPE", valeur_apres=f"pompe_id={pompe_id}")
    db.session.commit()
    
    return jsonify({"message": f"Alerte envoyée à {len(techniciens)} technicien(s)"}), 200
