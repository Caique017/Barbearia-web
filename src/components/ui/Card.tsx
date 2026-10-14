import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/** Superfície branca com borda arredondada e sombra suave — base dos cards do design. */
export function Card({ className = '', children, ...rest }: CardProps) {
  return (
    <div
      className={`rounded-card border border-line bg-surface shadow-card ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
