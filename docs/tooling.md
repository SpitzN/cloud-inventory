# Tooling

How the code is checked: the compiler, the linter, the formatter and the pre-commit gate, and why each is set up the way it is. The configuration files at the repository root are the source of truth for the exact rules. This document records the decisions and the traps behind them.

The whole setup was built and run on 2026-10-02 against 76 sample files, one "bad" file per rule that must fail and "good" files that must pass. Every sample behaved as expected. `@shadcn/lint` was added on 2026-10-03 and verified the same way. The separate TypeScript project for `src/components/ui/` was added the same day and run against 26 generated files.

## The gate

`pnpm check` runs four checks in order and stops at the first failure:

| Step         | Command                     |
| ------------ | --------------------------- |
| Typecheck    | `tsc -b`                    |
| Lint         | `eslint . --max-warnings 0` |
| Format check | `prettier --check .`        |
| Tests        | `vitest run`                |

A husky pre-commit hook runs `pnpm check` on the whole project, so a commit with a failing check is refused. On a small project the full run took about eight seconds.

There is no lint-staged and no CI workflow. The hook runs exactly what a developer or an agent runs by hand, and the project has one contributor.

## Decisions

| Decision                                                                                                | Why                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TypeScript pinned to 6.0.x                                                                              | npm's `latest` tag is TypeScript 7, and typescript-eslint 8 supports TypeScript below 6.1 only. One compiler both type-checks and lints.                                                                                                                                                                                                   |
| `tsc -b`, not `tsc --noEmit`                                                                            | The Vite template's root `tsconfig.json` lists no files, only references. `tsc --noEmit` checks nothing there and exits 0 on a type error.                                                                                                                                                                                                 |
| ESLint 10                                                                                               | ESLint 9 reached end-of-life in August 2026. `eslint-plugin-jsx-a11y` declares support only up to 9, but ran correctly on 10 across every sample; `pnpm peers check` reports the mismatch.                                                                                                                                                 |
| Prettier formats, ESLint lints                                                                          | Prettier's own documentation advises against running it as a lint rule. `eslint-config-prettier` is last in the config, and no formatting rule is left active.                                                                                                                                                                             |
| Prettier's options are written out, at 100 columns                                                      | The file states every option the code relies on, so a Prettier major cannot restyle it. `proseWrap: "preserve"` keeps Markdown prose as written; tables are still aligned and fenced code is still formatted.                                                                                                                              |
| `prettier-plugin-tailwindcss`                                                                           | Class order is formatting. The plugin sorts classes in `className`, `cn()` and `cva()`.                                                                                                                                                                                                                                                    |
| A lean plugin set                                                                                       | typescript-eslint, React hooks, React refresh, accessibility, Tailwind and `@shadcn/lint`. Large opinionated packs are left out; each of their rules would need defending.                                                                                                                                                                 |
| `@shadcn/lint`, with two of its six rules                                                               | `no-restyle` and `require-static-classes` refuse a `className` that restyles a `src/components/ui/` primitive. Three others check classes `better-tailwindcss` already checks, and `no-inline-styles` is left to review; all four are off.                                                                                                 |
| `@shadcn/lint` 0.2.0 on ESLint 10                                                                       | Built against ESLint 9: it depends on `@eslint/core` 0.17, though only for types. It ran correctly on 10 across every sample, and `pnpm peers check` reports nothing new.                                                                                                                                                                  |
| No `no-restyle` contracts                                                                               | Every primitive takes layout classes only. A look a primitive lacks is a variant in its `cva`: the tones on `Badge`, `align` on `TableHead` and `TableCell` ([ADR 0010](./adr/0010-project-variants-in-generated-primitives.md)).                                                                                                          |
| Disable comments are inert                                                                              | `noInlineConfig` is on, so a rule cannot be switched off from inside a file. A failing rule is fixed in the code.                                                                                                                                                                                                                          |
| `src/components/ui/` is outside lint and outside the project's extra compiler options                   | shadcn/ui files stay as generated, apart from variants the project adds to a `cva` ([ADR 0010](./adr/0010-project-variants-in-generated-primitives.md)), and some fail this project's rules. ESLint ignores the folder; `tsconfig.ui.json` compiles it under `strict` alone, and project code reads its types through a project reference. |
| Generated hooks land in `src/components/ui/hooks/`                                                      | `components.json` points the `hooks` alias there, so everything the shadcn CLI writes is in the one folder. The sidebar's `use-mobile.ts` sets state in an effect, which lint refuses in project code.                                                                                                                                     |
| The owner adds the components, up front                                                                 | The ones this version needs were generated in one pass on 2026-10-03. An unattended session never runs the shadcn CLI, so it cannot bring in another variant, a new package or a prompt nobody answers.                                                                                                                                    |
| The stack's packages are installed ahead of the tickets                                                 | Ticket 03 adds React Router, `next-themes` and Zod; the rest were installed in one pass on 2026-10-03. A package an unattended session wants beyond the stack is a new dependency, and a question for the owner.                                                                                                                           |
| Prettier still formats `src/components/ui/`                                                             | `pnpm format` is run after adding a component. Formatting is the one change a generated file takes.                                                                                                                                                                                                                                        |
| `pnpm-lock.yaml` is in `.prettierignore`                                                                | Otherwise the format check flags the lockfile.                                                                                                                                                                                                                                                                                             |
| Stricter compiler options than the template, for project code                                           | `strict`, `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`, in `tsconfig.app.json`.                                                                                                                                                                                                                                             |
| The `@/` alias for every import outside the folder                                                      | One spelling for each file, so a file moves without its importers' `../` chains changing. The boundary rules resolve files, so they see `./` and `@/` imports alike. Same-folder `./` imports are allowed; `../` is not.                                                                                                                   |
| `.scratch/` and `.claude/worktrees/` are git-ignored, ignored by ESLint, and outside Vitest's `include` | Prettier reads `.gitignore`; ESLint and Vitest do not. The first holds local notes and a reference copy with its own tsconfig and tests; the second holds checkouts of this repository made by agents, which the checks must not walk into.                                                                                                |
| `pnpm-workspace.yaml` holds only `allowBuilds`                                                          | pnpm refuses a dependency's build script unless it is listed; esbuild's is allowed and `unrs-resolver`'s refused (see the traps), so the install is warning-free. There is no workspace.                                                                                                                                                   |
| The root `tsconfig.json` repeats `paths`                                                                | Written by shadcn init, which reads the alias from the root file when adding a component. `tsc -b` ignores it, since that file lists no sources.                                                                                                                                                                                           |
| `passWithNoTests`                                                                                       | `vitest run` exits 1 when no test file exists, which would fail the gate before the first tested seam lands. Harmless once tests exist.                                                                                                                                                                                                    |
| `cn` is imported from the `cn` package                                                                  | shadcn/ui's generated `src/lib/utils.ts` only re-exports it, which lint bans, and the generated components import the package directly. The file is not kept; `shadcn add` does not recreate it.                                                                                                                                           |

## What lint enforces

| Convention                                                        | How                                                                                                                                    |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| No type assertions; `as const` and `satisfies` are allowed        | `@typescript-eslint/consistent-type-assertions`                                                                                        |
| No `any`, no non-null assertions, no unsafe use of untyped values | typescript-eslint's `strictTypeChecked` preset                                                                                         |
| No `@ts-ignore`, `@ts-expect-error` or `@ts-nocheck`              | `@typescript-eslint/ban-ts-comment`                                                                                                    |
| No nested ternaries                                               | `no-nested-ternary`                                                                                                                    |
| Blocks nest at most two deep; no `else` after a `return`          | `max-depth` 2 and `no-else-return` with `allowElseIf: false`, which together push a deeper branch into a guard clause or a function    |
| Destructuring when reading from objects and arrays                | `@typescript-eslint/prefer-destructuring`                                                                                              |
| No re-exports; names are exported where they are declared         | `no-restricted-syntax` selectors                                                                                                       |
| No default exports, except in config files                        | `no-restricted-exports`                                                                                                                |
| Import direction                                                  | `eslint-plugin-boundaries`: layers, feature isolation, folder vocabulary (see below)                                                   |
| Limits on tangled code                                            | `complexity` 10, `max-depth` 2, `max-params` 3, `max-nested-callbacks` 2                                                               |
| React Compiler rules                                              | `eslint-plugin-react-hooks`: state set or derived in effects, mutation, refs read during render, impure render, incompatible libraries |
| Accessibility basics                                              | `eslint-plugin-jsx-a11y`, strict                                                                                                       |
| Theme tokens only; no arbitrary values; no text above 24px        | `eslint-plugin-better-tailwindcss`                                                                                                     |
| A `components/ui` primitive takes layout classes; two exceptions  | `@shadcn/lint`: `no-restyle` allowing layout classes, and `require-static-classes` so that every class on a primitive can be read      |

Return types are inferred. No active rule asks for explicit ones.

### Import direction

`eslint-plugin-boundaries` classifies each file under `src/` and allows an import between project files only when a policy allows it ([ADR 0009](./adr/0009-feature-slices-with-enforced-boundaries.md)). External packages are not governed by it.

| Layer     | Files                                                                           | May import                                              |
| --------- | ------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `entry`   | `src/main.tsx`                                                                  | `src/app/app.tsx`, `ui`, `index.css`                    |
| `app`     | `src/app/app.tsx`, `src/app/{routes,shell/components,shell/hooks,shell/lib}/**` | `app`, `feature`, `domain`, `shared`, `lib`, `ui`       |
| `feature` | `src/features/<name>/{components,hooks,stores,schemas,lib}/**`                  | the same `<name>` only, `domain`, `shared`, `lib`, `ui` |
| `domain`  | `src/domain/**`                                                                 | `domain`, `lib`                                         |
| `shared`  | `src/components/**` (not `ui/`), `src/hooks/**`                                 | `shared`, `lib`, `ui`                                   |
| `lib`     | `src/lib/**`                                                                    | `lib`                                                   |
| `ui`      | `src/components/ui/**`                                                          | not linted                                              |

- No file imports a test file.
- A file outside every layer fails `boundaries/no-unknown-files`; this is what holds a feature to its five folders and `src/app/` to `app.tsx`, `routes/` and the shell's `components/`, `hooks/` and `lib/`. A test file counts only in those folders, so a test anywhere else fails too.
- An import that resolves to no layer fails `boundaries/no-unknown-dependencies`.
- Parent-relative imports (`../`) stay banned by `no-restricted-imports`.

## What lint cannot enforce

These stay review rules in `.claude/rules/`.

- A function or component that only forwards its arguments.
- A re-export written as a new binding, such as `export const alias = imported`.
- A compiled child component that reads from a stable object and goes stale. The config bans importing TanStack Table's core object types as a partial guard.
- Props destructured in the component signature.
- A variable declared and immediately returned.
- Nesting deeper than one family folder inside a feature's `components/`, and a hook file not named `use-*.ts`: the plugin classifies folders, not file names.
- That `src/domain/`, `src/components/`, `src/hooks/`, `src/lib/` and the shell's three folders stay flat: each is one element, so a subfolder inside it passes.
- That a `components/` folder holds only `.tsx` components and a `lib/` folder only pure code.
- A route page that holds business logic, and a `domain/` file only one feature uses.

Two of the Tailwind bans are blunt:

- The arbitrary-value ban also rejects structural values such as `grid-cols-[auto_1fr]`. Add a theme token or utility instead.
- The text-size ban matches class names, so a custom text-size token above 24px would pass.

`@shadcn/lint` as configured leaves three gaps:

- The layout allowance covers height, size and transforms as well as margin and width, so `h-12` on a `Button` passes although its `size` sets the height.
- Only `className` is checked. A look set through the `style` prop passes; the plugin's `no-inline-styles` would check it.
- A raw colour in an SVG attribute, such as `fill="#f00"`, passes. The plugin's `no-raw-colors` would check it, but its class check repeats the palette ban.

## Traps found while verifying

- **Three preset options reject ordinary React code** and are relaxed on purpose: a promise-returning handler passed to a JSX attribute, a number inside a template literal, and an arrow function returning a `void` call.
- **Export lists fail.** `export { a, b }` is rejected along with re-exports; write `export const`, `export function`, `export type` or `export interface` at the declaration.
- **Callbacks nest quickly inside a store definition.** A callback inside an updater inside a store creator is already three deep. Hoist the inner helper to a module function.
- **Angle-bracket assertions fail in the compiler too**, through `erasableSyntaxOnly`.
- **A primitive takes layout classes only.** Margin, width, height, display and position pass. Colour, padding, gap, shape, effects, motion and typography fail: add a variant to the primitive's `cva`, or put a column's own typography, such as `truncate` or `tabular-nums`, on a plain element inside the cell. Plain elements are not checked.
- **A wrapper cannot restyle a primitive either.** Classes a wrapper adds to a primitive, and classes passed to a wrapper that forwards `className`, are checked as if written on the primitive. The wrapper takes `className` in its signature; destructured in the body, it is reported as unreadable.
- **A class picked by key fails on a primitive.** `className={WIDTH[size]}` is reported as unreadable even when every value is a string in the same file. A ternary, a same-file constant or `cn(wide && "w-48")` passes.
- **The plugin's messages offer a new variant in the primitive's file.** That is where a new look goes, and the `note` setting says so.
- **A `cva` result on a primitive is unreadable.** `<Badge className={toneVariants({ tone })}>` is reported as dynamically built: the plugin reads a `cva(...)` call written inline, not a variant function called later. A chain of `tone === "x" && "..."` inside `cn` passes, and `.claude/rules/react.md` forbids it. The look is a variant in the primitive's own `cva`.
- **Variant classes in `src/components/ui/` are not linted.** ESLint ignores the folder, so the token, palette and unknown-class checks do not see a variant added there. Review checks it.
- **A generated file can fail the project's compiler options.** Of 26 files generated on 2026-10-03, `scroll-area.tsx` failed `noUnusedLocals` and `sonner.tsx` failed `exactOptionalPropertyTypes`. Both pass under `strict`, which is all `tsconfig.ui.json` asks. A generated file that fails a check even so is a question for the owner; it is not edited.
- **`shadcn add` stops at a prompt when a file it writes already exists.** A component that depends on an existing one, as the sidebar does on the button, needs `--overwrite`.
- **`eslint-plugin-boundaries` skips an `@/` import it cannot resolve.** By default such an import counts as an external package, and the dependencies rule ignores external packages: without `eslint-import-resolver-typescript`, every boundary would pass silently. `flag-as-external` with `unresolvableAlias: false` makes it an unknown local file instead, which fails `no-unknown-dependencies`.
- **The dependencies rule skips two kinds of import unless told otherwise:** an import inside one element folder, and an import of a file that belongs to no element. Without `checkInternals` and `checkUnknownLocals`, a file could import the test beside it, and `index.css` would be unchecked.
- **In v7 an element is a folder, never a file.** Patterns get `/**/*` appended, so a file pattern matches nothing. Single files (`main.tsx`, `index.css`, tests) are classified with `boundaries/files` categories, and lint cannot check a file's name or its depth inside an element.
- **A custom boundaries message loses its final full stop** in ESLint's output. Search for a message without it.
- **`unrs-resolver` asks to run an install script** when `eslint-import-resolver-typescript` is added. Its native binding arrives as a prebuilt optional package, so `pnpm-workspace.yaml` sets `allowBuilds.unrs-resolver: false`.
- **A `.d.ts` file under `src/` has no layer** and fails `no-unknown-files`. None is needed today (`tsconfig.app.json` sets `types: ["vite/client"]`); a later declaration file needs a `boundaries/files` category first.
- **A layer has no name when a file has no element.** The general boundaries message prints the file path in that case (`src/app/app.tsx → src/main.tsx`), through a Handlebars `{{#if}}` in the message.
