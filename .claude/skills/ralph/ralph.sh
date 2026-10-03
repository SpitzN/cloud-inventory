#!/usr/bin/env bash
# ralph: implement tickets unattended, one fresh claude session per ticket.
# Operator manual: SKILL.md beside this file. `ralph.sh --help` lists commands, flags and exit codes.

if ((BASH_VERSINFO[0] < 4)) && [ -x /opt/homebrew/bin/bash ]; then
  exec /opt/homebrew/bin/bash "$0" "$@"
fi
set -uo pipefail
shopt -u patsub_replacement 2>/dev/null || true

SKILL_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(git -C "$SKILL_DIR" rev-parse --show-toplevel 2>/dev/null) || { echo "ralph: not inside a git repository" >&2; exit 3; }
cd "$REPO_ROOT" || exit 3

LOCK="$REPO_ROOT/.scratch/ralph.lock"
PROMPT_TEMPLATE="$SKILL_DIR/prompt.md"
RATE_RE='rate.?limit|usage.?limit|hit your (session|weekly|usage|limit)|overloaded|529|too many requests|out of (extra )?usage|capacity'

CMD=""; N=""; FEATURE=cloud-inventory; BASE=main; MODEL=""; EFFORT=""; PUSH=1; MAX_TURNS=250; WATCHDOG_MIN=60
ISSUES=""; PROGRESS=""; PROGRESS_REL=""; RUNS_DIR=""; PR_DIR=""; PR_DIR_REL=""
BRANCH=""; TRUNK_REF=""; START_SHA=""; PR_URL=""
RUN_ID=""; RUN_DIR=""; CLAUDE_PID=""; WD_PID=""; RENDER_PID=""
CURRENT_NN=""; CURRENT_TITLE=""; CURRENT_FILE=""; CURRENT_ATTEMPT=1
SESSION_RC=0; SESSION_SUBTYPE=""; SESSION_IS_ERROR=false; SESSION_TURNS=0; SESSION_COST=0; SESSION_ID=""; SESSION_RESULT=""; SESSION_KILLED_BY=none
GATE_REASON=""; CHECK_STATE=""

# ---------------------------------------------------------------- cli

usage() {
  cat <<'EOF'
usage: ralph.sh <command> [options]

commands
  afk <n>     implement up to <n> ready tickets unattended, one fresh claude session each
  once        implement the next ready ticket in an interactive claude session (needs a terminal)
  dry-run     print the order the picker would take and where it stops
  status      show the live run (if any) and the latest run's log tail and summary
  stop        stop the live run; the current ticket stays in-progress

options
  --feature <slug>        tracker directory .scratch/<slug>/ (default: cloud-inventory)
  --base <branch>         the trunk: pull requests target it, and a branch with nothing open
                          below it starts from origin/<branch> (default: main)
  --no-push               keep the run local: no fetch, no push, no pull request; --base is
                          then any local ref
  --model <m>             pass --model to claude
  --effort <e>            pass --effort to claude
  --max-turns <n>         per-session turn cap (default: 250; afk only)
  --watchdog-minutes <n>  per-session wall-clock cap (default: 60; afk only)

exit codes
  0 done, or no eligible ticket     2 usage
  3 preflight: lock held, dirty tree, tool missing, fetch failed, ticket branches diverged
  4 a ticket failed twice           5 a ticket needs the owner (needs-info)
  6 rate-limit wait exhausted       130 stopped
  7 the ticket is done; pushing its branch or opening its pull request failed (the next run publishes it)

Each ticket gets its own branch, feat/<slug>-<ticket file name>, and its own pull request. The
branch starts on top of the newest ticket branch whose work is not yet in the trunk (a stack),
else from the trunk. A stacked pull request targets the branch below it.

The ticket directory is .scratch/<slug>/issues/. In a git worktree .scratch/ is absent (it is
git-ignored): symlink the feature directory in, e.g. ln -s <main checkout>/.scratch/<slug> .scratch/<slug>
EOF
}

die() { local code=$1; shift; echo "ralph: $*" >&2; exit "$code"; }

parse_args() {
  [ $# -ge 1 ] || { usage; exit 2; }
  CMD=$1; shift
  case "$CMD" in
    afk)
      [[ ${1:-} =~ ^[0-9]+$ ]] || { usage; die 2 "afk needs an iteration count"; }
      N=$1; shift;;
    once|dry-run|status|stop) ;;
    -h|--help|help) usage; exit 0;;
    *) usage; die 2 "unknown command: $CMD";;
  esac
  while [ $# -gt 0 ]; do
    case "$1" in
      --feature) FEATURE=${2:?--feature needs a value}; shift 2;;
      --base) BASE=${2:?--base needs a value}; shift 2;;
      --model) MODEL=${2:?--model needs a value}; shift 2;;
      --effort) EFFORT=${2:?--effort needs a value}; shift 2;;
      --max-turns) MAX_TURNS=${2:?--max-turns needs a value}; shift 2;;
      --watchdog-minutes) WATCHDOG_MIN=${2:?--watchdog-minutes needs a value}; shift 2;;
      --no-push) PUSH=0; shift;;
      --push) shift;;  # pushing is the default; the flag is kept so older commands still run
      *) usage; die 2 "unknown option: $1";;
    esac
  done
  ISSUES="$REPO_ROOT/.scratch/$FEATURE/issues"
  PROGRESS="$REPO_ROOT/.scratch/$FEATURE/progress.md"
  PROGRESS_REL=".scratch/$FEATURE/progress.md"
  RUNS_DIR="$REPO_ROOT/.scratch/$FEATURE/ralph"
  PR_DIR="$REPO_ROOT/.scratch/$FEATURE/pr"
  PR_DIR_REL=".scratch/$FEATURE/pr"
}

log() {
  local line
  line="$(date -u +%FT%TZ) $*"
  [ -n "$RUN_DIR" ] && echo "$line" >> "$RUN_DIR/run.log"
  echo "$line" >&2
}

# ---------------------------------------------------------------- preflight

ensure_node() {
  if ! command -v pnpm >/dev/null 2>&1 || ! command -v node >/dev/null 2>&1; then
    # shellcheck disable=SC1091
    [ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh" >/dev/null 2>&1
  fi
  command -v node >/dev/null 2>&1 || die 3 "node not found on PATH (nvm not loaded?)"
  command -v pnpm >/dev/null 2>&1 || die 3 "pnpm not found on PATH"
}

preflight_tickets() {
  [ -d "$ISSUES" ] || die 3 "no tickets directory: $ISSUES (in a worktree, symlink the feature directory from the main checkout's .scratch/)"
  compgen -G "$ISSUES/[0-9][0-9]-*.md" >/dev/null || die 3 "no tickets in $ISSUES"
}

preflight_tools() {
  local t
  for t in claude jq perl git; do command -v "$t" >/dev/null 2>&1 || die 3 "$t not found on PATH"; done
  [ -f "$PROMPT_TEMPLATE" ] || die 3 "missing prompt template: $PROMPT_TEMPLATE"
  [ "$PUSH" = 1 ] || return 0
  command -v gh >/dev/null 2>&1 || die 3 "gh not found on PATH (it opens the pull requests; --no-push runs without it)"
  git remote get-url origin >/dev/null 2>&1 || die 3 "no origin remote to push to (--no-push runs without one)"
}

# ---------------------------------------------------------------- tickets

issue_files() { ls "$ISSUES"/[0-9][0-9]-*.md 2>/dev/null | sort; }
ticket_number() { basename "$1" | cut -c1-2; }
ticket_title() { sed -n '1s/^# [0-9][0-9]: //p' "$1"; }
ticket_file() { ls "$ISSUES/$1"-*.md 2>/dev/null | head -n 1; }

# First token after the Status label; bold markers and any trailing note are ignored.
parse_status() {
  perl -ne 'if (/^\**Status\**:\**\s*([^\s*]+)/) { print "$1\n"; exit }' "$1"
}

# Blocked-by numbers of FILE, minus SELF. Parenthesised titles are dropped first; NN-NN ranges expand.
parse_blockers() {
  SELF="$2" perl -ne '
    if (/^\**Blocked by\**:\**\s*(.*)$/) {
      my $t = $1; $t =~ s/\([^)]*\)//g;
      my (%seen, @n);
      while ($t =~ /(?<!\d)(\d{2})(?:\s*[-\x{2013}]\s*(\d{2}))?(?!\d)/g) {
        if (defined $2) { push @n, map { sprintf "%02d", $_ } ($1 .. $2) } else { push @n, $1 }
      }
      print join(" ", grep { $_ ne $ENV{SELF} && !$seen{$_}++ } @n), "\n";
      exit;
    }' "$1"
}

status_of() {
  local f
  f=$(ticket_file "$1")
  if [ -n "$f" ]; then parse_status "$f"; else echo missing; fi
}

is_eligible() {  # FILE [SIM_DONE]
  local f=$1 sim=${2:-} nn b
  [ "$(parse_status "$f")" = ready-for-agent ] || return 1
  nn=$(ticket_number "$f")
  for b in $(parse_blockers "$f" "$nn"); do
    [[ " $sim " == *" $b "* ]] && continue
    [ "$(status_of "$b")" = done ] || return 1
  done
  return 0
}

pick_next() {  # [SIM_DONE]  (tickets already in the simulated set are skipped)
  local f sim=${1:-}
  for f in $(issue_files); do
    [[ " $sim " == *" $(ticket_number "$f") "* ]] && continue
    if is_eligible "$f" "$sim"; then echo "$f"; return 0; fi
  done
  return 1
}

explain_ineligible() {  # FILE [SIM_DONE]
  local f=$1 sim=${2:-} s nn b reasons=()
  s=$(parse_status "$f"); nn=$(ticket_number "$f")
  [ "$s" != ready-for-agent ] && reasons+=("status=$s")
  for b in $(parse_blockers "$f" "$nn"); do
    [[ " $sim " == *" $b "* ]] && continue
    [ "$(status_of "$b")" = done ] || reasons+=("blocked by $b ($(status_of "$b"))")
  done
  echo "${reasons[*]:-}"
}

set_status() {  # FILE NEW
  local f=$1 new=$2
  perl -0pi -e 's/^((?:\*\*)?Status(?:\*\*)?:(?:\*\*)?)[ \t]*[^\n]*/$1 '"$new"'/m' "$f"
  [ "$(parse_status "$f")" = "$new" ] || die 3 "could not set Status to $new in $f"
}

append_comment() {  # FILE TEXT
  local f=$1 text=$2
  [ -n "$(tail -c1 "$f")" ] && echo >> "$f"
  grep -q '^## Comments' "$f" || printf '\n## Comments\n\n' >> "$f"
  printf -- '- %s ralph(%s): %s\n' "$(date -u +%FT%TZ)" "${RUN_ID:-manual}" "$text" >> "$f"
}

ensure_progress() {
  [ -f "$PROGRESS" ] && return 0
  mkdir -p "$(dirname "$PROGRESS")"
  printf '# %s progress\n\nOne entry per ticket, appended by the session that implemented it: what was built, decisions, gotchas, files touched. Read before exploring.\n' "$FEATURE" > "$PROGRESS"
}

unticked_boxes() { grep -E '^- \[ \]' "$1" 2>/dev/null | sed -E 's/^- \[ \] //' | cut -c1-70; }

# ---------------------------------------------------------------- lock, tree, branch

lock_get() { sed -n "s/^$1=//p" "$LOCK" 2>/dev/null | head -n 1; }

acquire_lock() {
  mkdir -p "$(dirname "$LOCK")"
  if [ -f "$LOCK" ]; then
    local pid
    pid=$(lock_get pid)
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      die 3 "another ralph run is live: pid=$pid run_id=$(lock_get run_id) feature=$(lock_get feature). Run 'ralph.sh stop' first."
    fi
    echo "ralph: removing stale lock (pid=${pid:-?} is gone)" >&2
    rm -f "$LOCK"
  fi
  printf 'pid=%s\nrun_id=%s\nfeature=%s\nstarted=%s\nclaude_pid=\n' "$$" "$RUN_ID" "$FEATURE" "$(date -u +%FT%TZ)" > "$LOCK"
}

update_lock() {  # KEY VALUE
  [ -f "$LOCK" ] || return 0
  if grep -q "^$1=" "$LOCK"; then perl -pi -e "s/^$1=.*/$1=$2/" "$LOCK"; else echo "$1=$2" >> "$LOCK"; fi
}

release_lock() {
  [ -f "$LOCK" ] && [ "$(lock_get pid)" = "$$" ] && rm -f "$LOCK"
  return 0
}

assert_clean_tree() {
  [ -z "$(git status --porcelain --untracked-files=all)" ] || die 3 "working tree not clean; commit first (the loop refuses to mix its commits with yours)"
}

warn_leftovers() {
  local f
  for f in $(issue_files); do
    [ "$(parse_status "$f")" = in-progress ] || continue
    log warn "ticket $(ticket_number "$f") is in-progress from an earlier run; the picker skips it. To retry it, set its Status back to ready-for-agent."
  done
}

# ---------------------------------------------------------------- branches and pull requests
# One branch and one pull request per ticket. An open branch is a done ticket's branch whose
# commits are not yet in the trunk; the open branches form the stack. A new branch starts on
# the top of the stack, else from the trunk, and its pull request targets the branch below it.

ticket_branch() { echo "feat/$FEATURE-$(basename "$1" .md)"; }  # FILE

trunk_ref() { if [ "$PUSH" = 1 ]; then echo "origin/$BASE"; else echo "$BASE"; fi; }

sync_trunk() {
  if [ "$PUSH" = 1 ]; then
    git fetch --prune --quiet origin > "$RUN_DIR/fetch.log" 2>&1 || fail_exit 3 "could not fetch origin; see $RUN_DIR/fetch.log"
  fi
  TRUNK_REF=$(trunk_ref)
  git rev-parse --verify --quiet "$TRUNK_REF^{commit}" >/dev/null || fail_exit 3 "trunk not found: $TRUNK_REF"
}

# Where BRANCH lives: the local branch, else its copy on origin. Prints nothing when neither exists.
branch_ref() {  # BRANCH
  if git show-ref --verify --quiet "refs/heads/$1"; then echo "$1"
  elif git show-ref --verify --quiet "refs/remotes/origin/$1"; then echo "origin/$1"
  fi
}

# The open branches, bottom of the stack first. A branch merged some other way than a merge
# commit is not an ancestor of the trunk; after the pruning fetch its upstream reads [gone].
open_branches() {
  local f br ref
  for f in $(issue_files); do
    [ "$(parse_status "$f")" = done ] || continue
    br=$(ticket_branch "$f"); ref=$(branch_ref "$br")
    [ -n "$ref" ] || continue
    git merge-base --is-ancestor "$ref" "$TRUNK_REF" 2>/dev/null && continue
    [ "$ref" = "$br" ] && [ "$(git for-each-ref --format='%(upstream:track)' "refs/heads/$br")" = "[gone]" ] && continue
    printf '%s\t%s\n' "$(git rev-list --count "$TRUNK_REF..$ref")" "$br"
  done | sort -n | cut -f2
}

# The top of the stack; prints nothing when no branch is open. Fails when the open branches
# have diverged: the top has to contain every other one.
stack_top() {
  local all top b
  all=$(open_branches)
  [ -n "$all" ] || return 0
  top=$(printf '%s\n' "$all" | tail -n 1)
  for b in $all; do
    git merge-base --is-ancestor "$(branch_ref "$b")" "$(branch_ref "$top")" || return 1
  done
  echo "$top"
}

# The pull request base for BRANCH: the nearest open branch below it, else the trunk.
pr_base() {  # BRANCH
  local b base=$BASE self
  self=$(branch_ref "$1")
  for b in $(open_branches); do
    [ "$b" = "$1" ] && continue
    git merge-base --is-ancestor "$(branch_ref "$b")" "$self" 2>/dev/null && base=$b
  done
  echo "$base"
}

# Bring into the new branch what reached the trunk after the stack was cut: a review fix, another
# pull request. Skipped when the trunk adds no content, so a plain merge of a lower pull
# request leaves no merge commit here.
merge_trunk() {
  git merge-base --is-ancestor "$TRUNK_REF" HEAD && return 0
  [ "$(git merge-tree --write-tree HEAD "$TRUNK_REF" 2>/dev/null)" = "$(git rev-parse 'HEAD^{tree}')" ] && return 0
  if ! git merge --quiet --no-edit "$TRUNK_REF" > "$RUN_DIR/merge.log" 2>&1; then
    git merge --abort 2>/dev/null
    fail_exit 3 "merging $TRUNK_REF into $BRANCH conflicts. On $BRANCH, merge $TRUNK_REF by hand and commit, then run again"
  fi
  log branch merged=$TRUNK_REF into=$BRANCH
}

# The session starts with the dependencies its branch declares.
refresh_install() {
  [ -f "$REPO_ROOT/package.json" ] && [ -f "$REPO_ROOT/pnpm-lock.yaml" ] || return 0
  pnpm install --frozen-lockfile --prefer-offline > "$RUN_DIR/install.log" 2>&1 \
    || fail_exit 3 "pnpm install failed on $BRANCH; see $RUN_DIR/install.log"
}

# Check out the ticket's branch. A branch that already holds commits of its own is continued;
# otherwise it is cut fresh. Sets BRANCH and START_SHA, the commit the ticket's work starts from.
start_branch() {  # FILE
  local top start
  BRANCH=$(ticket_branch "$1")
  top=$(stack_top) || fail_exit 3 "open ticket branches have diverged ($(open_branches | tr '\n' ' ')): merge their pull requests, lowest first, then run again"
  start=$TRUNK_REF
  [ -n "$top" ] && start=$(branch_ref "$top")
  if git show-ref --verify --quiet "refs/heads/$BRANCH" && ! git merge-base --is-ancestor "$BRANCH" "$start"; then
    git checkout --quiet "$BRANCH" || fail_exit 3 "could not check out $BRANCH"
    START_SHA=$(git merge-base "$BRANCH" "$start")
    log branch name=$BRANCH continued=yes start=$START_SHA
  else
    git checkout --quiet -B "$BRANCH" --no-track "$start" || fail_exit 3 "could not create $BRANCH from $start"
    merge_trunk
    START_SHA=$(git rev-parse HEAD)
    log branch name=$BRANCH from=$start start=$START_SHA
  fi
  refresh_install
}

# The pull request body: a stacked-on line when the pull request targets another ticket's
# branch, then the session's file or a generated stand-in, then the attribution footer.
compose_pr_body() {  # BRANCH NN TITLE BASE BELOW_PR OUT
  local br=$1 nn=$2 title=$3 base=$4 below=$5 out=$6 src="$PR_DIR/$2.md" from=$TRUNK_REF
  [ "$base" != "$BASE" ] && from=$(branch_ref "$base")
  {
    if [ "$base" != "$BASE" ]; then
      printf '> Stacked on %s`%s`: merge that pull request first, with a merge commit. GitHub then points this one at `%s`.\n\n' \
        "${below:+#$below, }" "$base" "$BASE"
    fi
    if [ -s "$src" ]; then
      cat "$src"
    else
      printf '## Summary\n\nTicket %s: %s\n\n```text\n%s\n```\n\nThe session wrote no pull request body; the loop generated this one from the commits.\n' \
        "$nn" "$title" "$(git log --first-parent --no-merges --format='%h %s' "$from..$(branch_ref "$br")" 2>/dev/null)"
    fi
    grep -qs 'Generated with \[Claude Code\]' "$src" || printf '\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n'
  } > "$out"
}

# Push BRANCH and make sure it has a pull request. Sets PR_URL. Safe to repeat: an up-to-date
# branch is not pushed again, and a branch that ever had a pull request gets no second one.
publish() {  # BRANCH FILE
  local br=$1 file=$2 nn title try plog
  PR_URL=""
  if [ "$PUSH" != 1 ]; then PR_URL="none (--no-push)"; return 0; fi
  nn=$(ticket_number "$file"); title=$(ticket_title "$file"); plog="$RUN_DIR/$nn.publish.log"
  for try in 1 2 3; do
    if publish_once "$br" "$nn" "$title" >> "$plog" 2>&1; then
      log publish ticket=$nn branch=$br pr=$PR_URL
      return 0
    fi
    log warn "publish ticket=$nn try=$try of=3 failed; see $plog"
    if (( try < 3 )); then sleep "${RALPH_RETRY_SLEEP:-20}" & wait $!; fi
  done
  return 1
}

publish_once() {  # BRANCH NN TITLE
  local br=$1 nn=$2 title=$3 base below body
  if git show-ref --verify --quiet "refs/heads/$br"; then
    if ! git show-ref --verify --quiet "refs/remotes/origin/$br" || [ -n "$(git rev-list -1 "origin/$br..$br")" ]; then
      git push --quiet -u origin "$br" || return 1
    fi
  fi
  PR_URL=$(gh pr list --head "$br" --state all --json url --jq '.[0].url // empty') || return 1
  [ -n "$PR_URL" ] && return 0
  base=$(pr_base "$br"); below=""
  [ "$base" != "$BASE" ] && below=$(gh pr list --head "$base" --state open --json number --jq '.[0].number // empty')
  body="$RUN_DIR/$nn.pr-body.md"
  compose_pr_body "$br" "$nn" "$title" "$base" "$below" "$body"
  PR_URL=$(gh pr create --base "$base" --head "$br" --title "Ticket $nn: $title" --body-file "$body" | tail -n 1)
  [ -n "$PR_URL" ]
}

# A ticket closed by a run whose push or pull request failed is published before anything is picked.
publish_pending() {
  [ "$PUSH" = 1 ] || return 0
  local b
  for b in $(open_branches); do
    publish "$b" "$ISSUES/${b#"feat/$FEATURE-"}.md" || fail_exit 7 "could not publish $b (run dir: $RUN_DIR)"
  done
}

# ---------------------------------------------------------------- prompt

render_prompt() {  # FILE NN TITLE BASE_SHA PREFACE OUT
  local file=$1 nn=$2 title=$3 base=$4 preface=$5 out=$6 t rel
  rel=${file#"$REPO_ROOT/"}
  t=$(<"$PROMPT_TEMPLATE")
  t=${t//"{{TICKET_PATH}}"/$rel}
  t=${t//"{{TICKET_NUMBER}}"/$nn}
  t=${t//"{{TICKET_TITLE}}"/$title}
  t=${t//"{{FEATURE}}"/$FEATURE}
  t=${t//"{{PROGRESS_PATH}}"/$PROGRESS_REL}
  t=${t//"{{BASE_SHA}}"/$base}
  t=${t//"{{BRANCH}}"/$BRANCH}
  t=${t//"{{PR_BODY_PATH}}"/$PR_DIR_REL/$nn.md}
  t=${t//"{{RETRY_PREFACE}}"/$preface}
  printf '%s\n' "$t" > "$out"
}

build_retry_preface() {  # ATTEMPT REASON DETAIL_FILE BASE_SHA
  local attempt=$1 reason=$2 detail_file=$3 base=$4 detail=""
  if [ -n "$detail_file" ] && [ -s "$detail_file" ]; then
    detail=$(printf 'Last lines of the record:\n\n```\n%s\n```\n' "$(tail -n 40 "$detail_file")")
  fi
  cat <<EOF
## Read this first: attempt $attempt on this ticket

The previous session on this ticket ended without passing the loop's gate. What happened: $reason.

$detail
The working tree and the commits since \`$base\` are exactly as that session left them. Continue from them: read \`git status\`, \`git diff\`, \`git log $base..HEAD --oneline\`, \`$PROGRESS_REL\` and the ticket's \`## Comments\` before anything else, then finish the ticket. Keep every change in the tree and in those commits and build on them.
EOF
}

# ---------------------------------------------------------------- session

# jq filter turning stream-json events into readable log lines
RENDER_JQ='
  if .type == "system" and .subtype == "init" then
    "[init] model=\(.model // "?") session=\(.session_id // "?")"
  elif .type == "system" and .subtype == "api_retry" then
    "[api_retry] \(.error // "?") attempt=\(.attempt // "?") status=\(.error_status // "?")"
  elif .type == "assistant" then
    (.message.content // []) | if type == "string" then "[claude] \(.[0:2000])" else
      map(if .type == "text" then "[claude] \(.text[0:2000])"
          elif .type == "tool_use" then "[tool] \(.name) \((.input | tojson)[0:400])"
          else empty end) | .[] end
  elif .type == "user" then
    (.message.content // []) | if type == "string" then "[user] \(.[0:600])" else
      map(select(.type == "tool_result")
          | "[result] \((if (.content | type) == "string" then .content else ((.content // []) | map(.text? // "") | join(" ")) end)[0:600])") | .[] end
  elif .type == "result" then
    "[end] subtype=\(.subtype // "?") is_error=\(.is_error // "?") turns=\(.num_turns // "?") cost=\(.total_cost_usd // "?") session=\(.session_id // "?")"
  else empty end'

watchdog() {  # PID MINUTES MARKER
  local pid=$1 min=$2 marker=$3 i
  sleep "$((min * 60))"
  kill -0 "$pid" 2>/dev/null || return 0
  printf 'killed_at=%s after_minutes=%s\n' "$(date -u +%FT%TZ)" "$min" > "$marker"
  kill -TERM "$pid" 2>/dev/null
  for i in $(seq 1 20); do kill -0 "$pid" 2>/dev/null || return 0; sleep 1; done
  kill -KILL "$pid" 2>/dev/null
}

# End a background helper and its children. The helper dies first, so it neither reports
# nor acts on a child that was killed under it.
kill_tree() {  # PID
  [ -n "${1:-}" ] || return 0
  local kids
  kids=$(pgrep -P "$1" 2>/dev/null)
  kill "$1" 2>/dev/null
  # shellcheck disable=SC2086
  [ -n "$kids" ] && kill $kids 2>/dev/null
  wait "$1" 2>/dev/null
  return 0
}

read_result() {  # JSON RAW
  local json=$1 raw=$2
  if jq -e '.synthetic == true' "$json" >/dev/null 2>&1; then
    SESSION_SUBTYPE=none; SESSION_IS_ERROR=true; SESSION_COST=0; SESSION_ID=""; SESSION_RESULT=""
    SESSION_TURNS=$(jq -R -r 'fromjson? | select(.type == "assistant") | 1' "$raw" 2>/dev/null | wc -l | tr -d ' ')
    jq -c --argjson t "${SESSION_TURNS:-0}" '. + {num_turns: $t}' "$json" > "$json.tmp" 2>/dev/null && mv "$json.tmp" "$json"
    return 0
  fi
  SESSION_SUBTYPE=$(jq -r '.subtype // "?"' "$json")
  SESSION_IS_ERROR=$(jq -r '.is_error // false' "$json")
  SESSION_TURNS=$(jq -r '.num_turns // 0' "$json")
  SESSION_COST=$(jq -r '.total_cost_usd // 0' "$json")
  SESSION_ID=$(jq -r '.session_id // ""' "$json")
  SESSION_RESULT=$(jq -r '.result // ""' "$json")
}

run_session() {  # NN LABEL PROMPT_FILE
  local nn=$1 label=$2 prompt_file=$3
  local raw="$RUN_DIR/$nn-$label.jsonl" logf="$RUN_DIR/$nn-$label.log" json="$RUN_DIR/$nn-$label.json"
  local err="$RUN_DIR/$nn-$label.stderr" marker="$RUN_DIR/$nn-$label.watchdog"
  local -a extra=()
  [ -n "$MODEL" ] && extra+=(--model "$MODEL")
  [ -n "$EFFORT" ] && extra+=(--effort "$EFFORT")
  : > "$raw"; : > "$logf"
  env -u CLAUDECODE claude -p "$(<"$prompt_file")" \
    --output-format stream-json --verbose \
    --dangerously-skip-permissions --permission-prompts none \
    --max-turns "$MAX_TURNS" "${extra[@]}" \
    < /dev/null > "$raw" 2> "$err" &
  CLAUDE_PID=$!
  update_lock claude_pid "$CLAUDE_PID"
  bash -c 'tail -n +1 -F "$1" 2>/dev/null | jq -R -r --unbuffered "fromjson? | $2"' _ "$raw" "$RENDER_JQ" >> "$logf" 2>/dev/null &
  RENDER_PID=$!
  watchdog "$CLAUDE_PID" "$WATCHDOG_MIN" "$marker" 2>/dev/null &
  WD_PID=$!
  local rc=0
  wait "$CLAUDE_PID" || rc=$?
  CLAUDE_PID=""
  kill_tree "$WD_PID"; WD_PID=""
  sleep 1
  kill_tree "$RENDER_PID"; RENDER_PID=""
  jq -R -r "fromjson? | $RENDER_JQ" "$raw" > "$logf" 2>/dev/null
  jq -c 'select(.type == "result")' "$raw" 2>/dev/null | tail -n 1 > "$json"
  [ -s "$json" ] || printf '{"synthetic":true,"rc":%d}\n' "$rc" > "$json"
  SESSION_RC=$rc; SESSION_KILLED_BY=none
  [ -f "$marker" ] && SESSION_KILLED_BY=watchdog
  [ "$rc" -eq 143 ] && [ ! -f "$marker" ] && SESSION_KILLED_BY=external
  read_result "$json" "$raw"
  update_lock claude_pid ""
}

is_rate_limited() {  # RAW ERR (uses SESSION_*)
  local raw=$1 err=$2 last
  if [ "$SESSION_IS_ERROR" = true ] && printf '%s' "$SESSION_RESULT" | grep -qiE "$RATE_RE"; then return 0; fi
  if [ "$SESSION_KILLED_BY" = none ] && { [ "$SESSION_SUBTYPE" = none ] || [ "$SESSION_IS_ERROR" = true ]; }; then
    last=$(jq -R -r 'fromjson? | select(.type == "system" and .subtype == "api_retry") | .error // ""' "$raw" 2>/dev/null | tail -n 1)
    printf '%s' "$last" | grep -qiE 'rate_limit|overloaded' && return 0
    [ -s "$err" ] && grep -qiE "$RATE_RE" "$err" && return 0
  fi
  return 1
}

wait_for_capacity() {
  local i probe
  for i in $(seq 1 36); do
    log wait round=$i of=36 sleep_minutes=10
    sleep 600 & wait $! || true
    probe=$(env -u CLAUDECODE claude -p "Reply with the single word ok." --max-turns 1 --output-format json \
      --dangerously-skip-permissions --permission-prompts none 2>/dev/null </dev/null)
    if [ -n "$probe" ] && [ "$(printf '%s' "$probe" | jq -r '.is_error // true' 2>/dev/null)" = false ]; then
      log wait capacity=back
      return 0
    fi
  done
  return 1
}

# ---------------------------------------------------------------- gate

run_check() {  # LOG
  local clog=$1 pid killer rc=0
  if [ ! -f "$REPO_ROOT/package.json" ]; then
    CHECK_STATE=skipped
    echo "no package.json at the repo root: pnpm check skipped" > "$clog"
    return 0
  fi
  CHECK_STATE=ok
  pnpm check > "$clog" 2>&1 &
  pid=$!
  ( sleep 600; kill -TERM "$pid" ) 2>/dev/null &
  killer=$!
  wait "$pid" || rc=$?
  kill_tree "$killer"
  [ "$rc" -eq 0 ] && return 0
  CHECK_STATE=failed
  return 1
}

gate() {  # NN BASE_SHA LABEL -> GATE_REASON, CHECK_STATE
  local nn=$1 base=$2 label=$3 glog="$RUN_DIR/$nn-$label.gate.log" cur head file
  GATE_REASON=""; CHECK_STATE=""
  : > "$glog"
  cur=$(git branch --show-current)
  if [ "$cur" != "$BRANCH" ]; then
    GATE_REASON="not on branch $BRANCH (on ${cur:-a detached HEAD})"; echo "$GATE_REASON" >> "$glog"; return 1
  fi
  head=$(git rev-parse HEAD)
  if [ "$head" = "$base" ]; then
    GATE_REASON="no new commit since the base $base"; echo "$GATE_REASON" >> "$glog"; return 1
  fi
  if ! git merge-base --is-ancestor "$base" HEAD; then
    GATE_REASON="history rewritten: base $base is no longer an ancestor of HEAD"; echo "$GATE_REASON" >> "$glog"; return 1
  fi
  if [ -n "$(git status --porcelain --untracked-files=all)" ]; then
    GATE_REASON="working tree not clean"
    { echo "$GATE_REASON"; git status --porcelain --untracked-files=all; } >> "$glog"
    return 1
  fi
  if ! run_check "$RUN_DIR/$nn-$label.check.log"; then
    GATE_REASON="pnpm check failed"
    { echo "$GATE_REASON"; tail -n 60 "$RUN_DIR/$nn-$label.check.log"; } >> "$glog"
    return 1
  fi
  file=$(ticket_file "$nn")
  if ! sed -n '/^## Comments/,$p' "$file" | grep -qE '(^|[^0-9a-f])[0-9a-f]{7,40}([^0-9a-f]|$)'; then
    log warn "ticket $nn: no commit SHA under its ## Comments"
    echo "warn: no commit SHA under ## Comments" >> "$glog"
  fi
  if ! grep -qE "(^|[^0-9])$nn([^0-9]|$)" "$PROGRESS" 2>/dev/null; then
    log warn "ticket $nn: no entry in $PROGRESS_REL; appending a fallback line"
    printf '\n## %s %s (ralph fallback)\n\nThe session wrote no entry. Commits: %s..%s\n' \
      "$nn" "$(ticket_title "$file")" "$(git rev-parse --short "$base")" "$(git rev-parse --short HEAD)" >> "$PROGRESS"
  fi
  if [ "$PUSH" = 1 ] && [ ! -s "$PR_DIR/$nn.md" ]; then
    log warn "ticket $nn: no pull request body at $PR_DIR_REL/$nn.md; the loop generates one from the commits"
    echo "warn: no pull request body" >> "$glog"
  fi
  echo "pass check=$CHECK_STATE" >> "$glog"
  return 0
}

# ---------------------------------------------------------------- records

record_outcome() {  # NN TITLE ATTEMPTS STATUS [PULL_REQUEST]
  local nn=$1 title=$2 attempts=$3 status=$4 pr=${5:-} turns cost unticked tsv="$RUN_DIR/tickets.tsv"
  turns=$(cat "$RUN_DIR/$nn"-*.json 2>/dev/null | jq -s '[.[] | .num_turns // 0] | add // 0')
  cost=$(cat "$RUN_DIR/$nn"-*.json 2>/dev/null | jq -s '[.[] | .total_cost_usd // 0] | add // 0 | . * 100 | round / 100')
  unticked=$(unticked_boxes "$(ticket_file "$nn")" | wc -l | tr -d ' ')
  touch "$tsv"
  grep -v "^$nn	" "$tsv" > "$tsv.tmp" 2>/dev/null; mv "$tsv.tmp" "$tsv"
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$nn" "$title" "$attempts" "${turns:-0}" "${cost:-0}" "$status" "$unticked" "${pr:--}" >> "$tsv"
}

summarise() {
  local tsv="$RUN_DIR/tickets.tsv" out="$RUN_DIR/summary.txt" nn title attempts turns cost status unticked pr
  {
    echo "ralph run $RUN_ID  feature=$FEATURE  trunk=${TRUNK_REF:-?}  dir=$RUN_DIR"
    if [ -s "$tsv" ]; then
      printf '%-3s %-45s %-8s %-6s %-8s %-12s %s\n' ticket title attempts turns cost status unticked
      while IFS=$'\t' read -r nn title attempts turns cost status unticked pr; do
        printf '%-3s %-45.45s %-8s %-6s %-8s %-12s %s\n' "$nn" "$title" "$attempts" "$turns" "$cost" "$status" "$unticked"
        [ "${pr:--}" != - ] && echo "      pull request: $pr"
        unticked_boxes "$(ticket_file "$nn")" | sed 's/^/      - /'
      done < "$tsv"
    else
      echo "(no ticket was attempted)"
    fi
  } | tee "$out"
}

notify() {
  command -v osascript >/dev/null 2>&1 && osascript -e "display notification \"$1\" with title \"ralph\"" >/dev/null 2>&1
  return 0
}

fail_exit() {  # CODE MESSAGE
  local code=$1; shift
  log "run finished exit=$code reason=\"$*\""
  echo "ralph: $* (run dir: $RUN_DIR)" >&2
  exit "$code"
}

on_term() {
  trap - TERM INT
  log stop "signal received; stopping the run"
  if [ -n "$CLAUDE_PID" ] && kill -0 "$CLAUDE_PID" 2>/dev/null; then
    kill -TERM "$CLAUDE_PID" 2>/dev/null
    local i
    for i in $(seq 1 10); do kill -0 "$CLAUDE_PID" 2>/dev/null || break; sleep 1; done
    kill -KILL "$CLAUDE_PID" 2>/dev/null
  fi
  kill_tree "$WD_PID"; kill_tree "$RENDER_PID"
  if [ -n "$CURRENT_FILE" ]; then
    append_comment "$CURRENT_FILE" "stopped by the owner; status left in-progress"
    record_outcome "$CURRENT_NN" "$CURRENT_TITLE" "$CURRENT_ATTEMPT" in-progress
  fi
  [ -n "$RUN_DIR" ] && summarise >/dev/null
  log "run finished exit=130"
  release_lock
  exit 130
}

on_exit() {
  release_lock
  kill_tree "$WD_PID"; kill_tree "$RENDER_PID"
  return 0
}

# ---------------------------------------------------------------- commands

cmd_dry_run() {
  preflight_tickets
  local sim="" f nn i=0 blockers first="" open top br start
  TRUNK_REF=$(trunk_ref)
  echo "ralph dry-run  feature=$FEATURE  tickets=$(issue_files | wc -l | tr -d ' ')  trunk=$TRUNK_REF"
  echo "order:"
  while f=$(pick_next "$sim"); do
    [ -n "$first" ] || first=$f
    nn=$(ticket_number "$f"); i=$((i + 1)); sim="$sim $nn"
    blockers=$(parse_blockers "$f" "$nn"); [ -n "$blockers" ] || blockers=none
    printf '  %2d. %s %-55.55s blocked by: %s\n' "$i" "$nn" "$(ticket_title "$f")" "$blockers"
  done
  echo "stops after $i: no eligible ticket"
  for f in $(issue_files); do
    nn=$(ticket_number "$f")
    [[ " $sim " == *" $nn "* ]] && continue
    [ "$(parse_status "$f")" = done ] && continue
    printf '  %s %-55.55s %s\n' "$nn" "$(ticket_title "$f")" "$(explain_ineligible "$f" "$sim")"
  done
  # Where the first ticket's branch would start, read from the refs as the last fetch left them.
  if ! git rev-parse --verify --quiet "$TRUNK_REF^{commit}" >/dev/null; then
    echo "branches: trunk $TRUNK_REF not found in this checkout"
    return 0
  fi
  open=$(open_branches | tr '\n' ' ')
  echo "open ticket branches, bottom first (as of the last fetch): ${open:-none}"
  [ -n "$first" ] || return 0
  br=$(ticket_branch "$first")
  if ! top=$(stack_top); then
    echo "next branch: $br cannot start: the open branches have diverged; merge their pull requests, lowest first"
    return 0
  fi
  start=$TRUNK_REF
  [ -n "$top" ] && start=$(branch_ref "$top")
  if git show-ref --verify --quiet "refs/heads/$br" && ! git merge-base --is-ancestor "$br" "$start"; then
    echo "next branch: $br, continued from an earlier session"
  else
    echo "next branch: $br from ${top:-$TRUNK_REF}"
  fi
}

cmd_afk() {
  preflight_tickets; preflight_tools; ensure_node
  RUN_ID=$(date +%Y%m%d-%H%M%S)
  acquire_lock
  trap on_term TERM INT
  trap on_exit EXIT
  assert_clean_tree
  RUN_DIR="$RUNS_DIR/$RUN_ID"; mkdir -p "$RUN_DIR" "$PR_DIR"
  ensure_progress
  sync_trunk
  log start iterations=$N feature=$FEATURE trunk=$TRUNK_REF push=$PUSH max_turns=$MAX_TURNS watchdog_minutes=$WATCHDOG_MIN model=${MODEL:-default} effort=${EFFORT:-default} pid=$$
  warn_leftovers
  publish_pending
  local completed=0 file nn title base_sha attempt relaunch preface label reason detail now range
  while (( completed < N )); do
    if ! file=$(pick_next); then log "pick none=no-eligible-ticket"; break; fi
    nn=$(ticket_number "$file"); title=$(ticket_title "$file")
    start_branch "$file"; base_sha=$START_SHA
    CURRENT_NN=$nn; CURRENT_TITLE=$title; CURRENT_FILE=$file; CURRENT_ATTEMPT=1
    log pick ticket=$nn title="$title" branch=$BRANCH base=$base_sha
    set_status "$file" in-progress
    append_comment "$file" "picked; branch $BRANCH; base commit $base_sha"
    log status ticket=$nn status=in-progress
    attempt=1; relaunch=0; preface=""
    while :; do
      CURRENT_ATTEMPT=$attempt
      label="attempt$attempt"; (( relaunch > 0 )) && label="$label-r$relaunch"
      echo "current=$nn attempt=$attempt label=$label phase=session" > "$RUN_DIR/state"
      render_prompt "$file" "$nn" "$title" "$base_sha" "$preface" "$RUN_DIR/$nn-$label.prompt.md"
      log launch ticket=$nn attempt=$attempt label=$label
      run_session "$nn" "$label" "$RUN_DIR/$nn-$label.prompt.md"
      log session ticket=$nn attempt=$attempt label=$label rc=$SESSION_RC subtype=$SESSION_SUBTYPE turns=$SESSION_TURNS cost=$SESSION_COST killed=$SESSION_KILLED_BY session_id=${SESSION_ID:-none}
      if is_rate_limited "$RUN_DIR/$nn-$label.jsonl" "$RUN_DIR/$nn-$label.stderr"; then
        log rate-limit ticket=$nn attempt=$attempt
        echo "current=$nn attempt=$attempt label=$label phase=wait" > "$RUN_DIR/state"
        if ! wait_for_capacity; then
          append_comment "$file" "rate-limit wait exhausted after 6h; status left in-progress; logs $RUN_DIR"
          record_outcome "$nn" "$title" "$attempt" in-progress; summarise >/dev/null
          notify "ralph: rate-limit wait exhausted on ticket $nn"
          fail_exit 6 "rate-limit wait exhausted on ticket $nn"
        fi
        relaunch=$((relaunch + 1))
        preface=$(build_retry_preface "$attempt (relaunch $relaunch)" "the session hit a usage or rate limit and the loop waited for capacity" "" "$base_sha")
        continue
      fi
      now=$(parse_status "$file")
      if [ "$now" = needs-info ]; then
        [ "$(git rev-parse HEAD)" != "$base_sha" ] && log warn "ticket $nn: needs-info, yet commits were made since $base_sha"
        append_comment "$file" "needs-info seen; loop stopped. Answer above, set Status back to ready-for-agent, relaunch."
        record_outcome "$nn" "$title" "$attempt" needs-info; summarise >/dev/null
        notify "ralph: ticket $nn needs you"
        fail_exit 5 "ticket $nn needs the owner (needs-info)"
      fi
      if [ "$now" != in-progress ]; then
        log warn "ticket $nn: the session set status=$now; re-asserting in-progress"
        set_status "$file" in-progress
      fi
      if [ "$SESSION_RC" -eq 0 ]; then
        if gate "$nn" "$base_sha" "$label"; then
          log gate ticket=$nn result=pass check=$CHECK_STATE
          break
        fi
        reason="gate: $GATE_REASON"; detail="$RUN_DIR/$nn-$label.gate.log"
        log gate ticket=$nn result=fail reason="$GATE_REASON"
      else
        case "$SESSION_KILLED_BY/$SESSION_SUBTYPE" in
          watchdog/*)        reason="killed by the watchdog after $WATCHDOG_MIN minutes"; detail="";;
          external/*)        reason="killed before finishing (SIGTERM from outside)"; detail="";;
          */error_max_turns) reason="hit --max-turns $MAX_TURNS"; detail="";;
          *)                 reason="exit code $SESSION_RC ($SESSION_SUBTYPE)"; detail="$RUN_DIR/$nn-$label.log";;
        esac
      fi
      log fail ticket=$nn attempt=$attempt reason="$reason"
      if (( attempt == 1 )); then
        { git diff; git status --porcelain --untracked-files=all; } > "$RUN_DIR/$nn-attempt1.partial.diff" 2>/dev/null
        preface=$(build_retry_preface 2 "$reason" "$detail" "$base_sha")
        attempt=2; relaunch=0
        continue
      fi
      append_comment "$file" "failed twice ($reason); status left in-progress; logs $RUN_DIR"
      record_outcome "$nn" "$title" "$attempt" in-progress; summarise >/dev/null
      notify "ralph: ticket $nn failed twice"
      fail_exit 4 "ticket $nn failed twice: $reason"
    done
    set_status "$file" done
    log status ticket=$nn status=done
    CURRENT_NN=""; CURRENT_TITLE=""; CURRENT_FILE=""
    range="$(git rev-parse --short "$base_sha")..$(git rev-parse --short HEAD)"
    echo "current=$nn attempt=$attempt label=$label phase=publish" > "$RUN_DIR/state"
    if ! publish "$BRANCH" "$file"; then
      append_comment "$file" "done after $attempt attempt(s); commits $range; branch $BRANCH; not published yet: the next run pushes the branch and opens the pull request"
      record_outcome "$nn" "$title" "$attempt" done "not published"; summarise >/dev/null
      notify "ralph: ticket $nn is done, publishing failed"
      fail_exit 7 "ticket $nn is done; pushing $BRANCH or opening its pull request failed. Run again to publish it"
    fi
    append_comment "$file" "done after $attempt attempt(s); commits $range; branch $BRANCH; pull request $PR_URL"
    record_outcome "$nn" "$title" "$attempt" done "$PR_URL"
    log ticket ticket=$nn result=done attempts=$attempt unticked=$(unticked_boxes "$file" | wc -l | tr -d ' ') pr="$PR_URL"
    completed=$((completed + 1))
    # the owner may have merged a pull request while the session ran
    (( completed < N )) && sync_trunk
  done
  summarise
  notify "ralph $RUN_ID finished: $completed ticket(s) done"
  log "run finished exit=0 completed=$completed"
  exit 0
}

cmd_once() {
  { [ -t 0 ] && [ -t 1 ]; } || die 2 "once needs a terminal: run it from a shell, not from a Claude session"
  preflight_tickets; preflight_tools; ensure_node
  RUN_ID="once-$(date +%Y%m%d-%H%M%S)"
  acquire_lock
  trap on_exit EXIT
  assert_clean_tree
  RUN_DIR="$RUNS_DIR/$RUN_ID"; mkdir -p "$RUN_DIR" "$PR_DIR"
  ensure_progress
  sync_trunk
  publish_pending
  local file="" nn title base_sha now preface="" f rc resumed=0 range
  # a ticket left in-progress by an earlier session is resumed first
  for f in $(issue_files); do
    if [ "$(parse_status "$f")" = in-progress ]; then file=$f; resumed=1; break; fi
  done
  if [ -z "$file" ] && ! file=$(pick_next); then
    echo "ralph: no eligible ticket"; exit 0
  fi
  nn=$(ticket_number "$file"); title=$(ticket_title "$file")
  start_branch "$file"; base_sha=$START_SHA
  if [ "$resumed" = 1 ]; then
    preface=$(build_retry_preface "resume" "an earlier session left this ticket in-progress without passing the gate" "" "$base_sha")
  fi
  log start mode=once ticket=$nn title="$title" base=$base_sha branch=$BRANCH trunk=$TRUNK_REF push=$PUSH
  set_status "$file" in-progress
  append_comment "$file" "picked (once); branch $BRANCH; base commit $base_sha"
  render_prompt "$file" "$nn" "$title" "$base_sha" "$preface" "$RUN_DIR/$nn-once.prompt.md"
  local -a extra=()
  [ -n "$MODEL" ] && extra+=(--model "$MODEL")
  [ -n "$EFFORT" ] && extra+=(--effort "$EFFORT")
  log launch ticket=$nn mode=interactive
  env -u CLAUDECODE claude --dangerously-skip-permissions "${extra[@]}" "$(<"$RUN_DIR/$nn-once.prompt.md")"
  rc=$?
  log session ticket=$nn rc=$rc
  now=$(parse_status "$file")
  if [ "$now" = needs-info ]; then
    append_comment "$file" "needs-info seen (once)"
    record_outcome "$nn" "$title" 1 needs-info; summarise
    fail_exit 5 "ticket $nn needs the owner (needs-info)"
  fi
  if [ "$now" != in-progress ]; then
    log warn "ticket $nn: the session set status=$now; re-asserting in-progress"
    set_status "$file" in-progress
  fi
  if gate "$nn" "$base_sha" once; then
    set_status "$file" done
    log gate ticket=$nn result=pass check=$CHECK_STATE
    log status ticket=$nn status=done
    range="$(git rev-parse --short "$base_sha")..$(git rev-parse --short HEAD)"
    if ! publish "$BRANCH" "$file"; then
      append_comment "$file" "done (once); commits $range; branch $BRANCH; not published yet: the next run pushes the branch and opens the pull request"
      record_outcome "$nn" "$title" 1 done "not published"; summarise
      fail_exit 7 "ticket $nn is done; pushing $BRANCH or opening its pull request failed. Run again to publish it"
    fi
    append_comment "$file" "done (once); commits $range; branch $BRANCH; pull request $PR_URL"
    record_outcome "$nn" "$title" 1 done "$PR_URL"; summarise
    log "run finished exit=0"
    exit 0
  fi
  log gate ticket=$nn result=fail reason="$GATE_REASON"
  append_comment "$file" "gate failed (once): $GATE_REASON; status left in-progress"
  record_outcome "$nn" "$title" 1 in-progress; summarise
  fail_exit 4 "gate failed: $GATE_REASON. The ticket stays in-progress; 'ralph.sh once' resumes it."
}

cmd_status() {
  if [ -f "$LOCK" ]; then
    local pid
    pid=$(lock_get pid)
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      echo "live: pid=$pid run_id=$(lock_get run_id) feature=$(lock_get feature) claude_pid=$(lock_get claude_pid) started=$(lock_get started)"
    else
      echo "stale lock: pid=${pid:-?} is not running (the next run removes it)"
    fi
  else
    echo "no live run"
  fi
  local latest label nn
  latest=$(ls -d "$RUNS_DIR"/*/ 2>/dev/null | sort | tail -n 1)
  [ -n "$latest" ] || { echo "no runs under $RUNS_DIR"; return 0; }
  latest=${latest%/}
  echo "latest run: $latest"
  [ -f "$latest/state" ] && echo "state: $(cat "$latest/state")"
  echo "--- run.log (tail) ---"
  tail -n 15 "$latest/run.log" 2>/dev/null
  if [ -f "$latest/state" ] && [ -f "$LOCK" ]; then
    label=$(sed -n 's/.*label=\([^ ]*\).*/\1/p' "$latest/state")
    nn=$(sed -n 's/^current=\([0-9]*\).*/\1/p' "$latest/state")
    [ -f "$latest/$nn-$label.log" ] && { echo "--- $nn-$label.log (tail) ---"; tail -n 5 "$latest/$nn-$label.log"; }
  fi
  [ -f "$latest/summary.txt" ] && { echo "--- summary ---"; cat "$latest/summary.txt"; }
  return 0
}

cmd_stop() {
  [ -f "$LOCK" ] || { echo "no live run (no lock)"; exit 0; }
  local pid i
  pid=$(lock_get pid)
  if [ -z "$pid" ] || ! kill -0 "$pid" 2>/dev/null; then
    rm -f "$LOCK"; echo "stale lock removed (pid=${pid:-?} was not running)"; exit 0
  fi
  echo "stopping run $(lock_get run_id) (pid=$pid)"
  kill -TERM "$pid"
  for i in $(seq 1 30); do
    [ -f "$LOCK" ] || { echo "stopped"; exit 0; }
    sleep 1
  done
  echo "the run has not released the lock after 30s; pid=$pid" >&2
  exit 1
}

main() {
  parse_args "$@"
  case "$CMD" in
    afk) cmd_afk;;
    once) cmd_once;;
    dry-run) cmd_dry_run;;
    status) cmd_status;;
    stop) cmd_stop;;
  esac
}

main "$@"
