import type { ReactNode } from "react";
import { cn } from "cn";

export interface OsWindowProps {
  title: string;
  children: ReactNode;
  className?: string;
  titleBarClassName?: string;
  titleClassName?: string;
}

/** A card framed to look like a native OS window: traffic lights, a title bar, content below. */
function OsWindow({ title, children, className, titleBarClassName, titleClassName }: OsWindowProps) {
  return (
    <div className={cn("overflow-hidden rounded-xl shadow-sm ring-1 ring-foreground/10", className)}>
      <div
        className={cn(
          "flex items-center gap-1.5 border-b border-foreground/10 bg-muted px-3 py-2",
          titleBarClassName,
        )}
      >
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span
          className={cn(
            "flex-1 truncate text-center text-xs font-medium text-muted-foreground",
            titleClassName,
          )}
        >
          {title}
        </span>
        {/* Balances the traffic lights so the title stays visually centered. */}
        <span className="w-[3.75rem]" aria-hidden="true" />
      </div>
      {children}
    </div>
  );
}

export { OsWindow };
