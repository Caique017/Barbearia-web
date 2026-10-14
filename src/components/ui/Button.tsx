import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'destructive' | 'destructiveOutline' | 'ghostDark'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
}

const base =
  'relative inline-flex items-center justify-center gap-2 rounded-field font-semibold uppercase cursor-pointer select-none transition-[background-color,transform,border-color] duration-150 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100'

const variants: Record<Variant, string> = {
  primary: 'border border-transparent bg-brand text-white hover:bg-brand-hover',
  secondary: 'border-[1.5px] border-brand bg-surface text-brand hover:bg-brand-soft',
  destructive: 'border border-transparent bg-danger text-white hover:bg-danger-hover',
  destructiveOutline:
    'border-[1.5px] border-danger-border bg-surface text-danger hover:bg-danger-tint-2',
  ghostDark: 'border-[1.5px] border-white/30 bg-transparent text-white hover:bg-white/10',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-[11px] tracking-[0.5px]',
  md: 'h-12 px-4 text-[13px] tracking-[0.7px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner className="h-4 w-4" />}
      <span className={loading ? 'opacity-80' : ''}>{children}</span>
    </button>
  )
}
