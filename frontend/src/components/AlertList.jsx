// src/components/AlertList.jsx
//
// Composant pour afficher la liste des alertes
//
// Ce que vous devez faire ici :
// 1. Importer PropTypes depuis 'prop-types'
//
// 2. Créer un composant AlertList avec props :
//    - alerts : tableau des alertes
//    - onAcknowledge : fonction callback pour acquitter
//
// 3. Si alerts.length === 0 : afficher "Aucune alerte active"
//
// 4. Sinon, créer une fonction formatDate(dateString) pour formater les dates
//
// 5. Mapper alerts et afficher pour chaque alerte :
//    - <div className="alert-item {alert.severity}">
//      * Header : sévérité + statut
//      * Message
//      * Footer : type, date création + bouton Acquitter si status='ACTIVE'
//
// 6. Définir PropTypes :
//    AlertList.propTypes = {
//      alerts: PropTypes.array.isRequired,
//      onAcknowledge: PropTypes.func.isRequired
//    }
//
// 7. Exporter AlertList par défaut
