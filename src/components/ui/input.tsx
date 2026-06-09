import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-sm text-stone-800 transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-stone-800 placeholder:text-stone-300 focus:border-accent/40 focus:ring-2 focus:ring-accent/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-400 aria-invalid:border-red-400 aria-invalid:ring-2 aria-invalid:ring-red-100",
        className
      )}
      {...props}
    />
  )
}

export { Input }
