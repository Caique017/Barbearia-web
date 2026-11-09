import { api } from './axios'
import type { Preferencias } from '../types'

export const contaApi = {
  baixarDados: () =>
    api.get<Blob>('/conta/dados', { responseType: 'blob' }).then((r) => r.data),

  excluir: (senha: string) => api.post<void>('/conta/excluir', { senha }).then(() => undefined),

  preferencias: () => api.get<Preferencias>('/conta/preferencias').then((r) => r.data),

  atualizarPreferencias: (data: Partial<Preferencias>) =>
    api.patch<Preferencias>('/conta/preferencias', data).then((r) => r.data),

  descadastrar: (token: string) =>
    api.post<void>('/conta/descadastro', { token }).then(() => undefined),
}
