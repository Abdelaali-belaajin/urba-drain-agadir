from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
from db import db
from app.models.utilisateur import Utilisateur
from app.models.log_activite import LogActivite

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data     = request.get_json(silent=True) or {}
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")
    if not email or not password:
        return jsonify({"error": "Email et mot de passe requis"}), 400
    user = Utilisateur.query.filter_by(email=email).first()
    if not user or not user.actif or not user.check_password(password):
        return jsonify({"error": "Identifiants invalides"}), 401
    user.derniere_connexion = datetime.utcnow()
    token = create_access_token(identity=user.user_id)
    LogActivite.create(user.user_id, "LOGIN", "UTILISATEUR",
                       ip=request.remote_addr)
    db.session.commit()
    return jsonify({"access_token": token, "user": user.to_dict()}), 200

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    user_id = get_jwt_identity()
    LogActivite.create(user_id, "LOGOUT", "UTILISATEUR",
                       ip=request.remote_addr)
    db.session.commit()
    return jsonify({"message": "Déconnecté"}), 200

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    user = Utilisateur.query.get_or_404(get_jwt_identity())
    return jsonify(user.to_dict()), 200

@auth_bp.route("/me", methods=["PUT"])
@jwt_required()
def update_me():
    user_id = get_jwt_identity()
    user    = Utilisateur.query.get_or_404(user_id)
    data    = request.get_json(silent=True) or {}
    if "nom" in data:
        user.nom = data["nom"].strip()
    if "email" in data:
        email = data["email"].strip().lower()
        existing = Utilisateur.query.filter_by(email=email).first()
        if existing and existing.user_id != user_id:
            return jsonify({"error": "Email déjà utilisé"}), 409
        user.email = email
    LogActivite.create(user_id, "UPDATE_PROFIL", "UTILISATEUR")
    db.session.commit()
    return jsonify(user.to_dict()), 200

@auth_bp.route("/password", methods=["PUT"])
@jwt_required()
def change_password():
    user_id  = get_jwt_identity()
    user     = Utilisateur.query.get_or_404(user_id)
    data     = request.get_json(silent=True) or {}
    current  = data.get("current_password", "")
    new_pass = data.get("new_password", "")
    if not current or not new_pass:
        return jsonify({"error": "Mot de passe actuel et nouveau requis"}), 400
    if len(new_pass) < 8:
        return jsonify({"error": "Minimum 8 caractères"}), 400
    if not user.check_password(current):
        return jsonify({"error": "Mot de passe actuel incorrect"}), 401
    user.set_password(new_pass)
    LogActivite.create(user_id, "CHANGE_PASSWORD", "UTILISATEUR")
    db.session.commit()
    return jsonify({"message": "Mot de passe mis à jour"}), 200
