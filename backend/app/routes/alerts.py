# app/routes/alerts.py
#
# Ce fichier contient les routes API pour les alertes
#
# Ce que vous devez faire ici :
# 1. Importer Blueprint, jsonify, request depuis flask
# 2. Importer AlertService depuis app.services.alert_service
# 3. Créer un Blueprint : bp = Blueprint('alerts', __name__, url_prefix='/api/alerts')
#
# 4. Créer les routes suivantes :
#
#    GET /api/alerts (route: @bp.route('', methods=['GET']))
#    - Appeler AlertService.get_all_alerts()
#    - Retourner JSON avec {success: True, data: alerts}
#    - Gérer les erreurs avec try/except
#
#    GET /api/alerts/<int:alert_id>
#    - Appeler AlertService.get_alert_by_id(alert_id)
#    - Retourner 404 si non trouvé
#    - Retourner JSON avec l'alerte
#
#    POST /api/alerts
#    - Récupérer les données avec request.get_json()
#    - Appeler AlertService.create_alert(data)
#    - Retourner 201 avec l'ID créé
#
#    PUT /api/alerts/<int:alert_id>/acknowledge
#    - Appeler AlertService.acknowledge_alert(alert_id)
#    - Retourner 404 si 0 lignes affectées
#    - Retourner message de succès
