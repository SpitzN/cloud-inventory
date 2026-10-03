#!/usr/bin/env bash
# selftest: runs ralph.sh end to end, spending nothing and touching nothing on GitHub.
# Each case builds a throwaway repository with a bare remote under a temp directory, copies this
# skill into it, and puts stand-ins for claude, gh and osascript first on PATH. The stand-in
# session makes one commit per ticket; the stand-in gh records every pull request it is asked for.
#
# Run:  bash .claude/skills/ralph/selftest.sh [case ...]
# Cases: stack diverged conflict publish local continue kill stop (default: all). KEEP=1 keeps the temp directory.

if ((BASH_VERSINFO[0] < 4)) && [ -x /opt/homebrew/bin/bash ]; then
  exec /opt/homebrew/bin/bash "$0" "$@"
fi
set -uo pipefail

SKILL_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ROOT=$(mktemp -d "${TMPDIR:-/tmp}/ralph-selftest.XXXXXX")
PASSES=0; FAILS=0
SB=""; WORK=""; STUB=""; RC=0; BG=""; SESSION_PID=""

B1=feat/demo-01-step-1; B2=feat/demo-02-step-2; B3=feat/demo-03-step-3
B4=feat/demo-04-step-4; B5=feat/demo-05-step-5

cleanup() {
  if [ "${KEEP:-0}" = 1 ]; then echo "kept: $ROOT"; else rm -rf "$ROOT"; fi
}
trap cleanup EXIT

# ---------------------------------------------------------------- checks

ok() { PASSES=$((PASSES + 1)); echo "  PASS  $1"; }
no() { FAILS=$((FAILS + 1)); echo "  FAIL  $1"; }

is() {  # WHAT GOT WANT
  if [ "$2" = "$3" ]; then ok "$1"; else no "$1: wanted '$3', got '$2'"; fi
}

holds() {  # WHAT COMMAND...   passes when the command succeeds
  local what=$1; shift
  if "$@" >/dev/null 2>&1; then ok "$what"; else no "$what"; fi
}

not() {  # WHAT COMMAND...   passes when the command fails
  local what=$1; shift
  if "$@" >/dev/null 2>&1; then no "$what"; else ok "$what"; fi
}

# ---------------------------------------------------------------- sandbox

g() { git -C "$WORK" "$@"; }

owner_git() {  # ARGS...   git in the owner's clone, standing in for what happens on GitHub
  git -C "$SB/admin" -c user.name=owner -c user.email=owner@example.invalid \
    -c commit.gpgsign=false -c core.hooksPath=/dev/null "$@"
}

sandbox() {  # NAME TICKETS   a repository with TICKETS chained tickets under the feature "demo"
  SB="$ROOT/$1"; WORK="$SB/work"; STUB="$SB/stub"
  mkdir -p "$STUB/bin" "$WORK"
  git init --quiet --bare --initial-branch=main "$SB/origin.git"
  git -C "$WORK" init --quiet --initial-branch=main
  g config user.name "ralph selftest"
  g config user.email selftest@example.invalid
  g config commit.gpgsign false
  g config core.hooksPath /dev/null
  mkdir -p "$WORK/.claude/skills"
  cp -R "$SKILL_DIR" "$WORK/.claude/skills/ralph"
  printf '.scratch/\n' > "$WORK/.gitignore"
  g add -A
  g commit --quiet -m "Start"
  g remote add origin "$SB/origin.git"
  g push --quiet -u origin main
  mkdir -p "$WORK/.scratch/demo/issues"
  local i nn blocked
  for i in $(seq 1 "$2"); do
    nn=$(printf '%02d' "$i"); blocked="None (can start immediately)"
    (( i > 1 )) && blocked="$(printf '%02d' $((i - 1))) (Step $((i - 1)))"
    printf '# %s: Step %s\n\n**What to build:** one file.\n\n**Blocked by:** %s\n\n**Status:** ready-for-agent\n\n- [x] the file exists\n' \
      "$nn" "$i" "$blocked" > "$WORK/.scratch/demo/issues/$nn-step-$i.md"
  done
  write_stubs
}

write_stubs() {
  cat > "$STUB/bin/claude" <<'EOF'
#!/usr/bin/env bash
# Stand-in for claude: plays one session on the ticket the prompt names. $STUB_DIR/mode-NN picks
# the behaviour: hang, hang-once (the first call hangs), partial (commit, then fail); default: finish.
prompt=""
while [ $# -gt 0 ]; do
  case "$1" in -p) prompt=$2; shift 2;; *) shift;; esac
done
nn=$(printf '%s\n' "$prompt" | sed -n 's/^## Contract for ticket \([0-9][0-9]\).*/\1/p' | head -n 1)
ticket=$(printf '%s\n' "$prompt" | sed -n '1s#^/mattpocock-skills:implement ##p')
result() {
  printf '{"type":"result","subtype":"%s","is_error":%s,"num_turns":1,"total_cost_usd":0,"session_id":"stub","result":"%s"}\n' "$1" "$2" "$3"
}
[ -n "$nn" ] || { result success false ok; exit 0; }
calls=$(( $(cat "$STUB_DIR/calls-$nn" 2>/dev/null || echo 0) + 1 ))
echo "$calls" > "$STUB_DIR/calls-$nn"
mode=$(cat "$STUB_DIR/mode-$nn" 2>/dev/null || echo finish)
case "$mode" in
  hang) exec sleep 300;;
  hang-once) [ "$calls" = 1 ] && exec sleep 300;;
  partial)
    echo "part $calls" > "partial-$nn-$calls.txt"
    git add "partial-$nn-$calls.txt"
    git commit --quiet -m "Start file $nn, part $calls"
    result error_during_execution true "the stand-in stopped early"
    exit 1;;
esac
echo "work for ticket $nn" > "file-$nn.txt"
git add "file-$nn.txt"
git commit --quiet -m "Add file $nn" -m "Ticket: $nn"
printf -- '- stand-in session: commit %s\n' "$(git rev-parse --short HEAD)" >> "$ticket"
printf '\n## %s\n\nBuilt file-%s.txt.\n' "$nn" "$nn" >> .scratch/demo/progress.md
if [ -f "$STUB_DIR/write-body" ]; then
  printf '## Summary\n\nstand-in body for ticket %s\n' "$nn" > ".scratch/demo/pr/$nn.md"
fi
result success false finished
EOF
  cat > "$STUB/bin/gh" <<'EOF'
#!/usr/bin/env bash
# Stand-in for gh: keeps pull requests in $STUB_DIR/prs.tsv as number, head, base, title.
db="$STUB_DIR/prs.tsv"; touch "$db"
printf 'gh %s\n' "$*" >> "$STUB_DIR/gh.log"
[ "${1:-} ${2:-}" = "pr list" ] || [ "${1:-} ${2:-}" = "pr create" ] || exit 0
sub=$2; shift 2
head=""; base=""; title=""; body=""; want=url
while [ $# -gt 0 ]; do
  case "$1" in
    --head) head=$2; shift 2;;
    --base) base=$2; shift 2;;
    --title) title=$2; shift 2;;
    --body-file) body=$2; shift 2;;
    --json) want=$2; shift 2;;
    --state|--jq) shift 2;;
    *) shift;;
  esac
done
if [ "$sub" = list ]; then
  row=$(awk -F'\t' -v h="$head" '$2 == h' "$db" | tail -n 1)
  [ -n "$row" ] || exit 0
  n=$(printf '%s' "$row" | cut -f1)
  if [ "$want" = number ]; then echo "$n"; else echo "https://example.invalid/pull/$n"; fi
  exit 0
fi
if [ -f "$STUB_DIR/fail-create" ]; then echo "stand-in gh: pr create refused" >&2; exit 1; fi
n=$(( $(wc -l < "$db") + 1 ))
printf '%s\t%s\t%s\t%s\n' "$n" "$head" "$base" "$title" >> "$db"
cp "$body" "$STUB_DIR/body-$n.md"
echo "https://example.invalid/pull/$n"
EOF
  printf '#!/bin/sh\nexit 0\n' > "$STUB/bin/osascript"
  chmod +x "$STUB/bin/claude" "$STUB/bin/gh" "$STUB/bin/osascript"
}

ralph() {  # ARGS...   sets RC; the output lands in $SB/out.log
  ( cd "$WORK" && PATH="$STUB/bin:$PATH" STUB_DIR="$STUB" RALPH_RETRY_SLEEP=0 \
      bash .claude/skills/ralph/ralph.sh "$@" ) > "$SB/out.log" 2>&1
  RC=$?
}

start_bg() {  # ARGS...   sets BG, and SESSION_PID once the stand-in session is running
  ( cd "$WORK" && PATH="$STUB/bin:$PATH" STUB_DIR="$STUB" RALPH_RETRY_SLEEP=0 \
      exec bash .claude/skills/ralph/ralph.sh "$@" ) > "$SB/out.log" 2>&1 &
  BG=$!
  SESSION_PID=""
  local i
  for i in $(seq 1 150); do
    SESSION_PID=$(sed -n 's/^claude_pid=//p' "$WORK/.scratch/ralph.lock" 2>/dev/null)
    [ -n "$SESSION_PID" ] && [ -f "$STUB/calls-01" ] && return 0
    sleep 0.2
  done
  return 1
}

status() { sed -n 's/^\*\*Status:\*\* \([^ ]*\).*/\1/p' "$WORK/.scratch/demo/issues/$1"-*.md; }  # NN
pr_field() { awk -F'\t' -v h="$1" -v c="$2" '$2 == h { print $c }' "$STUB/prs.tsv" 2>/dev/null | tail -n 1; }  # HEAD COLUMN
pr_base_of() { pr_field "$1" 3; }  # HEAD
on_origin() { git -C "$SB/origin.git" show-ref --verify --quiet "refs/heads/$1"; }  # BRANCH
within() { g merge-base --is-ancestor "$1" "$2"; }  # A B   every commit of A is in B

# What GitHub does on "Create a merge commit" when merged branches are deleted automatically.
merge_on_origin() {  # BRANCH
  rm -rf "$SB/admin"
  git clone --quiet "$SB/origin.git" "$SB/admin"
  owner_git merge --quiet --no-ff -m "Merge pull request for $1" "origin/$1"
  owner_git push --quiet origin main
  owner_git push --quiet origin --delete "$1"
}

# A change that reaches the trunk without passing through the stack.
commit_on_origin() {  # FILE
  rm -rf "$SB/admin"
  git clone --quiet "$SB/origin.git" "$SB/admin"
  echo fix > "$SB/admin/$1"
  owner_git add "$1"
  owner_git commit --quiet -m "Add $1"
  owner_git push --quiet origin main
}

# ---------------------------------------------------------------- cases

case_stack() {
  echo "stack: two chained tickets in one run, then merges on the remote"
  sandbox stack 5
  touch "$STUB/write-body"
  ralph afk 2 --feature demo
  is "a run of two exits 0" "$RC" 0
  is "ticket 01 is done" "$(status 01)" done
  is "ticket 02 is done" "$(status 02)" done
  holds "branch 01 is on the remote" on_origin "$B1"
  holds "branch 02 is on the remote" on_origin "$B2"
  holds "branch 02 starts on top of branch 01" within "$B1" "$B2"
  is "pull request 01 targets the trunk" "$(pr_base_of "$B1")" main
  is "pull request 02 targets branch 01" "$(pr_base_of "$B2")" "$B1"
  is "the pull request is titled after the ticket" "$(pr_field "$B2" 4)" "Ticket 02: Step 2"
  holds "the session's body is used" grep -q "stand-in body for ticket 02" "$STUB/body-2.md"
  holds "a stacked pull request says what it is stacked on" grep -q "Stacked on #1" "$STUB/body-2.md"
  not "a pull request on the trunk carries no stacked line" grep -q "Stacked on" "$STUB/body-1.md"
  holds "the body ends with the attribution" grep -q "Generated with \[Claude Code\]" "$STUB/body-2.md"
  holds "the ticket records its pull request" grep -q "pull request https://example.invalid/pull/2" "$WORK/.scratch/demo/issues/02-step-2.md"
  holds "the summary lists the pull request" grep -q "pull request: https://example.invalid/pull/1" "$SB/out.log"
  local prompt
  prompt=$(ls "$WORK"/.scratch/demo/ralph/*/02-attempt1.prompt.md | head -n 1)
  holds "the prompt names the ticket's branch" grep -q "Branch \`$B2\` is this ticket's own" "$prompt"
  holds "the prompt names the body file" grep -q "\`.scratch/demo/pr/02.md\`" "$prompt"
  not "the prompt has no placeholder left" grep -q '{{' "$prompt"

  # the owner merges pull request 01; GitHub deletes its branch
  merge_on_origin "$B1"
  rm "$STUB/write-body"
  ralph afk 1 --feature demo
  is "the next run exits 0" "$RC" 0
  is "branch 03 starts at the tip of branch 02" "$(g merge-base "$B3" "$B2")" "$(g rev-parse "$B2")"
  is "merging the lower pull request leaves no merge commit in branch 03" "$(g rev-list --merges --count "$B2..$B3")" 0
  is "pull request 03 targets branch 02" "$(pr_base_of "$B3")" "$B2"
  holds "a missing body is generated from the commits" grep -q "the loop generated this one" "$STUB/body-3.md"

  # pull request 02 merges too and a fix lands on the trunk; 03 is still open
  merge_on_origin "$B2"
  commit_on_origin fix.txt
  ralph afk 1 --feature demo
  is "a run with a moved trunk exits 0" "$RC" 0
  holds "branch 04 stacks on the open branch 03" within "$B3" "$B4"
  holds "branch 04 holds the fix from the trunk" g cat-file -e "$B4:fix.txt"
  is "pull request 04 targets branch 03" "$(pr_base_of "$B4")" "$B3"

  # everything merges; the next branch starts from the trunk
  merge_on_origin "$B3"
  merge_on_origin "$B4"
  ralph afk 1 --feature demo
  is "a run after every merge exits 0" "$RC" 0
  is "pull request 05 targets the trunk" "$(pr_base_of "$B5")" main
  is "branch 05 is one commit on the trunk" "$(g rev-list --count "origin/main..$B5")" 1
}

case_diverged() {
  echo "diverged: a fix lands on a lower branch after the next one stacked on it"
  sandbox diverged 3
  ralph afk 2 --feature demo
  g checkout --quiet "$B1"
  echo fix > "$WORK/fix.txt"
  g add fix.txt
  g commit --quiet -m "Fix after review"
  ralph afk 1 --feature demo
  is "the run refuses with exit 3" "$RC" 3
  holds "it says the branches have diverged" grep -q "have diverged" "$SB/out.log"
  is "ticket 03 is untouched" "$(status 03)" ready-for-agent
  holds "the fix was pushed to its pull request first" git -C "$SB/origin.git" cat-file -e "$B1:fix.txt"
  merge_on_origin "$B1"
  ralph afk 1 --feature demo
  is "once the lower pull request is merged the run exits 0" "$RC" 0
  holds "branch 03 stacks on branch 02" within "$B2" "$B3"
  holds "branch 03 holds the fix" g cat-file -e "$B3:fix.txt"
}

case_conflict() {
  echo "conflict: the trunk and the stack change the same file"
  sandbox conflict 2
  ralph afk 1 --feature demo
  commit_on_origin file-01.txt
  ralph afk 1 --feature demo
  is "the run refuses with exit 3" "$RC" 3
  holds "it names the conflict" grep -q "merging origin/main into $B2 conflicts" "$SB/out.log"
  is "ticket 02 is untouched" "$(status 02)" ready-for-agent
  is "the tree is left clean" "$(g status --porcelain)" ""
  not "no merge is left half done" test -e "$WORK/.git/MERGE_HEAD"
}

case_publish() {
  echo "publish: opening the pull request fails; the next run publishes first"
  sandbox publish 2
  touch "$STUB/fail-create"
  ralph afk 2 --feature demo
  is "the run exits 7" "$RC" 7
  is "ticket 01 is done all the same" "$(status 01)" done
  is "ticket 02 was not started" "$(status 02)" ready-for-agent
  is "no pull request exists" "$(wc -l < "$STUB/prs.tsv" | tr -d ' ')" 0
  rm "$STUB/fail-create"
  ralph afk 2 --feature demo
  is "the rerun exits 0" "$RC" 0
  is "pull request 01 is opened first, on the trunk" "$(pr_field "$B1" 1) $(pr_base_of "$B1")" "1 main"
  is "pull request 02 targets branch 01" "$(pr_base_of "$B2")" "$B1"
}

case_local() {
  echo "local: --no-push stacks without a remote call"
  sandbox local 2
  ralph afk 2 --feature demo --no-push
  is "the run exits 0" "$RC" 0
  holds "branch 02 starts on top of branch 01" within "$B1" "$B2"
  not "nothing was pushed" on_origin "$B1"
  not "gh was not called" test -s "$STUB/gh.log"
}

case_continue() {
  echo "continue: a ticket that failed twice is picked up again on its own branch"
  sandbox continue 1
  echo partial > "$STUB/mode-01"
  ralph afk 1 --feature demo
  is "two failed attempts exit 4" "$RC" 4
  is "the ticket stays in-progress" "$(status 01)" in-progress
  not "nothing is published for it" on_origin "$B1"
  # the owner sets it back
  perl -pi -e 's/^\*\*Status:\*\* in-progress/**Status:** ready-for-agent/' "$WORK/.scratch/demo/issues/01-step-1.md"
  rm "$STUB/mode-01"
  ralph afk 1 --feature demo
  is "the rerun exits 0" "$RC" 0
  holds "the branch keeps the earlier commits" g cat-file -e "$B1:partial-01-1.txt"
  holds "the base it records is where the ticket's work began" \
    grep -q "picked; branch $B1; base commit $(g rev-parse origin/main)" "$WORK/.scratch/demo/issues/01-step-1.md"
  is "its pull request targets the trunk" "$(pr_base_of "$B1")" main
}

case_kill() {
  echo "kill: a session that dies is retried once"
  sandbox kill 1
  echo hang-once > "$STUB/mode-01"
  holds "the session starts" start_bg afk 1 --feature demo
  [ -n "$SESSION_PID" ] && kill -TERM "$SESSION_PID"
  wait "$BG"; RC=$?
  is "the run exits 0" "$RC" 0
  holds "the first session is recorded as killed" grep -q "killed=external" "$SB/out.log"
  holds "a second attempt ran" grep -q "launch ticket=01 attempt=2" "$SB/out.log"
  is "the ticket is done" "$(status 01)" done
}

case_stop() {
  echo "stop: the stop command ends the run and leaves the ticket in-progress"
  sandbox stop 1
  echo hang > "$STUB/mode-01"
  holds "the session starts" start_bg afk 1 --feature demo
  ( cd "$WORK" && PATH="$STUB/bin:$PATH" bash .claude/skills/ralph/ralph.sh stop ) > "$SB/stop.log" 2>&1
  wait "$BG"; RC=$?
  is "the run exits 130" "$RC" 130
  is "the ticket stays in-progress" "$(status 01)" in-progress
  not "the lock is gone" test -e "$WORK/.scratch/ralph.lock"
}

# ---------------------------------------------------------------- main

CASES=(stack diverged conflict publish local continue kill stop)
[ $# -gt 0 ] && CASES=("$@")
for c in "${CASES[@]}"; do
  declare -F "case_$c" >/dev/null || { echo "unknown case: $c (known: stack diverged conflict publish local continue kill stop)" >&2; exit 2; }
  "case_$c"
done
echo
if (( FAILS == 0 )); then
  echo "ALL CHECKS PASSED ($PASSES)"
else
  echo "$FAILS of $((PASSES + FAILS)) CHECKS FAILED"
  [ "${KEEP:-0}" = 1 ] || echo "run again with KEEP=1 to keep the sandboxes and read out.log"
  exit 1
fi
