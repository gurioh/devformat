# DevFormat Agent Guide

This repository is a static product site for browser-based text tools.

## Product shape

- `index.html` is the landing page.
- Tool pages live in folders such as `multiline/`, `formatter/`, `quote/`, `split-join/`, `escape/`, `json/`, and `cleanup/`.
- Shared JavaScript lives in `assets/`.
- Shared styles live in `assets/site.css`.
- Localized pages currently exist under `ja/` and `ko/` for selected tools.

## Non-negotiable constraints

- Keep all tools browser-only. Do not add a backend or server dependency.
- Do not add new analytics vendors. Existing GA events in `assets/site.js` are the maximum scope unless explicitly requested.
- Do not commit personal email metadata. Use GitHub noreply identity for automated commits.
- Do not break canonical URLs, hreflang links, or sitemap entries.
- Preserve existing visual language unless the issue explicitly asks for redesign.

## Preferred implementation style

- Keep changes small and page-scoped when possible.
- Reuse the existing patterns for:
  - quick answer blocks
  - segmented action toggles
  - preset chips
  - share settings links
  - localStorage-backed tool settings
- When adding a feature to one core tool, check whether the same pattern should exist in sibling tools.

## Validation checklist

For UI or behavior changes, verify at least these manually:

1. Input -> output -> copy flow still works.
2. Settings persistence still works after refresh when applicable.
3. Shared settings links restore the intended state when applicable.
4. Mobile layout is not obviously broken.
5. No missing IDs or JS selectors after markup edits.

## Delivery rules for automation runs

- Work on a dedicated issue branch, never directly on `main`.
- Leave a concise report with:
  - what changed
  - what was verified
  - any remaining risk or follow-up
- If the issue is ambiguous or high-risk, stop and leave a report instead of guessing.
