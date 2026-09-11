import { cn } from "cn";
import {
  composeRenderProps,
  Switch as SwitchPrimitive,
  type SwitchProps as SwitchPrimitiveProps,
} from "react-aria-components";

function Switch({ className, children, ...props }: SwitchPrimitiveProps) {
  return (
    <SwitchPrimitive
      data-slot="switch"
      className={cn(
        "peer group/switch relative inline-flex h-[18.4px] w-[32px] shrink-0 items-center rounded-full border border-transparent transition-all outline-none not-data-selected:bg-input focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-selected:bg-primary data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {composeRenderProps(children, (children) => (
        <>
          <span
            data-slot="switch-thumb"
            className="pointer-events-none block size-4 translate-x-0 rounded-full bg-background transition-transform group-data-selected/switch:translate-x-[calc(100%-2px)]"
          />
          {children}
        </>
      ))}
    </SwitchPrimitive>
  );
}

export { Switch };
