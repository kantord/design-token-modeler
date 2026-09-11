import type { ReactNode } from "react";
import { cn } from "cn";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface SidebarProps {
  children: ReactNode;
  className?: string;
}

/** A sticky, independently-scrollable panel styled like a floating card. */
function Sidebar({ children, className }: SidebarProps) {
  return (
    <aside className={cn("w-full lg:sticky lg:top-6 lg:w-96 lg:shrink-0 lg:self-start", className)}>
      <div className="overflow-hidden rounded-2xl bg-card shadow-xl ring-1 ring-foreground/10">
        <ScrollArea className="flex flex-col gap-6 p-6 lg:max-h-[calc(100vh-3rem)]">
          {children}
        </ScrollArea>
      </div>
    </aside>
  );
}

export { Sidebar };
