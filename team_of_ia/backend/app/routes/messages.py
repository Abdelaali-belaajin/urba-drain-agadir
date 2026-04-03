from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import db
from app.models.message import Message
from app.models.utilisateur import Utilisateur

messages_bp = Blueprint("messages", __name__)

@messages_bp.route("", methods=["GET"])
@jwt_required()
def get_messages():
    """GET /messages — lire mes messages reçus"""
    user_id = int(get_jwt_identity())
    messages = Message.query.filter_by(destinataire_id=user_id).order_by(Message.date_envoi.desc()).all()
    return jsonify([m.to_dict() for m in messages]), 200

@messages_bp.route("", methods=["POST"])
@jwt_required()
def send_message():
    """POST /messages — envoyer un message"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data or not all(k in data for k in ("destinataire_id", "sujet", "contenu")):
        return jsonify({"error": "Données manquantes (destinataire_id, sujet, contenu)"}), 400
        
    nouveau_message = Message(
        expediteur_id=user_id,
        destinataire_id=data["destinataire_id"],
        sujet=data["sujet"],
        contenu=data["contenu"]
    )
    db.session.add(nouveau_message)
    db.session.commit()
    
    return jsonify(nouveau_message.to_dict()), 201

@messages_bp.route("/<int:message_id>/lire", methods=["PUT"])
@jwt_required()
def lire_message(message_id):
    """PUT /messages/<id>/lire — marquer comme lu"""
    user_id = int(get_jwt_identity())
    message = Message.query.get_or_404(message_id)
    
    if message.destinataire_id != user_id:
        return jsonify({"error": "Non autorisé"}), 403
        
    message.lu = True
    db.session.commit()
    
    return jsonify(message.to_dict()), 200

@messages_bp.route("/users", methods=["GET"])
@jwt_required()
def get_message_users():
    """GET /messages/users — lister les utilisateurs pour nouveau message"""
    users = Utilisateur.query.filter_by(actif=True).all()
    return jsonify([{"user_id": u.user_id, "nom": u.nom, "role": u.role} for u in users]), 200

