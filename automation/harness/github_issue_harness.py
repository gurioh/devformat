#!/usr/bin/env python3
import json
import os
import pathlib
import re
import subprocess
import sys
from typing import Any, Dict, List, Optional


def env(name: str, default: Optional[str] = None) -> str:
    value = os.environ.get(name, default)
    if value is None or value == "":
        raise SystemExit(f"{name} is required")
    return value


REPO_FULL_NAME = env("REPO_FULL_NAME")
REPO_DIR = pathlib.Path(env("REPO_DIR")).resolve()
ISSUE_READY_LABEL = env("ISSUE_READY_LABEL", "agent-ready")
ISSUE_RUNNING_LABEL = env("ISSUE_RUNNING_LABEL", "agent-running")
ISSUE_FAILED_LABEL = env("ISSUE_FAILED_LABEL", "agent-failed")
ISSUE_PR_LABEL = env("ISSUE_PR_LABEL", "agent-pr-opened")
AGENT_COMMAND = os.environ.get("AGENT_COMMAND", "").strip()

RUNS_DIR = pathlib.Path(
    os.environ.get("HARNESS_RUNS_DIR", str(REPO_DIR / "automation" / "harness" / "runs"))
).resolve()


def run(cmd: List[str], *, cwd: Optional[pathlib.Path] = None, check: bool = True, env_override: Optional[Dict[str, str]] = None) -> subprocess.CompletedProcess:
    merged_env = os.environ.copy()
    if env_override:
        merged_env.update(env_override)
    return subprocess.run(
        cmd,
        cwd=str(cwd) if cwd else None,
        env=merged_env,
        check=check,
        capture_output=True,
        text=True,
    )


def gh_json(args: List[str]) -> Any:
    result = run(["gh", *args])
    return json.loads(result.stdout or "null")


def gh(args: List[str]) -> str:
    return run(["gh", *args]).stdout


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:40] or "issue"


def get_open_issue() -> Optional[Dict[str, Any]]:
    issues = gh_json([
        "issue",
        "list",
        "--repo",
        REPO_FULL_NAME,
        "--state",
        "open",
        "--label",
        ISSUE_READY_LABEL,
        "--limit",
        "20",
        "--json",
        "number,title,body,url,labels",
    ])
    for issue in issues:
        labels = {label["name"] for label in issue.get("labels", [])}
        if ISSUE_RUNNING_LABEL in labels:
            continue
        return issue
    return None


def edit_issue_labels(issue_number: int, add: Optional[List[str]] = None, remove: Optional[List[str]] = None) -> None:
    cmd = ["issue", "edit", str(issue_number), "--repo", REPO_FULL_NAME]
    for label in add or []:
        cmd.extend(["--add-label", label])
    for label in remove or []:
        cmd.extend(["--remove-label", label])
    gh(cmd)


def comment_issue(issue_number: int, body: str) -> None:
    gh(["issue", "comment", str(issue_number), "--repo", REPO_FULL_NAME, "--body", body])


def current_base() -> str:
    return run(["git", "rev-parse", "--abbrev-ref", "origin/HEAD"], cwd=REPO_DIR).stdout.strip().split("/")[-1]


def build_prompt(issue: Dict[str, Any], branch_name: str, run_dir: pathlib.Path) -> str:
    body = (issue.get("body") or "").strip()
    return f"""You are running inside the DevFormat repository.

Repository rules:
- Read CLAUDE.md first and then AGENTS.md.
- Work only on the issue described below.
- Create or update PLAN.md, PROGRESS.md, and REPORT.md inside {run_dir}.
- Use branch `{branch_name}`.
- Do not merge to main directly.
- Use GitHub noreply commit metadata from the environment.
- If the issue is unclear or unsafe, stop and write a report instead of guessing.

Issue:
- Number: {issue["number"]}
- Title: {issue["title"]}
- URL: {issue["url"]}

Issue body:
{body if body else "(empty issue body)"}

Execution checklist:
1. Read CLAUDE.md and AGENTS.md, then inspect the relevant code paths.
2. Write a short plan to {run_dir / "PLAN.md"}.
3. Keep a running task log in {run_dir / "PROGRESS.md"}.
4. Create branch `{branch_name}` if needed.
5. Implement the fix or improvement.
6. Run the smallest useful verification for the touched area.
7. Commit using the configured noreply identity.
8. Push branch `{branch_name}` to origin.
9. Open a PR against `{current_base()}`.
10. Write a concise report to {run_dir / "REPORT.md"} covering changes, verification, and residual risk.
11. Comment on GitHub issue #{issue["number"]} with the PR link and short summary.
"""


def ensure_branch(branch_name: str) -> None:
    existing = run(["git", "branch", "--list", branch_name], cwd=REPO_DIR).stdout.strip()
    if existing:
        run(["git", "switch", branch_name], cwd=REPO_DIR)
        return
    run(["git", "switch", "-c", branch_name], cwd=REPO_DIR)


def run_agent(prompt_path: pathlib.Path, branch_name: str) -> int:
    if not AGENT_COMMAND:
        raise SystemExit("AGENT_COMMAND must be configured in automation/harness/.env")

    ensure_branch(branch_name)
    agent_env = {
        "REPO_DIR": str(REPO_DIR),
        "HARNESS_PROMPT_FILE": str(prompt_path),
        "HARNESS_BRANCH": branch_name,
    }
    result = subprocess.run(
        AGENT_COMMAND,
        cwd=str(REPO_DIR),
        env={**os.environ, **agent_env},
        input=prompt_path.read_text(),
        text=True,
        shell=True,
    )
    return result.returncode


def find_pr(branch_name: str) -> Optional[Dict[str, Any]]:
    prs = gh_json([
        "pr",
        "list",
        "--repo",
        REPO_FULL_NAME,
        "--head",
        branch_name,
        "--state",
        "open",
        "--json",
        "number,url,title",
    ])
    return prs[0] if prs else None


def main() -> None:
    issue = get_open_issue()
    if not issue:
        print("No eligible issues found.")
        return

    issue_number = issue["number"]
    branch_name = f"agent/issue-{issue_number}-{slugify(issue['title'])}"
    run_dir = RUNS_DIR / f"issue-{issue_number}"
    run_dir.mkdir(parents=True, exist_ok=True)
    prompt_path = run_dir / "prompt.md"
    plan_path = run_dir / "PLAN.md"
    progress_path = run_dir / "PROGRESS.md"
    report_path = run_dir / "REPORT.md"

    prompt = build_prompt(issue, branch_name, run_dir)
    prompt_path.write_text(prompt)
    if not plan_path.exists():
        plan_path.write_text(
            f"# Plan for issue #{issue_number}\n\n"
            f"- Title: {issue['title']}\n"
            f"- Branch: {branch_name}\n"
            "- Scope to define\n"
            "- Verification to define\n"
        )
    if not progress_path.exists():
        progress_path.write_text(
            f"# Progress for issue #{issue_number}\n\n"
            "- Run created by harness\n"
        )
    if not report_path.exists():
        report_path.write_text(
            f"# Report for issue #{issue_number}\n\n"
            f"- Branch: {branch_name}\n"
            "- Summary pending\n"
            "- Verification pending\n"
            "- Residual risk pending\n"
        )

    edit_issue_labels(issue_number, add=[ISSUE_RUNNING_LABEL], remove=[ISSUE_FAILED_LABEL])
    comment_issue(issue_number, f"Harness picked up this issue for automated work on branch `{branch_name}`.")

    exit_code = run_agent(prompt_path, branch_name)

    if exit_code != 0:
        edit_issue_labels(issue_number, add=[ISSUE_FAILED_LABEL], remove=[ISSUE_RUNNING_LABEL])
        comment_issue(issue_number, f"Automated run failed for branch `{branch_name}`. Check harness logs and run artifacts.")
        raise SystemExit(exit_code)

    pr = find_pr(branch_name)
    if pr:
        edit_issue_labels(issue_number, add=[ISSUE_PR_LABEL], remove=[ISSUE_RUNNING_LABEL])
        comment_issue(issue_number, f"Automated run opened PR #{pr['number']}: {pr['url']}")
        print(f"Opened PR {pr['url']}")
    else:
        comment_issue(issue_number, f"Automated run finished on branch `{branch_name}` but no open PR was detected.")
        print("Agent run completed, but no PR was found.")


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as exc:
        sys.stderr.write(exc.stderr or str(exc))
        sys.exit(exc.returncode)
