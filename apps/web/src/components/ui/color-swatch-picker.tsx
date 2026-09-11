import { cn } from "cn";
import { ColorSwatch } from "react-aria-components";

export interface SwatchOption {
  name: string;
  hex: string;
}

export interface SwatchPickerProps {
  "aria-label": string;
  options: SwatchOption[];
  value: string;
  onChange: (name: string) => void;
  className?: string;
}

/**
 * A radio-group of named color swatches. Deliberately not built on
 * react-aria-components' ColorSwatchPicker: that component derives each
 * item's identity from its color value, which breaks once colors are
 * editable (its internal collection throws "Cannot change the id of an
 * item" when a swatch's hex changes under a stable name).
 */
function SwatchPicker({ options, value, onChange, className, ...props }: SwatchPickerProps) {
  return (
    <div role="radiogroup" className={cn("flex flex-wrap gap-2", className)} {...props}>
      {options.map((option) => (
        <button
          key={option.name}
          type="button"
          role="radio"
          aria-checked={option.name === value}
          aria-label={option.name}
          onClick={() => onChange(option.name)}
          className={cn(
            "size-7 cursor-pointer rounded-full outline-none ring-2 ring-offset-2 ring-offset-background transition-all focus-visible:ring-ring",
            option.name === value ? "ring-ring" : "ring-transparent",
          )}
        >
          <ColorSwatch color={option.hex} className="size-full rounded-full" />
        </button>
      ))}
    </div>
  );
}

export { SwatchPicker };
