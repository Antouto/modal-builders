import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "border border-[#ffffff14] px-[14px] py-2 bg-[#5865F2] text-primary-foreground hover:bg-[rgb(71,82,196)]",
        success: "border border-[#97979f0a] px-[14px] py-2 bg-[rgb(36,128,69)] hover:bg-[rgb(26,99,52)]",
        destructive:
          "border border-[#97979f0a] px-[14px] py-2 bg-[rgb(218,55,60)] text-destructive-foreground hover:bg-[rgb(161,40,41)]",
        outline:
          "border border-[#97979f0a] px-[14px] py-2 border border-input bg-[#313338] hover:bg-accent hover:text-accent-foreground",
        "secondary-outline": "border border-[rgba(151,151,159,0.2)] px-[14px] bg-transparent hover:bg-[rgba(151,151,159,0.2)]", //not exactly like in discord
        secondary:
          "bg-[rgba(151,151,159,0.12)] hover:bg-[rgba(151,151,159,0.2)] active:bg-[rgba(80,80,90,0.3)] text-[rgb(235,235,237)] border-[#97979f0a] border h-8 px-[14px] py-2",
        ghost:
          "text-[rgb(141,161,252)] hover:underline",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 text-[14px]",
        sm: "h-9 rounded-md px-3",
        md: "h-10 rounded-md px-6",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
