import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className = '', ...rest },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.4px] text-muted"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={`h-[46px] w-full rounded-field border-[1.5px] bg-surface px-[13px] text-[15px] text-ink outline-none transition-colors duration-150 placeholder:text-placeholder focus:border-ink ${
          error ? 'border-danger' : 'border-input-border'
        }`}
        {...rest}
      />
      {error && <p className="mt-1.5 text-[12px] text-danger">{error}</p>}
    </div>
  )
})
