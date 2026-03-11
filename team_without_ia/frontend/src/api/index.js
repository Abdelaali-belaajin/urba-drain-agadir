import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err.response?.data || err.message)
    return Promise.reject(err)
  }
)

export const zonesAPI = {
  getAll:   ()         => api.get('/zones'),
  getById:  (id)       => api.get(`/zones/${id}`),
  create:   (data)     => api.post('/zones', data),
  update:   (id, data) => api.put(`/zones/${id}`, data),
  delete:   (id)       => api.delete(`/zones/${id}`),
}

export const capteursAPI = {
  getAll:       (params) => api.get('/capteurs', { params }),
  getById:      (id)     => api.get(`/capteurs/${id}`),
  getCritiques: ()       => api.get('/capteurs', { params: { critique: 'true' } }),
  create:       (data)   => api.post('/capteurs', data),
  update:       (id, data) => api.put(`/capteurs/${id}`, data),
  deactivate:   (id)     => api.delete(`/capteurs/${id}`),
}

export const pompesAPI = {
  getAll:     (statut)      => api.get('/pompes', { params: statut ? { statut } : {} }),
  getById:    (id)          => api.get(`/pompes/${id}`),
  activer:    (id, user)    => api.post(`/pompes/${id}/activer`, { utilisateur: user }),
  desactiver: (id, user)    => api.post(`/pompes/${id}/desactiver`, { utilisateur: user }),
}

export default api
