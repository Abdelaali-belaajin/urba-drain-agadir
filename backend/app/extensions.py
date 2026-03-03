# app/extensions.py
#
# Ce fichier initialise les extensions Flask (ORM, migrations, CORS)
#
# Ce que vous devez faire ici :
# 1. Importer SQLAlchemy depuis flask_sqlalchemy
# 2. Importer Migrate depuis flask_migrate
# 3. Importer CORS depuis flask_cors
#
# 4. Créer les instances globales des extensions :
#    db = SQLAlchemy()      # Instance ORM pour gérer la base de données
#    migrate = Migrate()    # Instance pour les migrations de schéma
#    cors = CORS()          # Instance pour gérer les CORS
#
# 5. Ces instances seront initialisées dans __init__.py avec app.init_app()
#
# Note: Ce pattern permet d'éviter les imports circulaires
# en créant les instances avant de les attacher à l'application