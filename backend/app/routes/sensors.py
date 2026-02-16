# app/routes/sensors.py
#
# Ce fichier contient les routes API pour les capteurs
#
# Ce que vous devez faire ici :
# 1. Importer Blueprint, jsonify, request depuis flask
# 2. Importer SensorService depuis app.services.sensor_service
# 3. Créer un Blueprint : bp = Blueprint('sensors', __name__, url_prefix='/api/sensors')
#
# 4. Créer les routes suivantes :
#
#    GET /api/sensors
#    - Appeler SensorService.get_all_sensors()
#    - Exécute : SELECT * FROM sensors ORDER BY location
#    - Retourner JSON avec la liste des capteurs
#
#    GET /api/sensors/<int:sensor_id>
#    - Appeler SensorService.get_sensor_by_id(sensor_id)
#    - Exécute : SELECT * FROM sensors WHERE id=%s
#    - Retourner 404 si non trouvé
#
#    GET /api/sensors/<int:sensor_id>/readings?limit=100
#    - Récupérer le paramètre limit avec request.args.get('limit', 100)
#    - Appeler SensorService.get_sensor_readings(sensor_id, limit)
#    - Exécute : SELECT * FROM sensor_readings WHERE sensor_id=%s ORDER BY recorded_at DESC LIMIT %s
#    - Retourner JSON avec les lectures
