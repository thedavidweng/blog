# Comments and source hygiene

- Prefer clear naming, extraction and explicit types to narrative comments.
- Use comments only for constraints code cannot convey (external bugs, non-obvious workarounds or why an obvious alternative is unsafe). Document architectural/design choices under [docs/adr/](../adr/). Local code-adjacent caveats may use their own line `//` comment explaining *why*, not what the next statement does.
- No committed `TODO`, `FIXME`, `HACK` or `XXX` markers. File a GitHub Issue. No trailing inline comments. CI lint enforces these rules.
- JSDoc is unnecessary by default. Allow it for contracts types cannot express, such as units, invariants or output examples (e.g. locale URL builders).
- If an intentionally empty `catch {}` is required, place a brief comment explaining the no-op *inside* it to satisfy oxlint's `no-empty` rule.
- Favor compact readable code, not code golf. CI checks per-file comment budgets with [scripts/check-comment-budget.sh](../../scripts/check-comment-budget.sh).
- Put repo-wide stable conventions in these topic docs, not in a new tool-specific instruction file.
