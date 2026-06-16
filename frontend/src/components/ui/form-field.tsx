import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface FormFieldProps {
  /** Field id, used to tie the label/control/error together. */
  id: string
  label: string
  error?: string
  /** Optional helper text shown when there is no error. */
  helper?: string
  /** A trailing element next to the label (e.g. character count). */
  labelAddon?: React.ReactNode
  className?: string
  children: React.ReactNode
}

/**
 * Reusable form-field wrapper: label + control + inline error + helper text,
 * with accessible wiring (aria-describedby / aria-invalid via the control's id).
 */
function FormField({
  id,
  label,
  error,
  helper,
  labelAddon,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {labelAddon ? (
          <span className="text-xs text-muted-foreground">{labelAddon}</span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-sm font-medium text-destructive"
        >
          {error}
        </p>
      ) : helper ? (
        <p id={`${id}-helper`} className="text-xs text-muted-foreground">
          {helper}
        </p>
      ) : null}
    </div>
  )
}

/** Build the aria-describedby id a control should reference for a field. */
function fieldDescribedBy(
  id: string,
  error?: string,
  helper?: string
): string | undefined {
  if (error) return `${id}-error`
  if (helper) return `${id}-helper`
  return undefined
}

export { FormField, fieldDescribedBy }
