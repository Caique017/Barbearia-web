import { api } from './axios'
import type {
  Agendamento,
  AgendamentoRequest,
  DashboardData,
  HorarioDisponivel,
  StatusAgendamento,
} from '../types'

// TODO: integrar com API — rotas de agendamento ainda não implementadas no backend
export const agendamentoApi = {
  agendaDoDia: (data: string) =>
    api.get<Agendamento[]>('/barbeiro/agenda', { params: { data } }).then((r) => r.data),

  detalhe: (id: string) =>
    api.get<Agendamento>(`/barbeiro/agendamento/${id}`).then((r) => r.data),

  criar: (data: AgendamentoRequest) =>
    api.post<Agendamento>('/barbeiro/agendamento', data).then((r) => r.data),

  mudarStatus: (id: string, status: StatusAgendamento, motivo?: string) =>
    api
      .patch<Agendamento>(`/barbeiro/agendamento/${id}/status`, { status, motivo })
      .then((r) => r.data),

  horariosDisponiveis: (servicoId: string, data: string) =>
    api
      .get<HorarioDisponivel[]>('/agendamento/horarios-disponiveis', {
        params: { servicoId, data },
      })
      .then((r) => r.data),

  dashboard: (mes: string, ano: string) =>
    api
      .get<DashboardData>('/barbeiro/dashboard', { params: { mes, ano } })
      .then((r) => r.data),
}
