# Tooling

How the code is checked: the compiler, the linter, the formatter and the pre-commit gate, and why each is set up the way it is. The configuration files at the repository root are the source of truth for the exact rules. This document records the decisions and the traps behind them.

The whole setup was built and run on 2026-10-02 against 76 sample files, one "bad" file per rule that must fail and "good" files that must pass. Every sample behaved as expected.

## Status

Not set up yet: the repository has no application code. The verified configuration files, with the table, form, graph and store code they were tested on, are in `.scratch/tooling-reference/`, which is not committed. Project setup creates the real files from that copy and then deletes this section.

## The gate

`pnpm check` runs four checks in order and stops at the first failure:

| Step         | Command                       |
| ------------ | ----------------------------- |
| Typecheck    | `tsc -b`                      |
| Lint         | `eslint . --max-warnings 0`   |
| Format check | `prettier --check .`          |
| Tests        | `vitest run`                  |

A husky pre-commit hook runs `pnpm check` on the whole project, so a commit with a failing check is refused. On a small project the full run took about eight seconds.

There is no lint-staged and no CI workflow. The hook runs exactly what a developer or an agent runs by hand, and the project has one contributor.

## Decisions

| Decision                                             | Why                                                                                                                                             |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript pinned to 6.0.x                           | A fresh install gives TypeScript 7, and typescript-eslint 8 cannot run on it. One compiler both type-checks and lints.                          |
| `tsc -b`, not `tsc --noEmit`                         | The Vite template's root `tsconfig.json` lists no files, only references. `tsc --noEmit` checks nothing there and exits 0 on a type error.      |
| ESLint 10                                            | ESLint 9 reached end-of-life in August 2026. `eslint-plugin-jsx-a11y` declares support only up to 9, but ran correctly on 10 across every sample; `pnpm peers check` reports the mismatch. |
| Prettier formats, ESLint lints                       | Prettier's own documentation advises against running it as a lint rule. `eslint-config-prettier` is last in the config, and no formatting rule is left active. |
| `prettier-plugin-tailwindcss`                        | Class order is formatting. The plugin sorts classes in `className`, `cn()` and `cva()`.                                                         |
| A lean plugin set                                    | typescript-eslint, React hooks, React refresh, accessibility and Tailwind. Large opinionated packs are left out; each of their rules would need defending. |
| Disable comments are inert                           | `noInlineConfig` is on, so a rule cannot be switched off from inside a file. A failing rule is fixed in the code.                                |
| `src/components/ui/` is ignored by ESLint only       | shadcn/ui files stay as generated. Prettier and the compiler still cover them, so `pnpm format` is run after adding a component.                 |
| `pnpm-lock.yaml` is in `.prettierignore`             | Otherwise the format check flags the lockfile.                                                                                                  |
| Stricter compiler options than the template          | `strict`, `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.                                                                          |
| The `@/` alias for every import outside the folder   | The import-direction rules match on `@/features/…` and `@/app/…`. Same-folder `./` imports are allowed; `../` is not.                           |

## What lint enforces

| Convention                                                        | How                                                                                     |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| No type assertions; `as const` and `satisfies` are allowed        | `@typescript-eslint/consistent-type-assertions`                                         |
| No `any`, no non-null assertions, no unsafe use of untyped values | typescript-eslint's `strictTypeChecked` preset                                          |
| No `@ts-ignore`, `@ts-expect-error` or `@ts-nocheck`              | `@typescript-eslint/ban-ts-comment`                                                     |
| No nested ternaries                                               | `no-nested-ternary`                                                                     |
| No nested `if`; else-if chains and guard clauses pass             | Two `no-restricted-syntax` selectors plus `max-depth` 2                                 |
| Destructuring when reading from objects and arrays                | `@typescript-eslint/prefer-destructuring`                                               |
| No re-exports; names are exported where they are declared         | `no-restricted-syntax` selectors                                                        |
| No default exports, except in config files                        | `no-restricted-exports`                                                                 |
| Import direction                                                  | `no-restricted-imports` per folder (see below)                                          |
| Limits on tangled code                                            | `complexity` 10, `max-depth` 2, `max-params` 3, `max-nested-callbacks` 2                |
| React Compiler rules                                              | `eslint-plugin-react-hooks`: state set or derived in effects, mutation, refs read during render, impure render, incompatible libraries |
| Accessibility basics                                              | `eslint-plugin-jsx-a11y`, strict                                                        |
| Theme tokens only; no arbitrary values; no text above 24px        | `eslint-plugin-better-tailwindcss`                                                      |

Return types are inferred. No active rule asks for explicit ones.

### Import direction

```
app  →  features  →  lib, components
        applications  →  resources   (never the other way)
```

- `src/app/` may import anything.
- `src/features/` may not import from `src/app/`.
- `src/features/resources/` may not import from `src/features/applications/`.
- `src/lib/` and `src/components/` may not import from features or from `src/app/`.

## What lint cannot enforce

These stay review rules in `.claude/rules/`.

- A function or component that only forwards its arguments.
- A re-export written as a new binding, such as `export const alias = imported`.
- A compiled child component that reads from a stable object and goes stale. The config bans importing TanStack Table's core object types as a partial guard.
- Props destructured in the component signature.
- A variable declared and immediately returned.

Two of the Tailwind bans are blunt:

- The arbitrary-value ban also rejects structural values such as `grid-cols-[auto_1fr]`. Add a theme token or utility instead.
- The text-size ban matches class names, so a custom text-size token above 24px would pass.

## Traps found while verifying

- **Three preset options reject ordinary React code** and are relaxed on purpose: a promise-returning handler passed to a JSX attribute, a number inside a template literal, and an arrow function returning a `void` call.
- **Export lists fail.** `export { a, b }` is rejected along with re-exports; write `export const`, `export function`, `export type` or `export interface` at the declaration.
- **Callbacks nest quickly inside a store definition.** A callback inside an updater inside a store creator is already three deep. Hoist the inner helper to a module function.
- **Angle-bracket assertions fail in the compiler too**, through `erasableSyntaxOnly`.
