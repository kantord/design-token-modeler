import type { Shell, ShellProps } from "insane-forms";
import { Label } from "@/components/ui/label";

/** A generic insane-forms shell: label above the control, error below. Fields
 * without `.meta({ title })` render label-less (widgets fall back to aria-label). */
const FieldShell: Shell = (props: ShellProps) => {
  const { name, label, children, error } = props;
  return (
    <div className="flex flex-col gap-1">
      {label !== undefined && <Label htmlFor={name}>{label}</Label>}
      {children}
      {error !== undefined && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export { FieldShell };
