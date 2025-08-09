#!/usr/bin/env bash
set -euo pipefail

declare -A labels=(
  ["bug"]="#d73a4a"
  ["feat"]="#0e8a16"
  ["chore"]="#6a737d"
  ["perf"]="#1d76db"
  ["docs"]="#5319e7"
  ["test"]="#c2e0c6"
  ["design"]="#fbca04"
  ["a11y"]="#a2eeef"
  ["infra"]="#0052cc"
  ["policy"]="#e99695"
  ["rankings"]="#0366d6"
  ["compare"]="#0e8a16"
  ["player"]="#d93f0b"
  ["search"]="#6f42c1"
  ["labs"]="#bfdadc"
  ["ads"]="#ff9f1c"
  ["P0"]="#b60205"
  ["P1"]="#d93f0b"
  ["P2"]="#fbca04"
)

for name in "${!labels[@]}"; do
  gh label create "$name" --color "${labels[$name]}" --force
done
echo "done."
