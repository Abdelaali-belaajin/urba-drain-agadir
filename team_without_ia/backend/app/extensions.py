# app/extensions.py
"""
Initialisation des extensions Flask
CORS, JWT, etc.
"""
from flask_cors import CORS


def init_extensions(app):
    """
    Initialise toutes les extensions Flask
    
    Args:
        app (Flask): Instance de l'application
    """
    # Initialiser CORS pour permettre les requêtes depuis React
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config['CORS_ORIGINS'],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    