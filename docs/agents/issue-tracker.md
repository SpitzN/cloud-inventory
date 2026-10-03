# Issue tracker: Local Markdown

Issues and specs for this repo live as markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The spec is `.scratch/<feature-slug>/spec.md`
- Implementation issues are one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`, never a single combined tickets file
- Triage state is recorded as a `Status:` line near the top of each issue file (see `triage-labels.md` for the role strings)
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

## Implementation tickets

A ticket under `.scratch/<feature>/issues/` moves `ready-for-agent -> in-progress -> done`, or `in-progress -> needs-info`.

- `ready-for-agent`: the owner, at triage.
- `in-review`: the owner, for a ticket implemented by hand and waiting on its pull request; the loop treats it as not yet done.
- `in-progress`: the ralph loop (`.claude/skills/ralph/`), before it launches a session on the ticket.
- `done`: the loop, after its gate passes: a new commit, a clean tree, `pnpm check` green. The loop then pushes the ticket's branch, `feat/<feature>-<ticket file name>`, and opens its pull request; the URL is under the ticket's `## Comments`.
- `needs-info`: the agent, with the question under `## Comments` and nothing committed; the loop stops.

A `- [ ]` box still unticked at `done` has its reason under `## Comments`. The loop reads `Blocked by:` the way wayfinding does: the ticket is unblocked when every number it lists is `done`.

## When a skill says "publish to the issue tracker"

Create a new file under `.scratch/<feature-slug>/` (creating the directory if needed).

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the issue number directly.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a file with one **child** file per ticket.

- **Map**: `.scratch/<effort>/map.md` (the Notes / Decisions-so-far / Fog body).
- **Child ticket**: `.scratch/<effort>/issues/NN-<slug>.md`, numbered from `01`, with the question in the body. A `Type:` line records the ticket type (`research`/`prototype`/`grilling`/`task`); a `Status:` line records `claimed`/`resolved`.
- **Blocking**: a `Blocked by: NN, NN` line near the top. A ticket is unblocked when every file it lists is `resolved`.
- **Frontier**: scan `.scratch/<effort>/issues/` for files that are open, unblocked, and unclaimed; first by number wins.
- **Claim**: set `Status: claimed` and save before any work.
- **Resolve**: append the answer under an `## Answer` heading, set `Status: resolved`, then append a context pointer (gist + link) to the map's Decisions-so-far in `map.md`.
