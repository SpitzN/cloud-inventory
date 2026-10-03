# Product

<!-- impeccable:product-schema 1 -->

The product context for design work. What each screen does is in [docs/product.md](./docs/product.md), which stays the single source of truth for behaviour and scope; this file repeats none of it. How each screen is laid out is in [docs/wireframes.md](./docs/wireframes.md), and the terms are in [GLOSSARY.md](./GLOSSARY.md).

## Platform

web

## Users

A security or cloud engineer. They triage an organisation's cloud Resources by Criticality and open issues, build a Selection across filters, name it as an Application, and read that Application as a graph.

## Product Purpose

Cloud Inventory browses an organisation's cloud Resources, groups a Selection into an Application, and shows Applications as a graph. The scope, the screens and their behaviour are in [docs/product.md](./docs/product.md).

Success is a small console built carefully. Every screen behaves as specified, the states nobody asks about are handled, and each decision can be traced to a document.

## Positioning

The claim is finish, not breadth. Four screens, every one complete. Every behaviour is specified in `docs/`, every decision recorded as an ADR, and the hidden layer is treated as part of the product: empty states, focus, tooltips, announcements.

## Operating Context

- A desktop browser at 1280px wide or more ([ADR 0006](./docs/adr/0006-desktop-only.md)), in a light or dark theme that follows the system setting.
- No backend. Twelve Resources ship with the client, and Applications are saved in the browser ([ADR 0001](./docs/adr/0001-no-simulated-backend.md)).
- It runs from a fresh clone with `pnpm install && pnpm dev`. The README, the docs and the ADRs explain it beside the running app.

## Capabilities and Constraints

Functionality and scope: [docs/product.md](./docs/product.md). Stack and state: [docs/architecture.md](./docs/architecture.md). Checks: [docs/tooling.md](./docs/tooling.md).

These constraints bind every design command.

- The UI rules in [.claude/rules/ui.md](./.claude/rules/ui.md) and [.claude/rules/react.md](./.claude/rules/react.md) hold, as do the layouts in `docs/wireframes.md` and the behaviour in `docs/product.md`.
- Every colour is a theme token defined for both light and dark. The pass changes tokens and project components, and every screen changes together.
- Criticality is the only data-driven colour, and it comes from the four criticality tokens.
- `src/components/ui/` stays as the shadcn CLI generated it. The one exception is variants added to a component's `cva` ([ADR 0010](./docs/adr/0010-project-variants-in-generated-primitives.md)). Components are shadcn/ui's Base UI variants only ([ADR 0007](./docs/adr/0007-shadcn-ui-on-base-ui-only.md)). When a component is missing, the owner adds it.
- One font family: Fira Sans, chosen by the owner on 2026-10-03 for its screen legibility. It is loaded from `@fontsource/fira-sans`, never from a runtime CDN. A monospace second family was considered and declined, to keep the one-family rule.
- Text stays at 24px or below. Nothing below 1280px is targeted.
- The TypeScript, ESLint and Prettier configurations are unchanged, and `pnpm check` passes.

## Brand Commitments

- The company is "a cloud security company". No real company or product is named anywhere: the repository is public.
- The name is "Cloud Inventory". UI copy uses the terms in `GLOSSARY.md` (Resource, Application, Member, Selection, Criticality…) and avoids the alternatives it lists.
- There is no logo or other brand asset.

## Evidence on Hand

- The dataset: twelve Resources and one example Application, described in [docs/dataset.md](./docs/dataset.md).
- Nothing else. There are no screenshots, metrics, testimonials or deployed demo, and none may be invented. A live demo link appears in the README only once one is deployed.

## Product Principles

1. **What is critical is the only loud thing.** Default states are quiet, and colour and fill mark only what differs. The screen's primary action and Criticality are allowed to stand out.
2. **No meaning rides on one channel.** Criticality carries both a word and a colour. The Member table states what the graph draws.
3. **The hidden layer is the product.** Empty states, focus, hover, tooltips, toasts and announcements get the same care as the happy path.
4. **Every choice is traceable.** Any visual or behavioural decision leads to a token, a rule or an ADR.

## Accessibility & Inclusion

The requirements are in [docs/product.md](./docs/product.md#accessibility): keyboard reach with visible focus, labelled controls, focus trapped in dialogs and returned on close, colour never the only signal, and announced form errors. No WCAG level has been named as a target.
