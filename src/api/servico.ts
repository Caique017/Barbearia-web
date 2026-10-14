import { api } from './axios'
import type { Servico, ServicoRequest } from '../types'

// TODO: integrar com API — rotas de serviço ainda não implementadas no backend
export const servicoApi = {
  listar: () => api.get<Servico[]>('/barbeiro/servicos').then((r) => r.data),

  criar: (data: ServicoRequest) =>
    api.post<Servico>('/barbeiro/servicos', data).then((r) => r.data),

  editar: (id: string, data: ServicoRequest) =>
    api.put<Servico>(`/barbeiro/servicos/${id}`, data).then((r) => r.data),

  alternarAtivo: (id: string, ativo: boolean) =>
    api.patch<Servico>(`/barbeiro/servicos/${id}/ativo`, { ativo }).then((r) => r.data),
}
