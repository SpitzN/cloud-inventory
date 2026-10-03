/mattpocock-skills:implement {{TICKET_PATH}}

{{RETRY_PREFACE}}
## Contract for ticket {{TICKET_NUMBER}}: {{TICKET_TITLE}}

Branch `{{BRANCH}}` is this ticket's own; its work starts at commit `{{BASE_SHA}}`. The loop that launched you (`.claude/skills/ralph/`) runs unattended: nobody answers questions, and after you exit it closes the ticket, pushes the branch and opens the pull request.

1. The seams the ticket names are the pre-agreed ones: test at them, ask nobody.
2. Read `{{PROGRESS_PATH}}` and the ticket's `## Comments` before exploring; they hold what earlier tickets built and decided.
3. Run `pnpm check` before every commit. Commit shape: an imperative subject in the repo's style, a body line `Ticket: {{TICKET_NUMBER}} {{TICKET_TITLE}}`, and the trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
4. After the commit, run `/code-review` with fixed point `{{BASE_SHA}}` and `{{TICKET_PATH}}` as the spec; the standards are `CLAUDE.md`, `.claude/rules/` and `docs/tooling.md`. Fix hard findings in a follow-up commit; record judgement calls under the ticket's `## Comments`.
5. In the ticket, tick each `- [ ]` box you verified; for each box left unticked, write the reason under `## Comments`. Add a `## Comments` entry naming the commit SHAs.
6. Append this ticket's entry to `{{PROGRESS_PATH}}`: what you built, decisions, gotchas, files touched.
7. Write the pull request body to `{{PR_BODY_PATH}}` in the shape `/mattpocock-skills:pr` gives: Summary, Evidence, Merge Danger. It covers this ticket's commits; the loop opens the pull request from that file.
8. A new dependency, or any decision that needs the owner, means: set `**Status:** needs-info`, put the question under `## Comments`, commit nothing, and stop. Otherwise leave `**Status:**` as it is; the loop closes it.

Done means: every change committed on `{{BRANCH}}`, at least one new commit since `{{BASE_SHA}}`, a clean tree, `pnpm check` green. The loop checks exactly those.
