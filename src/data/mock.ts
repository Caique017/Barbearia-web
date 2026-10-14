import type {
  Agendamento,
  Cliente,
  DashboardData,
  HorarioDisponivel,
  Servico,
} from '../types'
import { toISODate } from '../utils/formatters'

/* ============================================================
   Dados mockados — extraídos do design "Barbearia - Telas".
   Usados enquanto as rotas do backend não existem.
   // TODO: integrar com API
   ============================================================ */

export const mockServicos: Servico[] = [
  { id: 'corte', nome: 'Corte', preco: 45, duracaoMinutos: 30, custoInsumo: 3, ativo: true },
  { id: 'barba', nome: 'Barba', preco: 30, duracaoMinutos: 20, custoInsumo: 2, ativo: true },
  { id: 'combo', nome: 'Corte + Barba', preco: 65, duracaoMinutos: 45, custoInsumo: 5, ativo: true },
  { id: 'pezinho', nome: 'Pezinho', preco: 20, duracaoMinutos: 15, custoInsumo: 1, ativo: false },
  { id: 'sobrancelha', nome: 'Sobrancelha', preco: 15, duracaoMinutos: 10, custoInsumo: 1, ativo: true },
]

/** Metadados só de apresentação (ícone/descrição/etiqueta) usados nos cards. */
export const servicoMeta: Record<string, { icon: string; desc: string; tag?: string }> = {
  corte: { icon: '✂️', desc: 'Máquina + tesoura, acabamento na navalha' },
  barba: { icon: '🪒', desc: 'Toalha quente, modelagem e óleo' },
  combo: { icon: '💈', desc: 'Corte completo + barba desenhada', tag: 'MAIS PEDIDO' },
  pezinho: { icon: '✨', desc: 'Retoque rápido da nuca e laterais' },
  sobrancelha: { icon: '💎', desc: 'Design e limpeza da sobrancelha' },
}

export const servicoIcon = (id: string) => servicoMeta[id]?.icon ?? '💈'

export const mockClientes: Cliente[] = [
  { id: 'c1', nome: 'João Pereira', whatsapp: '(11) 9 8123-4567' },
  { id: 'c2', nome: 'João Vitor', whatsapp: '(11) 9 9988-1122' },
]

const servicoPorId = (id: string) => mockServicos.find((s) => s.id === id) ?? mockServicos[0]

const apptTemplate: {
  time: string
  status: Agendamento['status']
  nome: string
  whatsapp: string
  servicoId: string
}[] = [
  { time: '09:00', status: 'CONCLUIDO', nome: 'Rafael Lima', whatsapp: '(11) 9 8111-2222', servicoId: 'corte' },
  { time: '10:30', status: 'CONFIRMADO', nome: 'Bruno Alves', whatsapp: '(11) 9 8123-4567', servicoId: 'combo' },
  { time: '11:30', status: 'CONFIRMADO', nome: 'Diego Souza', whatsapp: '(11) 9 8222-3333', servicoId: 'barba' },
  { time: '14:00', status: 'CANCELADO', nome: 'Igor Nunes', whatsapp: '(11) 9 8333-4444', servicoId: 'corte' },
  { time: '15:00', status: 'CONFIRMADO', nome: 'Marcos Vale', whatsapp: '(11) 9 8444-5555', servicoId: 'combo' },
]

/** Agenda mockada para um dia — mapeia os horários do template sobre a data pedida. */
export const mockAgenda = (dateISO: string): Agendamento[] =>
  apptTemplate.map((a, i) => ({
    id: `${dateISO}-${i}`,
    dataHora: `${dateISO}T${a.time}:00`,
    status: a.status,
    cliente: { id: `cli-${i}`, nome: a.nome, whatsapp: a.whatsapp },
    servico: servicoPorId(a.servicoId),
  }))

export const mockAgendamento = (id: string): Agendamento => ({
  id,
  dataHora: `${toISODate(new Date())}T10:30:00`,
  status: 'CONFIRMADO',
  cliente: { id: 'cli-1', nome: 'Bruno Alves', whatsapp: '(11) 9 8123-4567' },
  servico: servicoPorId('combo'),
})

/** Grade de horários (mesma do design). */
export const mockHorarios: HorarioDisponivel[] = [
  { hora: '09:00', disponivel: true },
  { hora: '09:30', disponivel: false },
  { hora: '10:00', disponivel: true },
  { hora: '10:30', disponivel: true },
  { hora: '11:00', disponivel: false },
  { hora: '11:30', disponivel: true },
  { hora: '14:00', disponivel: true },
  { hora: '14:30', disponivel: true },
  { hora: '15:00', disponivel: false },
  { hora: '15:30', disponivel: true },
  { hora: '16:00', disponivel: true },
  { hora: '16:30', disponivel: true },
]

export const mockProximo: Agendamento = {
  id: 'prox-1',
  dataHora: `${toISODate(new Date(Date.now() + 3 * 864e5))}T14:00:00`,
  status: 'CONFIRMADO',
  cliente: { id: 'me', nome: 'Bruno', whatsapp: '(11) 9 8123-4567' },
  servico: servicoPorId('combo'),
}

export const mockHistorico: Agendamento[] = [
  { id: 'h1', dataHora: '2026-06-15T10:00:00', status: 'CONCLUIDO', cliente: mockProximo.cliente, servico: servicoPorId('combo') },
  { id: 'h2', dataHora: '2026-05-28T11:00:00', status: 'CONCLUIDO', cliente: mockProximo.cliente, servico: servicoPorId('corte') },
  { id: 'h3', dataHora: '2026-05-12T09:30:00', status: 'CONCLUIDO', cliente: mockProximo.cliente, servico: servicoPorId('barba') },
  { id: 'h4', dataHora: '2026-04-20T16:00:00', status: 'CONCLUIDO', cliente: mockProximo.cliente, servico: servicoPorId('corte') },
]

export const mockDashboard: DashboardData = {
  faturamentoBruto: 8240,
  gastoInsumos: 640,
  lucroLiquido: 7600,
  mixServicos: [
    { nome: 'Corte', quantidade: 62 },
    { nome: 'Corte + Barba', quantidade: 48 },
    { nome: 'Barba', quantidade: 31 },
    { nome: 'Pezinho', quantidade: 12 },
  ],
}
