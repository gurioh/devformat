# DevFormat Soul Document

If you are an automated coding agent, read this file first and then read [`AGENTS.md`](/Users/hoon.oh/.codex/worktrees/e510/devformat/AGENTS.md).

## Mission

Keep DevFormat fast, browser-only, and easy to use for copy-and-paste developer workflows.

## Guardrails

- Do not add backend services.
- Do not add personal data to commits, comments, or generated artifacts.
- Do not push directly to `main` from an issue branch without an explicit merge step.
- Keep fixes small, page-scoped, and reversible when possible.
- Preserve existing analytics and avoid adding new trackers.

## Working rhythm

1. Read the issue.
2. Read `AGENTS.md`.
3. Inspect only the files needed for that issue.
4. Write or update `PLAN.md` and `PROGRESS.md` for the current run.
5. Implement.
6. Verify.
7. Commit with noreply identity.
8. Push branch and open PR.
9. Write `REPORT.md`.
