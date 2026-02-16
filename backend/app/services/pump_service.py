# app/services/pump_service.py
#
# Ce fichier contient la logique métier pour les pompes
#
# Ce que vous devez faire ici :
# 1. Importer execute_query depuis app.db
# 2. Créer une classe PumpService avec des méthodes statiques
#
# 3. Méthodes à implémenter :
#
#    get_all_pumps() :
#    - Requête SQL : SELECT * FROM pumps ORDER BY name
#    - Retourner la liste de toutes les pompes
#
#    get_pump_by_id(pump_id) :
#    - Requête SQL : SELECT * FROM pumps WHERE id = %s
#    - fetch_one=True pour retourner une seule pompe
#
#    activate_pump(pump_id) :
#    - Requête SQL : UPDATE pumps SET status='ACTIVE', last_activated_at=NOW() WHERE id=%s
#    - commit=True pour enregistrer les changements
#    - Retourner le nombre de lignes modifiées
#
#    deactivate_pump(pump_id) :
#    - Requête SQL : UPDATE pumps SET status='INACTIVE' WHERE id=%s
#    - commit=True
#    - Retourner le nombre de lignes modifiées
