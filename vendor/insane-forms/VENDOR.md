# Vendored: insane-forms

Source: `/home/kantord/repos/insane-forms`, package `packages/core` (published
name `insane-forms`), commit `c1f201a3fa4ac5a076c8f51cd95354d85c441ed2`, built
with `pnpm --filter insane-forms run build` (tsdown → `dist/index.js` +
`dist/index.d.ts`). MIT licensed.

This is the engine-agnostic core only — schema builders (`field`, `group`,
`list`, `hidden`, `wrap`), the introspection toolkit (`resolve*`), and the
`Render` runtime. It ships no form-library binding and no widgets; those are
"userland" by design in the upstream project.

Our react-hook-form binding (copied and adapted from the upstream repo's
`packages/examples/react-hook-form.tsx`, also userland/unshipped code) lives at
`apps/web/src/lib/insane-forms.tsx`. Our widgets, shell, and list chrome live
alongside the token editor's palette form.

To refresh: rebuild the upstream core package and copy `dist/index.{js,d.ts}`
over the files here.
