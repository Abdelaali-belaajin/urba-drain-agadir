# backend/tests/test_api.py
#
# Tests unitaires pour l'API
#
# Ce que vous devez faire ici :
# 1. Importer pytest
# 2. Importer create_app depuis app
#
# 3. Créer des fixtures pytest :
#    @pytest.fixture
#    def app() : créer l'app Flask en mode test
#
#    @pytest.fixture
#    def client(app) : créer un test client
#
# 4. Créer une classe TestAPI avec des méthodes de test :
#    - test_get_alerts(client) : tester GET /api/alerts
#    - test_get_pumps(client) : tester GET /api/pumps
#    - test_get_sensors(client) : tester GET /api/sensors
#    - test_activate_pump(client) : tester POST /api/pumps/1/activate
#    - test_acknowledge_alert(client) : tester PUT /api/alerts/1/acknowledge
#
# 5. Utiliser assert pour vérifier :
#    - response.status_code
#    - response.json['success']
#    - response.json['data']
#
# Pour lancer les tests : pytest


