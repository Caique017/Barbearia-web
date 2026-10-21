import type { DiaSemana } from '../types'

/** Dias da semana na ordem da barbearia (segunda primeiro), com os nomes da API. */
export const diasDaSemana: { valor: DiaSemana; nome: string; curto: string }[] = [
  { valor: 'MONDAY', nome: 'Segunda', curto: 'SEG' },
  { valor: 'TUESDAY', nome: 'Terça', curto: 'TER' },
  { valor: 'WEDNESDAY', nome: 'Quarta', curto: 'QUA' },
  { valor: 'THURSDAY', nome: 'Quinta', curto: 'QUI' },
  { valor: 'FRIDAY', nome: 'Sexta', curto: 'SEX' },
  { valor: 'SATURDAY', nome: 'Sábado', curto: 'SÁB' },
  { valor: 'SUNDAY', nome: 'Domingo', curto: 'DOM' },
]

/** Os próximos `n` dias a partir de hoje, à meia-noite. */
export const proximosDias = (n: number) => {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(hoje)
    d.setDate(hoje.getDate() + i)
    return d
  })
}

/** Primeiro e último dia do mês de `ref`. */
export const limitesDoMes = (ref: Date) => ({
  inicio: new Date(ref.getFullYear(), ref.getMonth(), 1),
  fim: new Date(ref.getFullYear(), ref.getMonth() + 1, 0),
})
