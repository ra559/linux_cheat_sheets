---
layout: sheet
title: "Bash Scripting Cheat Sheet"
category: "Shell"
summary: "Shell syntax, variables, conditions, loops, and scripting patterns for Bash on Debian 13."
date: 2026-10-24 13:14:55
permalink: /html/bash.html
---
# Bash Scripting Cheat Sheet

**Target:** Bash on Debian 13 (Trixie)  
**Audience:** Beginner to intermediate Linux users  
**Purpose:** A practical reference for writing readable, reliable, and safer Bash scripts.

> Bash is a command interpreter and scripting language. It is especially useful for automating command-line tasks and coordinating existing Linux tools. Use a dedicated parser for structured formats such as JSON and complex CSV files.

## Table of Contents

1. [Beginner Learning Path](#1-beginner-learning-path)
2. [Quick Introduction](#2-quick-introduction)
3. [Variables and User Input](#3-variables-and-user-input)
4. [Comments and Documentation](#4-comments-and-documentation)
5. [Conditionals](#5-conditionals)
6. [Comparisons and Tests](#6-comparisons-and-tests)
7. [Loops](#7-loops)
8. [Strict Mode and Defensive Scripting](#8-strict-mode-and-defensive-scripting)
9. [Functions](#9-functions)
10. [Arrays and Dictionaries](#10-arrays-and-dictionaries)
11. [Brace Expansion](#11-brace-expansion)
12. [Parameter Expansion and Special Variables](#12-parameter-expansion-and-special-variables)
13. [Shell Options: `set` and `shopt`](#13-shell-options-set-and-shopt)
14. [Command History and Interactive Shortcuts](#14-command-history-and-interactive-shortcuts)
15. [Arithmetic Operations](#15-arithmetic-operations)
16. [Redirection and File Descriptors](#16-redirection-and-file-descriptors)
17. [Here Documents and Here Strings](#17-here-documents-and-here-strings)
18. [Error Handling and `trap`](#18-error-handling-and-trap)
19. [Process Substitution](#19-process-substitution)
20. [Reading and Processing Files](#20-reading-and-processing-files)
21. [Structured Data: CSV and JSON](#21-structured-data-csv-and-json)
22. [Reading Data from Network Requests](#22-reading-data-from-network-requests)
23. [Reading Data over SSH](#23-reading-data-over-ssh)
24. [Quick Reference](#24-quick-reference)
25. [Bash Tricks for Administration](#25-bash-tricks-for-administration)
26. [Secure Script-Writing Practices](#26-secure-script-writing-practices)

---

## 1. Beginner Learning Path

Learn these topics in order. Practice each one with a small script before moving on.

1. **Run commands in a script.** Create a file, add a shebang, make it executable, and run it.
2. **Use variables.** Store a name, path, or command result. Learn why `"$variable"` is usually safer than `$variable`.
3. **Get input.** Use `read` to ask the user a question.
4. **Make decisions.** Use `if`, `else`, and test operators.
5. **Repeat work.** Practice `for` and `while` loops.
6. **Organize code.** Move repeated work into functions.
7. **Work with files.** Check that a file exists, read it line by line, and write output.
8. **Handle failures.** Check exit statuses, use meaningful error messages, and learn the limitations of `set -e`.
9. **Use arrays.** Store lists of filenames or arguments without accidentally splitting them.
10. **Automate a real task.** For example, check disk space, summarize log files, or back up a directory.
11. **Process structured data.** Use `jq` for JSON and a proper CSV parser for CSV files with quoted fields.
12. **Add remote data.** Learn `curl` for HTTP requests and `ssh` for remote commands.

Suggested beginner projects:

- Print system information.
- Ask for a directory and list its files.
- Check whether a service is active.
- Report files larger than a chosen size.
- Read a list of hosts and check connectivity.
- Fetch an API response and extract selected JSON fields.
- Back up a directory with a timestamped filename.

---

## 2. Quick Introduction

### A minimal script

Create `hello.sh`:

```bash
#!/usr/bin/env bash

printf 'Hello, world!\n'
```

Run it with Bash:

```bash
bash hello.sh
```

Or make it executable:

```bash
chmod +x hello.sh
./hello.sh
```

The first line is the **shebang**. It asks the system to run the script using Bash found through `env`.

### Basic rules

- Use `#!/usr/bin/env bash` for scripts that specifically require Bash.
- Commands usually run in order, from top to bottom.
- Separate commands with newlines. A semicolon (`;`) can put multiple commands on one line.
- Spaces matter in shell syntax. For example, `name="Ada"` is valid, but `name = "Ada"` is treated as a command named `name`.
- Quote variable expansions unless you deliberately want word splitting or pathname expansion.
- Prefer `printf` over `echo` for predictable output.

```bash
#!/usr/bin/env bash

name="Ada"
printf 'Welcome, %s!\n' "$name"
```

### Run a script with debugging

```bash
bash -x script.sh
```

Bash prints commands as it executes them. Be careful: tracing may expose secrets or tokens in logs.

---

## 3. Variables and User Input

### Assign and use variables

```bash
username="ada"
home_dir="$HOME"

printf 'User: %s\n' "$username"
printf 'Home: %s\n' "$home_dir"
```

Do not put spaces around the assignment `=`. Use `$name` or, preferably, `"${name}"` to expand a variable.

```bash
project="cinder"
printf 'Project: %s\n' "${project}"
```

### Environment variables

Environment variables are inherited by child processes when exported.

```bash
APP_ENV="development"
export APP_ENV

printf '%s\n' "$APP_ENV"
```

Set a variable for only one command:

```bash
APP_ENV=production ./run-app.sh
```

Common environment variables:

| Variable | Meaning |
|---|---|
| `HOME` | User's home directory |
| `USER` | Current username in many environments |
| `PATH` | Directories searched for commands |
| `PWD` | Current working directory |
| `SHELL` | User's configured login shell; not necessarily the shell running this script |
| `LANG` | Default locale |
| `TMPDIR` | Preferred temporary directory, if set |

### Read user input

```bash
read -r -p 'What is your name? ' name
printf 'Hello, %s!\n' "$name"
```

- `-r` prevents backslashes from being interpreted specially.
- `-p` displays a prompt.
- Always quote the variable when using it.

Read a password without displaying it:

```bash
read -r -s -p 'Password: ' password
printf '\n'
```

Avoid printing or logging passwords. Clear sensitive variables when practical:

```bash
unset password
```

Read input with a default:

```bash
read -r -p 'Enter a directory [/tmp]: ' directory
directory=${directory:-/tmp}
printf 'Selected: %s\n' "$directory"
```

### Read multiple values

```bash
read -r -p 'Enter first and last name: ' first_name last_name
printf 'First: %s\nLast: %s\n' "$first_name" "$last_name"
```

For arbitrary input, one variable is generally easier to reason about than multiple fields.

### Command substitution

Capture a command's output using `$(...)`:

```bash
today=$(date +%F)
kernel=$(uname -r)

printf 'Date: %s\nKernel: %s\n' "$today" "$kernel"
```

Avoid old-style backticks when writing new scripts:

```bash
# Prefer this:
files=$(find . -type f)
```

Command substitution removes trailing newline characters. It is not suitable for capturing arbitrary binary data or preserving all trailing newlines.

---

## 4. Comments and Documentation

Use `#` for comments:

```bash
# Update package indexes before installing packages.
sudo apt update
```

A useful script header describes its purpose and any important assumptions:

```bash
#!/usr/bin/env bash
# Purpose: Report the current disk usage.
# Usage: ./disk-report.sh [directory]
```

For longer scripts, document:

- What the script does.
- Required commands or packages.
- Expected arguments.
- Files it reads or changes.
- Whether it needs elevated privileges.
- Important failure conditions.

Do not comment every obvious line. Explain intent, assumptions, and non-obvious decisions.

---

## 5. Conditionals

### `if`, `elif`, and `else`

```bash
if [[ -f "$file" ]]; then
    printf 'File exists.\n'
elif [[ -d "$file" ]]; then
    printf 'Path is a directory.\n'
else
    printf 'Path does not exist or is not a regular file/directory.\n'
fi
```

The `[[ ... ]]` syntax is a Bash conditional expression. It is generally preferable to the older `[ ... ]` form in Bash scripts.

### `case`: switch-like branching

```bash
read -r -p 'Choose start, stop, or status: ' action

case "$action" in
    start)
        printf 'Starting...\n'
        ;;
    stop)
        printf 'Stopping...\n'
        ;;
    status|check)
        printf 'Checking status...\n'
        ;;
    *)
        printf 'Unknown action: %s\n' "$action" >&2
        exit 2
        ;;
esac
```

- Use `|` to match several alternatives.
- `*` is the fallback pattern.
- `;;` ends a case branch.
- Quote the variable in `case "$action" in`.

### Combine conditions

```bash
if [[ -f "$config" && -r "$config" ]]; then
    printf 'Configuration file exists and is readable.\n'
fi

if [[ "$answer" == "y" || "$answer" == "yes" ]]; then
    printf 'Continuing.\n'
fi
```

Use `&&` for AND and `||` for OR inside `[[ ... ]]`.

---

## 6. Comparisons and Tests

### File tests

| Test | True when |
|---|---|
| `-e "$path"` | Path exists |
| `-f "$path"` | Path is a regular file |
| `-d "$path"` | Path is a directory |
| `-r "$path"` | Path is readable |
| `-w "$path"` | Path is writable |
| `-x "$path"` | Path is executable or searchable, as applicable |
| `-s "$path"` | File exists and has a size greater than zero |
| `-L "$path"` | Path is a symbolic link |
| `file1 -nt file2` | `file1` is newer than `file2` |
| `file1 -ot file2` | `file1` is older than `file2` |

Example:

```bash
if [[ ! -e "$backup_file" ]]; then
    printf 'No backup found.\n'
fi
```

### String comparisons

```bash
[[ "$name" == "Ada" ]]       # Equal
[[ "$name" != "Ada" ]]       # Not equal
[[ -z "$name" ]]             # Empty string
[[ -n "$name" ]]             # Non-empty string
[[ "$file" == *.log ]]       # Pattern match
[[ "$text" =~ ^[0-9]+$ ]]    # Regular-expression match
```

The right side of `=~` is a regular expression, not a glob. Usually do not quote the whole regular expression:

```bash
if [[ "$value" =~ ^[0-9]+$ ]]; then
    printf 'Digits only.\n'
fi
```

### Numeric comparisons

Within `[[ ... ]]`:

| Operator | Meaning |
|---|---|
| `-eq` | Equal |
| `-ne` | Not equal |
| `-lt` | Less than |
| `-le` | Less than or equal |
| `-gt` | Greater than |
| `-ge` | Greater than or equal |

```bash
if [[ "$count" -gt 10 ]]; then
    printf 'More than ten.\n'
fi
```

For integer arithmetic conditions, `(( ... ))` is often clearer:

```bash
if (( count > 10 )); then
    printf 'More than ten.\n'
fi
```

Validate user-provided numbers before using them in arithmetic.

### Exit status

Every command returns an exit status: `0` conventionally means success, and a nonzero value indicates failure or another condition.

```bash
if grep -q 'error' application.log; then
    printf 'An error was found.\n'
else
    printf 'No matching error was found.\n'
fi
```

For `grep`, status `1` means no match, while larger values can indicate an error. Do not assume every nonzero status has the same meaning.

---

## 7. Loops

### `for` over a list

```bash
for name in Ada Grace Linus; do
    printf 'Hello, %s!\n' "$name"
done
```

### Loop over files safely

```bash
for file in ./*.log; do
    [[ -e "$file" ]] || continue
    printf 'Processing: %s\n' "$file"
done
```

The `./*.log` pattern can remain unmatched if there are no matching files. The existence check handles that common case.

For more complex filename discovery, consider `find` with `-print0` and a NUL-delimited reader.

### C-style loop

```bash
for ((i = 0; i < 5; i++)); do
    printf 'Index: %d\n' "$i"
done
```

### `while` loop

```bash
count=1

while (( count <= 5 )); do
    printf '%d\n' "$count"
    ((count += 1))
done
```

### `until` loop

Runs until its condition becomes true:

```bash
count=1

until (( count > 5 )); do
    printf '%d\n' "$count"
    ((count += 1))
done
```

### Read a file line by line

```bash
while IFS= read -r line || [[ -n "$line" ]]; do
    printf 'Line: %s\n' "$line"
done < "$input_file"
```

This preserves leading/trailing whitespace and backslashes and also processes a final line that lacks a newline.

### `break` and `continue`

- `break` exits the current loop.
- `continue` skips to the next iteration.

```bash
for number in {1..10}; do
    (( number == 3 )) && continue
    (( number == 8 )) && break
    printf '%d\n' "$number"
done
```

### Beware of loops in pipelines

This may run the loop in a subshell, so changes to `total` may not survive after the loop:

```bash
total=0
printf '%s\n' 1 2 3 | while read -r number; do
    ((total += number))
done
printf '%s\n' "$total"
```

Prefer input redirection when reading a file and keeping variables in the current shell:

```bash
total=0
while read -r number; do
    ((total += number))
done < numbers.txt

printf '%s\n' "$total"
```

---

## 8. Strict Mode and Defensive Scripting

A common starting point is:

```bash
set -Eeuo pipefail
```

These options are useful, but they are not a complete error-handling system and do not make every script safe automatically.

- `-e` (`errexit`): often exits when a simple command fails, but has important exceptions, including many commands used in conditionals, `&&`/`||` lists, and pipelines.
- `-u` (`nounset`): reports expansions of unset variables, with some exceptions such as supported default-value expansions.
- `-o pipefail`: makes a pipeline fail if a command in it fails, rather than reporting only the last command's status.
- `-E` (`errtrace`): lets an `ERR` trap be inherited by shell functions, command substitutions, and subshell environments in applicable cases.

Use explicit checks for important operations:

```bash
if ! cp -- "$source_file" "$destination_file"; then
    printf 'Error: could not copy file.\n' >&2
    exit 1
fi
```

Use `${variable:-default}` to provide a default if a variable is unset or empty:

```bash
: "${BACKUP_DIR:=/var/backups/myapp}"
```

This assignment sets `BACKUP_DIR` to the default if it is unset or empty. Use `${BACKUP_DIR:-/var/backups/myapp}` if you want a default value without assigning it.

### Check required commands

```bash
for command in curl jq; do
    if ! command -v "$command" >/dev/null 2>&1; then
        printf 'Error: required command not found: %s\n' "$command" >&2
        exit 1
    fi
done
```

### Check arguments

```bash
if (( $# != 1 )); then
    printf 'Usage: %s FILE\n' "$0" >&2
    exit 2
fi

input_file=$1
```

Do not rely on `set -e` alone for critical actions. Test the exact commands and failure paths your script depends on.

---

## 9. Functions

Functions group reusable commands.

```bash
greet() {
    local name=${1:-Guest}
    printf 'Hello, %s!\n' "$name"
}

greet "Ada"
greet
```

- `local` limits a variable to the function.
- Arguments are accessed with `$1`, `$2`, and so on.
- `$#` is the number of arguments.
- `"$@"` represents all arguments as separate words.

### Pass all arguments safely

```bash
show_arguments() {
    local argument

    for argument in "$@"; do
        printf 'Argument: %s\n' "$argument"
    done
}

show_arguments "two words" "*.txt"
```

### Return status, not general data

Bash function `return` values are exit statuses, normally in the range 0–255. To return text, print it and capture the output:

```bash
get_kernel() {
    uname -r
}

kernel=$(get_kernel)
printf 'Kernel: %s\n' "$kernel"
```

Use the exit status to report success or failure:

```bash
is_root() {
    [[ "$EUID" -eq 0 ]]
}

if is_root; then
    printf 'Running as root.\n'
fi
```

Be mindful that command substitution runs in a subshell environment, so variable changes made inside it do not affect the parent shell.

---

## 10. Arrays and Dictionaries

### Indexed arrays

```bash
packages=(curl jq git)

printf '%s\n' "${packages[0]}"
printf 'Count: %d\n' "${#packages[@]}"

for package in "${packages[@]}"; do
    printf 'Package: %s\n' "$package"
done
```

Important forms:

| Syntax | Meaning |
|---|---|
| `${array[0]}` | Element at index 0 |
| `${array[@]}` | All elements, preserving element boundaries when quoted |
| `${#array[@]}` | Number of elements |
| `array+=(value)` | Append an element |
| `unset 'array[1]'` | Remove an element |

Use `"${array[@]}"`, not `"${array[*]}"`, when passing each element as a separate argument.

```bash
files=("file one.txt" "file two.txt")
printf 'File: %s\n' "${files[@]}"
```

### Build an array from arguments

```bash
arguments=("$@")
```

Avoid this unsafe pattern:

```bash
# Unsafe: splits on whitespace and expands wildcard characters.
arguments=($input)
```

### Associative arrays (dictionaries)

Associative arrays use string keys. They require Bash 4 or newer, which Debian 13 provides.

```bash
declare -A ports=(
    [http]=80
    [https]=443
    [ssh]=22
)

printf 'SSH port: %s\n' "${ports[ssh]}"

for service in "${!ports[@]}"; do
    printf '%s: %s\n' "$service" "${ports[$service]}"
done
```

- `${!ports[@]}` expands to the keys.
- `${ports[$key]}` looks up a value.
- The order of associative-array iteration is not guaranteed.

Always quote associative-array expansions when using their values in commands.

---

## 11. Brace Expansion

Brace expansion generates text before normal command execution. It does not evaluate variables.

```bash
printf '%s\n' file{1,2,3}.txt
# file1.txt file2.txt file3.txt

printf '%s\n' {01..05}
# 01 02 03 04 05

printf '%s\n' {1..10..2}
# 1 3 5 7 9
```

Create several directories:

```bash
mkdir -p project/{src,tests,docs}
```

Brace expansion is useful for fixed lists. For values computed at runtime, use loops or arrays instead.

```bash
start=1
end=5

for ((i = start; i <= end; i++)); do
    printf '%d\n' "$i"
done
```

---

## 12. Parameter Expansion and Special Variables

### Useful parameter expansions

Assume `filename="report.tar.gz"`.

| Syntax | Meaning |
|---|---|
| `${filename}` | Value of variable |
| `${filename:-default}` | Default if unset or empty |
| `${filename-default}` | Default only if unset |
| `${filename:=default}` | Assign default if unset or empty |
| `${filename:?message}` | Report an error if unset or empty |
| `${#filename}` | Length of string |
| `${filename%.gz}` | Remove shortest matching suffix |
| `${filename%%.*}` | Remove longest matching suffix |
| `${filename#*.}` | Remove shortest matching prefix |
| `${filename##*.}` | Remove longest matching prefix |
| `${filename/old/new}` | Replace first matching pattern |
| `${filename//old/new}` | Replace all matching patterns |
| `${filename:0:6}` | Substring by offset and length |

Examples:

```bash
filename="report.tar.gz"

printf '%s\n' "${filename%.gz}"    # report.tar
printf '%s\n' "${filename##*.}"    # gz
printf '%s\n' "${filename//./_}"   # report_tar_gz
```

### Special variables

| Variable | Meaning |
|---|---|
| `$0` | Script name or shell invocation name |
| `$1`, `$2`, ... | Positional arguments |
| `$#` | Number of positional arguments |
| `"$@"` | All positional arguments as separate words when quoted |
| `"$*"` | All positional arguments combined into one word when quoted |
| `$?` | Exit status of the last command |
| `$$` | PID of the current shell |
| `$!` | PID of the most recent background command |
| `$-` | Current shell option flags |
| `$_` | Context-dependent: often the last argument of the previous command |
| `$BASH_VERSION` | Bash version |
| `$LINENO` | Current source line number in the script |
| `$EUID` | Effective user ID |
| `BASH_SOURCE[0]` | Path associated with the current Bash source file |

### Prefer `"$@"` for forwarding arguments

```bash
run_command() {
    command some-tool "$@"
}
```

This preserves each argument, including arguments containing spaces. Avoid unquoted `$@`.

### Arrays and indirect data

Do not use `eval` to turn strings into commands or variable references. `eval` re-parses text as shell code and can introduce command injection vulnerabilities. Use arrays, explicit `case` statements, and parameter expansion instead.

---

## 13. Shell Options: `set` and `shopt`

`set` controls shell options and positional parameters. `shopt` controls additional Bash-specific behavior.

### Common `set` options

```bash
set -e          # Exit in many cases when a command fails
set -u          # Treat many unset-variable expansions as errors
set -o pipefail # Fail a pipeline if any command fails
set -x          # Trace commands
set +x          # Stop command tracing
set +e          # Disable errexit
set +u          # Disable nounset
```

Set common defensive options together:

```bash
set -Eeuo pipefail
```

Remember the limitations of `-e`; explicit error checks are still necessary.

### Useful `shopt` options

```bash
shopt -s nullglob
shopt -s globstar
shopt -s extglob
shopt -u nocaseglob
```

- `nullglob`: an unmatched glob expands to nothing rather than remaining as a literal pattern.
- `globstar`: enables `**` to match files and directories recursively when used in a pathname pattern.
- `extglob`: enables extended pattern-matching operators.
- `nocaseglob`: makes pathname glob matching case-insensitive when enabled.

Example:

```bash
shopt -s nullglob

log_files=(./*.log)

for file in "${log_files[@]}"; do
    printf '%s\n' "$file"
done
```

Options affect the current shell and may change the behavior of later code. Enable them deliberately and document non-obvious choices.

---

## 14. Command History and Interactive Shortcuts

History expansion is mainly an **interactive shell feature**. It is generally not available in ordinary non-interactive scripts. Do not use `!!` in a script to repeat a command.

Common interactive shortcuts:

| Shortcut / expansion | Purpose |
|---|---|
| `!!` | Repeat the previous command |
| `!$` | Use the last argument of the previous command |
| `!*` | Use all arguments of the previous command |
| `!n` | Run history entry number `n` |
| `!string` | Run the most recent command beginning with `string` |
| `Ctrl+R` | Search command history |
| `Ctrl+A` | Move to start of command line |
| `Ctrl+E` | Move to end of command line |
| `Ctrl+U` | Delete from cursor to beginning of line |
| `Ctrl+K` | Delete from cursor to end of line |
| `Ctrl+W` | Delete the word before the cursor |
| `Alt+.` | Insert the previous command's last argument in many Readline setups |

History expansion can execute an unexpected command if used carelessly. Review the expanded command before pressing Enter.

Useful history-related commands:

```bash
history
history 20
history -c
```

`history -c` clears the current shell's in-memory history list; history persistence behavior depends on shell configuration. Do not assume it securely erases all historical records.

---

## 15. Arithmetic Operations

Use `(( ... ))` for integer arithmetic:

```bash
a=10
b=3

printf 'Sum: %d\n' "$((a + b))"
printf 'Difference: %d\n' "$((a - b))"
printf 'Product: %d\n' "$((a * b))"
printf 'Quotient: %d\n' "$((a / b))"
printf 'Remainder: %d\n' "$((a % b))"
```

Bash arithmetic uses integers, not floating-point numbers. Division truncates toward zero.

### Arithmetic operators

| Operator | Meaning |
|---|---|
| `+`, `-` | Addition, subtraction |
| `*`, `/`, `%` | Multiplication, integer division, remainder |
| `**` | Exponentiation |
| `++`, `--` | Increment, decrement |
| `+=`, `-=` | Update a variable |
| `==`, `!=`, `<`, `>` | Comparisons in arithmetic contexts |
| `&&`, `||`, `!` | Logical AND, OR, NOT |

```bash
count=0
((count += 1))

if (( count >= 1 )); then
    printf 'Count is at least one.\n'
fi
```

**Strict-mode note:** `((expression))` returns exit status 1 when its arithmetic result is zero. Under `set -e`, a standalone command such as `((count++))` can therefore unexpectedly terminate the script when `count` starts at zero. Prefer `((count += 1))` or `count=$((count + 1))` when incrementing from zero under strict mode.

Arithmetic expansion:

```bash
total=$((price * quantity))
```

Do not pass untrusted text into arithmetic expressions without validating it. Bash arithmetic is not a general-purpose decimal calculator.

---

## 16. Redirection and File Descriptors

By default, a command receives standard input and writes to standard output and standard error.

| File descriptor | Name | Default |
|---|---|---|
| `0` | Standard input (`stdin`) | Keyboard or inherited input |
| `1` | Standard output (`stdout`) | Terminal or inherited output |
| `2` | Standard error (`stderr`) | Terminal or inherited error output |

### Common redirections

```bash
command > output.txt       # Write stdout, replacing the file
command >> output.txt      # Append stdout
command 2> errors.txt      # Write stderr
command 2>> errors.txt     # Append stderr
command > all.txt 2>&1     # Send stdout and stderr to the same destination
command &> all.txt         # Bash shorthand for stdout and stderr
command < input.txt        # Read stdin from a file
command >/dev/null         # Discard stdout
command 2>/dev/null        # Discard stderr
```

Redirection order matters:

```bash
command > output.txt 2>&1
```

Both streams go to `output.txt`.

```bash
command 2>&1 > output.txt
```

Stderr first follows the original stdout destination; it does not follow the later redirection to `output.txt`.

### Pipes

```bash
ps aux | grep '[s]sh'
```

A pipe sends one command's stdout to the next command's stdin. Unless redirected separately, stderr remains separate.

With strict mode, `set -o pipefail` helps detect failures in earlier pipeline commands:

```bash
set -o pipefail
producer | processor | consumer
```

### Save output while displaying it

```bash
command 2>&1 | tee command.log
```

Append instead:

```bash
command 2>&1 | tee -a command.log
```

### Use a separate file descriptor for logs

```bash
exec 3>script.log

printf 'This goes to the terminal.\n'
printf 'This goes to the log.\n' >&3

exec 3>&-
```

`exec` with redirection can also change the script's default output streams:

```bash
exec >>script.log 2>&1
```

After this line, subsequent stdout and stderr are appended to `script.log`.

---

## 17. Here Documents and Here Strings

### Here document (`<<`)

A here document sends a block of text to a command's standard input:

```bash
cat <<EOF
Hello, $USER.
Today is $(date +%F).
EOF
```

When the delimiter is unquoted, parameter expansion, command substitution, and arithmetic expansion occur.

Quote the delimiter to prevent those expansions:

```bash
cat <<'EOF'
This prints $USER literally.
This does not run $(date).
EOF
```

### Indented here documents (`<<-`)

`<<-` removes leading **tab characters**, not spaces, from lines in the body:

```bash
cat <<-EOF
	This line starts with a tab in the script.
EOF
```

### Here strings (`<<<`)

A here string sends one string, followed by a newline, to a command:

```bash
grep -i 'error' <<< "$message"
```

Another example:

```bash
read -r first rest <<< "hello world again"
printf 'First: %s\nRest: %s\n' "$first" "$rest"
```

Use here documents for multiline input and here strings for a single string. Avoid embedding secrets in scripts or logs.

---

## 18. Error Handling and `trap`

### Handle errors explicitly

```bash
if ! mkdir -p -- "$destination"; then
    printf 'Error: unable to create destination directory.\n' >&2
    exit 1
fi
```

Send error messages to stderr with `>&2`.

### Capture an exit status

```bash
if cp -- "$source" "$destination"; then
    printf 'Copy complete.\n'
else
    status=$?
    printf 'Copy failed with status %d.\n' "$status" >&2
    exit "$status"
fi
```

Capture `$?` immediately. Running another command first overwrites it.

### Use `trap` for cleanup

```bash
#!/usr/bin/env bash
set -Eeuo pipefail

tmp_file=$(mktemp)

cleanup() {
    rm -f -- "$tmp_file"
}

trap cleanup EXIT

printf 'Temporary data\n' > "$tmp_file"
```

The `EXIT` trap runs when the shell exits, including many error exits. Cleanup functions should be safe if called during an incomplete operation.

### Handle interruption signals

```bash
trap 'printf "Interrupted.\n" >&2; exit 130' INT
trap 'printf "Terminated.\n" >&2; exit 143' TERM
```

Signal traps may run at points different from what beginners expect, depending on what the shell is doing. Keep traps simple.

### An `ERR` trap

```bash
set -E
trap 'status=$?; printf "Error at line %s (status %s)\n" "$LINENO" "$status" >&2' ERR
```

An `ERR` trap has exceptions similar to `set -e`; it is not a universal handler for every failed command. For critical operations, check statuses explicitly.

---

## 19. Process Substitution

Process substitution lets a command read the output of another command as if it were a file.

```bash
diff -u <(sort file_a.txt) <(sort file_b.txt)
```

Compare command outputs:

```bash
diff -u <(ip address show) <(ip route show)
```

Use it to read command output without storing it in a temporary file. It is Bash-specific and commonly implemented using `/dev/fd` or named pipes.

### Compare two streams with a loop

```bash
while IFS= read -r line; do
    printf 'Line: %s\n' "$line"
done < <(find . -maxdepth 1 -type f -print)
```

The `< <(...)` combination means: redirect the loop's input from the output of the command inside process substitution. This helps avoid the variable-scope problem that can occur with a pipeline loop.

Process substitution can make failure handling less obvious. If the producer command fails, the consuming command may still run. Use explicit status handling when producer success is important.

---

## 20. Reading and Processing Files

### Read a file line by line

```bash
input_file="servers.txt"

if [[ ! -r "$input_file" ]]; then
    printf 'Error: cannot read %s\n' "$input_file" >&2
    exit 1
fi

while IFS= read -r line || [[ -n "$line" ]]; do
    printf 'Value: %s\n' "$line"
done < "$input_file"
```

Why use `IFS= read -r`?

- `IFS=` prevents `read` from trimming leading and trailing whitespace.
- `-r` prevents backslashes from being treated as escape characters.
- The final `|| [[ -n "$line" ]]` processes a last line that does not end with a newline.

### Read a file into a variable

```bash
contents=$(< "$input_file")
```

This Bash shortcut is efficient for small text files. Command substitution removes trailing newlines, so it does not preserve the file byte-for-byte. Do not use it for binary data or files where exact newline preservation matters.

### Read an entire file into an array of lines

```bash
mapfile -t lines < "$input_file"

for line in "${lines[@]}"; do
    printf '%s\n' "$line"
done
```

`mapfile` (also known as `readarray`) is a Bash builtin. `-t` removes trailing newline characters from each line. This approach stores the whole file in memory, so use a loop for very large files.

### Useful text-processing commands

| Command | Common use |
|---|---|
| `grep` | Find lines matching a pattern |
| `sed` | Perform stream edits and substitutions |
| `awk` | Select and process fields or records |
| `cut` | Extract simple character or delimiter-separated fields |
| `sort` | Sort lines |
| `uniq` | Collapse adjacent duplicate lines |
| `wc` | Count lines, words, or bytes |
| `head` | Show the beginning of input |
| `tail` | Show the end of input or follow a growing log |
| `tr` | Translate or delete characters |
| `find` | Search directory trees for files |
| `xargs` | Build command arguments from input; use NUL-delimited mode for filenames |

Examples:

```bash
grep -n 'error' application.log
grep -i 'warning' application.log
awk '{print $1}' access.log
cut -d: -f1 /etc/passwd
sort names.txt | uniq -c
wc -l application.log
tail -n 50 application.log
tail -F /var/log/syslog
```

`cut -d: -f1` is suitable for simple colon-delimited data such as `/etc/passwd`. It is not a general CSV parser.

### Process filenames safely

Prefer NUL-delimited filenames because Unix filenames can contain spaces, tabs, quotes, and newlines (but not NUL bytes):

```bash
find /some/path -type f -name '*.log' -print0 |
    while IFS= read -r -d '' file; do
        printf 'Found: %s\n' "$file"
    done
```

If you need to modify variables outside the loop, use process substitution or redirect from a file rather than a pipeline loop.

With GNU `xargs`, use:

```bash
find /some/path -type f -name '*.log' -print0 |
    xargs -0 -r printf '%s\n'
```

Do not parse `ls` output to get filenames. Use globs, `find`, or NUL-delimited output.

### Read a simple configuration file

For a trusted, deliberately simple `KEY=VALUE` file, sourcing it may be appropriate:

```bash
source ./app.conf
```

**Warning:** `source` executes the file as shell code. Do not source a configuration file that an untrusted person can modify.

If the file is plain data rather than trusted shell syntax, parse its documented format without `source` and validate the values.

---

## 21. Structured Data: CSV and JSON

CSV and JSON are structured formats. Their quoting and nesting rules mean they should not always be treated as ordinary lines of text.

### CSV: simple delimited text

For a simple file such as:

```text
name,department
Ada,Engineering
Grace,Research
```

you can use `awk` for basic field operations:

```bash
awk -F, 'NR > 1 { print $1 }' employees.csv
```

`-F,` sets the field separator to a comma, and `NR > 1` skips the header.

However, this does **not** correctly parse general CSV. Real CSV files may contain:

```csv
name,description
Ada,"Engineer, researcher"
Grace,"Said ""hello"""
```

Commas and escaped quotes inside quoted fields make naive `cut`, `awk -F,`, or `IFS=, read` approaches unreliable for general CSV.

### CSV: use a real parser for real CSV

Ruby includes a CSV library in its standard library on normal Ruby installations. Example:

```bash
ruby -rcsv -e '
  CSV.foreach(ARGV.fetch(0), headers: true) do |row|
    puts row["name"]
  end
' employees.csv
```

This handles quoted fields far more reliably than splitting each line on commas. Check the CSV header names and file encoding for your actual data.

If you already have a suitable dedicated CSV-processing tool installed, it can be used instead. Choose a parser that follows the CSV format expected by the file.

### Useful CSV tasks

With a proper parser, you can:

- Select columns by header name.
- Filter rows based on values.
- Count records.
- Convert selected fields into another format.
- Generate summaries or reports.

Do not assume that every file ending in `.csv` uses exactly the same delimiter, quote character, encoding, or header conventions.

### JSON: use `jq`

Install `jq` if needed:

```bash
sudo apt update
sudo apt install jq
```

Example `system.json`:

```json
{
  "hostname": "debian-lab",
  "services": [
    {"name": "ssh", "enabled": true},
    {"name": "nginx", "enabled": false}
  ]
}
```

Pretty-print JSON:

```bash
jq . system.json
```

Select a property:

```bash
jq -r '.hostname' system.json
```

Select an array element:

```bash
jq '.services[0]' system.json
```

Extract names from an array:

```bash
jq -r '.services[].name' system.json
```

Filter records:

```bash
jq -r '.services[] | select(.enabled == true) | .name' system.json
```

Count array elements:

```bash
jq '.services | length' system.json
```

Provide a default when a property is missing or null:

```bash
jq -r '.owner // "unknown"' system.json
```

The `-r` option prints strings as raw text rather than JSON-quoted strings. This is useful for command-line output, but remember that extracted values can still contain newlines or other characters.

### Validate JSON

```bash
if jq empty system.json >/dev/null; then
    printf 'Valid JSON.\n'
else
    printf 'Invalid JSON.\n' >&2
    exit 1
fi
```

`jq` exits unsuccessfully when it cannot parse invalid JSON. A valid JSON document can still have the wrong shape or unexpected values, so validate the fields your script needs.

### Safely use extracted JSON values

For a single expected string value:

```bash
hostname=$(jq -er '.hostname | strings' system.json) || {
    printf 'Missing or invalid hostname.\n' >&2
    exit 1
}

printf 'Hostname: %s\n' "$hostname"
```

`-e` makes `jq` return a failing status for certain false/null/no-result outcomes. The `strings` filter ensures the selected value is a string; `-r` outputs it as raw text.

Be careful when converting arbitrary JSON arrays into shell variables. Newlines and shell word splitting can destroy record boundaries. Prefer keeping the data in JSON and processing it with `jq`, or use a well-defined encoding when passing values to another program.

### CSV and JSON safety rules

- Do not parse JSON with `grep` or `sed` when `jq` is available.
- Do not parse arbitrary CSV by splitting on commas.
- Validate that required properties and fields exist.
- Treat external data as untrusted.
- Quote shell variables when passing values to commands.
- Do not use `eval` to execute data extracted from a file or API.
- Keep data separate from shell code.

---

## 22. Reading Data from Network Requests

### Make an HTTP request with `curl`

```bash
curl https://example.com/
```

Save the response body:

```bash
curl --fail --show-error --silent \
    --output response.html \
    https://example.com/
```

Options:

- `--fail`: return a failure status for HTTP responses with error status codes (with some behavior differences for redirects and protocol details).
- `--show-error`: display an error message when used with `--silent`.
- `--silent`: suppress progress output.
- `--output`: write the response body to a file.

Set a connection timeout and an overall timeout:

```bash
curl --fail --show-error --silent \
    --connect-timeout 5 \
    --max-time 20 \
    https://example.com/
```

### Check the result explicitly

```bash
if response=$(curl --fail --show-error --silent \
    --connect-timeout 5 \
    --max-time 20 \
    https://example.com/api/status); then
    printf 'Response received.\n'
else
    printf 'Request failed.\n' >&2
    exit 1
fi
```

Do not assume a successful network connection means the response contains the data you expected. Check HTTP status, content type when relevant, and response structure.

### Retrieve JSON from an API

```bash
curl --fail --show-error --silent \
    --connect-timeout 5 \
    --max-time 20 \
    https://api.example.com/status |
    jq .
```

For important scripts, capture and check the request result before processing it, especially when you need to distinguish network failure from JSON parsing failure.

### Send a request with a header

```bash
curl --fail --show-error --silent \
    -H 'Accept: application/json' \
    https://api.example.com/status
```

### Send JSON data

```bash
curl --fail --show-error --silent \
    -H 'Content-Type: application/json' \
    --data '{"enabled":true}' \
    https://api.example.com/settings
```

For dynamic values, use `jq` to build valid JSON rather than manually concatenating strings:

```bash
payload=$(jq -n --arg name "$username" '{username: $name}')

curl --fail --show-error --silent \
    -H 'Content-Type: application/json' \
    --data "$payload" \
    https://api.example.com/users
```

Do not put real API tokens directly in scripts that may be committed to version control. Read secrets from an appropriate protected source or environment variable and avoid printing them.

### Download a file

```bash
curl --fail --show-error --location \
    --output archive.tar.gz \
    https://example.com/archive.tar.gz
```

`--location` follows redirects. Do not blindly download and execute scripts from the internet. Verify the source and integrity of downloaded files, and use trusted package repositories when possible.

### Retries

```bash
curl --fail --show-error --silent \
    --retry 3 \
    --retry-delay 2 \
    --connect-timeout 5 \
    --max-time 30 \
    https://api.example.com/status
```

Retries are useful for transient failures, but do not blindly retry non-idempotent requests that might create duplicate actions. Check the API's retry guidance and use idempotency keys where supported.

---

## 23. Reading Data over SSH

SSH lets a script run commands on another computer. Data may flow from the remote command to the local script through standard output.

### Run a remote command

```bash
ssh user@server.example.com 'hostname'
ssh user@server.example.com 'df -h /'
```

The quoted command is interpreted by the remote shell. Be careful when including local variables in a remote command.

### Capture remote output

```bash
if remote_hostname=$(ssh \
    -o BatchMode=yes \
    -o ConnectTimeout=5 \
    user@server.example.com 'hostname'); then
    printf 'Remote host: %s\n' "$remote_hostname"
else
    printf 'SSH command failed.\n' >&2
    exit 1
fi
```

`BatchMode=yes` disables interactive password and host-key prompts that could block automation. Configure trusted host keys and authentication before using it.

### Read a remote file

```bash
ssh user@server.example.com 'cat /etc/os-release'
```

If you need to parse the result locally, remember that command substitution removes trailing newlines:

```bash
if os_release=$(ssh user@server.example.com 'cat /etc/os-release'); then
    printf '%s\n' "$os_release"
fi
```

### Transfer files

Copy a file to a remote system:

```bash
scp ./report.txt user@server.example.com:/tmp/report.txt
```

Copy a file from a remote system:

```bash
scp user@server.example.com:/var/log/syslog ./remote-syslog
```

Use `rsync` for efficient synchronization:

```bash
rsync -av -- ./reports/ user@server.example.com:/srv/reports/
```

Review source and destination paths carefully, particularly when using `--delete`, which removes destination files that are absent from the source.

### Use SSH keys for automation

Configure public-key authentication and verify the remote host's identity. Do not disable host-key checking merely to make an automation script work. A strict host-key policy helps protect against connecting to an impersonated server.

Useful options:

```bash
ssh \
    -o BatchMode=yes \
    -o ConnectTimeout=5 \
    -o ServerAliveInterval=15 \
    -o ServerAliveCountMax=3 \
    user@server.example.com 'uptime'
```

### Local versus remote variable expansion

This command expands `$HOME` on the remote system because the variable is inside single quotes:

```bash
ssh user@server.example.com 'printf "%s\n" "$HOME"'
```

This command expands the local shell's `$HOME` before SSH is started:

```bash
ssh user@server.example.com "printf '%s\n' '$HOME'"
```

The second example is only suitable for values that cannot introduce quoting problems. Do not interpolate arbitrary or untrusted values into a remote command string.

### Pass data safely

When possible, send data through standard input instead of constructing a remote shell command from untrusted strings:

```bash
printf '%s\n' "$value" |
    ssh user@server.example.com 'cat > /tmp/value.txt'
```

Use a safe, intentional destination path and ensure the remote command is appropriate. For more complex data, use `scp`, `rsync`, or a program that accepts data on stdin.

**Important:** Quoting a variable in the local shell does not automatically protect it from interpretation by the remote shell. Remote commands pass through shell parsing on the remote side too. Prefer fixed remote commands, validated inputs, and standard-input/file-transfer methods over dynamic command construction.

### Check several hosts

```bash
hosts=(server1.example.com server2.example.com)

for host in "${hosts[@]}"; do
    if ssh -o BatchMode=yes -o ConnectTimeout=5 \
        "admin@$host" 'uptime'; then
        printf 'OK: %s\n' "$host"
    else
        printf 'FAILED: %s\n' "$host" >&2
    fi
done
```

Hostnames and usernames should come from trusted configuration or be validated. For many hosts, consider concurrency limits, logging, and per-host timeouts.

---

## 24. Quick Reference

### Script skeleton

```bash
#!/usr/bin/env bash
set -Eeuo pipefail

usage() {
    printf 'Usage: %s FILE\n' "$0" >&2
}

main() {
    if (( $# != 1 )); then
        usage
        return 2
    fi

    local file=$1

    if [[ ! -r "$file" ]]; then
        printf 'Error: cannot read %s\n' "$file" >&2
        return 1
    fi

    printf 'Processing: %s\n' "$file"
}

main "$@"
```

### Common syntax

| Syntax | Meaning |
|---|---|
| `# comment` | Comment |
| `name=value` | Assign a variable |
| `"$name"` | Expand a variable as one word |
| `"${array[@]}"` | Expand array elements as separate words |
| `$(command)` | Capture command output |
| `$(( expression ))` | Arithmetic expansion |
| `[[ condition ]]` | Bash conditional test |
| `(( expression ))` | Arithmetic evaluation |
| `command1 && command2` | Run second if first succeeds |
| `command1 || command2` | Run second if first fails |
| `command1 \| command2` | Pipe stdout to next command |
| `> file` | Redirect stdout, replacing file |
| `>> file` | Append stdout |
| `2> file` | Redirect stderr |
| `< file` | Redirect stdin |
| `"$@"` | All arguments, preserving boundaries |
| `"$HOME"` | Home directory environment variable |

### Useful exit statuses

- `0`: success by convention.
- Nonzero: failure or a condition reported by the command.
- `exit 1`: exit with a general failure status.
- `exit 2`: often used for usage or argument errors, though conventions vary.
- `return 1`: return a failure status from a function.

### Essential commands

| Task | Command |
|---|---|
| Find a command | `command -v name` |
| Show current directory | `pwd` |
| List files | `find` or a shell glob |
| Search text | `grep` |
| Process fields | `awk` |
| Edit streams | `sed` |
| Parse JSON | `jq` |
| Fetch a URL | `curl` |
| Read files line by line | `while IFS= read -r line` |
| Create a temporary file | `mktemp` |
| Inspect a script's syntax | `bash -n script.sh` |
| Trace script execution | `bash -x script.sh` |
| Check the current Bash version | `bash --version` |

---

## 25. Bash Tricks for Administration

### Check whether a command exists

```bash
if command -v rsync >/dev/null 2>&1; then
    printf 'rsync is installed.\n'
else
    printf 'rsync is not available.\n'
fi
```

### Check whether the script runs as root

```bash
if (( EUID != 0 )); then
    printf 'Run this script as root or with sudo.\n' >&2
    exit 1
fi
```

Use elevated privileges only when required. Avoid running an entire script as root if only one command needs elevated access.

### Check a systemd service

```bash
if systemctl is-active --quiet ssh; then
    printf 'SSH service is active.\n'
else
    printf 'SSH service is not active.\n'
fi
```

The service unit name can vary by application or distribution.

### Check disk space

```bash
df -h /
```

Check a particular mount point:

```bash
df -h /var
```

For a script, parse command output carefully and avoid assuming a fixed column layout unless you control the output format.

### Check memory

```bash
free -h
```

### Find large files

```bash
find /var -type f -size +100M -print
```

Permission errors may appear when searching system directories. Redirect stderr only if you intentionally want to hide those errors:

```bash
find /var -type f -size +100M -print 2>/dev/null
```

### Find recently modified files

```bash
find "$HOME" -type f -mtime -1 -print
```

`-mtime -1` means modified less than approximately 24 hours ago, not necessarily since midnight.

### Create a timestamped backup

```bash
backup="config.$(date +%Y%m%d-%H%M%S).bak"
cp -- config "$backup"
```

For important backups, check the copy's exit status and consider ownership, permissions, metadata, and restoration testing.

### Create a temporary directory and clean it up

```bash
tmp_dir=$(mktemp -d)

cleanup() {
    rm -rf -- "$tmp_dir"
}
trap cleanup EXIT
```

`mktemp -d` creates a unique directory. Only remove a path you created and control. Never build a cleanup path from untrusted input.

### Process a list of packages

```bash
packages=(curl jq git)

sudo apt update
sudo apt install -- "${packages[@]}"
```

### Check the exit status of a service restart

```bash
if sudo systemctl restart ssh; then
    printf 'SSH restart command succeeded.\n'
else
    printf 'SSH restart failed.\n' >&2
    exit 1
fi
```

A successful restart command does not necessarily prove the service is healthy afterward. Check service status when required.

### Print a progress message

```bash
printf '[%s] Starting task...\n' "$(date '+%F %T')"
```

### Log messages consistently

```bash
log() {
    printf '[%s] %s\n' "$(date '+%F %T')" "$*" >&2
}

log "Starting maintenance"
```

This simple function is suitable for ordinary messages. If message arguments may contain arbitrary data, consider a format that avoids joining arguments ambiguously.

---

## 26. Secure Script-Writing Practices

1. **Quote expansions.** Prefer `"$value"` and `"${array[@]}"` unless splitting or glob expansion is intentional.
2. **Use `--` when supported.** For example, `rm -- "$file"` helps prevent a filename beginning with `-` from being treated as an option. Check whether the command supports `--`.
3. **Validate input.** Check argument count, expected formats, and allowed values before using them.
4. **Avoid `eval`.** It can turn data into executable shell code.
5. **Do not parse `ls` output.** Use globs, `find`, or NUL-delimited filename handling.
6. **Do not parse JSON with regular expressions.** Use `jq`.
7. **Do not split arbitrary CSV on commas.** Use a real CSV parser.
8. **Treat network and remote data as untrusted.** Validate expected fields and values.
9. **Protect credentials.** Do not commit tokens, passwords, private keys, or sensitive output to version control.
10. **Use least privilege.** Run as an ordinary user unless elevated privileges are needed.
11. **Use safe temporary files.** Use `mktemp` rather than predictable filenames such as `/tmp/my-script.tmp`.
12. **Handle failures explicitly.** Strict mode is helpful, but not a substitute for checking important operations.
13. **Test before destructive changes.** Consider a dry-run mode, backups, and explicit confirmation for irreversible actions.
14. **Be careful with `rm -rf`.** Validate paths and never let an empty or unexpected variable become a deletion target.
15. **Do not disable SSH host-key checking casually.** Verify server identity and configure known hosts for automation.
16. **Do not execute downloads blindly.** Verify the source and integrity of downloaded code.
17. **Use `bash -n` to check syntax.** It does not prove the script behaves correctly, but it catches many syntax errors.
18. **Test failure paths.** Try missing files, empty input, permission errors, failed network requests, and unexpected values.
19. **Use meaningful messages.** Send diagnostics to stderr and provide useful exit statuses.
20. **Keep scripts readable.** Prefer clear names, small functions, consistent formatting, and comments explaining why a decision was made.

### Final checklist

Before using a script for an important task, ask:

- [ ] Does it have the correct shebang?
- [ ] Are variable expansions quoted appropriately?
- [ ] Are arguments and external input validated?
- [ ] Are required commands checked or documented?
- [ ] Are failures handled intentionally?
- [ ] Are temporary files cleaned up safely?
- [ ] Are credentials protected?
- [ ] Have I tested it with missing, empty, and malformed input?
- [ ] Have I checked any destructive operations before running them?

---

**Remember:** Bash is strongest when it connects reliable command-line tools. Keep shell code focused on control flow and automation, use dedicated tools for structured data, and make failure handling explicit.
