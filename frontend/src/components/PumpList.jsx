// src/components/PumpList.jsx
//
// Composant pour afficher la liste des pompes
//
// Ce que vous devez faire ici :
// 1. Importer PropTypes depuis 'prop-types'
//
// 2. Créer un composant PumpList avec props :
//    - pumps : tableau des pompes
//    - onActivate : fonction callback pour activer
//    - onDeactivate : fonction callback pour désactiver
//
// 3. Si pumps.length === 0 : afficher "Aucune pompe enregistrée"
//
// 4. Sinon, mapper pumps et afficher pour chaque pompe :
//    - <div className="pump-item">
//      * Header : nom + badge status
//      * Info : location + capacité (m³/h)
//      * Actions :
//        - Si status='INACTIVE' : bouton Activer
//        - Si status='ACTIVE' : bouton Désactiver
//
// 5. Définir PropTypes :
//    PumpList.propTypes = {
//      pumps: PropTypes.array.isRequired,
//      onActivate: PropTypes.func.isRequired,
//      onDeactivate: PropTypes.func.isRequired
//    }
//
// 6. Exporter PumpList par défaut
