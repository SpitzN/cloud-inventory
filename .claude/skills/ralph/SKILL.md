---
name: ralph
description: Run the ralph loop (implement ready tickets unattended, one fresh session per ticket), or inspect and stop a run.
disable-model-invocation: true
argument-hint: "afk <n> | dry-run | status | stop [--feature <slug>]"
allowed-tools: Bash(bash .claude/skills/ralph/ralph.sh *), Bash(env -u CLAUDECODE nohup bash .claude/skills/ralph/ralph.sh *), Bash(tail *), Bash(cat .scratch/*), Bash(grep * .scratch/*)
---

The owner asked for: `$ARGUMENTS`

The loop is `ralph.sh` beside this file. `bash .claude/skills/ralph/ralph.sh --help` lists every subcommand, flag and exit code; pass `--feature <slug>` through whenever the owner names one.

## `afk <n>`

1. Run `bash .claude/skills/ralph/ralph.sh dry-run` and show the owner the first `<n>` tickets of the printed order. An empty order ends here: nothing is ready.
2. Launch detached from this session:
   `env -u CLAUDECODE nohup bash .claude/skills/ralph/ralph.sh afk <n> </dev/null >/dev/null 2>&1 &`
   Within a few seconds `cat .scratch/ralph.lock` names the live run (`pid`, `run_id`, `feature`, `claude_pid`). A missing lock means the script refused to start (held lock, dirty tree, missing tool): rerun the same command in the foreground to read its reason.
3. Tell the owner the run directory, `.scratch/<feature>/ralph/<run_id>/`, and what lands there: `run.log` (one event per line), `NN-attemptK.log` (readable session stream), `NN-attemptK.json` (result, turns, cost), `summary.txt` at the end.
4. Watch `run.log` with the Monitor tool until a line contains `run finished`. Relay each `ticket`, `fail`, `rate-limit` and `launch … attempt=2` line as it appears, with the attempt's `.log` path.
5. On `run finished`, show `summary.txt` and what the exit code means: 0 done; 4 a ticket failed twice and stays `in-progress`; 5 a ticket needs the owner (`needs-info`, question under its `## Comments`); 6 the rate-limit wait ran out; 130 stopped.

## `dry-run`

Run `bash .claude/skills/ralph/ralph.sh dry-run` and show the order the picker takes and why it stops where it does.

## `status`

Run `bash .claude/skills/ralph/ralph.sh status`: live or not, current ticket and attempt, the tail of `run.log`, the summary when finished. For detail, `tail` the attempt's `.log`.

## `stop`

Run `bash .claude/skills/ralph/ralph.sh stop`. The script ends the current session, leaves the ticket `in-progress` and removes the lock. Confirm with `status`, then name the ticket the owner sets back to `ready-for-agent` before the next run.

## Hands-on mode

`bash .claude/skills/ralph/ralph.sh once` opens an interactive `claude` on the next ticket and needs a terminal, so the owner runs it from a shell. Same prompt and gate as `afk`; no watchdog, no retry. A ticket left `in-progress` by an earlier session is what `once` picks up first.

## When a run stops early

- `needs-info`: read the ticket's `## Comments`, get the owner's answer, record it there, set `**Status:** ready-for-agent`, launch again.
- Failed twice: read the last attempt's `.log` and `.gate.log`; with the owner, fix or reset the tree; set `**Status:** ready-for-agent`; launch again.

While `.scratch/ralph.lock` exists the checkout belongs to the run; owner work goes in a worktree.
