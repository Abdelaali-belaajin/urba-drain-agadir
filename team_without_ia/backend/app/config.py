# app/config.py
"""
Configuration de l'application Flask
Différentes configurations pour développement, test et production
"""
import os
from dotenv import load_dotenv

# Charger les variables d'environnement depuis .env
load_dotenv()


class Config:
    """Configuration de base commune à tous les environnements"""
    
    # Clé secrète Flask (pour sessions, JWT, etc.)
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Configuration MySQL
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'drainage_surveillance')
    
    # Configuration CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')
    
    # Configuration JSON
    JSON_SORT_KEYS = False  # Ne pas trier les clés JSON
    JSONIFY_PRETTYPRINT_REGULAR = True  # JSON formaté en dev


class DevelopmentConfig(Config):
    """Configuration pour l'environnement de développement"""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """Configuration pour l'environnement de production"""
    DEBUG = False
    TESTING = False
    
    # En production, SECRET_KEY DOIT venir de l'environnement
    SECRET_KEY = os.getenv('SECRET_KEY')
    
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY must be set in production environment")


class TestingConfig(Config):
    """Configuration pour les tests"""
    TESTING = True
    DEBUG = True
    
    # Base de données de test séparée
    DB_NAME = os.getenv('DB_NAME_TEST', 'drainage_surveillance_test')


# Dictionnaire pour sélectionner la configuration
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}