# app/__init__.py
"""
Application Factory Flask
Crée et configure l'application Flask
"""
from flask import Flask, jsonify
from app.config import config
from app.extensions import init_extensions


def create_app(config_name='development'):
    """
    Factory pour créer l'application Flask
    
    Args:
        config_name (str): Nom de la configuration ('development', 'production', 'testing')
    
    Returns:
        Flask: Instance de l'application configurée
    """
    # Créer l'instance Flask
    app = Flask(__name__)
    
    # Charger la configuration
    app.config.from_object(config[config_name])
    
    # Initialiser les extensions (CORS, JWT, etc.)
    init_extensions(app)
    
    # Enregistrer les blueprints (routes)
    register_blueprints(app)
    
    # Enregistrer les gestionnaires d'erreurs
    register_error_handlers(app)
    
    # Route de test santé
    @app.route('/health', methods=['GET'])
    def health_check():
        """Endpoint de santé pour vérifier que l'API fonctionne"""
        return jsonify({
            'status': 'healthy',
            'message': 'API Drainage Urbain Agadir - Service opérationnel'
        }), 200
    
    return app


def register_blueprints(app):
    # Importer et enregistrer les routes
    from app.routes.zones import bp as zones_bp
    from app.routes.capteurs import bp as capteurs_bp
    from app.routes.pompes import bp as pompes_bp
    
    app.register_blueprint(zones_bp, url_prefix='/api/zones')
    app.register_blueprint(capteurs_bp, url_prefix='/api/capteurs')
    app.register_blueprint(pompes_bp, url_prefix='/api/pompes')


def register_error_handlers(app):
    """
    Enregistre les gestionnaires d'erreurs globaux
    
    Args:
        app (Flask): Instance de l'application
    """
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'error': 'Resource not found',
            'message': str(error)
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'error': 'Internal server error',
            'message': 'Une erreur est survenue sur le serveur'
        }), 500
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'error': 'Bad request',
            'message': str(error)
        }), 400