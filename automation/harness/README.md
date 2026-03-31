# Agent Harness

This folder contains a minimal GitHub issue -> agent run -> PR harness for DevFormat.

## What it does

1. Polls GitHub for the next open issue with a ready label.
2. Marks that issue as running.
3. Builds an agent prompt using the issue body plus repository rules from [`CLAUDE.md`](/Users/hoon.oh/.codex/worktrees/e510/devformat/CLAUDE.md) and [`AGENTS.md`](/Users/hoon.oh/.codex/worktrees/e510/devformat/AGENTS.md).
4. Invokes your configured coding agent command.
5. Checks whether the run produced a PR for the issue branch.
6. Updates issue labels and comments with the result.

## Files

- [`config.example.env`](/Users/hoon.oh/.codex/worktrees/e510/devformat/automation/harness/config.example.env): environment template
- [`run-cron.sh`](/Users/hoon.oh/.codex/worktrees/e510/devformat/automation/harness/run-cron.sh): cron entrypoint
- [`github_issue_harness.py`](/Users/hoon.oh/.codex/worktrees/e510/devformat/automation/harness/github_issue_harness.py): queue runner and orchestrator

## Prerequisites

- `gh` authenticated for the target repository
- Python 3
- A coding agent CLI that can read a prompt from stdin and work inside the repo

## Setup

1. Copy [`config.example.env`](/Users/hoon.oh/.codex/worktrees/e510/devformat/automation/harness/config.example.env) to `automation/harness/.env`.
2. Set `AGENT_COMMAND`.
3. Ensure automated git identity uses a GitHub noreply email.
4. Create these labels in GitHub:
   - `agent-ready`
   - `agent-running`
   - `agent-failed`
   - `agent-pr-opened`

## Recommended agent command

The harness intentionally does not hardcode one vendor CLI.

Expected behavior:

- Reads prompt from stdin
- Has filesystem access to `REPO_DIR`
- Can commit, push, and create a PR

Example shape:

```bash
AGENT_COMMAND='codex exec --cwd "$REPO_DIR"'
```

If your CLI needs a different wrapper, set that command instead.

## Cron example

Run every 15 minutes:

```cron
*/15 * * * * cd /absolute/path/to/devformat && /absolute/path/to/devformat/automation/harness/run-cron.sh >> /tmp/devformat-agent-harness.log 2>&1
```

## Queue model

- Only issues with `ISSUE_READY_LABEL` are eligible.
- Issues already carrying `ISSUE_RUNNING_LABEL` are skipped.
- The harness picks one issue per run.
- If a PR is found for the generated issue branch, the issue is relabeled as `ISSUE_PR_LABEL`.

## Generated run artifacts

By default, each run writes files to `automation/harness/runs/issue-<number>/`:

- `PLAN.md`
- `PROGRESS.md`
- `REPORT.md`
- `prompt.md`

These files are gitignored.

## Practical rollout advice

- Start with one narrow label such as `agent-ready`.
- Keep issue scopes small.
- Make the agent responsible for reporting what it changed and what it verified.
- Add a reviewer gate before merging PRs automatically.
