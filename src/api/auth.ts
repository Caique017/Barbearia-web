import { api } from './axios'
import type {
  BarbeiroCadastroRequest,
  ClienteCadastroRequest,
  LoginRequest,
  LoginResponse,
  Usuario,
} from '../types'

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/auth/login', data).then((r) => r.data),

  registrarBarbeiro: (data: BarbeiroCadastroRequest) =>
    api.post<LoginResponse>('/auth/registro', data).then((r) => r.data),

  // TODO: integrar com API — rota de cadastro de cliente ainda não implementada no backend
  registrarCliente: (data: ClienteCadastroRequest) =>
    api.post<LoginResponse>('/auth/registro', data).then((r) => r.data),

  me: () => api.get<Usuario>('/auth/me').then((r) => r.data),
}
