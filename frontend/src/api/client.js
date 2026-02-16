// src/api/client.js
//
// Client API pour communiquer avec le backend Flask
//
// Ce que vous devez faire ici :
// 1. Définir API_BASE_URL = '/api'
//
// 2. Créer une classe ApiClient avec :
//
//    Méthode request(endpoint, options) :
//    - Construire l'URL complète : API_BASE_URL + endpoint
//    - Ajouter les headers : Content-Type: application/json
//    - Utiliser fetch() pour faire la requête
//    - Parser la réponse en JSON
//    - Gérer les erreurs HTTP
//    - Retourner les données
//
//    Méthodes pour les alertes :
//    - getAlerts() : GET /alerts
//    - getAlert(id) : GET /alerts/:id
//    - acknowledgeAlert(id) : PUT /alerts/:id/acknowledge
//
//    Méthodes pour les pompes :
//    - getPumps() : GET /pumps
//    - getPump(id) : GET /pumps/:id
//    - activatePump(id) : POST /pumps/:id/activate
//    - deactivatePump(id) : POST /pumps/:id/deactivate
//
//    Méthodes pour les capteurs :
//    - getSensors() : GET /sensors
//    - getSensor(id) : GET /sensors/:id
//    - getSensorReadings(id, limit) : GET /sensors/:id/readings?limit=X
//
// 3. Exporter une instance : export default new ApiClient()
