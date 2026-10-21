import { api } from './axios'
import type { ResumoFinanceiro } from '../types'

export const financeiroApi = {
  /** Período de até 366 dias, datas em YYYY-MM-DD. */
  resumo: (de: string, ate: string) =>
    api.get<ResumoFinanceiro>('/financeiro/resumo', { params: { de, ate } }).then((r) => r.data),
}
