export type Role = 'BARBEIRO' | 'CLIENTE'

export type StatusAgendamento =
  | 'CONFIRMADO'
  | 'CONCLUIDO'
  | 'CANCELADO'
  | 'NO_SHOW'
  | 'REMARCADO'

export interface Usuario {
  id: string
  nome: string
  email: string
  role: Role
}

export interface Servico {
  id: string
  nome: string
  preco: number
  duracaoMinutos: number
  custoInsumo: number
  ativo: boolean
}

export interface Cliente {
  id: string
  nome: string
  whatsapp: string
}

export interface Agendamento {
  id: string
  dataHora: string
  status: StatusAgendamento
  cliente: Cliente
  servico: Servico
}

export interface DashboardData {
  faturamentoBruto: number
  gastoInsumos: number
  lucroLiquido: number
  mixServicos: { nome: string; quantidade: number }[]
}

/* ---------------------------------- Auth --------------------------------- */
export interface LoginRequest {
  email: string
  senha: string
}

export interface LoginResponse {
  token: string
  nome: string
  email: string
  role: Role
}

export interface BarbeiroCadastroRequest {
  nome: string
  email: string
  senha: string
}

export interface ClienteCadastroRequest {
  nome: string
  email: string
  whatsapp: string
  senha: string
}

/* ------------------------------ Requests --------------------------------- */
export interface ServicoRequest {
  nome: string
  preco: number
  duracaoMinutos: number
  custoInsumo: number
}

export interface AgendamentoRequest {
  clienteId?: string
  clienteNome?: string
  clienteWhatsapp?: string
  servicoId: string
  dataHora: string
}

export interface HorarioDisponivel {
  hora: string
  disponivel: boolean
}
