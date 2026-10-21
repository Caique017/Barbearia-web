import { api } from './axios'
import type { Agendamento, AgendamentoBarbeiroRequest, Disponibilidade } from '../types'

/** Agenda do barbeiro logado. Datas em YYYY-MM-DD, horários sem fuso. */
export const agendaApi = {
  doPeriodo: (de: string, ate: string = de) =>
    api.get<Agendamento[]>('/agenda', { params: { de, ate } }).then((r) => r.data),

  detalhe: (id: string) => api.get<Agendamento>(`/agenda/${id}`).then((r) => r.data),

  criar: (data: AgendamentoBarbeiroRequest) =>
    api.post<Agendamento>('/agenda', data).then((r) => r.data),

  concluir: (id: string) =>
    api.post<Agendamento>(`/agenda/${id}/concluir`).then((r) => r.data),

  falta: (id: string) => api.post<Agendamento>(`/agenda/${id}/falta`).then((r) => r.data),

  cancelar: (id: string) =>
    api.post<Agendamento>(`/agenda/${id}/cancelar`).then((r) => r.data),

  /** Devolve o agendamento novo; o antigo vira REMARCADO. */
  remarcar: (id: string, dataHora: string) =>
    api.post<Agendamento>(`/agenda/${id}/remarcar`, { dataHora }).then((r) => r.data),

  /** Horários livres de um dia para um serviço — a mesma rota pública que o cliente usa. */
  disponibilidade: (slug: string, servicoId: string, data: string) =>
    api
      .get<Disponibilidade>(`/barbeiros/publico/${encodeURIComponent(slug)}/disponibilidade`, {
        params: { servicoId, data },
      })
      .then((r) => r.data),
}
