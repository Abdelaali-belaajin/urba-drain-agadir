# app/config.py
#
# Ce fichier contient la configuration de l'application Flask avec ORM
#
# Ce que vous devez faire ici :
# 1. Importer os pour accéder aux variables d'environnement
# 2. Créer une classe Config avec les attributs suivants :
#
#    Configuration Base de Données :
#    - DB_HOST : hôte MySQL (défaut: localhost)
#    - DB_PORT : port MySQL (défaut: 3306)
#    - DB_USER : utilisateur MySQL (défaut: root)
#    - DB_PASSWORD : mot de passe MySQL
#    - DB_NAME : nom de la base (défaut: urba_drain)
#
#    Configuration SQLAlchemy :
#    - SQLALCHEMY_DATABASE_URI : construire l'URI de connexion
#      Format : mysql+pymysql://user:password@host:port/database
#      Exemple : f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
#    
#    - SQLALCHEMY_TRACK_MODIFICATIONS : mettre à False (économise mémoire)
#    - SQLALCHEMY_ECHO : True en debug pour voir les requêtes SQL
#
#    Configuration Flask :
#    - SECRET_KEY : clé secrète Flask
#    - DEBUG : mode debug (défaut: True)
#
# Utiliser os.getenv() pour lire depuis les variables d'environnement
