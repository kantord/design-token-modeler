import type { ITheme } from "@xterm/xterm";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { OsWindow } from "@/components/ui/os-window";
import { XtermPanel } from "@/components/ui/xterm-panel";
import { hexForRole, type AnsiRole, type Mapping, type PaletteColor } from "@/lib/palette";

/** xterm's own chrome (background/foreground) is a fixed light or dark scheme —
 * only the 16 ANSI slots come from the mapping, so the palette being showcased
 * is never accidentally invisible against its own background. Real ANSI palettes
 * are designed to work on both, which is exactly what these two are for. */
function ansiTheme(palette: PaletteColor[], mapping: Mapping, dark: boolean): ITheme {
  const hex = (n: number) => hexForRole(palette, mapping, `ansi${n}` as AnsiRole);
  return {
    background: dark ? "#1e1e1e" : "#ffffff",
    foreground: dark ? "#e5e5e5" : "#24292e",
    black: hex(0),
    red: hex(1),
    green: hex(2),
    yellow: hex(3),
    blue: hex(4),
    magenta: hex(5),
    cyan: hex(6),
    white: hex(7),
    brightBlack: hex(8),
    brightRed: hex(9),
    brightGreen: hex(10),
    brightYellow: hex(11),
    brightBlue: hex(12),
    brightMagenta: hex(13),
    brightCyan: hex(14),
    brightWhite: hex(15),
  };
}

function ansiLabel(n: number): string {
  return `ANSI ${n}`.padEnd(8);
}

// One row per base hue: a normal-intensity swatch next to its "light" counterpart.
const PALETTE_LINES = Array.from(
  { length: 8 },
  (_, i) => `\x1b[3${i}m███\x1b[0m ${ansiLabel(i)} \x1b[9${i}m███\x1b[0m ${ansiLabel(i + 8)}`,
);

// The same 16 colors as they actually get used: a prompt, file statuses, log levels.
const SESSION_LINES = [
  "\x1b[32m$\x1b[0m \x1b[1mgit status\x1b[0m",
  "On branch \x1b[36mmain\x1b[0m",
  "Changes not staged for commit:",
  "  \x1b[31mmodified:   src/app.tsx\x1b[0m",
  "  \x1b[32mnew file:   src/widget.tsx\x1b[0m",
  "",
  "\x1b[33mwarning\x1b[0m: 2 files need formatting",
  "\x1b[31merror\x1b[0m: type mismatch in \x1b[36mtheme.ts:42\x1b[0m",
  "\x1b[32msuccess\x1b[0m: build completed in 1.2s",
];

const TERMINAL_LINES = [...PALETTE_LINES, "", ...SESSION_LINES];

export interface TerminalPreviewProps {
  palette: PaletteColor[];
  mapping: Mapping;
}

function TerminalPreview({ palette, mapping }: TerminalPreviewProps) {
  const darkTheme = ansiTheme(palette, mapping, true);
  const lightTheme = ansiTheme(palette, mapping, false);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1">
        <CardTitle>Terminal preview</CardTitle>
        <CardDescription>
          The 16 ANSI slots, mapped from the palette on the left, on both a dark and a light
          terminal background.
        </CardDescription>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <OsWindow
          title="zsh — dark"
          className="flex-1"
          titleBarClassName="bg-[#2d2d2d] border-[#3d3d3d]"
          titleClassName="text-[#a0a0a0]"
        >
          <XtermPanel theme={darkTheme} lines={TERMINAL_LINES} className="h-96 rounded-none" />
        </OsWindow>
        <OsWindow
          title="zsh — light"
          className="flex-1"
          titleBarClassName="bg-[#e5e5e5] border-[#d0d0d0]"
          titleClassName="text-[#57606a]"
        >
          <XtermPanel theme={lightTheme} lines={TERMINAL_LINES} className="h-96 rounded-none" />
        </OsWindow>
      </div>
    </div>
  );
}

export { TerminalPreview };
