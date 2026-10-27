export type Role = "BARBEIRO" | "CLIENTE";

export type StatusAgendamento =
  | "CONFIRMADO"
  | "CONCLUIDO"
  | "CANCELADO"
  | "NO_SHOW"
  | "REMARCADO";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: Role;
}

/* -------------------------------- Serviços -------------------------------- */
export interface Servico {
  id: string;
  nome: string;
  preco: number;
  duracaoMinutos: number;
  custoInsumo: number;
  ativo: boolean;
}

/** O que o cliente vê: sem custo e só os ativos. */
export interface ServicoPublico {
  id: string;
  nome: string;
  preco: number;
  duracaoMinutos: number;
}

export interface ServicoRequest {
  nome: string;
  preco: number;
  duracaoMinutos: number;
  custoInsumo: number;
}

/** PATCH /servicos/:id — só os campos enviados mudam. */
export type ServicoAtualizacao = Partial<ServicoRequest> & { ativo?: boolean };

/* -------------------------------- Clientes -------------------------------- */
export interface PedidoVinculo {
  nome: string;
  email: string;
}

/** Cliente da carteira do barbeiro. */
export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  temConta: boolean;
  /** Alguém criou conta pelo link com o telefone deste cliente e espera aprovação. */
  pedidoVinculo: PedidoVinculo | null;
}

export interface ClienteRequest {
  nome: string;
  telefone: string;
}

/* ------------------------------- Agendamento ------------------------------ */
export interface Agendamento {
  id: string;
  /** Hora de parede da barbearia, sem fuso: "2026-10-21T10:30:00". */
  dataHora: string;
  terminaEm: string;
  status: StatusAgendamento;
  /** Preço da época em que foi marcado. */
  preco: number;
  servico: { id: string; nome: string };
  cliente: { id: string; nome: string; telefone: string };
}

export interface AgendamentoBarbeiroRequest {
  clienteId: string;
  servicoId: string;
  dataHora: string;
}

export interface AgendamentoClienteRequest {
  servicoId: string;
  dataHora: string;
}

export interface Disponibilidade {
  data: string;
  servicoId: string;
  /** "09:00" ou "09:00:00", conforme o servidor serializa. */
  horarios: string[];
}

export interface MinhaBarbearia {
  slug: string;
  nome: string;
  horarioFuncionamento: string | null;
}

/* --------------------------- Barbeiro e horários -------------------------- */
export interface PerfilBarbeiro {
  barbeiroId: string;
  nome: string;
  email: string;
  nomeBarbearia: string;
  slug: string;
  horarioFuncionamento: string | null;
}

export interface PerfilAtualizacao {
  nomeBarbearia?: string;
  horarioFuncionamento?: string;
}

export type DiaSemana =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface FaixaHorario {
  diaSemana: DiaSemana;
  abre: string;
  fecha: string;
}

export interface Bloqueio {
  id: string;
  inicio: string;
  fim: string;
  motivo: string | null;
  /** Agendamentos confirmados que caem dentro do bloqueio — para remarcar. */
  agendamentosNoPeriodo: number;
}

export interface BloqueioRequest {
  inicio: string;
  fim: string;
  motivo?: string;
}

/* ------------------------------- Financeiro ------------------------------- */
export interface ResumoDia {
  data: string;
  atendimentos: number;
  faturamento: number;
  custos: number;
  lucro: number;
}

export interface ResumoServico {
  nome: string;
  atendimentos: number;
  faturamento: number;
}

export interface ResumoFinanceiro {
  de: string;
  ate: string;
  atendimentos: number;
  faturamento: number;
  custos: number;
  lucro: number;
  dias: ResumoDia[];
  servicos: ResumoServico[];
}

/* ------------------------------- Assinatura ------------------------------- */
export type StatusAssinatura =
  | "TESTE"
  | "ATIVA"
  | "PAGAMENTO_PENDENTE"
  | "CANCELADA";

export type FormaPagamento = "CARTAO" | "PIX";

export interface Assinatura {
  status: StatusAssinatura;
  ativa: boolean;
  testeAte: string;
  liberadaAte: string | null;
  diasRestantes: number;
  formaPagamento: FormaPagamento | null;
  precoMensal: number;
  cancelamentoAgendado: boolean;
}

/* ---------------------------------- Auth --------------------------------- */
export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  nome: string;
  email: string;
}

export interface BarbeiroCadastroRequest {
  nome: string;
  nomeBarbearia: string;
  horarioFuncionamento?: string;
  email: string;
  senha: string;
}

export interface ClienteCadastroRequest {
  nome: string;
  telefone: string;
  email: string;
  senha: string;
  barbeiroId: string;
}

export interface BarbeiroCadastroResponse {
  token: string;
  nome: string;
  email: string;
  slug: string;
}

export interface ClienteCadastroResponse {
  token: string;
  nome: string;
  email: string;
  vinculoPendente: boolean;
}

export interface BarbeariaPublica {
  barbeiroId: string;
  nome: string;
  horarioFuncionamento: string | null;
}

/* ------------------------------ Senha ------------------------------------ */
export interface EsqueciSenhaRequest {
  email: string;
}

export interface RedefinirSenhaRequest {
  token: string;
  novaSenha: string;
}

/* ---------------------------------- Erros -------------------------------- */
export interface CampoErro {
  campo: string;
  mensagem: string;
}

export interface ErroResposta {
  timestamp: string;
  status: number;
  erro: string;
  mensagem: string;
  caminho: string;
  campos?: CampoErro[];
}
