import { api } from './axios'
import type { Agendamento, AgendamentoRequest } from '../types'

// TODO: integrar com API — rotas do cliente ainda não implementadas no backend
export const clienteApi = {
  historico: () => api.get<Agendamento[]>('/cliente/historico').then((r) => r.data),

  agendar: (data: AgendamentoRequest) =>
    api.post<Agendamento>('/cliente/agendamento', data).then((r) => r.data),
}
