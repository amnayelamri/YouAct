import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Authentication
export const authService = {
  register: (username, email, password, confirmPassword) =>
    api.post('/auth/register', { username, email, password, confirmPassword }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password })
}

// Projects
export const projectService = {
  getAll: () => api.get('/projects'),
  
  create: (title, description, videoLink) =>
    api.post('/projects', { title, description, videoLink }),
  
  getById: (id) => api.get(`/projects/${id}`),
  
  update: (id, data) =>
    api.put(`/projects/${id}`, data),
  
  delete: (id) => api.delete(`/projects/${id}`)
}

// Annotations
export const annotationService = {
  getByProject: (projectId) =>
    api.get(`/annotations/project/${projectId}`),
  
  create: (projectId, timestamp, content, title, contentType = 'text') =>
    api.post('/annotations', { projectId, timestamp, content, title, contentType }),
  
  update: (id, data) =>
    api.put(`/annotations/${id}`, data),
  
  delete: (id) => api.delete(`/annotations/${id}`)
}

export default api
