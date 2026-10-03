---
paths:
  - "src/**/*"
---

# Structure

Lint enforces the layers and the folder names (`docs/tooling.md`, Import direction). These are the rules it cannot check. The decision is [ADR 0009](../../docs/adr/0009-feature-slices-with-enforced-boundaries.md); the layout is in `docs/architecture.md`, Code layout.

## Where a new file goes

1. A route page, or anything that connects two features: `src/app/routes/`. The router and providers: `src/app/app.tsx`. The shell: `src/app/shell/`.
2. Something only one feature uses: that feature, in the folder named by what the file is.
   - `components/`: a `.tsx` component. A family of related components may share one subfolder, such as `components/graph/`; nothing nests deeper.
   - `hooks/`: a hook, named `use-<what>.ts`.
   - `stores/`: a Zustand store.
   - `schemas/`: a Zod schema only this feature uses.
   - `lib/`: a pure function.
3. A fact more than one feature reads, such as a domain schema, the dataset or the Criticality rank: `src/domain/`, one file per concept, flat.
4. Something with no domain meaning that a second caller already needs: `src/components/`, `src/hooks/` or `src/lib/`.

A folder is created with its first file. No empty folders, no placeholder files, no `index.ts` barrels. A test sits beside the file it tests.

## Crossing features

A feature never imports another, not even a type. When a screen needs two features, its route reads from one and passes plain values and callbacks into the other. The New application route reads the Selection, passes its ids to `ApplicationForm` as starting Members, and passes a callback that clears the Selection after a create.

If the same fact is needed by both features, move it to `src/domain/` instead of passing it through every route.

## A domain term both features show

A component that shows a domain term in both features, such as the Criticality badge in the Resources table, the Member table and the Resource combobox, is split in two:

- the mapping from the term to a look, as a pure function in `src/domain/` (for example Criticality → badge tone, beside the Criticality rank);
- the look, as a domain-agnostic component in `src/components/` that takes the tone as a prop.

Each feature composes the two where it needs them. `src/components/` never imports `src/domain/`, and neither feature imports the other's badge.

## Routes

A file in `src/app/routes/` arranges feature components and connects them. It holds no business logic and no private sub-components; those belong in a feature. A route whose page would only render one feature component mounts that component directly in the router definition, with no page file.
