import * as React from "react"
import { cn } from "./Button"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-brand-gold/20 bg-black/40 px-3 py-2 text-sm font-mono text-brand-cream placeholder:text-brand-cream/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-gold disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
