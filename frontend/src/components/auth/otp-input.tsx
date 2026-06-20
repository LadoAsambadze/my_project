'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
  autoFocus?: boolean
}

/**
 * A row of single-digit inputs for entering a numeric one-time code.
 * Auto-advances on type, steps back on Backspace, and supports pasting the
 * whole code. `value` is the concatenated digits (filled left to right).
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled,
  autoFocus,
}: OtpInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  const focusAt = (index: number) => {
    inputs.current[Math.max(0, Math.min(index, length - 1))]?.focus()
  }

  const setDigit = (index: number, digit: string) => {
    const next = Array.from({ length }, (_, i) => value[i] ?? '')
    next[index] = digit
    onChange(next.join('').replace(/\s/g, ''))
  }

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1)
    setDigit(index, digit)
    if (digit) focusAt(index + 1)
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      e.preventDefault()
      setDigit(index - 1, '')
      focusAt(index - 1)
    } else if (e.key === 'ArrowLeft') {
      focusAt(index - 1)
    } else if (e.key === 'ArrowRight') {
      focusAt(index + 1)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length)
    if (!pasted) return
    onChange(pasted)
    focusAt(pasted.length)
  }

  return (
    <div className="flex justify-center gap-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          autoFocus={autoFocus && i === 0}
          disabled={disabled}
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={cn(
            'h-12 w-11 rounded-md border border-input bg-background text-center text-lg font-semibold outline-none',
            'focus:border-primary focus:ring-2 focus:ring-primary/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        />
      ))}
    </div>
  )
}
