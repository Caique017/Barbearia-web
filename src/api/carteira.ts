import { api } from './axios'
import type { Cliente, ClienteRequest } from '../types'

/** Carteira de clientes do barbeiro logado. */
export const carteiraApi = {
  listar: () => api.get<Cliente[]>('/clientes').then((r) => r.data),

  cadastrar: (data: ClienteRequest) => api.post<Cliente>('/clientes', data).then((r) => r.data),

  atualizar: (id: string, data: Partial<ClienteRequest>) =>
    api.patch<Cliente>(`/clientes/${id}`, data).then((r) => r.data),

  aprovarVinculo: (id: string) =>
    api.post<Cliente>(`/clientes/${id}/vinculo`).then((r) => r.data),

  recusarVinculo: (id: string) =>
    api.delete<void>(`/clientes/${id}/vinculo`).then(() => undefined),
}
