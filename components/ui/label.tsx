"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  required,
  children,
  count,
  error,
  min,
  max,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & { required?: boolean, count?: number, error?: boolean, min?: number, max?: number }) {

  const hasError = error
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        cn("text-[16px] font-semibold transition-colors duration-100 flex items-center gap-2", hasError && "text-text-danger"),
        className
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-1">
        <span>{children}</span>
        {required && (
          <span className="text-text-danger">*</span>
        )}
      </span>
      {(min !== undefined && max !== undefined) ? (
        <span
          className={cn(
            "italic text-xs font-medium transition-colors duration-100",
            hasError ? "text-text-danger" : "text-text-muted"
          )}
        >
          {min === max ? `Must be ${min}` : `Must be between ${min} and ${max}`}
        </span>
      ) : (count !== undefined) && (
        <span
          className={cn(
            "italic text-xs font-medium transition-colors duration-100",
            hasError ? "text-text-danger" : "text-text-muted"
          )}
        >
          {max !== undefined ? `${count}/${max}` : `${count}`}
        </span>
      )}
    </LabelPrimitive.Root>
  )
}

export { Label }
