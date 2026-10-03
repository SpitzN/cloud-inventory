---
paths:
  - "src/**/*.tsx"
---

# React

## Composition

- Build screens by composing small parts, in the style of shadcn/ui: a compound component exposes its parts and the caller arranges them.
- Vary a component through `children` and composed parts before adding a prop. A component collecting boolean props is split into parts.
- A wrapper around a `components/ui` primitive adds something the primitive lacks, such as domain meaning or fixed behaviour. Otherwise the primitive is used directly.
- Base UI variants compose with the `render` prop.
- Class names are merged with `cn`. A look picked by a prop is a `cva` variant, never a chain of `prop === "x" && "..."` conditions inside `cn`.
- A look a `components/ui` primitive lacks is a new variant in that primitive's `cva`, as the four tones are on `Badge`, not classes on its `className`. A `cva` result passed to a primitive's `className` fails `shadcn/require-static-classes`.

## React Compiler

The compiler memoizes every component, so a component re-renders only when its props or hook values change.

- **Memoization is the compiler's job.** Write plain functions and values, without `useMemo`, `useCallback` or `memo`.
- **Pass plain values to children.** A child handed a stable object that changes internally keeps showing stale data.
  - **Table:** call `table` and `row` methods in the component that calls `useTable` and in the column definitions' render functions, and hand the results down as values.
  - **Form:** children read form state with `useWatch`, `useFormState` or `Controller`, given `control`.
- **Derived values are computed during render.** An effect only synchronises with something outside React.
