# app/db.py
#
# FICHIER OBSOLÈTE avec l'architecture ORM
#
# Ce fichier n'est plus nécessaire car SQLAlchemy gère la connexion.
# L'objet db est maintenant défini dans app/extensions.py
#
# Si vous souhaitez garder ce fichier pour compatibilité :
# - Vous pouvez créer des fonctions utilitaires pour des requêtes SQL brutes
# - Utiliser db.session.execute() depuis extensions.py
#
# Exemple d'utilisation avec ORM :
# from app.extensions import db
# from app.models import Sensor
# 
# # Créer
# sensor = Sensor(name='Capteur 1', type='LEVEL')
# db.session.add(sensor)
# db.session.commit()
#
# # Lire
# sensors = Sensor.query.all()
# sensor = Sensor.query.get(1)
# sensors = Sensor.query.filter_by(status='ACTIVE').all()
#
# # Mettre à jour
# sensor.status = 'INACTIVE'
# db.session.commit()
#
# # Supprimer
# db.session.delete(sensor)
# db.session.commit()
