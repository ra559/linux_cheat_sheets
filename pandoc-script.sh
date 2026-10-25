
#!/usr/bin/env bash

readme() {
    cat <<'HERE'
Usage:
    ./pandoc-script.sh markdown-file.md

Requirements:
    - Provide one filename ending in .md.
    - The source file must be located in markdown/.
    - The template must exist in templates/minimal.html.
    - Stylesheets must be located in css/.

Example:
    ./pandoc-script.sh docker.md

Input:
    markdown/docker.md

Output:
    html/docker.html
HERE
}

# ANSI colors
BLUE='\033[34m'
GREEN='\033[32m'
RED='\033[31m'
RESET='\033[0m'

printf '%s\n' '───────────────────────────────────────'

# Require exactly one argument.
if [[ $# -ne 1 ]]; then
    printf '%b\n' "${RED}Error:${RESET} Provide exactly one Markdown filename." >&2
    readme
    exit 1
fi

# Accept filenames only, not paths.
if [[ "$1" == */* ]]; then
    printf '%b\n' "${RED}Error:${RESET} Provide a filename, not a path." >&2
    readme
    exit 1
fi

# Require the .md extension.
if [[ "$1" != *.md ]]; then
    printf '%b\n' "${RED}Error:${RESET} Filename must end in .md." >&2
    exit 1
fi

INPUT="docs/markdown/$1"
OUTPUT="docs/html/${1%.md}.html"
TEMPLATE="templates/minimal.html"

# Check input and template.
if [[ ! -f "$INPUT" ]]; then
    printf '%b\n' "${RED}Error:${RESET} File not found: $INPUT" >&2
    exit 1
fi

if [[ ! -f "$TEMPLATE" ]]; then
    printf '%b\n' "${RED}Error:${RESET} Template not found: $TEMPLATE" >&2
    exit 1
fi

# Check required directories and stylesheets.
if [[ ! -d docs/html ]]; then
    mkdir -p docs/html || exit 1
fi

for stylesheet in css/style.css css/nav.css css/highlight.css; do
    if [[ ! -f "$stylesheet" ]]; then
        printf '%b\n' "${RED}Error:${RESET} Stylesheet not found: $stylesheet" >&2
        exit 1
    fi
done

printf '%b\n' "${BLUE}Info:${RESET} Starting conversion of $INPUT..."

if pandoc \
    --from=gfm \
    --to=html5 \
    --standalone \
    --metadata "title=${1%.md}" \
    --toc \
    --toc-depth=3 \
    --template="$TEMPLATE" \
    --css= css/style.css \
    --css= css/nav.css \
    --css= css/highlight.css \
    --highlight-style=tango \
    "$INPUT" \
    --output="$OUTPUT"
then
    printf '%b\n' "${GREEN}Success:${RESET} HTML file created: $OUTPUT"
else
    status=$?
    printf '%b\n' "${RED}Error:${RESET} Pandoc failed with exit code $status." >&2
    exit "$status"
fi

printf '%s\n' '───────────────────────────────────────'

