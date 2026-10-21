import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TopBar } from "../../components/layout/TopBar";
import { Logo } from "../../components/layout/Logo";
import { Button, Input, Spinner } from "../../components/ui";
import { authApi } from "../../api/auth";
import { apiErrorMessage, apiFieldErrors } from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import type { BarbeariaPublica } from "../../types";

const schema = z
  .object({
    nome: z.string().min(1, "Informe seu nome"),
    email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
    // Espelha Telefone.PADRAO da API, que valida depois de remover o que não é dígito.
    telefone: z
      .string()
      .refine(
        (v) => /^[1-9]{2}9?\d{8}$/.test(v.replace(/\D/g, "")),
        "Telefone inválido. Informe DDD + número.",
      ),
    senha: z
      .string()
      .min(8, "Mínimo de 8 caracteres")
      .max(64, "Máximo de 64 caracteres"),
    confirmar: z.string().min(1, "Repita a senha"),
  })
  .refine((d) => d.senha === d.confirmar, {
    path: ["confirmar"],
    message: "As senhas não conferem",
  });
type FormData = z.infer<typeof schema>;

export function CadastroPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [erro, setErro] = useState<string | null>(null);
  const { slug } = useParams<{ slug: string }>();
  const [pendente, setPendente] = useState(false);
  const [barbearia, setBarbearia] = useState<BarbeariaPublica | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    setErro(null);
    if (!slug) return;
    let active = true;
    authApi
      .buscarBarbearia(slug)
      .then((b) => {
        if (active) setBarbearia(b);
      })
      .catch((e) => {
        if (active) setErro(apiErrorMessage(e));
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const onSubmit = handleSubmit(async (data) => {
    if (!barbearia) return;
    setErro(null);
    try {
      const res = await authApi.registrarCliente({
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        senha: data.senha,
        barbeiroId: barbearia.barbeiroId,
      });
      // A conta existe e o token vale nos dois casos — o que fica pendente é o vínculo.
      await login(res.token);
      if (res.vinculoPendente) {
        setPendente(true);
        return;
      }
      navigate("/cliente/historico", { replace: true });
    } catch (e) {
      // Marca cada input com a mensagem do 400; o resto cai na mensagem geral.
      for (const c of apiFieldErrors(e)) {
        setError(c.campo as keyof FormData, { message: c.mensagem });
      }
      setErro(
        apiErrorMessage(
          e,
          "Não foi possível criar sua conta. Tente novamente.",
        ),
      );
    }
  });

  if (pendente)
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-screen px-[22px] text-center">
        <h1 className="m-0 text-[22px] font-medium leading-tight text-ink">
          Cadastro aguardando aprovação
        </h1>
        <p className="m-0 max-w-[360px] text-[14px] leading-relaxed text-ink-2">
          Já existe um cliente com esse telefone
          {barbearia ? ` na ${barbearia.nome}` : ""}. Seu cadastro está
          aguardando a aprovação da barbearia para liberar seu histórico.
        </p>
        {slug && (
          <Link
            to={`/b/${slug}`}
            className="mt-1 text-[13px] font-semibold text-brand"
          >
            Voltar para a barbearia
          </Link>
        )}
      </div>
    );
  if (!barbearia && erro)
    return (
      <div className="flex min-h-dvh items-center justify-center bg-screen text-danger">
        <p>{erro}</p>
      </div>
    );
  if (!barbearia)
    return (
      <div className="flex min-h-dvh items-center justify-center bg-screen text-brand">
        <Spinner className="h-8 w-8" />
      </div>
    );

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-screen lg:max-w-none lg:flex-row lg:bg-surface">
      {/* Painel de marca — só no desktop (design D5) */}
      <div className="relative hidden flex-1 overflow-hidden bg-ink text-white lg:block">
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#1a1a1a,#111)]" />
        <div className="absolute right-[64px] top-[60px] h-[180px] w-[34px] bg-brand [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)]" />
        <div className="absolute right-[24px] top-[60px] h-[180px] w-[34px] bg-brand-light [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)]" />
        <div className="absolute bottom-16 left-14 right-14">
          <div className="mb-3.5 flex items-center gap-2.5">
            <Logo size={32} />
            <span className="text-[24px] font-semibold text-white">
              ClipBook
            </span>
          </div>
          <h2 className="max-w-[400px] text-[34px] font-medium leading-tight text-white">
            Crie sua conta na {barbearia.nome}!
          </h2>
        </div>
      </div>

      {/* Painel do formulário (direita no desktop) */}
      <div className="flex flex-1 flex-col lg:w-[460px] lg:flex-none lg:justify-center lg:overflow-y-auto lg:px-[60px] lg:py-14">
        <div className="lg:hidden">
          <TopBar to="/login" />
        </div>
        <div className="flex flex-1 flex-col px-[22px] pb-7 pt-3 lg:flex-none lg:px-0 lg:pb-0 lg:pt-0">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">
            Novo cliente
          </div>
          <h1 className="m-0 mb-1.5 text-[27px] font-medium leading-tight text-ink">
            Criar sua conta na {barbearia.nome}.
          </h1>
          <p className="mb-5 text-[14px] leading-relaxed text-ink-2 lg:hidden">
            Guarde seu histórico e agende ainda mais rápido da próxima vez.
          </p>


          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
            <Input
              label="Nome completo"
              placeholder="Seu nome"
              autoComplete="name"
              error={errors.nome?.message}
              {...register("nome")}
            />
            <Input
              label="E-mail"
              type="email"
              placeholder="voce@email.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Telefone"
              type="tel"
              placeholder="(11) 9 8888-7777"
              autoComplete="tel"
              error={errors.telefone?.message}
              {...register("telefone")}
            />
            <div className="flex gap-2.5">
              <Input
                label="Senha"
                type="password"
                placeholder="mín. 6"
                autoComplete="new-password"
                className="flex-1"
                error={errors.senha?.message}
                {...register("senha")}
              />
              <Input
                label="Confirmar"
                type="password"
                placeholder="repita"
                autoComplete="new-password"
                className="flex-1"
                error={errors.confirmar?.message}
                {...register("confirmar")}
              />
            </div>
            <p className="text-[12px] text-muted">
              Seu e-mail será usado para login.
            </p>
            {erro && (
              <p className="rounded-field bg-danger-tint-2 px-3 py-2 text-[13px] text-danger">
                {erro}
              </p>
            )}
            <Button
              type="submit"
              className="mt-1 w-full"
              loading={isSubmitting}
              disabled={!barbearia || isSubmitting}
            >
              Criar conta
            </Button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-[13px] text-muted">Já tenho conta </span>
            <Link to="/login" className="text-[13px] font-semibold text-brand">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
