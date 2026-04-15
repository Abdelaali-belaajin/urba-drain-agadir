import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
});

// Request interceptor: add Authorization token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Response interceptor: handle 401 Unauthorized globally
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const isLoginAttempt = error.config?.url?.endsWith('/login');
        if (error.response?.status === 401 && !isLoginAttempt) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('role');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// --- Auth --- prefix: /auth
export const login = (email, password) => api.post('/auth/login', { email, password });
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const updateMe = (data) => api.put('/auth/me', data);
export const changePassword = (data) => api.put('/auth/password', data);

// --- Zones --- prefix: /zones
export const getZones = () => api.get('/zones');

// --- Alertes --- prefix: /alertes
export const getAlertes = () => api.get('/alertes');
export const resolveAlerte = (id) => api.put(`/alertes/${id}/resoudre`);

// --- Pompes --- prefix: /pompes
export const getPompes = () => api.get('/pompes');
export const togglePompe = (id) => api.put(`/pompes/${id}/toggle`);

// --- Capteurs --- prefix: /capteurs
export const getCapteurs = () => api.get('/capteurs');

// --- Simulation --- prefix: /simulation
export const lancerSimulation = (zone_id, intensite) => api.post('/simulation/orage', { zone_id, intensite });
export const lancerCheminement = (zone_id) => api.post('/simulation/cheminement', { zone_id });
export const resetSystem = () => api.post('/simulation/reset');

// --- Users --- prefix: /users
export const getUsers = () => api.get('/users');
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const toggleUser = (id) => api.patch(`/users/${id}/toggle`);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// --- Messages --- prefix: /messages
export const getMessages = () => api.get('/messages');
export const getMessageUsers = () => api.get('/messages/users');
export const markMessageAsRead = (id) => api.put(`/messages/${id}/lire`);
export const sendMessage = (data) => api.post('/messages', data);

// --- Logs --- prefix: /logs
export const getLogs = () => api.get('/logs?limit=20');

// --- Citizen Alerts --- prefix: /api/alerts
export const notifyCitizens = (zone_id) => api.post('/api/alerts/send-citizen-emails', { zone_id });

// --- System --- prefix: /system

export default api;
