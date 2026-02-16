# Cahier de Recette et Assurance Qualité

## 📋 Tests Backend

### 1. Connexion Base de Données
- [ ] Connexion MySQL réussie
- [ ] Gestion des erreurs de connexion
- [ ] Fermeture correcte des connexions

### 2. API Endpoints

#### Alertes
- [ ] GET /api/alerts - Liste toutes les alertes
- [ ] GET /api/alerts/:id - Récupération alerte spécifique
- [ ] PUT /api/alerts/:id/acknowledge - Acquittement alerte
- [ ] Gestion erreur 404 si alerte inexistante

#### Pompes
- [ ] GET /api/pumps - Liste toutes les pompes
- [ ] POST /api/pumps/:id/activate - Activation pompe
- [ ] POST /api/pumps/:id/deactivate - Désactivation pompe
- [ ] Validation statut pompe avant action

#### Capteurs
- [ ] GET /api/sensors - Liste tous les capteurs
- [ ] GET /api/sensors/:id/readings - Lectures capteur
- [ ] Limite de résultats respectée

### 3. Triggers MySQL
- [ ] Trigger création alerte niveau critique
- [ ] Trigger mise à jour last_reading_at
- [ ] Trigger enregistrement opérations pompes

### 4. Procédures Stockées
- [ ] sp_auto_activate_pumps fonctionne correctement
- [ ] sp_system_status_report retourne données valides

## 🖥️ Tests Frontend

### 1. Interface Dashboard
- [ ] Chargement données au démarrage
- [ ] Affichage correct des alertes
- [ ] Affichage correct des pompes
- [ ] Affichage correct des capteurs
- [ ] Gestion état de chargement
- [ ] Gestion des erreurs

### 2. Interactions Utilisateur
- [ ] Bouton "Acquitter" alerte fonctionne
- [ ] Bouton "Activer" pompe fonctionne
- [ ] Bouton "Désactiver" pompe fonctionne
- [ ] Rafraîchissement données après action

### 3. Responsive Design
- [ ] Affichage correct sur desktop
- [ ] Affichage correct sur tablette
- [ ] Affichage correct sur mobile

## 🔒 Sécurité (À Implémenter)

### À Ajouter en Production
- [ ] Authentification utilisateurs
- [ ] Validation des entrées
- [ ] Protection CSRF
- [ ] Rate limiting
- [ ] Logging des actions
- [ ] Chiffrement des données sensibles

## ⚡ Performance

### Métriques Attendues
- [ ] Temps de réponse API < 200ms
- [ ] Chargement page < 2s
- [ ] Pas de requêtes N+1
- [ ] Index sur colonnes fréquemment requêtées

## 🧪 Scénarios de Test

### Scénario 1 : Niveau Critique
1. Insérer lecture capteur > 2.5m
2. Vérifier création alerte automatique
3. Vérifier affichage dans dashboard
4. Acquitter l'alerte
5. Vérifier changement de statut

### Scénario 2 : Activation Pompe
1. Pompe avec statut INACTIVE
2. Cliquer sur "Activer"
3. Vérifier changement statut vers ACTIVE
4. Vérifier enregistrement dans pump_operations
5. Désactiver la pompe
6. Vérifier retour à INACTIVE

### Scénario 3 : Procédure Automatique
1. Insérer lectures élevées zone "Centre-Ville"
2. Exécuter sp_auto_activate_pumps
3. Vérifier activation pompes de la zone
4. Vérifier logs opérations

## ✅ Critères d'Acceptation

- ✅ Toutes les tables créées correctement
- ✅ 3 triggers fonctionnels
- ✅ 2 procédures stockées opérationnelles
- ✅ API retourne données JSON valides
- ✅ Frontend communique avec backend
- ✅ Interface utilisateur intuitive
- ✅ Données de test chargées

## 📊 Rapport de Tests

### Date : _______________
### Testeur : _______________

| Test | Statut | Commentaires |
|------|--------|--------------|
| Connexion DB | ⬜ | |
| API Alerts | ⬜ | |
| API Pumps | ⬜ | |
| API Sensors | ⬜ | |
| Triggers | ⬜ | |
| Procédures | ⬜ | |
| Dashboard | ⬜ | |
| Responsive | ⬜ | |

**Légende** : ✅ Validé | ❌ Échec | ⬜ Non testé

---

**Version**: 1.0  
**Date**: Février 2026
