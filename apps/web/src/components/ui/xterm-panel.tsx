import "@xterm/xterm/css/xterm.css";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal, type ITheme } from "@xterm/xterm";
import { useEffect, useRef } from "react";
import { cn } from "cn";

export interface XtermPanelProps {
  /** ANSI 0-15 plus background/foreground, applied live without recreating the terminal. */
  theme: ITheme;
  /** Lines written on mount and whenever they change; may contain raw ANSI SGR escapes. */
  lines: string[];
  className?: string;
}

/** A read-only xterm.js terminal: renders `lines` (raw ANSI escapes allowed) under `theme`. */
function XtermPanel({ theme, lines, className }: XtermPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const term = new Terminal({
      convertEol: true,
      disableStdin: true,
      cursorBlink: false,
      fontSize: 13,
      theme,
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(container);
    fitAddon.fit();
    termRef.current = term;

    const resizeObserver = new ResizeObserver(() => fitAddon.fit());
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      term.dispose();
      termRef.current = null;
    };
    // Only the initial theme seeds construction; live updates happen below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const term = termRef.current;
    if (term) {
      term.options.theme = { ...theme };
    }
  }, [theme]);

  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    term.reset();
    for (const line of lines) {
      term.writeln(line);
    }
  }, [lines]);

  return (
    <div
      ref={containerRef}
      data-testid="xterm-panel"
      className={cn("overflow-hidden rounded-lg", className)}
    />
  );
}

export { XtermPanel };
