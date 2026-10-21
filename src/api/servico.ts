import { api } from './axios'
import type { Servico, ServicoAtualizacao, ServicoPublico, ServicoRequest } from '../types'

export const servicoApi = {
  listar: () => api.get<Servico[]>('/servicos').then((r) => r.data),

  criar: (data: ServicoRequest) => api.post<Servico>('/servicos', data).then((r) => r.data),

  /** PATCH parcial: serve para editar e para ativar/desativar. */
  atualizar: (id: string, data: ServicoAtualizacao) =>
    api.patch<Servico>(`/servicos/${id}`, data).then((r) => r.data),

  /** Serviços ativos de uma barbearia, sem custo — usado pelo cliente. */
  publicos: (slug: string) =>
    api
      .get<ServicoPublico[]>(`/barbeiros/publico/${encodeURIComponent(slug)}/servicos`)
      .then((r) => r.data),
}
