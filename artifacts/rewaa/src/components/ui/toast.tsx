import * as React from "react"
import { Cross2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

const Toast = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
        className
      )}
      {...props}
    />
  )
})
Toast.displayName = "Toast"

export { Toast }

// Placeholder for full Toaster implementation
// Real implementation would use @radix-ui/react-toast or sonner
export function Toaster() {
  return null;
}
