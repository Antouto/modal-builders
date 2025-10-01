import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, "aria-invalid": ariaInvalid, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      style={{ transition: 'border-color .1s' }}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground dark:bg-input/30 border-custom-input-border-color flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-custom-input-text-color shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "flex h-[36px] w-full rounded-[8px] bg-custom-input-background-color px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none border border-border-subtle focus:border-custom-input-focus-border-color disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-text-danger aria-invalid:focus:border-text-danger hover:custom-input-hover-border-color",
        className
      )}
      aria-invalid={ariaInvalid}
      {...props}
    />
  )
}

export { Input }
