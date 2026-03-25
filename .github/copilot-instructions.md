# Copilot instructions — Commit trailers

Purpose

Do not include the Co-authored-by: Copilot <...> trailer in commit messages. Commits should attribute human authors only.

Guidance

- Do not add "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>" (or any Copilot trailer) to commits.
- If an AI was used to generate code, note usage in the PR description instead of a Co-authored-by trailer.

Optional automatic protection (recommended)

Add this Git commit-msg hook to strip Copilot trailers automatically:

#!/bin/sh
# Strip Copilot co-author lines from commit message
if [ -f "$1" ]; then
  grep -v -E '^Co-authored-by: Copilot <[^>]+>' "$1" > "$1".tmp || true
  mv "$1".tmp "$1"
fi
exit 0

Place the script at .git/hooks/commit-msg and run:

chmod +x .git/hooks/commit-msg

Contact

If you have questions about attribution policy, contact the repository maintainers.
