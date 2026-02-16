// src/pages/Dashboard.jsx
//
// Page principale du dashboard
//
// Ce que vous devez faire ici :
// 1. Importer useState et useEffect depuis 'react'
// 2. Importer les composants : AlertList, PumpList, SensorList
// 3. Importer apiClient depuis '../api/client'
//
// 4. Créer un composant Dashboard avec :
//
//    States :
//    - alerts (tableau vide par défaut)
//    - pumps (tableau vide)
//    - sensors (tableau vide)
//    - loading (true par défaut)
//    - error (null par défaut)
//
//    Fonction loadData() async :
//    - Mettre loading à true
//    - Utiliser Promise.all pour charger en parallèle :
//      * apiClient.getAlerts()
//      * apiClient.getPumps()
//      * apiClient.getSensors()
//    - Mettre à jour les states avec les résultats
//    - Gérer les erreurs avec try/catch
//    - Mettre loading à false à la fin
//
//    useEffect :
//    - Appeler loadData() au montage du composant
//
//    Handlers :
//    - handleAcknowledgeAlert(alertId) : appeler apiClient.acknowledgeAlert puis reload
//    - handleActivatePump(pumpId) : appeler apiClient.activatePump puis reload
//    - handleDeactivatePump(pumpId) : appeler apiClient.deactivatePump puis reload
//
//    Rendu :
//    - Si loading : afficher message "Chargement..."
//    - Si error : afficher erreur avec bouton Réessayer
//    - Sinon : afficher 3 sections :
//      * Section Alertes avec <AlertList>
//      * Section Pompes avec <PumpList>
//      * Section Capteurs avec <SensorList>
//
// 5. Exporter Dashboard par défaut
