import { api } from "./axios";
import type {
  BarbeiroCadastroRequest,
  ClienteCadastroRequest,
  LoginRequest,
  LoginResponse,
  Usuario,
  BarbeiroCadastroResponse,
  ClienteCadastroResponse,
  BarbeariaPublica,
  EsqueciSenhaRequest,
  RedefinirSenhaRequest,
} from "../types";

export const authApi = {
  loginBarbeiro: (data: LoginRequest) =>
    api.post<LoginResponse>("/auth/barbeiro/login", data).then((r) => r.data),

  registrarBarbeiro: (data: BarbeiroCadastroRequest) =>
    api
      .post<BarbeiroCadastroResponse>("/auth/barbeiro/registro", data)
      .then((r) => r.data),

  loginCliente: (data: LoginRequest) =>
    api.post<LoginResponse>("/auth/cliente/login", data).then((r) => r.data),

  registrarCliente: (data: ClienteCadastroRequest) =>
    api
      .post<ClienteCadastroResponse>("/auth/cliente/registro", data)
      .then((r) => r.data),

  buscarBarbearia: (slug: string) =>
    api
      .get<BarbeariaPublica>(`/barbeiros/publico/${encodeURIComponent(slug)}`)
      .then((r) => r.data),

  me: () => api.get<Usuario>("/auth/me").then((r) => r.data),

  // Encerra todas as sessões no servidor: tokens já emitidos param de valer.
  sair: () => api.post<void>("/auth/sair").then(() => undefined),

  // Os dois respondem 204 sem corpo. O "esqueci" é silencioso de propósito:
  // responde igual para e-mail existente, inexistente ou pedido repetido.
  esqueciSenha: (data: EsqueciSenhaRequest) =>
    api.post<void>("/auth/senha/esqueci", data).then(() => undefined),

  redefinirSenha: (data: RedefinirSenhaRequest) =>
    api.post<void>("/auth/senha/redefinir", data).then(() => undefined),
};
