import { api } from './axios'
import type { Assinatura, FormaPagamento } from '../types'

export const assinaturaApi = {
  consultar: () => api.get<Assinatura>('/assinatura').then((r) => r.data),

  /** URL do checkout do Stripe — o front só redireciona. */
  checkout: (formaPagamento: FormaPagamento) =>
    api
      .post<{ url: string }>('/assinatura/checkout', { formaPagamento })
      .then((r) => r.data.url),

  /** Portal do Stripe: trocar cartão, cancelar, ver faturas. */
  portal: () => api.post<{ url: string }>('/assinatura/portal').then((r) => r.data.url),
}
