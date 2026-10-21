import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { Header } from "../../components/layout/Header";
import { PanelShell } from "../../components/layout/PanelShell";
import { Badge, Button } from "../../components/ui";
import { useIsDesktop } from "../../hooks/useMediaQuery";
import { mockAgenda } from "../../data/mock";
import type { Agendamento, StatusAgendamento } from "../../types";
import { statusConfig } from "../../utils/status";
import {
  formatAgendaDate,
  formatCurrencyShort,
  formatTime,
  initials,
  toISODate,
  whatsappLink,
} from "../../utils/formatters";

export function AgendaPage() {
  const [dia, setDia] = useState(() => new Date());
  // TODO: integrar com API — GET /barbeiro/agenda?data=YYYY-MM-DD
  const [agenda, setAgenda] = useState<Agendamento[]>(() =>
    mockAgenda(toISODate(new Date())),
  );

  const mudarDia = (delta: number) => {
    const novo = new Date(dia);
    novo.setDate(novo.getDate() + delta);
    setDia(novo);
    setAgenda(mockAgenda(toISODate(novo)));
  };

  const setStatus = (id: string, status: StatusAgendamento) =>
    setAgenda((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

  const { confirmados, previsto } = useMemo(() => {
    const conf = agenda.filter((a) => a.status === "CONFIRMADO");
    return {
      confirmados: conf.length,
      previsto: conf.reduce((s, a) => s + a.servico.preco, 0),
    };
  }, [agenda]);

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
                previsto hoje
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

        <div className="flex max-w-[820px] flex-col gap-2.5">
          {agenda.length === 0 ? (
            <div className="rounded-card border border-line bg-surface p-10 text-center text-[14px] text-muted shadow-card">
              Nenhum agendamento neste dia.
            </div>
          ) : (
            agenda.map((a) => {
              const cfg = statusConfig[a.status];
              const isConfirmado = a.status === "CONFIRMADO";
              return (
                <div
                  key={a.id}
                  className={`flex items-center justify-between rounded-card border border-line ${cfg.bar} border-l-4 bg-surface p-4 shadow-card ${
                    a.status === "CONCLUIDO" || a.status === "CANCELADO"
                      ? "opacity-60"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="min-w-[52px]">
                      <div className="text-[19px] font-semibold leading-none text-ink">
                        {formatTime(a.dataHora)}
                      </div>
                      <div className="mt-[3px] text-[10.5px] text-muted-2">
                        {a.servico.duracaoMinutos}min
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
                        {a.servico.nome} ·{" "}
                        {formatCurrencyShort(a.servico.preco)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isConfirmado && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => setStatus(a.id, "CONCLUIDO")}
                        >
                          Concluído
                        </Button>
                        <Button
                          size="sm"
                          variant="destructiveOutline"
                          onClick={() => setStatus(a.id, "NO_SHOW")}
                        >
                          No-show
                        </Button>
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
            })
          )}
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
        <span className="text-[14.5px] font-semibold text-ink">
          {formatAgendaDate(dia)}
        </span>
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
          <div className="mt-[3px] text-[10.5px] text-muted">previsto hoje</div>
        </div>
      </div>

      {/* Lista de agendamentos */}
      <div className="flex flex-1 flex-col gap-2.5 px-5 pb-4 pt-1">
        {agenda.length === 0 ? (
          <div className="mt-16 flex flex-col items-center px-6 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-tint text-2xl">
              📅
            </div>
            <p className="text-[15px] font-semibold text-ink">
              Nenhum agendamento neste dia
            </p>
            <p className="mt-1 text-[13px] text-muted">
              Toque no + para marcar um horário para um cliente.
            </p>
          </div>
        ) : (
          agenda.map((a) => {
            const cfg = statusConfig[a.status];
            const isConfirmado = a.status === "CONFIRMADO";
            return (
              <div
                key={a.id}
                className={`rounded-card border border-line ${cfg.bar} border-l-4 bg-surface p-[15px] shadow-card ${
                  a.status === "CONCLUIDO" || a.status === "CANCELADO"
                    ? "opacity-60"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="min-w-[48px] flex-none text-center">
                    <div className="text-[19px] font-semibold leading-none text-ink">
                      {formatTime(a.dataHora)}
                    </div>
                    <div className="mt-[3px] text-[10.5px] text-muted-2">
                      {a.servico.duracaoMinutos}min
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
                      {a.servico.nome} · {formatCurrencyShort(a.servico.preco)}
                    </div>
                  </div>
                </div>

                {isConfirmado && (
                  <div className="mt-3 flex gap-[7px]">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => setStatus(a.id, "CONCLUIDO")}
                    >
                      Concluído
                    </Button>
                    <Button
                      size="sm"
                      variant="destructiveOutline"
                      onClick={() => setStatus(a.id, "NO_SHOW")}
                    >
                      No-show
                    </Button>
                    <a
                      href={whatsappLink(
                        a.cliente.telefone,
                        a.cliente.nome,
                        formatTime(a.dataHora),
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-9 flex-none items-center rounded-field border-[1.5px] border-input-border bg-surface px-3 text-[11.5px] font-semibold text-ink-2 hover:bg-screen"
                    >
                      Lembrar ↗
                    </a>
                    <Link
                      to={`/barbeiro/agendamento/${a.id}`}
                      aria-label="Detalhes"
                      className="flex h-9 w-9 flex-none items-center justify-center rounded-field border-[1.5px] border-input-border bg-surface text-[14px] text-ink-2 hover:bg-screen"
                    >
                      ›
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        )}
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
