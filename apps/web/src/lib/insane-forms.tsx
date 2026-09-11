/**
 * The react-hook-form binding for insane-forms. insane-forms ships no engine —
 * this ~30-line adapter is "userland by design" (copied from insane-forms'
 * own packages/examples/react-hook-form.tsx, MIT). See vendor/insane-forms/VENDOR.md.
 */
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { type FieldEngine, Render } from "insane-forms";
import {
  type UseFormProps,
  useController,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import type * as z from "zod";

export const reactHookFormEngine: FieldEngine = {
  useField(name, seed) {
    const { field, fieldState } = useController({ name, defaultValue: seed });
    return {
      value: field.value,
      onChange: field.onChange,
      onBlur: field.onBlur,
      error: fieldState.error?.message,
    };
  },
  useArray(name) {
    const fa = useFieldArray({ name });
    return {
      rows: fa.fields.map((f) => ({ id: f.id })),
      append: (value) => fa.append(value as never),
      remove: (index) => fa.remove(index),
    };
  },
  useWatch(name) {
    return useWatch({ name });
  },
};

/** `<RhfFields schema={…} />` renders a schema's fields anywhere inside an RHF FormProvider. */
export function RhfFields({ schema, name = "" }: { schema: z.ZodType; name?: string }) {
  return <Render schema={schema} name={name} engine={reactHookFormEngine} />;
}

/**
 * react-hook-form's own methods (watch, control, …) for live reads — no submit
 * button needed.
 *
 * `defaults` is deliberately typed as plain `object`, not `DeepPartial<z.input<S>>`
 * as upstream's example does: `insane.group()`'s return type loses its shape
 * through this package's bundled `.d.ts` (a tsdown dts-rollup artifact — its
 * `field()` calls type fine, `group()`'s `ShapeOf<A>` does not), so
 * `z.input<S>` on a grouped schema resolves to `Record<string, never>` instead
 * of the real shape. Runtime validation is unaffected — Zod schemas are built
 * at runtime, not from these static types — callers just don't get
 * defaults/schema type-checking against each other here.
 */
export function useZodForm<S extends z.ZodType>(
  schema: S,
  opts: { defaults?: object } & Omit<
    UseFormProps<Record<string, unknown>>,
    "resolver" | "defaultValues"
  > = {},
) {
  const { defaults, ...rest } = opts;
  return useForm({
    resolver: standardSchemaResolver(schema as never),
    defaultValues: defaults as never,
    shouldUnregister: false,
    ...rest,
  });
}
