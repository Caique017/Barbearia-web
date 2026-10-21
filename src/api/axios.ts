import axios from "axios";
import type { CampoErro, ErroResposta } from "../types";
import { loginForPath } from "../utils/auth-routes";

export const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Login e cadastro respondem 401 para senha errada — quem trata é a página. */
const ehTentativaDeEntrar = (url: string | undefined) =>
  !!url && (url.includes("/login") || url.includes("/registro"));

/** Disparado quando a API responde 402: o teste ou o mês pago do barbeiro acabou. */
export const EVENTO_ASSINATURA_VENCIDA = "clipbook:assinatura-vencida";

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // O cliente também recebe 402 ("barbearia não aceita agendamentos"), mas
    // o aviso com link para o plano só faz sentido no painel do barbeiro.
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 402 &&
      window.location.pathname.startsWith("/barbeiro")
    ) {
      window.dispatchEvent(
        new CustomEvent(EVENTO_ASSINATURA_VENCIDA, {
          detail: apiErrorMessage(error),
        }),
      );
    }

    const sessaoExpirada =
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !ehTentativaDeEntrar(error.config?.url);

    if (sessaoExpirada) {
      localStorage.removeItem("token");
      // Sem usuário carregado, o perfil é deduzido da URL — um barbeiro
      // com token expirado volta para o login dele, não para o do cliente.
      const destino = loginForPath(window.location.pathname);
      // Evita loop se já estiver na tela de login
      if (window.location.pathname !== destino) {
        window.location.href = destino;
      }
    }
    return Promise.reject(error);
  },
);

/** Corpo do erro, quando a resposta veio no formato da API. */
function corpoDoErro(error: unknown): Partial<ErroResposta> | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  return error.response?.data as Partial<ErroResposta> | undefined;
}

/** Extrai uma mensagem de erro amigável de uma resposta da API. */
export function apiErrorMessage(
  error: unknown,
  fallback = "Algo deu errado. Tente novamente.",
) {
  return corpoDoErro(error)?.mensagem ?? fallback;
}

/** Erros de validação por campo (400), para marcar cada input do formulário. */
export function apiFieldErrors(error: unknown): CampoErro[] {
  return corpoDoErro(error)?.campos ?? [];
}
