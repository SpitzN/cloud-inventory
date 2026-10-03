# Project variants in generated primitives

A look that a `src/components/ui/` primitive lacks is added as a variant to that primitive's `cva`. The Criticality badge's four tones (`neutral`, `caution`, `warning`, `danger`) are `Badge` variants, and a feature picks one with `<Badge variant={criticalityTone(criticality)}>`. Until ticket 04, generated files stayed exactly as the shadcn CLI wrote them. The owner chose this when the first Criticality badge was coloured from outside the primitive by a chain of `tone === "x" && "..."` conditions inside `cn`: a look picked by a prop is a `cva` variant.

Two alternatives were rejected:

- **A `cva` variant function in a wrapper, passed to the primitive's `className`.** `shadcn/require-static-classes` reports the result as dynamically built, because the plugin cannot read a variant function's output.
- **A plain element styled with the primitive's exported variants**, as in `<span className={cn(badgeVariants(), toneVariants({ tone }))}>`. Lint passes, but only because plain elements are not checked, so `no-restyle` no longer guards the classes.

## Consequences

- A generated file differs from the CLI's output by its added variants and nothing else. Every other change to a generated file is still a question for the owner.
- `shadcn add --overwrite` on such a file drops the added variants, which are then added again.
- ESLint ignores `src/components/ui/`, so token and palette checks do not cover the added classes. Review does.
- The `Badge` colour contract in `eslint.config.js` is gone: colour classes on `<Badge>` now fail `no-restyle`.
- In the split described in [ADR 0009](./0009-feature-slices-with-enforced-boundaries.md), the look is a variant of the primitive where one fits, rather than a wrapper component in `src/components/`.
