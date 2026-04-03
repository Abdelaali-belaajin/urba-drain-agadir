from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import db
from app.models.utilisateur import Utilisateur, ROLES
from app.models.log_activite import LogActivite
from app.middleware.rbac import require_role

users_bp = Blueprint("users", __name__)


@users_bp.route("", methods=["GET"])
@jwt_required()
@require_role("ADMIN")
def get_users():
    return jsonify([u.to_dict() for u in Utilisateur.query.all()]), 200


@users_bp.route("", methods=["POST"])
@jwt_required()
@require_role("ADMIN")
def create_user():
    data     = request.get_json(silent=True) or {}
    nom      = data.get("nom", "").strip()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role     = data.get("role", "LECTEUR").upper()

    if not nom or not email or not password:
        return jsonify({"error": "nom, email et password sont requis"}), 400
    if role not in ROLES:
        return jsonify({"error": f"Rôle invalide. Valeurs : {ROLES}"}), 400
    if len(password) < 8:
        return jsonify({"error": "Mot de passe trop court (min 8 caractères)"}), 400
    if Utilisateur.query.filter_by(email=email).first():
        return jsonify({"error": "Email déjà utilisé"}), 409

    user = Utilisateur(nom=nom, email=email, role=role)
    user.set_password(password)
    db.session.add(user)
    LogActivite.create(int(get_jwt_identity()), "CREATE_USER", "UTILISATEUR",
                       valeur_apres=f"email={email}, role={role}")
    db.session.commit()
    return jsonify(user.to_dict()), 201


@users_bp.route("/<int:user_id>", methods=["PUT"])
@jwt_required()
@require_role("ADMIN")
def update_user(user_id):
    user = Utilisateur.query.get_or_404(user_id)
    data = request.get_json(silent=True) or {}

    if "nom" in data:
        user.nom = data["nom"].strip()
    if "email" in data:
        email    = data["email"].strip().lower()
        existing = Utilisateur.query.filter_by(email=email).first()
        if existing and existing.user_id != user_id:
            return jsonify({"error": "Email déjà utilisé"}), 409
        user.email = email
    if "role" in data:
        role = data["role"].upper()
        if role not in ROLES:
            return jsonify({"error": f"Rôle invalide : {ROLES}"}), 400
        user.role = role

    LogActivite.create(int(get_jwt_identity()), "UPDATE_USER", "UTILISATEUR",
                       valeur_apres=f"user_id={user_id}")
    db.session.commit()
    return jsonify(user.to_dict()), 200


@users_bp.route("/<int:user_id>/toggle", methods=["PATCH"])
@jwt_required()
@require_role("ADMIN")
def toggle_user(user_id):
    admin_id = int(get_jwt_identity())
    if user_id == admin_id:
        return jsonify({"error": "Impossible de se désactiver soi-même"}), 403
    user       = Utilisateur.query.get_or_404(user_id)
    user.actif = not user.actif
    action     = "ACTIVATE_USER" if user.actif else "DEACTIVATE_USER"
    LogActivite.create(admin_id, action, "UTILISATEUR",
                       valeur_apres=f"user_id={user_id}")
    db.session.commit()
    return jsonify(user.to_dict()), 200


@users_bp.route("/<int:user_id>", methods=["DELETE"])
@jwt_required()
@require_role("ADMIN")
def delete_user(user_id):
    admin_id = int(get_jwt_identity())
    if user_id == admin_id:
        return jsonify({"error": "Impossible de supprimer son propre compte"}), 403
    user = Utilisateur.query.get_or_404(user_id)
    if user.role == "ADMIN":
        return jsonify({"error": "Impossible de supprimer un compte ADMIN"}), 403
    LogActivite.create(admin_id, "DELETE_USER", "UTILISATEUR",
                       valeur_avant=f"email={user.email}, role={user.role}")
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"Utilisateur {user.email} supprimé"}), 200
