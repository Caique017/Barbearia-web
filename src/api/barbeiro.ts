import { api } from './axios'
import type {
  Bloqueio,
  BloqueioRequest,
  FaixaHorario,
  PerfilAtualizacao,
  PerfilBarbeiro,
} from '../types'

export const barbeiroApi = {
  perfil: () => api.get<PerfilBarbeiro>('/barbeiros/me').then((r) => r.data),

  atualizarPerfil: (data: PerfilAtualizacao) =>
    api.patch<PerfilBarbeiro>('/barbeiros/me', data).then((r) => r.data),

  /** O link antigo para de funcionar na hora. */
  trocarSlug: (slug: string) =>
    api.patch<PerfilBarbeiro>('/barbeiros/me/slug', { slug }).then((r) => r.data),

  horarios: () => api.get<FaixaHorario[]>('/barbeiros/me/horarios').then((r) => r.data),

  /** Substitui todas as faixas de uma vez. */
  definirHorarios: (faixas: FaixaHorario[]) =>
    api.put<FaixaHorario[]>('/barbeiros/me/horarios', { faixas }).then((r) => r.data),

  bloqueios: () => api.get<Bloqueio[]>('/barbeiros/me/bloqueios').then((r) => r.data),

  bloquear: (data: BloqueioRequest) =>
    api.post<Bloqueio>('/barbeiros/me/bloqueios', data).then((r) => r.data),

  desbloquear: (id: string) =>
    api.delete<void>(`/barbeiros/me/bloqueios/${id}`).then(() => undefined),
}
