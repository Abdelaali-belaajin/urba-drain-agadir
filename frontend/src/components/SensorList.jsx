// src/components/SensorList.jsx
//
// Composant pour afficher la liste des capteurs
//
// Ce que vous devez faire ici :
// 1. Importer PropTypes depuis 'prop-types'
//
// 2. Créer un composant SensorList avec props :
//    - sensors : tableau des capteurs
//
// 3. Si sensors.length === 0 : afficher "Aucun capteur enregistré"
//
// 4. Créer une fonction formatDate(dateString) qui :
//    - Retourne 'Jamais' si dateString est null
//    - Sinon retourne la date formatée en français
//
// 5. Mapper sensors et afficher pour chaque capteur :
//    - <div className="sensor-item">
//      * Header : nom + badge status
//      * Info :
//        - Location (avec icône)
//        - Type du capteur
//        - Dernière lecture (utiliser formatDate)
//
// 6. Définir PropTypes :
//    SensorList.propTypes = {
//      sensors: PropTypes.array.isRequired
//    }
//
// 7. Exporter SensorList par défaut
