interface LogoProps {
  size?: number
  /** Cor das listras claras — use o tom do fundo onde o logo está. */
  light?: string
}

/** Poste de barbeiro estilizado — marca do ClipBook. */
export function Logo({ size = 28, light = '#ffffff' }: LogoProps) {
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        background: `repeating-linear-gradient(45deg,#024ad8 0 ${size / 5}px,${light} ${size / 5}px ${(size / 5) * 2}px)`,
        boxShadow: '0 0 0 1px rgba(255,255,255,.3)',
      }}
    />
  )
}
