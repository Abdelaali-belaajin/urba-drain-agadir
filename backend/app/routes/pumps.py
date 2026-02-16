# app/routes/pumps.py
#
# Ce fichier contient les routes API pour les pompes
#
# Ce que vous devez faire ici :
# 1. Importer Blueprint, jsonify, request depuis flask
# 2. Importer PumpService depuis app.services.pump_service
# 3. Créer un Blueprint : bp = Blueprint('pumps', __name__, url_prefix='/api/pumps')
#
# 4. Créer les routes suivantes :
#
#    GET /api/pumps
#    - Appeler PumpService.get_all_pumps()
#    - Retourner JSON avec {success: True, data: pumps}
#
#    GET /api/pumps/<int:pump_id>
#    - Appeler PumpService.get_pump_by_id(pump_id)
#    - Retourner 404 si non trouvé
#
#    POST /api/pumps/<int:pump_id>/activate
#    - Appeler PumpService.activate_pump(pump_id)
#    - Exécute : UPDATE pumps SET status='ACTIVE', last_activated_at=NOW() WHERE id=%s
#    - Retourner message de succès
#
#    POST /api/pumps/<int:pump_id>/deactivate
#    - Appeler PumpService.deactivate_pump(pump_id)
#    - Exécute : UPDATE pumps SET status='INACTIVE' WHERE id=%s
#    - Retourner message de succès
