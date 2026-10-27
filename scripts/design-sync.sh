#!/bin/sh
# Copy the design system files the site uses from the design repo checkout into app/_design.
# The design repo is the source of truth: change it there first, then run this.
#   sh scripts/design-sync.sh          copy
#   sh scripts/design-sync.sh --check  only report files that differ
set -eu
src="${DESIGN_REPO:-$HOME/notedwin/projects/design}"
dst="$(cd "$(dirname "$0")/.." && pwd)/app/_design"
files="css/tokens.css css/theme.css css/components.css
fonts/CommitMono-Regular.woff2 fonts/CommitMono-SemiBold.woff2 fonts/CommitMono-LICENSE.txt
fonts/DepartureMono-Regular.woff2 fonts/DepartureMono-LICENSE.txt
src/tokens.json src/theme.ts src/react/primitives.tsx src/react/ink.ts src/react/flame.tsx
src/react/dither-photo.tsx src/react/theme-toggle.tsx"
# The package marks its client bundle "use client" at build time; these copies need it in the file.
needs_client="src/react/dither-photo.tsx src/react/theme-toggle.tsx"
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
differ=0
for f in $files; do
	out="$dst/${f#src/}"
	cp "$src/$f" "$tmp"
	case " $needs_client " in
		*" $f "*) { printf '"use client";\n\n'; cat "$src/$f"; } > "$tmp" ;;
	esac
	if ! cmp -s "$tmp" "$out" 2>/dev/null; then
		differ=1
		if [ "${1:-}" = "--check" ]; then echo "differs: $f"; else mkdir -p "$(dirname "$out")"; cp "$tmp" "$out"; echo "copied: $f"; fi
	fi
done
if [ "$differ" = 0 ]; then echo "app/_design matches $src"; fi
if [ "${1:-}" = "--check" ]; then exit "$differ"; fi
