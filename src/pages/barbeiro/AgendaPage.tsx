import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { Header } from "../../components/layout/Header";
import { PanelShell } from "../../components/layout/PanelShell";
import { Badge, Button, Carregando, ErroCarregar, Vazio } from "../../components/ui";
import { useIsDesktop } from "../../hooks/useMediaQuery";
import { useCarregar } from "../../hooks/useCarregar";
import { agendaApi } from "../../api/agenda";
import { apiErrorMessage } from "../../api/axios";
import type { Agendamento } from "../../types";
import { statusConfig } from "../../utils/status";
import {
  duracaoMinutos,
  formatAgendaDate,
  formatCurrencyShort,
  formatTime,
  initials,
  toISODate,
  whatsappLink,
} from "../../utils/formatters";

/** Status que já não ocupam o horário — aparecem apagados. */
const apagado = (a: Agendamento) =>
  a.status === "CONCLUIDO" || a.status === "CANCELADO" || a.status === "REMARCADO";

export function AgendaPage() {
  const [dia, setDia] = useState(() => new Date());
  // "Hoje" é lido uma vez, ao abrir a tela.
  const [hojeISO] = useState(() => toISODate(new Date()));
  const diaISO = toISODate(dia);
  const { dados, setDados, erro, carregando, recarregar } = useCarregar(
    () => agendaApi.doPeriodo(diaISO),
    [diaISO],
  );
  const agenda = useMemo(() => dados ?? [], [dados]);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  const mudarDia = (delta: number) => {
    const novo = new Date(dia);
    novo.setDate(novo.getDate() + delta);
    setErroAcao(null);
    setDia(novo);
  };

  const agir = async (a: Agendamento, acao: "concluir" | "falta") => {
    setOcupado(a.id);
    setErroAcao(null);
    try {
      const atualizado = await agendaApi[acao](a.id);
      setDados((prev) => (prev ?? []).map((x) => (x.id === a.id ? atualizado : x)));
    } catch (e) {
      setErroAcao(apiErrorMessage(e));
    } finally {
      setOcupado(null);
    }
  };

  const { confirmados, previsto } = useMemo(() => {
    const conf = agenda.filter((a) => a.status === "CONFIRMADO");
    const valendo = agenda.filter((a) => a.status === "CONFIRMADO" || a.status === "CONCLUIDO");
    return {
      confirmados: conf.length,
      previsto: valendo.reduce((s, a) => s + a.preco, 0),
    };
  }, [agenda]);

  const ehHoje = diaISO === hojeISO;
  const rotuloPrevisto = ehHoje ? "previsto hoje" : "previsto no dia";

  const estado =
    carregando && !dados ? (
      <Carregando />
    ) : erro && !dados ? (
      <ErroCarregar mensagem={erro} onTentar={recarregar} />
    ) : agenda.length === 0 ? (
      <Vazio
        icone="📅"
        titulo="Nenhum agendamento neste dia"
        dica="Use o + para marcar um horário para um cliente."
      />
    ) : null;

  const acoes = (a: Agendamento, mobile: boolean) => (
    <>
      <Button
        size="sm"
        className={mobile ? "flex-1" : ""}
        loading={ocupado === a.id}
        onClick={() => agir(a, "concluir")}
      >
        Concluído
      </Button>
      <Button
        size="sm"
        variant="destructiveOutline"
        disabled={ocupado === a.id}
        onClick={() => agir(a, "falta")}
      >
        No-show
      </Button>
    </>
  );

  const isDesktop = useIsDesktop();

  /* ------------------------------- Desktop (D3) ------------------------------ */
  if (isDesktop) {
    return (
      <PanelShell>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => mudarDia(-1)}
              aria-label="Dia anterior"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-ink-2 hover:bg-line-2"
            >
              ‹
            </button>
            <h2 className="text-[26px] font-medium text-ink">
              {formatAgendaDate(dia)}
            </h2>
            <button
              onClick={() => mudarDia(1)}
              aria-label="Próximo dia"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-ink-2 hover:bg-line-2"
            >
              ›
            </button>
            {!ehHoje && (
              <button
                onClick={() => setDia(new Date())}
                className="text-[12px] font-semibold uppercase tracking-[0.4px] text-brand"
              >
                Hoje
              </button>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg border border-line bg-surface px-4 py-[11px]">
              <div className="text-[19px] font-semibold leading-none text-ink">
                {confirmados}
              </div>
              <div className="mt-[3px] text-[10.5px] text-muted">
                confirmados
              </div>
            </div>
            <div className="rounded-lg border border-line bg-surface px-4 py-[11px]">
              <div className="text-[19px] font-semibold leading-none text-brand">
                {formatCurrencyShort(previsto)}
              </div>
              <div className="mt-[3px] text-[10.5px] text-muted">
                {rotuloPrevisto}
              </div>
            </div>
            <Link
              to="/barbeiro/agendamento/novo"
              className="flex h-[46px] items-center rounded-field bg-brand px-4 text-[12px] font-semibold uppercase tracking-[0.5px] text-white hover:bg-brand-hover"
            >
              + Novo
            </Link>
          </div>
        </div>

        {erroAcao && <p className="mb-3 text-[13px] text-danger">{erroAcao}</p>}

        <div className="flex max-w-[820px] flex-col gap-2.5">
          {estado ??
            agenda.map((a) => {
              const cfg = statusConfig[a.status];
              const isConfirmado = a.status === "CONFIRMADO";
              return (
                <div
                  key={a.id}
                  className={`flex items-center justify-between rounded-card border border-line ${cfg.bar} border-l-4 bg-surface p-4 shadow-card ${
                    apagado(a) ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="min-w-[52px]">
                      <div className="text-[19px] font-semibold leading-none text-ink">
                        {formatTime(a.dataHora)}
                      </div>
                      <div className="mt-[3px] text-[10.5px] text-muted-2">
                        {duracaoMinutos(a.dataHora, a.terminaEm)}min
                      </div>
                    </div>
                    <div
                      className={`flex h-[38px] w-[38px] flex-none items-center justify-center rounded-lg text-[13px] font-bold ${
                        isConfirmado
                          ? "bg-brand-tint-2 text-brand"
                          : "bg-line-2 text-muted"
                      }`}
                    >
                      {initials(a.cliente.nome)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[14.5px] font-semibold text-ink">
                          {a.cliente.nome}
                        </span>
                        <Badge status={a.status} />
                      </div>
                      <div className="text-[12.5px] text-muted">
                        {a.servico.nome} · {formatCurrencyShort(a.preco)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isConfirmado && (
                      <>
                        {acoes(a, false)}
                        <a
                          href={whatsappLink(a.cliente.telefone, a.cliente.nome, a.dataHora)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-9 items-center rounded-field border-[1.5px] border-input-border bg-surface px-3 text-[11.5px] font-semibold text-ink-2 hover:bg-screen"
                        >
                          Lembrar ↗
                        </a>
                      </>
                    )}
                    <Link
                      to={`/barbeiro/agendamento/${a.id}`}
                      aria-label="Detalhes"
                      className="flex h-9 w-9 flex-none items-center justify-center rounded-field border-[1.5px] border-input-border bg-surface text-[14px] text-ink-2 hover:bg-screen"
                    >
                      ›
                    </Link>
                  </div>
                </div>
              );
            })}
        </div>
      </PanelShell>
    );
  }

  /* -------------------------------- Mobile (2.2) ----------------------------- */
  return (
    <AppShell withNav>
      <Header />

      {/* Seletor de dia */}
      <div className="mx-5 mb-1.5 flex flex-none items-center justify-between rounded-lg border border-line bg-surface px-3.5 py-[11px]">
        <button
          onClick={() => mudarDia(-1)}
          aria-label="Dia anterior"
          className="flex h-[30px] w-[30px] items-center justify-center rounded-field bg-screen text-[15px] text-ink-2 hover:bg-line"
        >
          ‹
        </button>
        <button onClick={() => setDia(new Date())} className="text-[14.5px] font-semibold text-ink">
          {formatAgendaDate(dia)}
        </button>
        <button
          onClick={() => mudarDia(1)}
          aria-label="Próximo dia"
          className="flex h-[30px] w-[30px] items-center justify-center rounded-field bg-screen text-[15px] text-ink-2 hover:bg-line"
        >
          ›
        </button>
      </div>

      {/* Estatísticas do dia */}
      <div className="flex flex-none gap-2 px-5 pb-2.5 pt-0.5">
        <div className="flex-1 rounded-lg border border-line bg-surface px-[11px] py-[9px]">
          <div className="text-[18px] font-semibold leading-none text-ink">
            {confirmados}
          </div>
          <div className="mt-[3px] text-[10.5px] text-muted">confirmados</div>
        </div>
        <div className="flex-1 rounded-lg border border-line bg-surface px-[11px] py-[9px]">
          <div className="text-[18px] font-semibold leading-none text-brand">
            {formatCurrencyShort(previsto)}
          </div>
          <div className="mt-[3px] text-[10.5px] text-muted">{rotuloPrevisto}</div>
        </div>
      </div>

      {erroAcao && <p className="mx-5 mb-1 text-[13px] text-danger">{erroAcao}</p>}

      {/* Lista de agendamentos */}
      <div className="flex flex-1 flex-col gap-2.5 px-5 pb-4 pt-1">
        {estado ??
          agenda.map((a) => {
            const cfg = statusConfig[a.status];
            const isConfirmado = a.status === "CONFIRMADO";
            return (
              <div
                key={a.id}
                className={`rounded-card border border-line ${cfg.bar} border-l-4 bg-surface p-[15px] shadow-card ${
                  apagado(a) ? "opacity-60" : ""
                }`}
              >
                <Link to={`/barbeiro/agendamento/${a.id}`} className="flex items-center gap-3">
                  <div className="min-w-[48px] flex-none text-center">
                    <div className="text-[19px] font-semibold leading-none text-ink">
                      {formatTime(a.dataHora)}
                    </div>
                    <div className="mt-[3px] text-[10.5px] text-muted-2">
                      {duracaoMinutos(a.dataHora, a.terminaEm)}min
                    </div>
                  </div>
                  <div className="w-px self-stretch bg-line-2" />
                  <div
                    className={`flex h-[38px] w-[38px] flex-none items-center justify-center rounded-lg text-[13px] font-bold ${
                      isConfirmado
                        ? "bg-brand-tint-2 text-brand"
                        : "bg-line-2 text-muted"
                    }`}
                  >
                    {initials(a.cliente.nome)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center gap-2">
                      <span className="truncate text-[14.5px] font-semibold text-ink">
                        {a.cliente.nome}
                      </span>
                      <Badge status={a.status} />
                    </div>
                    <div className="text-[12.5px] text-muted">
                      {a.servico.nome} · {formatCurrencyShort(a.preco)}
                    </div>
                  </div>
                </Link>

                {isConfirmado && (
                  <div className="mt-3 flex gap-[7px]">
                    {acoes(a, true)}
                    <a
                      href={whatsappLink(a.cliente.telefone, a.cliente.nome, a.dataHora)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-9 flex-none items-center rounded-field border-[1.5px] border-input-border bg-surface px-3 text-[11.5px] font-semibold text-ink-2 hover:bg-screen"
                    >
                      Lembrar ↗
                    </a>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Botão flutuante */}
      <div className="pointer-events-none sticky bottom-[84px] z-30 flex justify-end px-5">
        <Link
          to="/barbeiro/agendamento/novo"
          aria-label="Novo agendamento"
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-field bg-brand text-[28px] font-light leading-none text-white shadow-[0_8px_24px_rgba(2,74,216,.4)] hover:bg-brand-hover"
        >
          +
        </Link>
      </div>
    </AppShell>
  );
}
