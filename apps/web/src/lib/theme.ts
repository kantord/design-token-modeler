export interface Theme {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
}

const THEME_KEYS = [
  "background",
  "foreground",
  "card",
  "cardForeground",
  "popover",
  "popoverForeground",
  "primary",
  "primaryForeground",
  "secondary",
  "secondaryForeground",
  "muted",
  "mutedForeground",
  "accent",
  "accentForeground",
  "destructive",
  "border",
  "input",
  "ring",
] as const satisfies readonly (keyof Theme)[];

function toKebabCase(key: string): string {
  return key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

/** Sets one `--token` CSS custom property per [[Theme]] field on `el`. */
export function applyTheme(el: HTMLElement, theme: Theme): void {
  for (const key of THEME_KEYS) {
    el.style.setProperty(`--${toKebabCase(key)}`, theme[key]);
  }
}
