import axios from 'axios'

const client = axios.create({
    baseURL: 'http://localhost:5000',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
})

// Ajouter automatiquement le token JWT à chaque requête
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Gérer les erreurs globalement
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default client
