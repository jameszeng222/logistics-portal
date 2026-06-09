import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-xl border border-border/50 bg-white/80 px-3 py-1 text-sm font-light text-foreground/80 transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-light file:text-foreground/80 placeholder:text-muted-foreground/40 focus:border-accent/30 focus:ring-2 focus:ring-accent/8 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-secondary/50 disabled:text-muted-foreground aria-invalid:border-red-300 aria-invalid:ring-2 aria-invalid:ring-red-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
