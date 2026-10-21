/** Ícone pelo nome do serviço — a API não guarda ícone, então o nome decide. */
export const servicoIcon = (nome: string) => {
  const n = nome.toLowerCase()
  if (n.includes('corte') && n.includes('barba')) return '💈'
  if (n.includes('barba')) return '🪒'
  if (n.includes('sobrancelha')) return '💎'
  if (n.includes('pezinho') || n.includes('acabamento')) return '✨'
  if (n.includes('corte')) return '✂️'
  return '💈'
}
