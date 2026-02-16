# app/__init__.py
# 
# Ce fichier contient la factory Flask pour créer l'application
#
# Ce que vous devez faire ici :
# 1. Importer Flask et CORS
# 2. Importer la configuration depuis config.py
# 3. Créer une fonction create_app() qui :
#    - Crée une instance Flask
#    - Configure l'app avec Config
#    - Active CORS pour permettre les requêtes du frontend
#    - Importe et enregistre les blueprints (alerts, pumps, sensors)
#    - Retourne l'app configurée
#
# Example structure:
# def create_app():
#     app = Flask(__name__)
#     # Configuration...
#     # blueprints...
#     return app
