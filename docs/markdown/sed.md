---
layout: sheet
title: "GNU sed Cheat Sheet for Debian 13"
category: "Text"
summary: "Search, select, transform, and edit text streams and files with GNU sed."
date: 2026-10-24 15:08:43
permalink: /html/sed.html
---
# GNU `sed` Cheat Sheet for Debian 13

> **Purpose:** A practical reference for using `sed` to search, select, transform, and edit text streams and files.
>
> **Package:** `sed`  
> **Scope:** This guide focuses on common GNU `sed` usage on Debian 13. Examples that modify files are clearly marked. Always test commands on sample files before changing important data.

## Table of contents

1. [Check availability and get help](#1-check-availability-and-get-help)
2. [How sed works](#2-how-sed-works)
3. [Basic syntax](#3-basic-syntax)
4. [Print and select lines](#4-print-and-select-lines)
5. [Find and replace text](#5-find-and-replace-text)
6. [Regular expressions](#6-regular-expressions)
7. [Address ranges and multiple commands](#7-address-ranges-and-multiple-commands)
8. [Edit files safely](#8-edit-files-safely)
9. [Useful transformations](#9-useful-transformations)
10. [Common pitfalls and safe habits](#10-common-pitfalls-and-safe-habits)
11. [Quick command index](#11-quick-command-index)

---

## 1. Check availability and get help

```bash
command -v sed
dpkg-query -S "$(command -v sed)"
sed --version
man sed
```

On Debian, GNU `sed` is provided by the `sed` package.

## 2. How sed works

`sed` is a **stream editor**. It reads input one line at a time, applies commands, and normally prints the result.

If `names.txt` contains:

```text
alice
bob
carol
```

This changes lowercase `a` characters to uppercase `A` in the output:

```bash
sed 's/a/A/g' names.txt
```

By default, `sed` does not change the original file. It prints transformed text to standard output.

## 3. Basic syntax

```text
sed [OPTIONS] 'COMMAND' FILE
```

| Option | Meaning |
|---|---|
| `-n` | Suppress automatic printing; print only when instructed |
| `-e` | Supply a script of commands |
| `-f FILE` | Read commands from a script file |
| `-E` | Use extended regular expressions |
| `-i` | Edit files in place |
| `-i.bak` | Edit in place and keep a backup with the `.bak` suffix |

Examples:

```bash
sed 's/cat/dog/' pets.txt
sed -n '1,5p' notes.txt
sed -E 's/[0-9]+/NUMBER/g' data.txt
```

## 4. Print and select lines

Print line 3 only:

```bash
sed -n '3p' notes.txt
```

Print lines 3 through 7:

```bash
sed -n '3,7p' notes.txt
```

Print the last line:

```bash
sed -n '$p' notes.txt
```

Print lines containing `error`:

```bash
sed -n '/error/p' application.log
```

Print lines that do not contain `error`:

```bash
sed -n '/error/!p' application.log
```

## 5. Find and replace text

The substitution command has this general form:

```text
s/PATTERN/REPLACEMENT/FLAGS
```

Replace the first match on each line:

```bash
sed 's/cat/dog/' pets.txt
```

Replace every match on each line:

```bash
sed 's/cat/dog/g' pets.txt
```

Ignore case (GNU `sed` extension):

```bash
sed 's/error/warning/Ig' application.log
```

Replace only on line 2:

```bash
sed '2s/draft/final/' notes.txt
```

Replace text only on lines beginning with `Host `:

```bash
sed '/^Host /s/old.example/new.example/' config.txt
```

Use a different delimiter when the pattern contains `/`:

```bash
sed 's|/home/alice|/home/student|g' paths.txt
```

Use captured text in a replacement:

```bash
sed -E 's/([A-Za-z]+), ([A-Za-z]+)/\2 \1/' names.txt
```

For input such as `Smith, Alex`, the output is `Alex Smith`. In the replacement, `\1` and `\2` refer to captured groups.

Replace only the second match on each line:

```bash
sed 's/:/-/2' values.txt
```

## 6. Regular expressions

By default, GNU `sed` uses basic regular expressions. The `-E` option enables extended regular expressions.

| Pattern | Meaning |
|---|---|
| `.` | Any single character except a newline |
| `^` | Start of line |
| `$` | End of line |
| `[abc]` | One character: `a`, `b`, or `c` |
| `[0-9]` | One digit |
| `[^0-9]` | One character that is not a digit |
| `*` | Zero or more repetitions of the preceding pattern |
| `\+` | One or more repetitions in basic regular expressions |
| `\?` | Zero or one repetition in basic regular expressions |
| `+` | One or more repetitions with `-E` |
| `?` | Zero or one repetition with `-E` |
| `\(...\)` | Grouping in basic regular expressions |
| `(...)` | Grouping with `-E` |
| `\|` | Alternation in basic regular expressions; use `|` with `-E` |

Examples:

```bash
sed -n '/^ERROR/p' application.log
sed -E 's/[0-9]+/[NUMBER]/g' data.txt
sed -E 's/(red|blue)/COLOR/g' colors.txt
```

## 7. Address ranges and multiple commands

Change text only on lines 2 through 5 in the output:

```bash
sed '2,5s/old/new/g' notes.txt
```

Print from the first line beginning with `START` through the end:

```bash
sed -n '/^START/,$p' log.txt
```

Run multiple commands:

```bash
sed -e 's/cat/dog/g' -e 's/blue/green/g' pets.txt
```

Or separate commands with semicolons:

```bash
sed 's/cat/dog/g; s/blue/green/g' pets.txt
```

Remove lines beginning with `#` from the output:

```bash
sed '/^#/d' config.txt
```

Remove blank lines from the output:

```bash
sed '/^$/d' notes.txt
```

These examples do not modify the original file.

## 8. Edit files safely

Preview a change first:

```bash
sed 's/old/new/g' config.txt
```

Edit in place and save a backup:

```bash
sed -i.bak 's/old/new/g' config.txt
```

This changes `config.txt` and saves the previous version as `config.txt.bak`.

Edit in place without a backup:

```bash
sed -i 's/old/new/g' config.txt
```

**Warning:** This modifies the original file directly. Prefer `-i.bak` for important files.

Write the result to a new file:

```bash
sed 's/old/new/g' config.txt > config-updated.txt
```

Do not redirect output to the same file being read; the shell can truncate the file before `sed` reads it.

## 9. Useful transformations

Remove leading spaces and tabs:

```bash
sed 's/^[[:blank:]]*//' notes.txt
```

Remove trailing spaces and tabs:

```bash
sed 's/[[:blank:]]*$//' notes.txt
```

Remove both leading and trailing spaces and tabs:

```bash
sed 's/^[[:blank:]]*//; s/[[:blank:]]*$//' notes.txt
```

Add a prefix to every line:

```bash
sed 's/^/> /' notes.txt
```

Add a suffix to every line:

```bash
sed 's/$/;/' values.txt
```

Remove lines that contain `DEBUG` from the output:

```bash
sed '/DEBUG/d' application.log
```

Convert a simple comma-and-space separator to a tab:

```bash
sed 's/, /\t/g' names.txt
```

This is suitable only for simple text. It is not a safe general-purpose way to process CSV files with quoted fields.

## 10. Common pitfalls and safe habits

- **Preview before editing.** Run a command without `-i` first to inspect its output.
- **Remember the default behavior.** `sed` prints transformed text; it does not normally alter the source file.
- **Use `-n` with `p` when selecting lines.** Without `-n`, selected lines may be printed twice.
- **Understand the `g` flag.** Without `g`, only the first match on each line is replaced.
- **Quote the script.** Single quotes usually prevent the shell from interpreting characters such as `$`, `*`, and parentheses before `sed` receives them.
- **Be careful with regular expressions.** A dot (`.`) is a wildcard unless escaped.
- **Use a backup for in-place edits.** `-i.bak` keeps a copy of the original.
- **Do not overwrite the input using redirection.** For example, `sed 's/a/b/g' file.txt > file.txt` can empty the file.
- **Consult the manual.** GNU `sed` has more features than this beginner-focused reference covers.

## 11. Quick command index

| Task | Example |
|---|---|
| Replace first match per line | `sed 's/old/new/' file.txt` |
| Replace all matches per line | `sed 's/old/new/g' file.txt` |
| Replace ignoring case | `sed 's/old/new/Ig' file.txt` |
| Print line 5 | `sed -n '5p' file.txt` |
| Print lines 5–10 | `sed -n '5,10p' file.txt` |
| Print matching lines | `sed -n '/word/p' file.txt` |
| Delete matching lines from output | `sed '/word/d' file.txt` |
| Remove blank lines from output | `sed '/^$/d' file.txt` |
| Edit with a backup | `sed -i.bak 's/old/new/g' file.txt` |
| Use extended regex | `sed -E 's/[0-9]+/N/g' file.txt` |
| Check availability | `command -v sed` |
| Find package ownership | `dpkg-query -S "$(command -v sed)"` |
