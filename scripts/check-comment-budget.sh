#!/usr/bin/env bash
# Per-file comment-line budget (see AGENTS.md "Code Comments & Line Economy").
MAX_RATIO="${1:-15}"
status=0
files=$(find src tests scripts functions -type f \( -name '*.ts' -o -name '*.astro' -o -name '*.mjs' \))
for f in $files; do
  total=$(grep -cE '[^[:space:]]' "$f")
  [ "${total:-0}" -eq 0 ] && continue
  comments=$(grep -E '^[[:space:]]*(//|/\*|\*)' "$f" | grep -vcE 'https?://|oxlint-|eslint-|@ts-')
  ratio=$((comments * 100 / total))
  if [ "$ratio" -gt "$MAX_RATIO" ]; then
    echo "FAIL $f : ${comments}/${total} code-lines = ${ratio}% comments (budget ${MAX_RATIO}%)"
    status=1
  fi
done
[ "$status" -eq 0 ] && echo "OK: all files within ${MAX_RATIO}% comment budget"
exit "$status"
