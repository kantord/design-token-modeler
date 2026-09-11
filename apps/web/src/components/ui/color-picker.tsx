import { cn } from "cn";
import {
  ColorArea,
  ColorField,
  ColorPicker as AriaColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorThumb,
  Dialog,
  Input as ColorFieldInput,
  Label as ColorFieldLabel,
  parseColor,
  SliderTrack,
  type Color,
} from "react-aria-components";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";

export interface ColorPickerFieldProps {
  value: string;
  onChange: (hex: string) => void;
  className?: string;
}

function parseHexOrBlack(hex: string): Color {
  try {
    return parseColor(hex);
  } catch {
    return parseColor("#000000");
  }
}

function ColorPickerField({ value, onChange, className }: ColorPickerFieldProps) {
  return (
    <AriaColorPicker
      value={parseHexOrBlack(value)}
      onChange={(next) => onChange(next.toString("hex"))}
    >
      <PopoverTrigger>
        <Button
          variant="outline"
          className={cn("w-full justify-start gap-2 font-mono", className)}
        >
          <ColorSwatch className="size-4 rounded-sm ring-1 ring-foreground/15" />
          {value}
        </Button>
        <Popover placement="bottom start">
          <Dialog className="flex flex-col gap-3 outline-none">
            <ColorArea
              colorSpace="hsb"
              xChannel="saturation"
              yChannel="brightness"
              className="h-32 w-full rounded-md"
            >
              <ColorThumb className="size-4 rounded-full border-2 border-white shadow-md" />
            </ColorArea>
            <ColorSlider colorSpace="hsb" channel="hue">
              <SliderTrack className="relative h-3 w-full rounded-full">
                <ColorThumb className="top-1/2 size-4 rounded-full border-2 border-white shadow-md" />
              </SliderTrack>
            </ColorSlider>
            <ColorField className="flex flex-col gap-1">
              <ColorFieldLabel className="text-xs font-medium text-muted-foreground">
                Hex
              </ColorFieldLabel>
              <ColorFieldInput className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" />
            </ColorField>
          </Dialog>
        </Popover>
      </PopoverTrigger>
    </AriaColorPicker>
  );
}

export { ColorPickerField };
