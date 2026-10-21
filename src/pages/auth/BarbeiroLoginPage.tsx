import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppShell } from "../../components/layout/AppShell";
import { Logo } from "../../components/layout/Logo";
import { Button, Input } from "../../components/ui";
import { authApi } from "../../api/auth";
import { apiErrorMessage } from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import { homeFor } from "../../utils/auth-routes";

const schema = z.object({
  email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
  senha: z.string().min(1, "Informe sua senha"),
});
type FormData = z.infer<typeof schema>;

/** Login do barbeiro (design 2.1) — acesso profissional, tema escuro. */
export function BarbeiroLoginPage() {
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
      const res = await authApi.loginBarbeiro({
        email: data.email,
        senha: data.senha,
      });
      const usuario = await login(res.token);
      navigate(homeFor(usuario.role), { replace: true });
    } catch (e) {
      setErro(apiErrorMessage(e, "E-mail ou senha incorretos"));
    }
  });

  return (
    <AppShell className="bg-surface-dark">
      <div className="relative flex flex-1 flex-col justify-center overflow-hidden px-[26px] py-6">
        {/* Chevrons decorativos */}
        <div className="absolute right-[52px] top-[70px] h-[150px] w-[30px] bg-brand [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)]" />
        <div className="absolute right-4 top-[70px] h-[150px] w-[30px] bg-brand-light [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)]" />

        <div className="relative">
          <div className="mb-7">
            <div className="mb-6 inline-flex items-center gap-[7px] rounded-lg border border-brand-light/40 bg-brand-light/15 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-light" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.9px] text-white">
                Acesso profissional
              </span>
            </div>
            <div className="mb-2.5 flex items-center gap-2.5">
              <Logo size={32} />
              <span className="text-[24px] font-semibold text-white">
                ClipBook
              </span>
            </div>
            <p className="text-[14px] leading-relaxed text-white/60">
              Painel de gestão da sua barbearia.
            </p>
          </div>

          {/* Card de login */}
          <div className="rounded-2xl bg-surface p-5 shadow-[0_8px_24px_rgba(0,0,0,.35)]">
            <form onSubmit={onSubmit} noValidate>
              <Input
                label="E-mail"
                type="email"
                placeholder="voce@barbearia.com"
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
              <div className="mt-2 text-right">
                <Link
                  to="/esqueci-senha"
                  state={{ voltarPara: "/barbeiro/login" }}
                  className="text-[12.5px] font-medium text-brand-ink"
                >
                  Esqueci a senha
                </Link>
              </div>
              {erro && (
                <p className="mt-3 rounded-field bg-danger-tint-2 px-3 py-2 text-[13px] text-danger">
                  {erro}
                </p>
              )}
              <Button
                type="submit"
                className="mt-[18px] w-full"
                loading={isSubmitting}
              >
                Entrar
              </Button>
            </form>
          </div>

          <p className="mt-[18px] text-center text-[12px] text-white/60">
            Ainda não tem barbearia?{" "}
            <Link to="/barbeiro/cadastro" className="font-semibold text-brand-ink">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
