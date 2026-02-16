# app/services/alert_service.py
#
# Ce fichier contient la logique métier pour les alertes
#
# Ce que vous devez faire ici :
# 1. Importer execute_query depuis app.db
# 2. Créer une classe AlertService avec des méthodes statiques (@staticmethod)
#
# 3. Méthodes à implémenter :
#
#    get_all_alerts() :
#    - Requête SQL : SELECT * FROM alerts ORDER BY created_at DESC
#    - Utiliser execute_query(query)
#    - Retourner la liste des alertes
#
#    get_alert_by_id(alert_id) :
#    - Requête SQL : SELECT * FROM alerts WHERE id = %s
#    - Utiliser execute_query(query, (alert_id,), fetch_one=True, fetch_all=False)
#    - Retourner une seule alerte ou None
#
#    create_alert(data) :
#    - Requête SQL : INSERT INTO alerts (sensor_id, alert_type, severity, message, threshold_value, current_value) VALUES (%s, %s, %s, %s, %s, %s)
#    - Extraire les données du dict data avec .get()
#    - Utiliser execute_query(query, params, commit=True)
#    - Retourner l'ID de l'alerte créée
#
#    acknowledge_alert(alert_id) :
#    - Requête SQL : UPDATE alerts SET status='ACKNOWLEDGED', acknowledged_at=NOW() WHERE id=%s
#    - Utiliser execute_query(query, (alert_id,), commit=True)
#    - Retourner le nombre de lignes affectées
