# app/services/sensor_service.py
#
# Ce fichier contient la logique métier pour les capteurs
#
# Ce que vous devez faire ici :
# 1. Importer execute_query depuis app.db
# 2. Créer une classe SensorService avec des méthodes statiques
#
# 3. Méthodes à implémenter :
#
#    get_all_sensors() :
#    - Requête SQL : SELECT * FROM sensors ORDER BY location
#    - Retourner tous les capteurs triés par localisation
#
#    get_sensor_by_id(sensor_id) :
#    - Requête SQL : SELECT * FROM sensors WHERE id = %s
#    - fetch_one=True pour un seul capteur
#
#    get_sensor_readings(sensor_id, limit=100) :
#    - Requête SQL : SELECT * FROM sensor_readings WHERE sensor_id=%s ORDER BY recorded_at DESC LIMIT %s
#    - Paramètres : (sensor_id, limit)
#    - Retourner les dernières lectures du capteur
#    - limit par défaut = 100
