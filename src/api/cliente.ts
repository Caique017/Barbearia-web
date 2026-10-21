import { api } from './axios'
import type { Agendamento, AgendamentoClienteRequest, MinhaBarbearia } from '../types'

/** Rotas do cliente logado. Todas respondem 409 enquanto o vínculo aguarda aprovação. */
export const clienteApi = {
  minhaBarbearia: () =>
    api.get<MinhaBarbearia>('/agendamentos/minha-barbearia').then((r) => r.data),

  meusAgendamentos: () => api.get<Agendamento[]>('/agendamentos').then((r) => r.data),

  agendar: (data: AgendamentoClienteRequest) =>
    api.post<Agendamento>('/agendamentos', data).then((r) => r.data),

  cancelar: (id: string) =>
    api.post<Agendamento>(`/agendamentos/${id}/cancelar`).then((r) => r.data),
}
