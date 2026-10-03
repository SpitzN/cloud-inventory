# Cloud Inventory

A small frontend for the kind of console a cloud security company runs: browse cloud Resources, group a Selection into an Application, and view Applications as a graph. There is no backend; state is held in the client.

This repository is public. The domain is described as "a cloud security company"; no real company or product is named.

## Where things are

- `GLOSSARY.md`: the domain terms. Use them in code names, UI copy, commits and docs.
- `docs/product.md`: what each screen does. Read before changing behaviour.
- `docs/wireframes.md`: how each screen looks. Read before building or changing a screen.
- `docs/architecture.md`: stack, where state lives, units, tests, verified library facts. Read before adding a module or a dependency.
- `docs/tooling.md`: the checks, what lint enforces and why. Read when a check fails for a reason you do not recognise.
- `docs/dataset.md`: the twelve Resources and the example Application.
- `docs/adr/`: decisions already made. Flag a conflict with one instead of overriding it.

## Rules

Read these before writing or changing code under `src/`:

- `.claude/rules/code-design.md`: every source file.
- `.claude/rules/structure.md`: where a new file goes; every file under `src/`.
- `.claude/rules/react.md` and `.claude/rules/ui.md`: components.

## Working agreements

- `pnpm check` (typecheck, lint, format check, tests) passes before work is called done.
- A failing check is fixed in the code. The TypeScript, ESLint and Prettier configurations stay as they are, and every commit goes through the pre-commit hook.
- A new dependency needs the owner's approval first.
- `src/components/ui/` holds what the shadcn CLI generates, hooks included, and those files stay as generated, apart from variants the project adds to a component's `cva` ([ADR 0010](docs/adr/0010-project-variants-in-generated-primitives.md)). Re-running `shadcn add --overwrite` on such a file drops those variants, so they are added again. Everything outside it is project code and passes every check.
- Build screens from the components already in `src/components/ui/`. They are shadcn/ui's Base UI variants, the only kind this project uses, never Radix or React Aria ([ADR 0007](docs/adr/0007-shadcn-ui-on-base-ui-only.md)). The owner adds components: when one is missing, stop and ask.

## Agent skills

### Issue tracker

Specs and tickets are local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` at the repo root and ADRs in `docs/adr/`. See `docs/agents/domain.md`.

### Ralph loop

`/ralph afk <n>` implements the next `<n>` ready tickets unattended, with one session, one branch and one pull request per ticket; `/ralph dry-run` shows the order. See `.claude/skills/ralph/SKILL.md`.
