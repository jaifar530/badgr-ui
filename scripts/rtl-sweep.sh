#!/usr/bin/env bash
# Rewrite physical Tailwind direction utilities to logical ones, so the UI mirrors
# under dir="rtl" without a second set of classes.
#
#   ./scripts/rtl-sweep.sh <file-or-dir>...
#
# Under dir="ltr" a logical utility compiles to exactly its physical twin
# (ms-4 -> margin-inline-start -> margin-left), so this is a no-op for English.
# That is the property the verification leans on: LTR computed styles must not move.
#
# The guards matter more than the renames. In this codebase:
#   tw-rounded-lg          x96  <- a bare s/tw-rounded-l/ turns every one into a dead class
#   tw-border-red|link|... x7   <- same for s/tw-border-l/ and s/tw-border-r/
#   tw-border-l-           x1   <- the only genuine one
# so every l/r rule requires the next character to not be a letter.
#
# Deliberately NOT handled here:
#   tw-space-x-*   semantic: gap-* when the parent is flex/grid, else space-x-reverse
#   tw-divide-x-*  no logical equivalent in Tailwind 3
#   physical contexts (fabric.js canvas coords, popper/maplibre placement enums,
#   vendored third-party CSS) — those are correctly physical and are excluded below.
set -euo pipefail

[ $# -gt 0 ] || { echo "usage: $0 <file-or-dir>..." >&2; exit 2; }

# Paths whose direction words are library enums or canvas coordinates, not CSS.
# Only vendored/compiled CSS is excluded. Library placement enums (popper, maplibre)
# and fabric.js canvas coordinates are JS values, not tw- classes, so the rename
# cannot reach them — excluding their components would only strand real CSS.
EXCLUDE_RE='(assets/@concentricsky|/thirdparty/)'

mapfile -t FILES < <(
	for target in "$@"; do
		if [ -d "$target" ]; then
			find "$target" -type f \( -name '*.html' -o -name '*.ts' \)
		else
			printf '%s\n' "$target"
		fi
	done | grep -Ev "$EXCLUDE_RE" | sort -u
)

[ "${#FILES[@]}" -gt 0 ] || { echo "no files matched"; exit 0; }

# `|| true`: grep exits 1 on no matches, which set -e would treat as fatal.
tokens() { grep -rohE 'tw-[A-Za-z0-9._/%-]+' "${FILES[@]}" 2>/dev/null | sort | uniq -c | sort -rn || true; }
before=$(tokens)

perl -pi -e '
	s/\btw-ml-/tw-ms-/g;
	s/\btw-mr-/tw-me-/g;
	s/\btw-pl-/tw-ps-/g;
	s/\btw-pr-/tw-pe-/g;
	s/\btw-scroll-ml-/tw-scroll-ms-/g;  s/\btw-scroll-mr-/tw-scroll-me-/g;
	s/\btw-scroll-pl-/tw-scroll-ps-/g;  s/\btw-scroll-pr-/tw-scroll-pe-/g;
	s/\btw-left-/tw-start-/g;
	s/\btw-right-/tw-end-/g;
	s/\btw-text-left\b/tw-text-start/g;
	s/\btw-text-right\b/tw-text-end/g;
	s/\btw-float-left\b/tw-float-start/g;
	s/\btw-float-right\b/tw-float-end/g;
	s/\btw-clear-left\b/tw-clear-start/g;
	s/\btw-clear-right\b/tw-clear-end/g;
	s/\btw-rounded-tl/tw-rounded-ss/g;
	s/\btw-rounded-tr/tw-rounded-se/g;
	s/\btw-rounded-bl/tw-rounded-es/g;
	s/\btw-rounded-br/tw-rounded-ee/g;
	s/\btw-rounded-l(?![a-z])/tw-rounded-s/g;
	s/\btw-rounded-r(?![a-z])/tw-rounded-e/g;
	s/\btw-border-l(?![a-z])/tw-border-s/g;
	s/\btw-border-r(?![a-z])/tw-border-e/g;
' "${FILES[@]}"

after=$(tokens)

echo "files swept: ${#FILES[@]}"
echo "--- class tokens that changed ---"
diff <(echo "$before") <(echo "$after") || true
