# Guide de Développement Frontend - Système de Gestion du Réseau Pluvial Urbain

## Vue d'ensemble

Ce dossier contient l'interface utilisateur de l'application de gestion du réseau pluvial urbain d'Agadir. L'application frontend communique avec l'API backend Flask pour afficher en temps réel les données des capteurs, gérer les pompes et visualiser les alertes.

## Pile Technologique Requise

### Technologies Obligatoires

- **React.js** : Version 18.x ou supérieure - Bibliothèque JavaScript pour construire l'interface utilisateur
- **Vite** : Outil de build et serveur de développement rapide
- **JavaScript ES6+** : ou TypeScript si vous préférez un typage fort

### Technologies Recommandées (Optionnelles)

Vous êtes libres d'utiliser les bibliothèques suivantes selon vos besoins :

**Gestion d'État**
- **Redux Toolkit** : Gestion d'état globale complexe
- **Zustand** : Alternative plus simple à Redux
- **React Context API** : Gestion d'état native React (suffisant pour projets moyens)
- **React Query (TanStack Query)** : Cache et synchronisation des données serveur

**Routing**
- **React Router v6** : Navigation entre les pages

**Interface Utilisateur**
- **Material-UI (MUI)** : Composants UI prêts à l'emploi
- **Ant Design** : Bibliothèque de composants riche
- **Tailwind CSS** : Framework CSS utility-first
- **Styled Components** : CSS-in-JS
- **SASS/SCSS** : Préprocesseur CSS

**Visualisation de Données**
- **Recharts** : Graphiques React simples et personnalisables
- **Chart.js + react-chartjs-2** : Graphiques interactifs
- **D3.js** : Visualisations de données avancées
- **ApexCharts** : Graphiques modernes et responsives

**Cartes Interactives**
- **Leaflet + react-leaflet** : Cartes interactives open-source
- **Google Maps API** : Cartes Google
- **Mapbox** : Cartes personnalisables

**Gestion des Formulaires**
- **React Hook Form** : Gestion performante des formulaires
- **Formik** : Alternative populaire
- **Yup** : Validation de schémas

**Communication Temps Réel**
- **Socket.IO Client** : WebSocket pour notifications en temps réel
- **Server-Sent Events (SSE)** : Alternative plus simple

**Utilitaires**
- **Axios** : Client HTTP (alternative à fetch)
- **date-fns** ou **day.js** : Manipulation de dates
- **lodash** : Fonctions utilitaires JavaScript
- **React Icons** : Icônes vectorielles

**Tests**
- **Vitest** : Framework de tests (recommandé avec Vite)
- **React Testing Library** : Tests de composants
- **Jest** : Alternative à Vitest
- **Cypress** : Tests end-to-end

## Architecture de l'Application

L'application frontend doit permettre aux utilisateurs de :

1. **S'authentifier** et gérer leur profil
2. **Visualiser en temps réel** l'état du réseau de drainage
3. **Consulter** les données des capteurs avec graphiques historiques
4. **Gérer les pompes** (activation, désactivation selon les droits)
5. **Gérer les alertes** (acquittement, résolution)
6. **Administrer** le système (utilisateurs, zones, configuration)

## Structure de Projet Suggérée

Vous êtes libres d'organiser votre code comme vous le souhaitez, mais voici une structure recommandée pour un projet React bien organisé :

```
frontend/
├── public/
│   ├── favicon.ico
│   ├── logo.png
│   └── assets/              # Images, icônes statiques
│
├── src/
│   ├── main.jsx             # Point d'entrée de l'application
│   ├── App.jsx              # Composant racine
│   ├── App.css              # Styles globaux
│   │
│   ├── assets/              # Ressources (images, fonts, etc.)
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │
│   ├── components/          # Composants réutilisables
│   │   ├── common/          # Composants génériques
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── Notification.jsx
│   │   │
│   │   ├── layout/          # Composants de mise en page
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── MainLayout.jsx
│   │   │
│   │   ├── capteurs/        # Composants spécifiques aux capteurs
│   │   │   ├── CapteurCard.jsx
│   │   │   ├── CapteurList.jsx
│   │   │   ├── CapteurDetail.jsx
│   │   │   ├── CapteurForm.jsx
│   │   │   └── CapteurChart.jsx
│   │   │
│   │   ├── pompes/          # Composants pompes
│   │   │   ├── PompeCard.jsx
│   │   │   ├── PompeList.jsx
│   │   │   ├── PompeDetail.jsx
│   │   │   ├── PompeControls.jsx
│   │   │   └── PompeHistorique.jsx
│   │   │
│   │   ├── alertes/         # Composants alertes
│   │   │   ├── AlerteCard.jsx
│   │   │   ├── AlerteList.jsx
│   │   │   ├── AlerteDetail.jsx
│   │   │   ├── AlerteBadge.jsx
│   │   │   └── AlerteFilter.jsx
│   │   │
│   │   ├── zones/           # Composants zones
│   │   │   ├── ZoneCard.jsx
│   │   │   ├── ZoneMap.jsx
│   │   │   ├── ZoneDetail.jsx
│   │   │   └── ZoneForm.jsx
│   │   │
│   │   └── charts/          # Composants graphiques
│   │       ├── LineChart.jsx
│   │       ├── BarChart.jsx
│   │       ├── PieChart.jsx
│   │       └── RealtimeChart.jsx
│   │
│   ├── pages/               # Pages/Vues principales
│   │   ├── Dashboard.jsx    # Tableau de bord principal
│   │   ├── Login.jsx        # Page de connexion
│   │   ├── Register.jsx     # Inscription (si applicable)
│   │   │
│   │   ├── zones/
│   │   │   ├── ZonesPage.jsx
│   │   │   └── ZoneDetailPage.jsx
│   │   │
│   │   ├── capteurs/
│   │   │   ├── CapteursPage.jsx
│   │   │   └── CapteurDetailPage.jsx
│   │   │
│   │   ├── pompes/
│   │   │   ├── PompesPage.jsx
│   │   │   └── PompeDetailPage.jsx
│   │   │
│   │   ├── alertes/
│   │   │   ├── AlertesPage.jsx
│   │   │   └── AlerteDetailPage.jsx
│   │   │
│   │   ├── rapports/
│   │   │   ├── RapportsPage.jsx
│   │   │   └── RapportDetailPage.jsx
│   │   │
│   │   ├── admin/
│   │   │   ├── UsersPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── SystemConfigPage.jsx
│   │   │
│   │   ├── NotFound.jsx     # Page 404
│   │   └── Unauthorized.jsx # Page 403
│   │
│   ├── services/            # Services API
│   │   ├── api.js           # Configuration Axios/Fetch
│   │   ├── authService.js   # Authentification
│   │   ├── zoneService.js   # API zones
│   │   ├── capteurService.js # API capteurs
│   │   ├── lectureService.js # API lectures
│   │   ├── pompeService.js  # API pompes
│   │   ├── alerteService.js # API alertes
│   │   └── userService.js   # API utilisateurs
│   │
│   ├── hooks/               # Custom Hooks React
│   │   ├── useAuth.js       # Hook authentification
│   │   ├── useCapteurs.js   # Hook récupération capteurs
│   │   ├── usePompes.js     # Hook pompes
│   │   ├── useAlertes.js    # Hook alertes
│   │   ├── useWebSocket.js  # Hook WebSocket temps réel
│   │   └── usePermissions.js # Hook vérification permissions
│   │
│   ├── context/             # React Context (si utilisé)
│   │   ├── AuthContext.jsx  # Context authentification
│   │   ├── ThemeContext.jsx # Context thème (dark/light)
│   │   └── NotificationContext.jsx # Context notifications
│   │
│   ├── store/               # Redux/Zustand (si utilisé)
│   │   ├── index.js         # Configuration du store
│   │   ├── slices/          # Redux slices
│   │   │   ├── authSlice.js
│   │   │   ├── capteurSlice.js
│   │   │   ├── pompeSlice.js
│   │   │   └── alerteSlice.js
│   │   └── actions/         # Actions async
│   │
│   ├── utils/               # Fonctions utilitaires
│   │   ├── constants.js     # Constantes (API URLs, enum, etc.)
│   │   ├── helpers.js       # Fonctions helpers génériques
│   │   ├── validators.js    # Validations personnalisées
│   │   ├── formatters.js    # Formatage dates, nombres, etc.
│   │   └── permissions.js   # Logique de permissions
│   │
│   ├── routes/              # Configuration des routes
│   │   ├── index.jsx        # Définition des routes
│   │   ├── PrivateRoute.jsx # Route protégée (auth)
│   │   └── RoleRoute.jsx    # Route par rôle
│   │
│   └── styles/              # Styles globaux
│       ├── index.css        # Styles principaux
│       ├── variables.css    # Variables CSS
│       └── themes.css       # Thèmes (dark/light)
│
├── .env                     # Variables d'environnement (NE PAS COMMITER)
├── .env.example             # Exemple de configuration
├── .gitignore               # Fichiers à ignorer
├── index.html               # Page HTML principale
├── package.json             # Dépendances npm
├── vite.config.js           # Configuration Vite
└── README.md                # Ce fichier
```

## Installation et Configuration

### Étape 1 : Installation des Dépendances

Le fichier `package.json` contient les dépendances de base. Vous pouvez ajouter d'autres bibliothèques selon vos besoins.

```bash
npm install
```

Si vous ajoutez de nouvelles dépendances :

```bash
npm install nom-du-package
```

### Étape 2 : Variables d'Environnement

Créez un fichier `.env` à la racine du dossier frontend :

```env
# URL de l'API backend
VITE_API_BASE_URL=http://localhost:5000/api

# Clé API Google Maps (si utilisé)
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here

# Clé API Mapbox (si utilisé)
VITE_MAPBOX_ACCESS_TOKEN=your_token_here

# WebSocket URL (si utilisé)
VITE_WS_URL=ws://localhost:5000

# Mode développement
VITE_ENV=development
```

Important : Dans Vite, les variables d'environnement doivent commencer par `VITE_` pour être accessibles dans le code.

### Étape 3 : Lancement de l'Application

```bash
npm run dev
```

L'application devrait démarrer sur `http://localhost:5173` (par défaut avec Vite).

### Étape 4 : Build de Production

```bash
npm run build
```

Les fichiers optimisés seront générés dans le dossier `dist/`.

### Étape 5 : Prévisualisation du Build

```bash
npm run preview
```

## Fonctionnalités à Implémenter

### 1. Authentification

Page de connexion avec gestion de session :

**Fonctionnalités requises :**
- Formulaire de connexion (email/username + mot de passe)
- Stockage sécurisé du token JWT (localStorage ou sessionStorage)
- Déconnexion avec suppression du token
- Redirection automatique si non authentifié
- Affichage du profil utilisateur connecté

**Considérations :**
- Rafraîchissement automatique du token avant expiration
- Gestion de la déconnexion automatique après expiration
- Protection des routes selon l'authentification

```jsx
// Exemple de structure
const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Identifiants invalides');
    }
  };

  return (
    // Formulaire de connexion
  );
};
```

### 2. Dashboard Principal

Vue d'ensemble du système avec indicateurs clés :

**Sections à afficher :**

a) **Statistiques Globales** (en haut de page)
- Nombre total de capteurs (avec nombre actifs/inactifs)
- Nombre total de pompes (avec nombre actives/en panne)
- Nombre d'alertes actives (par sévérité)
- Zones à risque élevé

b) **Carte Interactive**
- Affichage des zones sur une carte (Leaflet ou Google Maps)
- Marqueurs pour capteurs et pompes avec codes couleur :
  - Vert : Fonctionnel/Normal
  - Orange : Attention/Avertissement
  - Rouge : Critique/Panne
- Clic sur marqueur → affichage popup avec détails
- Filtrage par type (capteurs/pompes/alertes)

c) **Alertes Récentes**
- Liste des 10 dernières alertes actives
- Badge de sévérité (INFO, AVERTISSEMENT, CRITIQUE, URGENCE)
- Bouton d'action rapide (acquitter)
- Lien vers détails de l'alerte

d) **Graphiques Temps Réel**
- Graphique linéaire : Niveaux d'eau des capteurs critiques (dernières 24h)
- Graphique en barres : Activité des pompes par zone
- Graphique circulaire : Distribution des alertes par type

e) **Activité Récente**
- Timeline des dernières opérations (pompes activées, alertes résolues)
- Mise à jour automatique (polling ou WebSocket)

**Rafraîchissement des données :**
- Polling toutes les 30 secondes pour les données critiques
- WebSocket pour notifications en temps réel (optionnel mais recommandé)
- Indicateur de dernière mise à jour

### 3. Gestion des Zones

Page listant toutes les zones du réseau de drainage :

**Vue Liste :**
- Tableau ou grille de cartes affichant :
  - Nom de la zone
  - Superficie et population
  - Niveau de risque (badge coloré)
  - Nombre de capteurs actifs
  - Nombre de pompes actives
  - Actions : Voir détails, Modifier (ADMIN)

**Filtres et Tri :**
- Filtrer par niveau de risque
- Recherche par nom
- Tri par nom, superficie, niveau de risque

**Page Détail Zone :**
- Informations générales (nom, coordonnées GPS, superficie, population)
- Carte de la zone avec capteurs et pompes
- Liste des capteurs de la zone (tableau)
- Liste des pompes de la zone (tableau)
- Historique des alertes de la zone (graphique)
- Statistiques : nombre d'alertes 30 derniers jours, temps total activation pompes

**Formulaire (ADMIN uniquement) :**
- Créer nouvelle zone
- Modifier zone existante
- Validation des champs (nom unique, superficie > 0, etc.)

### 4. Gestion des Capteurs

Page listant tous les capteurs avec possibilité de filtrage :

**Vue Liste :**
- Tableau avec colonnes :
  - Référence (ex: CAP-TL-001)
  - Type (Niveau/Débit/Pression)
  - Zone d'appartenance
  - Statut (badge coloré : Actif/Inactif/Maintenance/Défaillant)
  - Dernière lecture (valeur + horodatage)
  - Niveau de batterie (barre de progression)
  - Actions : Détails, Modifier, Maintenance

**Filtres :**
- Par zone
- Par type de capteur
- Par statut
- Recherche par référence

**Vue Carte :**
- Affichage des capteurs sur carte
- Clusters pour zones denses
- Code couleur selon statut

**Page Détail Capteur :**
- Informations techniques (référence, type, localisation, coordonnées GPS)
- Statut actuel et seuils (alerte, critique)
- Dernière lecture avec horodatage
- Graphique des lectures (dernières 24h, 7j, 30j)
  - Ligne pour la valeur
  - Ligne horizontale pour seuil d'alerte
  - Ligne horizontale pour seuil critique
  - Zone rouge si dépassement
- Historique des lectures (tableau paginé)
- Historique de maintenance
- Détection d'anomalies (lectures marquées comme anormales)

**Graphique Temps Réel :**
- Mise à jour automatique avec nouvelles lectures
- Possibilité de zoomer sur période
- Export des données (CSV, PNG)

**Actions (selon rôle) :**
- TECHNICIEN/ADMIN : Enregistrer maintenance
- ADMIN : Modifier paramètres (seuils, localisation)

### 5. Gestion des Pompes

Page listant toutes les pompes avec contrôles d'activation :

**Vue Liste :**
- Cartes affichant pour chaque pompe :
  - Nom et référence
  - Zone d'appartenance
  - Capacité (m³/h)
  - Statut (Active/Inactive/Maintenance/Panne)
  - Mode d'activation (Manuel/Automatique/Planifié)
  - Heures de fonctionnement
  - Dernière activation
  - Boutons d'action : Activer/Désactiver (selon rôle), Détails

**Contrôles (OPERATEUR/ADMIN uniquement) :**
- Toggle switch pour activation/désactivation
- Confirmation avant action
- Impossibilité d'activer pompe en mode AUTOMATIQUE manuellement
- Affichage du mode actuel et possibilité de le changer

**Indicateurs Visuels :**
- Badge vert si pompe active
- Badge gris si inactive
- Badge orange si maintenance
- Badge rouge si panne
- Avertissement si heures fonctionnement > 500h (maintenance requise)

**Page Détail Pompe :**
- Informations techniques (référence, nom, capacité, localisation)
- Statut et mode actuel
- Statistiques :
  - Total heures de fonctionnement
  - Nombre d'activations (7 derniers jours, 30 jours)
  - Temps moyen d'activation
- Graphique : Activité de la pompe (temps actif par jour)
- Historique des opérations (tableau paginé) :
  - Type opération (Activation/Désactivation/Maintenance)
  - Déclencheur (Manuel/Automatique/Alerte)
  - Utilisateur (si manuel)
  - Horodatage
  - Remarques
- Alertes liées à cette pompe

**Actions :**
- OPERATEUR/ADMIN : Activer/Désactiver, Changer mode
- TECHNICIEN : Enregistrer maintenance
- ADMIN : Modifier paramètres

### 6. Gestion des Alertes

Page centrale pour gérer toutes les alertes système :

**Vue Liste :**
- Tableau avec colonnes :
  - Sévérité (badge coloré : INFO/AVERTISSEMENT/CRITIQUE/URGENCE)
  - Type (Niveau Élevé/Panne Capteur/Panne Pompe/Maintenance)
  - Titre
  - Zone concernée
  - Date de création
  - Statut (Active/Acquittée/Résolue/Ignorée)
  - Actions : Détails, Acquitter, Résoudre

**Filtres :**
- Par statut (onglets : Actives / Toutes)
- Par sévérité (checkboxes)
- Par type
- Par zone
- Par plage de dates

**Tri :**
- Par sévérité (URGENCE en premier)
- Par date (les plus récentes)

**Code Couleur :**
- Rouge : URGENCE
- Orange foncé : CRITIQUE
- Orange clair : AVERTISSEMENT
- Bleu : INFO

**Actions Rapides (OPERATEUR/ADMIN) :**
- Bouton "Acquitter" sur alertes non acquittées
- Bouton "Résoudre" sur alertes acquittées (avec formulaire pour actions prises)
- Notification visuelle/sonore pour nouvelles alertes CRITIQUES/URGENCE

**Page Détail Alerte :**
- Informations complètes :
  - Type, sévérité, statut
  - Titre et message détaillé
  - Zone, capteur, pompe concernés (liens cliquables)
  - Horodatages (création, acquittement, résolution)
  - Utilisateur ayant acquitté/résolu
  - Actions prises (si renseignées)
- Timeline de l'alerte (créée → acquittée → résolue)
- Données contextuelles :
  - Si alerte niveau : graphique des lectures du capteur
  - Si alerte pompe : historique des opérations
- Opérations pompes déclenchées par cette alerte

**Formulaire de Résolution :**
- Champ texte obligatoire : "Actions entreprises"
- Bouton "Marquer comme résolue"
- Validation : alertes CRITIQUE doivent être acquittées avant résolution

**Notifications Temps Réel :**
- Badge de notification (nombre d'alertes actives)
- Toast/Snackbar pour nouvelles alertes CRITIQUES
- Son d'alerte (optionnel, désactivable)
- Notification navigateur (si permission accordée)

### 7. Gestion des Utilisateurs (ADMIN uniquement)

Page d'administration des comptes utilisateurs :

**Vue Liste :**
- Tableau :
  - Nom d'utilisateur
  - Email
  - Nom complet
  - Rôle (badge coloré)
  - Statut (Actif/Inactif)
  - Dernière connexion
  - Actions : Modifier, Désactiver/Activer

**Filtres :**
- Par rôle
- Par statut (actif/inactif)
- Recherche par nom/email

**Formulaire Création/Modification :**
- Nom d'utilisateur (unique)
- Email (unique)
- Mot de passe (création seulement, avec confirmation)
- Nom, Prénom
- Rôle (sélecteur : ADMIN/OPERATEUR/TECHNICIEN/VIEWER)
- Téléphone
- Statut Actif/Inactif

**Validation :**
- Email valide
- Mot de passe fort (8+ caractères, majuscule, chiffre, caractère spécial)
- Nom d'utilisateur et email uniques

**Gestion des Rôles :**
- Affichage des permissions par rôle (info-bulle)
- Impossible de se retirer ses propres droits ADMIN
- Confirmation avant changement de rôle

### 8. Rapports et Statistiques

Page dédiée aux rapports système :

**Rapport de Statut Système :**
- Appel de l'API `/api/reports/system-status`
- Affichage des sections retournées par la procédure stockée :
  - Statistiques capteurs
  - Statistiques pompes
  - Alertes par sévérité
  - Zones à risque

**Rapport par Zone :**
- Sélection d'une zone
- Génération de rapport :
  - Nombre d'alertes (30 derniers jours)
  - Performance des capteurs (taux de disponibilité)
  - Activité des pompes (heures de fonctionnement)
  - Graphiques d'évolution

**Export de Données :**
- Export PDF des rapports
- Export CSV des tableaux de données
- Export PNG des graphiques

**Périodes Personnalisables :**
- Sélecteur de dates (du... au...)
- Presets : Dernières 24h, 7 jours, 30 jours, 90 jours

## Gestion de l'État

Vous avez plusieurs options pour gérer l'état de l'application :

### Option 1 : React Context API (Simple)

Pour applications moyennes, suffisant pour :
- État d'authentification
- Thème (dark/light)
- Notifications

```jsx
// AuthContext.jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('token', response.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### Option 2 : Redux Toolkit (Complexe)

Pour applications complexes avec beaucoup d'état partagé :
- Données de capteurs, pompes, alertes
- État de filtrage et tri
- Cache de données

```jsx
// capteurSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchCapteurs = createAsyncThunk(
  'capteurs/fetchAll',
  async () => {
    const response = await capteurService.getAll();
    return response.data;
  }
);

const capteurSlice = createSlice({
  name: 'capteurs',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCapteurs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCapteurs.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchCapteurs.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  },
});

export default capteurSlice.reducer;
```

### Option 3 : React Query (Recommandé pour API)

Gestion automatique du cache, refetch, et synchronisation serveur :

```jsx
// useCapteurs.js
import { useQuery } from '@tanstack/react-query';

export const useCapteurs = (filters = {}) => {
  return useQuery({
    queryKey: ['capteurs', filters],
    queryFn: () => capteurService.getAll(filters),
    refetchInterval: 30000, // Refetch toutes les 30s
    staleTime: 10000, // Données considérées fraîches pendant 10s
  });
};

// Dans un composant
const CapteursList = () => {
  const { data, isLoading, error } = useCapteurs({ statut: 'ACTIF' });

  if (isLoading) return <Loader />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {data.map(capteur => <CapteurCard key={capteur.id} capteur={capteur} />)}
    </div>
  );
};
```

## Communication avec l'API Backend

### Configuration Axios

Créez une instance Axios configurée :

```jsx
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré, rediriger vers login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Services API

Créez des services pour chaque ressource :

```jsx
// services/capteurService.js
import api from './api';

const capteurService = {
  getAll: (filters = {}) => {
    return api.get('/capteurs', { params: filters });
  },

  getById: (id) => {
    return api.get(`/capteurs/${id}`);
  },

  create: (data) => {
    return api.post('/capteurs', data);
  },

  update: (id, data) => {
    return api.put(`/capteurs/${id}`, data);
  },

  delete: (id) => {
    return api.delete(`/capteurs/${id}`);
  },

  getLectures: (id, params = {}) => {
    return api.get(`/capteurs/${id}/lectures`, { params });
  },

  getLatestLecture: (id) => {
    return api.get(`/capteurs/${id}/lectures/latest`);
  },
};

export default capteurService;
```

## Routing et Navigation

Utilisez React Router pour la navigation :

```jsx
// routes/index.jsx
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      
      {/* Routes protégées */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Dashboard />} />
        
        <Route path="/zones" element={<ZonesPage />} />
        <Route path="/zones/:id" element={<ZoneDetailPage />} />
        
        <Route path="/capteurs" element={<CapteursPage />} />
        <Route path="/capteurs/:id" element={<CapteurDetailPage />} />
        
        <Route path="/pompes" element={<PompesPage />} />
        <Route path="/pompes/:id" element={<PompeDetailPage />} />
        
        <Route path="/alertes" element={<AlertesPage />} />
        <Route path="/alertes/:id" element={<AlerteDetailPage />} />
        
        <Route path="/rapports" element={<RapportsPage />} />
        
        {/* Routes ADMIN uniquement */}
        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
```

### Route Protégée

```jsx
// routes/PrivateRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { token } = useAuth();
  
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
```

### Route par Rôle

```jsx
// routes/RoleRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  return allowedRoles.includes(user.role) 
    ? <Outlet /> 
    : <Navigate to="/unauthorized" replace />;
};

export default RoleRoute;
```

## Visualisation de Données

### Graphiques avec Recharts

Exemple de graphique linéaire pour lectures de capteurs :

```jsx
// components/charts/LineChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const CapteurLineChart = ({ data, seuilAlerte, seuilCritique }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="timestamp" 
          tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
        />
        <YAxis label={{ value: 'Niveau (cm)', angle: -90, position: 'insideLeft' }} />
        <Tooltip 
          labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
        />
        <Legend />
        
        {/* Ligne des lectures */}
        <Line 
          type="monotone" 
          dataKey="valeur" 
          stroke="#8884d8" 
          name="Niveau d'eau"
          dot={false}
        />
        
        {/* Seuils */}
        <ReferenceLine 
          y={seuilAlerte} 
          stroke="orange" 
          strokeDasharray="3 3" 
          label="Seuil Alerte"
        />
        <ReferenceLine 
          y={seuilCritique} 
          stroke="red" 
          strokeDasharray="3 3" 
          label="Seuil Critique"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CapteurLineChart;
```

### Cartes Interactives avec Leaflet

```jsx
// components/zones/ZoneMap.jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const ZoneMap = ({ zones, capteurs, pompes }) => {
  const center = [30.4278, -9.5981]; // Agadir

  return (
    <MapContainer center={center} zoom={12} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      
      {/* Marqueurs pour capteurs */}
      {capteurs.map(capteur => (
        <Marker 
          key={capteur.id} 
          position={[capteur.latitude, capteur.longitude]}
          icon={getIconByStatus(capteur.statut)}
        >
          <Popup>
            <strong>{capteur.reference}</strong><br />
            Statut: {capteur.statut}<br />
            Dernière lecture: {capteur.derniere_lecture} cm
          </Popup>
        </Marker>
      ))}
      
      {/* Marqueurs pour pompes */}
      {pompes.map(pompe => (
        <Marker 
          key={pompe.id} 
          position={[pompe.latitude, pompe.longitude]}
          icon={getPumpIcon(pompe.statut)}
        >
          <Popup>
            <strong>{pompe.nom}</strong><br />
            Statut: {pompe.statut}<br />
            Capacité: {pompe.capacite} m³/h
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default ZoneMap;
```

## Gestion des Permissions

Créez des composants et hooks pour gérer les permissions :

```jsx
// utils/permissions.js
export const PERMISSIONS = {
  ADMIN: ['ALL'],
  OPERATEUR: ['manage_pumps', 'acknowledge_alerts', 'view_data'],
  TECHNICIEN: ['maintenance', 'view_data'],
  VIEWER: ['view_data'],
};

export const hasPermission = (userRole, permission) => {
  const rolePermissions = PERMISSIONS[userRole] || [];
  return rolePermissions.includes('ALL') || rolePermissions.includes(permission);
};

// hooks/usePermissions.js
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils/permissions';

export const usePermissions = () => {
  const { user } = useAuth();
  
  return {
    canManagePumps: hasPermission(user?.role, 'manage_pumps'),
    canAcknowledgeAlerts: hasPermission(user?.role, 'acknowledge_alerts'),
    canDoMaintenance: hasPermission(user?.role, 'maintenance'),
    isAdmin: user?.role === 'ADMIN',
  };
};

// Composant pour affichage conditionnel
const PermissionGuard = ({ permission, children }) => {
  const { user } = useAuth();
  
  if (!hasPermission(user?.role, permission)) {
    return null;
  }
  
  return children;
};
```

## Gestion des Notifications

Créez un système de notifications (toast/snackbar) :

```jsx
// context/NotificationContext.jsx
import { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto-suppression après 5 secondes
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <NotificationContainer notifications={notifications} onClose={removeNotification} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

// Utilisation
const SomeComponent = () => {
  const { addNotification } = useNotification();
  
  const handleAction = async () => {
    try {
      await someAction();
      addNotification('Action effectuée avec succès', 'success');
    } catch (error) {
      addNotification('Une erreur est survenue', 'error');
    }
  };
};
```

## WebSocket pour Temps Réel (Optionnel)

Si vous souhaitez des mises à jour en temps réel :

```jsx
// hooks/useWebSocket.js
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const useWebSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_WS_URL, {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    newSocket.on('connect', () => {
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  return { socket, connected };
};

// Utilisation pour écouter les nouvelles alertes
const Dashboard = () => {
  const { socket } = useWebSocket();
  const { addNotification } = useNotification();
  
  useEffect(() => {
    if (!socket) return;
    
    socket.on('nouvelle_alerte', (alerte) => {
      addNotification(
        `Nouvelle alerte ${alerte.niveau_severite}: ${alerte.titre}`,
        'warning'
      );
      // Rafraîchir les données
    });
    
    return () => socket.off('nouvelle_alerte');
  }, [socket]);
};
```

## Responsive Design

Assurez-vous que l'application fonctionne sur tous les appareils :

- **Desktop** : Vue complète avec sidebar et graphiques
- **Tablette** : Sidebar repliable, graphiques adaptés
- **Mobile** : Menu hamburger, cartes empilées, graphiques simplifiés

Utilisez des media queries ou un framework CSS responsive.

## Tests

### Tests Unitaires avec Vitest

```jsx
// components/CapteurCard.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CapteurCard from './CapteurCard';

describe('CapteurCard', () => {
  it('affiche le statut du capteur', () => {
    const capteur = {
      id: 1,
      reference: 'CAP-001',
      statut: 'ACTIF',
      derniere_lecture: 25.5,
    };
    
    render(<CapteurCard capteur={capteur} />);
    
    expect(screen.getByText('CAP-001')).toBeInTheDocument();
    expect(screen.getByText('ACTIF')).toBeInTheDocument();
  });
});
```

### Tests E2E avec Cypress

```javascript
// cypress/e2e/login.cy.js
describe('Login', () => {
  it('permet à un utilisateur de se connecter', () => {
    cy.visit('/login');
    
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.contains('Tableau de bord').should('be.visible');
  });
});
```

## Performance

### Optimisations

1. **Code Splitting** : Utilisez `React.lazy()` pour charger les pages à la demande
   
   ```jsx
   const Dashboard = lazy(() => import('./pages/Dashboard'));
   ```

2. **Mémoïsation** : Utilisez `useMemo` et `useCallback` pour éviter re-renders inutiles

3. **Pagination** : Ne chargez pas toutes les données d'un coup, utilisez la pagination

4. **Debouncing** : Pour les recherches et filtres en temps réel

5. **Image Optimization** : Utilisez des formats modernes (WebP) et lazy loading

## Sécurité

- Validez toutes les entrées utilisateur
- Ne stockez jamais de données sensibles en clair
- Utilisez HTTPS en production
- Implémentez Content Security Policy (CSP)
- Sanitisez les données avant affichage (protection XSS)

## Déploiement

### Build de Production

```bash
npm run build
```

### Options d'Hébergement

- **Netlify** : Déploiement automatique depuis Git
- **Vercel** : Optimisé pour React/Vite
- **GitHub Pages** : Gratuit pour projets open-source
- **Serveur Apache/Nginx** : Configuration manuelle

### Configuration Nginx (exemple)

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    root /var/www/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Ressources et Documentation

### Documentation React
- React Docs : https://react.dev/
- React Router : https://reactrouter.com/

### Bibliothèques UI
- Material-UI : https://mui.com/
- Ant Design : https://ant.design/

### Visualisation
- Recharts : https://recharts.org/
- Leaflet : https://leafletjs.com/

### État et Requêtes
- Redux Toolkit : https://redux-toolkit.js.org/
- React Query : https://tanstack.com/query/latest

## Liberté de Développement

Ce guide fournit des recommandations et des exigences minimales, mais vous êtes encouragés à :

- Choisir votre bibliothèque UI préférée
- Implémenter des fonctionnalités bonus (dark mode, notifications push, etc.)
- Organiser le code selon vos préférences
- Ajouter des animations et transitions
- Utiliser TypeScript pour un typage fort
- Implémenter des patterns avancés (HOC, Render Props, etc.)

L'important est de respecter :
1. Les technologies imposées (React.js, Vite)
2. Les fonctionnalités requises (authentification, dashboard, gestion des entités)
3. La communication avec l'API backend
4. Les bonnes pratiques de développement React

Bon développement et soyez créatifs dans votre implémentation.
Amaali Oussama 