# app/__init__.py
# 
# Ce fichier contient la factory Flask pour créer l'application (MVC + ORM)
#
# Ce que vous devez faire ici :
# 1. Importer Flask
# 2. Importer la configuration depuis config.py
# 3. Importer les extensions depuis extensions.py : db, migrate, cors
#
# 4. Créer une fonction create_app() qui :
#    - Crée une instance Flask
#    - Configure l'app avec Config
#    - Initialise les extensions :
#      * db.init_app(app)
#      * migrate.init_app(app, db)
#      * cors.init_app(app)
#    
#    - Importer les modèles pour que Flask-Migrate les détecte :
#      from app import models
#    
#    - Importer et enregistrer les blueprints depuis controllers/ :
#      from app.controllers import alerts, pumps, sensors
#      app.register_blueprint(alerts.bp)
#      app.register_blueprint(pumps.bp)
#      app.register_blueprint(sensors.bp)
#    
#    - Retourne l'app configurée
#
# Pattern Factory avec ORM pour éviter les imports circulaires
