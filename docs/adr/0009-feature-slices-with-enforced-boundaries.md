# Feature slices with enforced boundaries

Source code is organised in layers, and lint enforces the direction between them. `src/app/` holds the router, the shell and one thin page per route; `src/features/<name>/` holds one vertical slice per domain area, grouped into `components/`, `hooks/`, `stores/`, `schemas/` and `lib/`; `src/domain/` holds what more than one feature needs; `src/components/`, `src/hooks/` and `src/lib/` hold domain-agnostic code. Features never import each other. The layout follows a feature-sliced structure the owner uses in another project, and was adopted when ticket 03 showed that nothing said where a file goes.

Four choices were made, each against an alternative:

- **No feature imports another.** Facts both features need move to `src/domain/`; a screen that needs two features is composed by its route, which reads from one and passes plain values into the other. The alternative kept the earlier one-way exception, `applications → resources`, which made the boundary a special case.
- **Every route page lives in `src/app/routes/`.** Features export building blocks, never pages. The alternative kept pages in their feature, which leaves two homes for pages and cannot express the New application page, which needs both features.
- **A fixed folder vocabulary inside a feature,** rather than letting a feature stay flat until it grows, which needs someone to judge when to restructure.
- **`eslint-plugin-boundaries`,** rather than one `no-restricted-imports` block per feature. Only the plugin can report a file that sits outside every known folder.

## Consequences

- Two dev dependencies: `eslint-plugin-boundaries` and `eslint-import-resolver-typescript`, which lets it follow the `@/` alias.
- A cross-feature need is met by a route passing state in, or by moving a fact to `src/domain/`; never by an import between features.
- A component that shows a domain term in both features is split: the mapping in `src/domain/`, the look as a domain-agnostic component in `src/components/`, composed by each feature. `.claude/rules/structure.md` has the details.
- A route whose page would only render one feature component mounts that component directly in the router definition, with no page file, since a page that only forwards breaks "every layer transforms".
- Lint checks folders, not file names: the nesting depth inside `components/` and the `use-*` name of a hook are review rules in `.claude/rules/structure.md`.
- The layer table and the traps met while configuring the plugin are in [tooling.md](../tooling.md).
