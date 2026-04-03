from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.models.utilisateur import Utilisateur

ROLE_HIERARCHY = {"LECTEUR": 1, "TECHNICIEN": 2, "OPERATEUR": 3, "ADMIN": 4}

def require_role(*roles):
    """Accepte uniquement les rôles listés."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = Utilisateur.query.get(int(get_jwt_identity()))
            if not user or not user.actif:
                return jsonify({"error": "Compte introuvable ou désactivé"}), 401
            if user.role not in roles:
                return jsonify({"error": "Accès refusé", "required": list(roles), "your_role": user.role}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def require_min_role(min_role: str):
    """Accepte tout rôle >= min_role dans la hiérarchie."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = Utilisateur.query.get(int(get_jwt_identity()))
            if not user or not user.actif:
                return jsonify({"error": "Compte introuvable ou désactivé"}), 401
            if ROLE_HIERARCHY.get(user.role, 0) < ROLE_HIERARCHY.get(min_role, 99):
                return jsonify({"error": "Accès refusé", "required_min": min_role, "your_role": user.role}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator
