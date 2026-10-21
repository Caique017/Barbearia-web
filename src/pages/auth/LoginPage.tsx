import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Logo } from "../../components/layout/Logo";
import { Button, Input } from "../../components/ui";
import { authApi } from "../../api/auth";
import { apiErrorMessage } from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import { homeFor } from "../../components/layout/ProtectedRoute";

const schema = z.object({
  email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
  senha: z.string().min(1, "Informe sua senha"),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [erro, setErro] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (data) => {
    setErro(null);
    try {
      const res = await authApi.loginCliente({
        email: data.email,
        senha: data.senha,
      });
      const usuario = await login(res.token);
      navigate(homeFor(usuario.role), { replace: true });
    } catch (e) {
      // Mensagem genérica por segurança
      setErro(apiErrorMessage(e, "E-mail ou senha incorretos"));
    }
  });

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-surface lg:max-w-none lg:flex-row">
      {/* Hero / painel de marca (esquerda no desktop) */}
      <div className="relative h-[266px] flex-none overflow-hidden bg-ink text-white lg:h-auto lg:flex-1">
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(17,17,17,.96),rgba(17,17,17,.35)_60%,rgba(17,17,17,.55))] lg:bg-[linear-gradient(160deg,rgba(17,17,17,.9),rgba(17,17,17,.35))]" />
        <div className="absolute right-[52px] top-[34px] h-[150px] w-[30px] bg-brand [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)] lg:right-[64px] lg:top-[60px] lg:h-[180px] lg:w-[34px]" />
        <div className="absolute right-4 top-[34px] h-[150px] w-[30px] bg-brand-light [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)] lg:right-[24px] lg:top-[60px] lg:h-[180px] lg:w-[34px]" />
        <div className="absolute inset-x-[22px] bottom-[22px] lg:inset-x-auto lg:bottom-16 lg:left-14 lg:right-14">
          <div className="mb-2 flex items-center gap-2.5 lg:mb-3.5">
            <Logo size={30} />
            <span className="text-[21px] font-semibold text-white lg:text-[24px]">
              ClipBook
            </span>
          </div>
          <h2 className="mb-2.5 hidden max-w-[400px] text-[34px] font-medium leading-tight text-white lg:block">
            Agende seu horário em qualquer barbearia parceira
          </h2>
        </div>
      </div>

      {/* Formulário (direita no desktop) */}
      <div className="flex flex-1 flex-col px-[22px] pb-7 pt-5 lg:w-[460px] lg:flex-none lg:justify-center lg:px-[60px] lg:py-16">
        <div className="mb-2.5 hidden text-[11px] font-semibold uppercase tracking-[0.9px] text-brand lg:block">
          Bem-vindo de volta
        </div>
        <h2 className="mb-6 hidden text-[28px] font-medium text-ink lg:block">
          Entrar na sua conta
        </h2>

        <form onSubmit={onSubmit} noValidate>
          <Input
            label="E-mail"
            type="email"
            placeholder="voce@email.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className="mt-3"
            error={errors.senha?.message}
            {...register("senha")}
          />
          <div className="mb-4 mt-2 text-right">
            <Link
              to="/esqueci-senha"
              state={{ voltarPara: "/login" }}
              className="text-[12.5px] font-medium text-brand"
            >
              Esqueci a senha
            </Link>
          </div>
          {erro && (
            <p className="mb-3 rounded-field bg-danger-tint-2 px-3 py-2 text-[13px] text-danger">
              {erro}
            </p>
          )}
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Entrar
          </Button>
        </form>

        {/* Não há cadastro genérico de cliente: a conta nasce do link da barbearia. */}
        <div className="mt-4 rounded-card bg-brand-soft px-4 py-3">
          <p className="m-0 text-[13px] font-semibold text-ink">
            Ainda não tem conta?
          </p>
          <p className="m-0 mt-0.5 text-[12.5px] leading-relaxed text-muted">
            Abra o link que sua barbearia enviou para criar a sua.
          </p>
        </div>

        <div className="mt-5 border-t border-line pt-4 text-center">
          <Link to="/agendar" className="text-[14px] font-semibold text-brand">
            Continuar sem cadastro →
          </Link>
          <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
            Você agenda normalmente, mas o histórico só fica salvo com uma
            conta.
          </p>
          <p className="mt-3.5 border-t border-line pt-3.5 text-[12.5px] text-muted">
            Tem uma barbearia?{" "}
            <Link to="/barbeiro/login" className="font-semibold text-brand">
              Entrar como barbeiro
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
