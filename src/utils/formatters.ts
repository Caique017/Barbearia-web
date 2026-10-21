export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

/** "R$ 8.240" — sem centavos, como no design (stats e preços). */
export const formatCurrencyShort = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

/** "Terça, 7 de julho" — cabeçalho do seletor de dia da agenda. */
export const formatAgendaDate = (date: Date) => {
  const weekday = date
    .toLocaleDateString("pt-BR", { weekday: "long" })
    .replace(/-feira$/, "");
  const rest = date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
  });
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${rest}`;
};

export const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

export const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

/** "Terça, 7 de julho" — cabeçalho da agenda */
export const formatLongDate = (date: Date) =>
  date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

/** YYYY-MM-DD para query params da API */
export const toISODate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const initials = (nome: string) =>
  nome
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const whatsappLink = (telefone: string, nome: string, horario: string) =>
  `https://wa.me/55${telefone.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Olá ${nome}, confirmando seu horário amanhã às ${horario}. Te esperamos! ✂️`,
  )}`;
