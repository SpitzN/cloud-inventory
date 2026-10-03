---
name: ralph
description: Run the ralph loop (implement ready tickets unattended, one fresh session per ticket), or inspect and stop a run.
disable-model-invocation: true
argument-hint: "afk <n> | dry-run | status | stop [--feature <slug>]"
allowed-tools: Bash(bash .claude/skills/ralph/ralph.sh *), Bash(env -u CLAUDECODE nohup bash .claude/skills/ralph/ralph.sh *), Bash(bash .claude/skills/ralph/selftest.sh*), Bash(tail *), Bash(cat .scratch/*), Bash(grep * .scratch/*)
---

The owner asked for: `$ARGUMENTS`

The loop is `ralph.sh` beside this file. `bash .claude/skills/ralph/ralph.sh --help` lists every subcommand, flag and exit code; pass `--feature <slug>` through whenever the owner names one.

## `afk <n>`

1. Run `bash .claude/skills/ralph/ralph.sh dry-run` and show the owner the first `<n>` tickets of the printed order and its `next branch` line, which says where the first ticket's branch starts. An empty order ends here: nothing is ready.
2. Launch detached from this session:
   `env -u CLAUDECODE nohup bash .claude/skills/ralph/ralph.sh afk <n> </dev/null >/dev/null 2>&1 &`
   Within a few seconds `cat .scratch/ralph.lock` names the live run (`pid`, `run_id`, `feature`, `claude_pid`). A missing lock means the script refused to start (held lock, dirty tree, missing tool): rerun the same command in the foreground to read its reason.
3. Tell the owner the run directory, `.scratch/<feature>/ralph/<run_id>/`, and what lands there: `run.log` (one event per line), `NN-attemptK.log` (readable session stream), `NN-attemptK.json` (result, turns, cost), `summary.txt` at the end.
4. Watch `run.log` with the Monitor tool until a line contains `run finished`. Relay each `ticket`, `fail`, `rate-limit` and `launch … attempt=2` line as it appears, with the attempt's `.log` path. A `ticket … result=done` line carries the ticket's pull request URL: give it to the owner.
5. On `run finished`, show `summary.txt` and what the exit code means: 0 done; 3 the run refused to start a ticket, reason on the `run finished` line; 4 a ticket failed twice and stays `in-progress`; 5 a ticket needs the owner (`needs-info`, question under its `## Comments`); 6 the rate-limit wait ran out; 7 a ticket is `done` but its branch or pull request did not reach GitHub; 130 stopped.

## `dry-run`

Run `bash .claude/skills/ralph/ralph.sh dry-run` and show the order the picker takes and why it stops where it does.

## `status`

Run `bash .claude/skills/ralph/ralph.sh status`: live or not, current ticket and attempt, the tail of `run.log`, the summary when finished. For detail, `tail` the attempt's `.log`.

## `stop`

Run `bash .claude/skills/ralph/ralph.sh stop`. The script ends the current session, leaves the ticket `in-progress` and removes the lock. Confirm with `status`, then name the ticket the owner sets back to `ready-for-agent` before the next run.

## Hands-on mode

`bash .claude/skills/ralph/ralph.sh once` opens an interactive `claude` on the next ticket and needs a terminal, so the owner runs it from a shell. Same prompt and gate as `afk`; no watchdog, no retry. A ticket left `in-progress` by an earlier session is what `once` picks up first.

## Branches and pull requests

Each ticket gets its own branch, `feat/<feature>-<ticket file name>`, and its own pull request, which the loop opens once the gate passes. The URL lands in `summary.txt` and under the ticket's `## Comments`.

While an earlier ticket's pull request is open, the next branch starts on top of it and its pull request targets that branch: a stack. With nothing open, the branch starts from `origin/main`. The owner merges a stack from the bottom, each pull request with a merge commit; GitHub deletes the merged branch and points the next pull request at `main`.

A fix to an open pull request is a commit on that ticket's branch in this checkout. The next run pushes it.

`--no-push` keeps a run local, with no fetch, push or pull request; the `ralph-smoke` fixture runs that way.

## When a run stops early

- `needs-info`: read the ticket's `## Comments`, get the owner's answer, record it there, set `**Status:** ready-for-agent`, launch again.
- Failed twice: read the last attempt's `.log` and `.gate.log`; with the owner, fix the ticket's branch; set `**Status:** ready-for-agent`; launch again. The run continues on that branch.
- Exit 7, not published: launch again. The run publishes every `done` ticket's branch before it picks a ticket.
- Exit 3, branches diverged: a lower branch gained commits the branches above it lack. The owner merges the open pull requests, lowest first; launch again.
- Exit 3, merge conflict: `origin/main` moved under the stack. On the branch the message names, merge `origin/main` by hand and commit; launch again.

While `.scratch/ralph.lock` exists the checkout belongs to the run; owner work goes in a worktree.

## After changing the loop

`bash .claude/skills/ralph/selftest.sh` replays the loop offline against stand-ins for `claude` and `gh`: stacking, publishing, retry, stop. It ends with `ALL CHECKS PASSED`.
