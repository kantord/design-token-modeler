import { cn } from "cn";
import {
  DialogTrigger,
  Popover as PopoverPrimitive,
  type DialogTriggerProps,
  type PopoverProps as PopoverPrimitiveProps,
} from "react-aria-components";

function PopoverTrigger({ children, ...props }: DialogTriggerProps) {
  return (
    <DialogTrigger data-slot="popover-trigger" {...props}>
      {children}
    </DialogTrigger>
  );
}

function Popover({
  className,
  placement = "bottom",
  offset = 4,
  ...props
}: Omit<PopoverPrimitiveProps, "className"> & {
  className?: string;
}) {
  return (
    <PopoverPrimitive
      data-slot="popover-content"
      placement={placement}
      offset={offset}
      className={cn(
        "z-50 flex w-64 origin-(--trigger-anchor-point) flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-entering:animate-in data-entering:fade-in-0 data-entering:zoom-in-95 data-exiting:animate-out data-exiting:fade-out-0 data-exiting:zoom-out-95",
        className,
      )}
      {...props}
    />
  );
}

export { Popover, PopoverTrigger };
