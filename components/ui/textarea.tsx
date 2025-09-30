import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground aria-invalid:border-text-danger dark:bg-input/30 min-h-16 w-full max-w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 overflow-auto resize-y whitespace-pre-wrap break-words",
                "min-h-[80px] w-full max-w-full rounded-[8px] bg-background-base-low px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none border border-border-subtle focus:border-[#5197ed] disabled:cursor-not-allowed disabled:opacity-50 overflow-auto resize-y whitespace-pre-wrap break-words",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
