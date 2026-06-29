import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Obtiene el CSRF token antes de requests que lo necesitan
client.interceptors.request.use(async (config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    await axios.get('http://localhost:8000/api/auth/csrf/', { withCredentials: true })
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1]
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken
    }
  }
  return config
})

export default client