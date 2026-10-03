# Cloud Inventory

A small frontend for the kind of console a cloud security company runs: browse cloud Resources, group a Selection into an Application, and view Applications as a graph. There is no backend; state is held in the client.

## Run it

```
pnpm install && pnpm dev
```

Then open the address Vite prints. Tested with Node 24 and pnpm 11, in a desktop browser 1280px wide or more ([ADR 0006](./docs/adr/0006-desktop-only.md)).

`pnpm check` runs the typecheck, the lint, the format check and the unit tests. The pre-commit hook runs the same command, so no commit skips it.

## What was built

| Route               | Screen                                                                                                                                                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/resources`        | The twelve Resources in a table. Search by name, filter by Provider, Environment and Criticality with a count beside each value, sort on three columns. All of it lives in the address. Tick rows to build a Selection. |
| `/applications/new` | A form seeded from the Selection: name, description, Members. A live graph of the Application being created sits beside it.                                                                                             |
| `/applications`     | The Applications created, newest first. Each card shows its Member count, its open issues and its Members' most critical level.                                                                                         |
| `/applications/:id` | A drawer over the Applications page: the graph, the Member table, and Delete. Hovering a row highlights its node, and the reverse. A reload or a shared link reopens it.                                                |

**A short tour.** On Resources, filter to production and tick a few rows, then clear the filter and tick one more: the Selection survives. Press "Create application". The form starts with those Members, and the preview draws them as you type a name. Create, and you land in the new Application's drawer. Hover the Member rows to see the graph follow. On first run, the Applications page already holds one example, "Data Platform", so there is something to open before you create anything.

What each screen does, edge cases included, is in [docs/product.md](./docs/product.md). How it looks is in [docs/wireframes.md](./docs/wireframes.md) and [DESIGN.md](./DESIGN.md).

## Decisions and trade-offs

### Where state lives

There is no backend, and none is simulated. The third column says who would own each piece in the real product.

| State                              | Home                                                                 | In the real product |
| ---------------------------------- | -------------------------------------------------------------------- | ------------------- |
| Resources                          | A static, typed module                                               | Server-owned        |
| Applications                       | A Zustand store, saved to localStorage and Zod-parsed on load        | Server-owned        |
| Selection                          | A second Zustand store, in memory, so it outlives the page           | Client-owned        |
| Search, filters, sort              | The query string, Zod-parsed: it survives a reload and can be shared | Client-owned        |
| Form draft                         | React Hook Form, seeded from the Selection                           | Client-owned        |
| Open drawer                        | The route: linkable, and Back closes it                              | Client-owned        |
| Theme, sidebar folded              | localStorage                                                         | Client-owned        |
| Filtered rows, counts, graph nodes | Computed on every render; derived data is never stored               | Derived             |

The full table, the routes, the code layout and the units are in [docs/architecture.md](./docs/architecture.md).

### Decision records

| ADR                                                                   | Decision                                                                                         |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| [0001](./docs/adr/0001-no-simulated-backend.md)                       | No simulated backend: no fake async API, no loading states for data already in memory            |
| [0002](./docs/adr/0002-react-flow-for-the-graph.md)                   | React Flow for the graph                                                                         |
| [0003](./docs/adr/0003-tanstack-table-for-the-resources-table.md)     | TanStack Table, given controlled state: the table owns none of its own                           |
| [0004](./docs/adr/0004-react-hook-form-with-zod.md)                   | React Hook Form with Zod; every domain type is inferred from a schema                            |
| [0005](./docs/adr/0005-create-on-a-page-view-and-edit-in-a-drawer.md) | Create on a page, where the form has room for its preview; view in a drawer, over the list       |
| [0006](./docs/adr/0006-desktop-only.md)                               | Desktop only, 1280px and wider                                                                   |
| [0007](./docs/adr/0007-shadcn-ui-on-base-ui-only.md)                  | shadcn/ui on Base UI only                                                                        |
| [0008](./docs/adr/0008-open-issues-is-part-of-resource.md)            | `openIssues` is part of `Resource` (below)                                                       |
| [0009](./docs/adr/0009-feature-slices-with-enforced-boundaries.md)    | Feature slices, with the import direction enforced by lint                                       |
| [0010](./docs/adr/0010-project-variants-in-generated-primitives.md)   | A look a generated primitive lacks is a variant in its `cva`, not a class chain at the call site |

### The `openIssues` mismatch

`openIssues` was in the sample data and in the table requirements, but missing from the first `Resource` interface, so the sample did not type-check as written (TS2353). It is added to `Resource` as a required, non-negative integer. A second extended type, a separate lookup by id and silencing the compiler were each considered and rejected ([ADR 0008](./docs/adr/0008-open-issues-is-part-of-resource.md)). It is the one change to the first data model.

## Beyond the core requirements

- **Sorting** on Name, Criticality (by rank, not alphabetically) and Open issues, with ties broken by name.
- **Saved Applications**, which survive a reload. Unreadable saved data falls back to the first-run state instead of crashing.
- **An example Application** on first run. Once deleted, it stays deleted.
- **Delete**, from the drawer, behind a confirmation.
- **A dark theme**, which follows the system setting until the switch is used.

## The dataset

Twelve Resources, each chosen to exercise something ([docs/dataset.md](./docs/dataset.md)):

- Every filter value matches at least two rows, and some combinations match none, which shows the empty state.
- Criticality and open issues disagree on purpose, so the two sorts give visibly different orders.
- The rows fall into three natural Applications across three Providers, and one IAM role belongs in all three, so a Resource can be a Member of several.
- One name is 35 characters long, to test truncation in the table, the chips and the graph.

## Connecting a real API

A known migration, not a swap ([ADR 0001](./docs/adr/0001-no-simulated-backend.md)):

- Resources and Applications move to a server-state library: a query for each list, mutations for create and delete.
- Every screen that reads them gains a pending state and an error state.
- A duplicate name becomes a server rejection mapped to the name field.
- The existing Zod schemas parse the responses at the new boundary.
- The Selection, the address state, the form draft and the theme stay where they are.

## What would come next

- Edit an Application, in a drawer, reusing the creation form.
- A Resource details view, with owner, tags and region.
- Layouts below 1280px wide.
- A New application page that survives a reload.
- A real API, as above.
- Graph: real relationships between Resources, clicking a node to open its Resource, a combined view of several Applications, grouping by Provider or Environment, and a layout engine for larger graphs.
- Pagination or virtualisation once the Resource list is large.
- TypeScript 7, once the linter supports it.

## How it was built with AI

I used Claude Code throughout. My work was deciding, and reviewing the result. The order mattered: every decision was written down before any code, so the agent always worked from documents rather than from a conversation.

1. **Requirements into a product document.** I worked through the requirements with the agent and broke them into action items. I combined the superpowers brainstorming skill with Matt Pocock's grilling skill, in which the agent asks questions in rounds until no branch of the design is left assumed. The result was a product document: [docs/product.md](./docs/product.md) and [GLOSSARY.md](./GLOSSARY.md).
2. **Decisions.** Each choice with a real alternative became an ADR as it was made. For a while the repository held only documents.
3. **Wireframes.** Once the major decisions were settled, the agent drafted the wireframes. After a few rounds back and forth we settled the layout of every screen ([docs/wireframes.md](./docs/wireframes.md)).
4. **Guardrails.** I captured what the agent should follow: [CLAUDE.md](./CLAUDE.md), the rules under [.claude/rules/](./.claude/rules/), the domain glossary, and a check gate that rejects a commit when anything fails. Lint enforces the folder boundaries, the React Compiler rules and accessibility rules, so a rule does not depend on the agent remembering it ([docs/tooling.md](./docs/tooling.md)).
5. **Spec and tickets.** From the documents, the agent wrote a spec of user stories and cut it into fifteen tickets. Each ticket is a thin, end-to-end slice with its acceptance checks and the documents to read first. The spec and tickets stay local.
6. **Project setup.** The agent and I set up the project, the stack and the gate together.
7. **The loop.** We wrote a bash loop, [ralph.sh](./.claude/skills/ralph/ralph.sh). It gives each ticket a fresh agent session, a branch and a pull request. The agent implements the ticket and runs the gate, and the loop opens the pull request only once the gate passes. A ticket that fails twice, or needs a decision from me, stops the run. I tested the loop on tickets 1 to 3, then let it run unattended on tickets 4 to 13.
8. **Review.** I reviewed each pull request before merging it. Some needed a refactoring round, but not many. Where a review changed a rule, the rule went back into the documents, so later tickets followed it.
9. **Visual design.** Ticket 14 was a design pass with the impeccable skill, through the theme tokens. It also produced [DESIGN.md](./DESIGN.md).
10. **This README** and a final check of every screen.

The merged pull requests are the record of the work.

## Where things are

| Path                                             | What                                                               |
| ------------------------------------------------ | ------------------------------------------------------------------ |
| [docs/product.md](./docs/product.md)             | What each screen does: scope, behaviour, edge cases, accessibility |
| [docs/wireframes.md](./docs/wireframes.md)       | How each screen is laid out                                        |
| [DESIGN.md](./DESIGN.md)                         | The visual system: tokens, type, depth, motion, components         |
| [docs/architecture.md](./docs/architecture.md)   | Stack, state, routes, code layout, verified library facts          |
| [docs/dataset.md](./docs/dataset.md)             | The twelve Resources and the example Application                   |
| [docs/tooling.md](./docs/tooling.md)             | The checks and why each is set up the way it is                    |
| [docs/adr/](./docs/adr/)                         | The decision records                                               |
| [GLOSSARY.md](./GLOSSARY.md)                     | The domain terms                                                   |
| [CLAUDE.md](./CLAUDE.md), [.claude/](./.claude/) | The agent's instructions, rules and the ticket loop                |
