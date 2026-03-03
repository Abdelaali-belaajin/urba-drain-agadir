# app/schemas/alert_schema.py
#
# Schémas de validation pour Alert (optionnel)
#
# Ce que vous devez faire ici :
# 1. Créer AlertSchema si vous utilisez Marshmallow
# 2. Définir les règles de validation pour :
#    - sensor_id (requis si présent)
#    - alert_type (enum valide)
#    - severity (enum valide)
#    - message (requis, min 10 caractères)
#    - threshold_value et current_value (numériques)