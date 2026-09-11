import type * as React from "react";
import { cn } from "cn";

/** A minimal shadcn-style scroll area: no dedicated primitive exists for the
 * react-aria base, so this just leans on native thin-scrollbar styling. */
function ScrollArea({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="scroll-area"
      className={cn(
        "overflow-y-auto overscroll-contain [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]",
        className,
      )}
      {...props}
    />
  );
}

export { ScrollArea };
