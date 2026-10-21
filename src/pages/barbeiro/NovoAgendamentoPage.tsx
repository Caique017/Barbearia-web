import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { TopBar } from "../../components/layout/TopBar";
import { PanelShell } from "../../components/layout/PanelShell";
import { Button, Carregando, ErroCarregar, Input, Spinner } from "../../components/ui";
import { useIsDesktop } from "../../hooks/useMediaQuery";
import { useCarregar } from "../../hooks/useCarregar";
import { agendaApi } from "../../api/agenda";
import { barbeiroApi } from "../../api/barbeiro";
import { carteiraApi } from "../../api/carteira";
import { servicoApi } from "../../api/servico";
import { apiErrorMessage } from "../../api/axios";
import type { Cliente } from "../../types";
import { proximosDias } from "../../utils/dias";
import { servicoIcon } from "../../utils/servico";
import {
  dataCurta,
  formatCurrencyShort,
  formatTelefone,
  horaCurta,
  initials,
  toISODate,
  toLocalDateTime,
} from "../../utils/formatters";

const CheckCircle = ({ on }: { on: boolean }) => (
  <div
    className={`flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full border-[1.5px] ${
      on ? "border-brand bg-brand" : "border-input-border bg-transparent"
    }`}
  >
    {on && (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M2.5 6.2l2.3 2.3L9.5 3.5"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </div>
);

const so = (s: string) => s.replace(/\D/g, "");

export function NovoAgendamentoPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const dias = useMemo(() => proximosDias(14), []);

  const base = useCarregar(() =>
    Promise.all([barbeiroApi.perfil(), carteiraApi.listar(), servicoApi.listar()]),
  );
  const [perfil, clientesApi, servicos] = base.dados ?? [null, [], []];
  const [criados, setCriados] = useState<Cliente[]>([]);
  const clientes = useMemo(() => [...criados, ...clientesApi], [criados, clientesApi]);

  // Passo 1 — cliente
  const [busca, setBusca] = useState("");
  const [clienteSel, setClienteSel] = useState<string | null>(null);
  const [novoNome, setNovoNome] = useState("");
  const [novoWhats, setNovoWhats] = useState("");

  // Passo 2 — serviço e horário
  const [servicoSel, setServicoSel] = useState<string | null>(null);
  const [diaSel, setDiaSel] = useState(0);
  const [slotSel, setSlotSel] = useState<string | null>(null);
  const [horaLivre, setHoraLivre] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const dia = dias[diaSel];
  const slug = perfil?.slug ?? null;
  const horarios = useCarregar(
    () =>
      slug && servicoSel
        ? agendaApi.disponibilidade(slug, servicoSel, toISODate(dia)).then((d) => d.horarios.map(horaCurta))
        : Promise.resolve<string[]>([]),
    [slug, servicoSel, toISODate(dia)],
  );

  const servicosAtivos = useMemo(() => servicos.filter((s) => s.ativo), [servicos]);
  const resultados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return clientes.filter(
      (c) =>
        termo === "" ||
        c.nome.toLowerCase().includes(termo) ||
        (so(termo) !== "" && c.telefone.includes(so(termo))),
    );
  }, [busca, clientes]);

  const clienteEscolhido: Cliente | null =
    (clienteSel && clientes.find((c) => c.id === clienteSel)) ||
    (novoNome.trim()
      ? { id: "", nome: novoNome.trim(), telefone: novoWhats, temConta: false, pedidoVinculo: null }
      : null);

  const novoValido = !clienteSel && novoNome.trim() !== "" && /^[1-9]{2}9?\d{8}$/.test(so(novoWhats));
  const podeAvancar = !!clienteSel || novoValido;
  const horaEscolhida = horaLivre || slotSel;
  const podeConfirmar = podeAvancar && !!servicoSel && !!horaEscolhida;

  const escolherDia = (i: number) => {
    setDiaSel(i);
    setSlotSel(null);
  };

  const confirmar = async () => {
    if (!servicoSel || !horaEscolhida) return;
    setEnviando(true);
    setErro(null);
    try {
      let clienteId = clienteSel;
      if (!clienteId) {
        // Cadastra o cliente novo e já o deixa selecionado — se o horário
        // falhar, tentar de novo não cria o mesmo cliente duas vezes.
        const novo = await carteiraApi.cadastrar({ nome: novoNome.trim(), telefone: so(novoWhats) });
        setCriados((prev) => [novo, ...prev]);
        setClienteSel(novo.id);
        setNovoNome("");
        setNovoWhats("");
        clienteId = novo.id;
      }
      const criado = await agendaApi.criar({
        clienteId,
        servicoId: servicoSel,
        dataHora: toLocalDateTime(dia, horaEscolhida),
      });
      navigate(`/barbeiro/agendamento/${criado.id}`);
    } catch (e) {
      setErro(apiErrorMessage(e));
      horarios.recarregar();
    } finally {
      setEnviando(false);
    }
  };

  const isDesktop = useIsDesktop();

  if (!base.dados) {
    const estado = base.carregando ? (
      <Carregando />
    ) : (
      <ErroCarregar mensagem={base.erro ?? "Não foi possível carregar."} onTentar={base.recarregar} />
    );
    return isDesktop ? (
      <PanelShell>{estado}</PanelShell>
    ) : (
      <AppShell className="bg-screen">
        <TopBar title="Novo agendamento" />
        {estado}
      </AppShell>
    );
  }

  /* ------------------------------ Blocos comuns ----------------------------- */
  const campoBusca = (
    <div className="relative mb-4">
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#a5a5a5"
        strokeWidth="2"
        className="absolute left-3.5 top-1/2 -translate-y-1/2"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4-4" />
      </svg>
      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por nome ou WhatsApp"
        className="h-[46px] w-full rounded-full border-[1.5px] border-input-border bg-surface pl-10 pr-3.5 text-[14.5px] text-ink outline-none placeholder:text-placeholder focus:border-ink"
      />
    </div>
  );

  const listaClientes = (
    <div className="mb-5 flex max-h-[340px] flex-col gap-2.5 overflow-y-auto">
      {resultados.length === 0 && (
        <p className="text-[13px] text-muted">
          {clientes.length === 0 ? "Sua carteira ainda está vazia." : "Nenhum cliente encontrado."}
        </p>
      )}
      {resultados.map((c) => {
        const on = clienteSel === c.id;
        return (
          <button
            key={c.id}
            onClick={() => {
              setClienteSel(on ? null : c.id);
              setNovoNome("");
              setNovoWhats("");
            }}
            className={`flex items-center gap-3 rounded-card border-[1.5px] p-3 text-left transition-colors ${
              on ? "border-brand bg-brand-tint shadow-card" : "border-line bg-surface shadow-card"
            }`}
          >
            <div
              className={`flex h-[42px] w-[42px] flex-none items-center justify-center rounded-lg text-[14px] font-bold ${
                on ? "bg-brand text-white" : "bg-brand-tint text-brand"
              }`}
            >
              {initials(c.nome)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14.5px] font-semibold text-ink">{c.nome}</div>
              <div className="text-[12px] text-muted">{formatTelefone(c.telefone)}</div>
            </div>
            <CheckCircle on={on} />
          </button>
        );
      })}
    </div>
  );

  const novoCliente = (
    <>
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-line-3" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted">
          ou cadastrar novo
        </span>
        <div className="h-px flex-1 bg-line-3" />
      </div>
      <div className="flex flex-col gap-3">
        <Input
          label="Nome"
          placeholder="Nome do cliente"
          maxLength={100}
          value={novoNome}
          onChange={(e) => {
            setNovoNome(e.target.value);
            setClienteSel(null);
          }}
        />
        <Input
          label="WhatsApp"
          type="tel"
          placeholder="(11) 9 8888-7777"
          value={novoWhats}
          error={
            novoNome.trim() && novoWhats && !novoValido ? "Informe DDD + número." : undefined
          }
          onChange={(e) => setNovoWhats(e.target.value)}
        />
        <p className="m-0 text-[12px] leading-relaxed text-muted">
          Sem senha por agora. Se o cliente criar conta pelo seu link com este telefone,
          você aprova o vínculo na tela de clientes.
        </p>
      </div>
    </>
  );

  const listaServicos = (
    <div className="mb-5 flex flex-col gap-2.5">
      {servicosAtivos.length === 0 && (
        <p className="text-[13px] text-muted">Cadastre um serviço ativo antes de agendar.</p>
      )}
      {servicosAtivos.map((s) => {
        const on = servicoSel === s.id;
        return (
          <button
            key={s.id}
            onClick={() => {
              setServicoSel(s.id);
              setSlotSel(null);
            }}
            className={`flex items-center gap-3 rounded-card border-[1.5px] p-3.5 text-left transition-colors ${
              on ? "border-brand bg-brand-tint shadow-card" : "border-line bg-surface shadow-card"
            }`}
          >
            <div
              className={`flex h-10 w-10 flex-none items-center justify-center rounded-lg text-lg ${
                on ? "bg-brand-tint-2" : "bg-screen"
              }`}
            >
              {servicoIcon(s.nome)}
            </div>
            <div className="flex-1">
              <span className="text-[14.5px] font-semibold text-ink">{s.nome}</span>
              <div className="mt-0.5 text-[12px] text-muted">{s.duracaoMinutos} min</div>
            </div>
            <span className="text-[14.5px] font-semibold text-ink">{formatCurrencyShort(s.preco)}</span>
            <CheckCircle on={on} />
          </button>
        );
      })}
    </div>
  );

  const seletorDia = (
    <div className="mb-4 flex gap-2 overflow-x-auto pb-1.5">
      {dias.map((d, i) => {
        const on = i === diaSel;
        const dow = d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "").slice(0, 3).toUpperCase();
        return (
          <button
            key={i}
            onClick={() => escolherDia(i)}
            className={`w-[54px] flex-none rounded-lg border-[1.5px] py-2.5 text-center transition-colors ${
              on ? "border-brand bg-brand text-white" : "border-line bg-surface"
            }`}
          >
            <div className={`text-[10.5px] font-semibold tracking-[0.4px] ${on ? "text-white/80" : "text-muted"}`}>
              {dow}
            </div>
            <div className={`mt-[3px] text-[19px] font-semibold ${on ? "text-white" : "text-ink"}`}>
              {d.getDate()}
            </div>
          </button>
        );
      })}
    </div>
  );

  const gradeHorarios = (colunas: string) => (
    <>
      <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">
        Horários livres · {dataCurta(dia)}
      </div>
      {!servicoSel ? (
        <p className="mb-4 text-[13px] text-muted">Escolha o serviço para ver os horários.</p>
      ) : horarios.carregando ? (
        <div className="mb-4 flex justify-center py-4 text-brand">
          <Spinner />
        </div>
      ) : (horarios.dados ?? []).length === 0 ? (
        <p className="mb-4 text-[13px] text-muted">
          Nenhum horário livre no expediente deste dia. Use "outro horário" abaixo se quiser
          encaixar mesmo assim.
        </p>
      ) : (
        <div className={`mb-4 grid ${colunas} gap-2`}>
          {(horarios.dados ?? []).map((h) => {
            const on = slotSel === h && !horaLivre;
            return (
              <button
                key={h}
                onClick={() => {
                  setSlotSel(h);
                  setHoraLivre("");
                }}
                className={`rounded-field border-[1.5px] py-[13px] text-center text-[14px] font-semibold transition-colors ${
                  on ? "border-brand bg-brand text-white" : "border-input-border bg-surface text-ink hover:border-ink"
                }`}
              >
                {h}
              </button>
            );
          })}
        </div>
      )}
      <Input
        label="Outro horário (fora do expediente)"
        type="time"
        step={300}
        className="mb-4"
        value={horaLivre}
        onChange={(e) => setHoraLivre(e.target.value)}
      />
      {erro && <p className="mb-3 text-[13px] text-danger">{erro}</p>}
    </>
  );

  /* ------------------------------- Desktop (D7) ------------------------------ */
  if (isDesktop) {
    return (
      <PanelShell>
        <h2 className="mb-6 text-[26px] font-medium text-ink">Novo agendamento</h2>
        <div className="flex max-w-[960px] gap-9">
          <div className="w-[320px] flex-none">
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">
              1 · Cliente
            </div>
            {campoBusca}
            {listaClientes}
            {novoCliente}
          </div>
          <div className="flex-1">
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">
              2 · Serviço e horário
            </div>
            {listaServicos}
            {seletorDia}
            {gradeHorarios("grid-cols-4")}
            <Button className="w-full" disabled={!podeConfirmar} loading={enviando} onClick={confirmar}>
              Confirmar agendamento
            </Button>
          </div>
        </div>
      </PanelShell>
    );
  }

  /* --------------------------- Mobile (2.3 / 2.4) ---------------------------- */
  return (
    <AppShell className="bg-screen">
      <TopBar title="Novo agendamento" />

      {/* Progresso */}
      <div className="flex-none px-[22px] pb-3 pt-2.5">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.4px] text-brand">
            Passo {step} de 2
          </span>
          <span className="text-[12.5px] text-muted">
            · {step === 1 ? "Cliente" : "Serviço e horário"}
          </span>
        </div>
        <div className="flex gap-[5px]">
          <div className="h-1 flex-1 rounded bg-brand" />
          <div className={`h-1 flex-1 rounded ${step === 2 ? "bg-brand" : "bg-line-3"}`} />
        </div>
      </div>

      {step === 1 ? (
        <div className="flex flex-1 flex-col px-[22px] pb-6 pt-0.5">
          {campoBusca}
          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">
            Seus clientes
          </div>
          {listaClientes}
          {novoCliente}
        </div>
      ) : (
        <div className="flex flex-1 flex-col px-[22px] pb-6 pt-0.5">
          {/* Cliente escolhido */}
          <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-line bg-surface px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-tint text-[12px] font-bold text-brand">
              {initials(clienteEscolhido?.nome ?? "")}
            </div>
            <div className="flex-1">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.4px] text-muted">
                Cliente
              </div>
              <div className="text-[13.5px] font-semibold text-ink">{clienteEscolhido?.nome}</div>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-[11px] font-semibold uppercase tracking-[0.4px] text-brand"
            >
              Trocar
            </button>
          </div>

          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">
            Serviço
          </div>
          {listaServicos}
          {seletorDia}
          {gradeHorarios("grid-cols-3")}
        </div>
      )}

      {/* Rodapé fixo */}
      <div className="sticky bottom-0 flex-none border-t border-line bg-surface px-5 pb-6 pt-3.5 shadow-[0_-2px_8px_rgba(26,26,26,.04)]">
        {step === 1 ? (
          <Button className="w-full" disabled={!podeAvancar} onClick={() => setStep(2)}>
            Continuar
          </Button>
        ) : (
          <Button className="w-full" disabled={!podeConfirmar} loading={enviando} onClick={confirmar}>
            Confirmar agendamento
          </Button>
        )}
      </div>
    </AppShell>
  );
}
