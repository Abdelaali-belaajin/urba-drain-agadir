# app/config.py
#
# Ce fichier contient la configuration de l'application Flask
#
# Ce que vous devez faire ici :
# 1. Importer os pour accéder aux variables d'environnement
# 2. Créer une classe Config avec les attributs suivants :
#    - DB_HOST : hôte MySQL (défaut: localhost)
#    - DB_PORT : port MySQL (défaut: 3306)
#    - DB_USER : utilisateur MySQL (défaut: root)
#    - DB_PASSWORD : mot de passe MySQL
#    - DB_NAME : nom de la base (défaut: urba_drain)
#    - SECRET_KEY : clé secrète Flask
#    - DEBUG : mode debug (défaut: True)
#
# Utiliser os.getenv() pour lire depuis les variables d'environnement
# avec des valeurs par défaut
