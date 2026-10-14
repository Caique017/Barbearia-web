import axios from 'axios'

export const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      // Evita loop se já estiver na tela de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

/** Extrai uma mensagem de erro amigável de uma resposta da API. */
export function apiErrorMessage(error: unknown, fallback = 'Algo deu errado. Tente novamente.') {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; erro?: string } | undefined
    return data?.message ?? data?.erro ?? fallback
  }
  return fallback
}
