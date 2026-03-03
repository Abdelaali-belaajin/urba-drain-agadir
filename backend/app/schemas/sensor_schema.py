# app/schemas/sensor_schema.py
#
# Schémas de validation et sérialisation pour Sensor (optionnel avec Marshmallow)
#
# Ce que vous devez faire ici :
# 1. Si vous utilisez Marshmallow pour la validation :
#    - Importer Schema, fields depuis marshmallow
#    - Créer SensorSchema(Schema) avec les champs :
#      * id, name, type, location, latitude, longitude
#      * status, installed_at, last_reading_at
#    - Méthodes : dump() pour sérialiser, load() pour valider
#
# 2. Alternative sans Marshmallow :
#    - Utiliser directement la méthode to_dict() des modèles
#    - Valider manuellement les données dans les services
#
# 3. Avantages de Marshmallow :
#    - Validation automatique des types
#    - Sérialisation/désérialisation cohérente
#    - Documentation automatique des schemas