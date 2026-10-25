# Text-File Manipulation Reference for Debian 13

> **Scope warning:** This reference intentionally excludes `find`, `xargs`, `sed`, `awk`, `grep`, `printf`, and `echo`. These commands are covered separately or deserve their own focused reference. Consult the corresponding cheat sheets for those utilities.

This guide covers practical commands for inspecting, counting, sorting, comparing, combining, formatting, splitting, and making simple changes to text files on Debian 13.

**Package note:** Package names below refer to Debian package names, not just upstream projects. Package placement can vary by Debian release and installation. The examples are intended for Debian 13; verify package ownership on your own system using the commands in [Checking command availability](#1-checking-command-availability). Commands are not necessarily installed on every Debian system, especially minimal containers.

## Table of contents

1. [Checking command availability](#1-checking-command-availability)
2. [Viewing and inspecting text files](#2-viewing-and-inspecting-text-files)
3. [Counting, numbering, and selecting lines](#3-counting-numbering-and-selecting-lines)
4. [Sorting, comparing, and deduplicating](#4-sorting-comparing-and-deduplicating)
5. [Combining and rearranging text](#5-combining-and-rearranging-text)
6. [Formatting and transforming text](#6-formatting-and-transforming-text)
7. [Splitting files](#7-splitting-files)
8. [Editing files and applying changes](#8-editing-files-and-applying-changes)
9. [Character encoding and line endings](#9-character-encoding-and-line-endings)
10. [Installing missing utilities](#10-installing-missing-utilities)
11. [Common pitfalls and safe habits](#11-common-pitfalls-and-safe-habits)
12. [Quick command index](#12-quick-command-index)

---

## 1. Checking command availability

Debian installations differ. A desktop installation, server, and minimal container may have different sets of commands.

### Check whether a command is available

```bash
command -v column
```

If the command is available through your `PATH`, this prints its path, such as `/usr/bin/column`. If nothing is printed, the command may not be installed or may not be in your `PATH`.

### Find which installed package owns a command

```bash
dpkg-query -S /usr/bin/column
```

Or, if the command is available:

```bash
dpkg-query -S "$(command -v column)"
```

This works when the file is owned by an installed Debian package. It may not identify commands that were installed manually or files that do not belong to a package.

### Check whether a package is installed

```bash
dpkg-query -W coreutils
```

If the package is not installed, `dpkg-query` may report that it is not known. You can also check package status with:

```bash
dpkg -s coreutils
```

### Find the package that provides a missing command

If `apt-file` is installed and its file index has been updated:

```bash
apt-file search /column
```

Install and update `apt-file` if needed:

```bash
sudo apt update
sudo apt install apt-file
sudo apt-file update
```

The package search index may need refreshing after repository changes.

### Package names versus project names

The package column in this guide identifies the Debian package expected to provide the utility. For example, **GNU Coreutils** is a software project, while **`coreutils`** is the Debian package name. Use `dpkg-query -S` to verify the package that owns a particular command on your installation.

---

## 2. Viewing and inspecting text files

### `cat`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Print files to the terminal or concatenate multiple files.

```bash
cat notes.txt
cat part1.txt part2.txt
```

Show line-ending characters and other non-printing characters:

```bash
cat -A notes.txt
```

**Tip:** `cat` is useful for short files. For long files, use a pager such as `less` if installed.

### `tac`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Print a file's lines in reverse order.

```bash
tac log.txt
```

This reverses the order of lines, not the characters within each line.

### `head`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Display the beginning of a file.

```bash
head notes.txt
head -n 5 notes.txt
```

The first command displays the first 10 lines by default. The second displays the first 5.

### `tail`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Display the end of a file.

```bash
tail notes.txt
tail -n 20 application.log
```

Follow a growing log file:

```bash
tail -f application.log
```

Press `Ctrl+C` to stop following the file.

### `file`

**Package:** `file`  
**Purpose:** Identify a file's likely type and encoding characteristics.

```bash
file notes.txt
file *
```

The result is an informed identification, not a guarantee that a file's contents are valid or safe.

### `less`

**Package:** `less`  
**Purpose:** Read long files one screen at a time.

```bash
less application.log
```

Useful keys include `/word` to search, `n` to move to the next match, and `q` to quit. The `less` package may not be installed on minimal systems.

---

## 3. Counting, numbering, and selecting lines

### `wc`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Count lines, words, bytes, or characters.

```bash
wc notes.txt
wc -l notes.txt
wc -w notes.txt
wc -c notes.txt
wc -m notes.txt
```

- `-l`: lines
- `-w`: words
- `-c`: bytes
- `-m`: characters, as interpreted using the current locale

A byte count and a character count can differ for UTF-8 text.

### `nl`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Add line numbers to text.

```bash
nl notes.txt
nl -ba notes.txt
```

By default, `nl` numbers non-empty lines. The `-ba` option numbers all lines.

### `cut`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Select characters, bytes, or delimiter-separated fields from each line.

```bash
cut -c 1-10 notes.txt
cut -d ':' -f 1 /etc/passwd
cut -d ',' -f 1,3 data.csv
```

- `-c`: select character positions
- `-d`: set a field delimiter
- `-f`: select fields

**CSV caution:** `cut` does not understand quoted CSV fields. A comma inside a quoted field can cause unexpected results.

### `paste`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Combine corresponding lines from files, separated by tabs by default.

```bash
paste first-names.txt last-names.txt
paste -d ',' first.txt second.txt
```

The files are combined line by line. `paste` does not perform a semantic join based on matching values; use `join` for that.

---

## 4. Sorting, comparing, and deduplicating

### `sort`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Sort lines in a text file.

```bash
sort names.txt
sort -r names.txt
sort -n numbers.txt
sort -u names.txt
```

- `-r`: reverse the sort order
- `-n`: compare values numerically
- `-u`: output only one line for each distinct sort key

Sort and save the result to a different file:

```bash
sort names.txt > names-sorted.txt
```

**Locale note:** Sorting order can vary with the current locale. For predictable byte-oriented sorting, you can use `LC_ALL=C sort names.txt`.

### `uniq`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Report or remove repeated adjacent lines.

```bash
uniq names-sorted.txt
uniq -c names-sorted.txt
uniq -d names-sorted.txt
```

- `-c`: prefix lines with their counts
- `-d`: show only repeated lines

`uniq` only detects adjacent duplicate lines. To find duplicates anywhere in a file, sort first:

```bash
sort names.txt | uniq
```

### `comm`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Compare two sorted files line by line.

```bash
comm first-sorted.txt second-sorted.txt
```

The output has three columns: lines unique to the first file, lines unique to the second file, and lines shared by both. Both input files should be sorted using compatible sorting rules.

### `join`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Combine lines from two sorted files using a matching field.

Example files, sorted by the first field:

`people.txt`:
```text
1 Alice
2 Bob
3 Carol
```

`scores.txt`:
```text
1 85
2 92
3 78
```

Join them:

```bash
join people.txt scores.txt
```

Example output:

```text
1 Alice 85
2 Bob 92
3 Carol 78
```

By default, `join` uses the first whitespace-separated field as the key. The input files must be sorted by the join field.

### `diff`

**Package:** `diffutils`  
**Purpose:** Show differences between two files.

```bash
diff old.txt new.txt
diff -u old.txt new.txt
```

The `-u` option produces a unified diff, a common format for reviewing changes and preparing patches.

### `cmp`

**Package:** `diffutils`  
**Purpose:** Compare two files byte by byte.

```bash
cmp first.bin second.bin
```

`cmp` is useful for checking whether two files are identical, including files that are not plain text.

### `diff3`

**Package:** `diffutils`  
**Purpose:** Compare three versions of a file.

```bash
diff3 original.txt version-a.txt version-b.txt
```

This is useful when reviewing changes made independently to a common original.

---

## 5. Combining and rearranging text

### `column`

**Package:** `bsdextrautils` (Debian package; verify on your system)  
**Purpose:** Format text into aligned columns or display delimited data in a table.

```bash
printf 'Name Age\nAlice 30\nBob 27\n' | column -t
```

Although this example uses a shell builtin, `printf` is outside the scope of this reference and is shown only to supply sample input. You can instead put the input in a file:

```text
Name Age
Alice 30
Bob 27
```

Then run:

```bash
column -t table.txt
```

For delimiter-separated input:

```bash
column -s ',' -t data.txt
```

`column` aligns fields for display; it is not a full CSV parser.

### `tee`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Write standard input to a file and also display it.

```bash
cat notes.txt | tee copy.txt
```

Write to a file while replacing its previous contents:

```bash
cat notes.txt | tee output.txt
```

Append instead of replacing:

```bash
cat notes.txt | tee -a output.txt
```

Be careful: without `-a`, `tee` overwrites the destination file.

### `tr`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Translate or delete individual characters in input.

Convert lowercase ASCII letters to uppercase:

```bash
cat names.txt | tr 'a-z' 'A-Z'
```

Replace tabs with spaces:

```bash
cat data.txt | tr '\t' ' '
```

Delete carriage-return characters:

```bash
cat windows-text.txt | tr -d '\r'
```

`tr` works on characters and character sets, not whole words or multi-character strings.

### `expand`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Convert tabs into spaces.

```bash
expand notes.txt
expand -t 4 notes.txt
```

The second example uses a tab stop of four columns.

### `unexpand`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Convert runs of spaces into tabs where possible.

```bash
unexpand notes.txt
unexpand -a notes.txt
```

With `-a`, spaces throughout each line are considered, rather than only leading whitespace.

### `fmt`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Reflow text paragraphs to a chosen line width.

```bash
fmt notes.txt
fmt -w 60 notes.txt
```

`fmt` is useful for wrapping prose. It is not appropriate for source code, tables, or formats where line breaks have meaning.

### `fold`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Wrap long lines at a selected width.

```bash
fold -w 80 notes.txt
fold -s -w 80 notes.txt
```

The `-s` option prefers breaking at spaces. Unlike `fmt`, `fold` wraps each input line independently.

### `shuf`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Randomize the order of lines.

```bash
shuf names.txt
shuf -n 5 names.txt
```

The second example selects five lines at random.

### `pr`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Prepare text for paginated or multi-column printing.

```bash
pr notes.txt
pr -2 names.txt
```

The `-2` option formats the file into two columns.

---

## 6. Formatting and transforming text

### `printf` is excluded

The `printf` command is intentionally excluded from this reference and should not be treated as a utility covered here. See the scope warning at the top of the document.

### `od`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Display file contents as octal, hexadecimal, or other representations.

```bash
od -c notes.txt
od -An -tx1 notes.txt
```

This can help reveal tabs, line endings, and other characters that are difficult to see.

### `hexdump`

**Package:** `bsdextrautils` (verify package ownership on your installation)  
**Purpose:** Display a file as hexadecimal and printable characters.

```bash
hexdump -C notes.txt
```

Useful for investigating invisible characters and binary file contents.

### `xxd`

**Package:** `xxd`  
**Purpose:** Display a hexadecimal dump of a file.

```bash
xxd notes.txt
xxd -g 1 notes.txt
```

The package is commonly named `xxd` on Debian. Check availability before using it.

### `base64`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Encode or decode data using Base64.

```bash
base64 image-data.bin
base64 -d encoded.txt
```

Base64 is an encoding, not encryption. It does not protect sensitive information.

### `rev`

**Package:** `util-linux` (verify package ownership on your installation)  
**Purpose:** Reverse the characters in each line.

```bash
rev words.txt
```

This reverses each line independently, rather than reversing the order of lines.

---

## 7. Splitting files

### `split`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Split a file into smaller pieces.

Split into chunks of 1,000 lines:

```bash
split -l 1000 large.txt chunk-
```

Split into chunks of 10 megabytes:

```bash
split -b 10M large.txt chunk-
```

The output files use names such as `chunk-aa`, `chunk-ab`, and so on.

### `csplit`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Split a file at lines matching a pattern or at specified line numbers.

```bash
csplit document.txt '/^Chapter 2/' '{*}'
```

This is an introductory example; `csplit` patterns and repeat expressions have additional rules. Check `man csplit` before using it on important files.

---

## 8. Editing files and applying changes

This section intentionally uses simple examples. Make a backup before changing important files, and check the command's manual if you are unsure about its behavior.

### `cp`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Copy a file, often to create a backup.

```bash
cp notes.txt notes.txt.bak
```

### `mv`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Move or rename a file.

```bash
mv draft.txt final.txt
```

If the destination exists, it may be overwritten. Use interactive mode to be prompted before overwriting:

```bash
mv -i draft.txt final.txt
```

### `touch`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Create an empty file if it does not exist, or update a file's timestamps.

```bash
touch new-notes.txt
```

If the file already exists, `touch` does not erase its contents.

### `patch`

**Package:** `patch`  
**Purpose:** Apply changes described in a patch file.

```bash
patch < changes.patch
```

A patch commonly contains changes created by `diff -u`. Apply patches in the correct directory and make sure the patch matches the version of the files you have. Back up important files first.

### `sponge`

**Package:** `moreutils`  
**Purpose:** Read all input before writing it to a destination file. This can avoid the common problem of truncating a file when a command reads from and writes to the same file.

Example: sort a file and replace it with the sorted result:

```bash
sort names.txt | sponge names.txt
```

**Availability:** `sponge` is not part of GNU Coreutils and may need to be installed. It is provided by Debian's `moreutils` package.

### `install`

**Package:** `coreutils` (GNU Coreutils)  
**Purpose:** Copy a file while setting permissions or creating destination directories.

```bash
install -m 644 notes.txt backup/notes.txt
```

The destination directory must exist for this example. Unlike the name might suggest, `install` is also a general-purpose file-copying utility; it is not only for installing software.

### Overwrite and append redirection

These are shell features rather than standalone commands, but they are important when working with text files.

```bash
cat notes.txt > copy.txt
cat more-notes.txt >> copy.txt
```

- `>` creates or replaces the destination file.
- `>>` creates the file if needed and appends to it.

**Warning:** Do not redirect output to the same file a command is reading unless you know the operation is safe. Shell redirection can truncate the destination before the command begins reading it.

---

## 9. Character encoding and line endings

### `iconv`

**Package:** `libc-bin` (verify with `dpkg-query -S "$(command -v iconv)"`)  
**Purpose:** Convert text between character encodings.

```bash
iconv -f ISO-8859-1 -t UTF-8 old.txt > new.txt
```

This reads text interpreted as ISO-8859-1 and writes UTF-8 output to a separate file. Confirm the input encoding first; guessing incorrectly can corrupt the resulting text.

### `dos2unix`

**Package:** `dos2unix`  
**Purpose:** Convert Windows-style CRLF line endings to Unix-style LF line endings.

```bash
dos2unix notes.txt
```

To keep the original file, make a copy first:

```bash
cp notes.txt notes.txt.bak
dos2unix notes.txt
```

### `unix2dos`

**Package:** `dos2unix`  
**Purpose:** Convert Unix-style LF line endings to Windows-style CRLF line endings.

```bash
unix2dos notes.txt
```

Both `dos2unix` and `unix2dos` are commonly supplied by the Debian `dos2unix` package.

### Check line endings

```bash
file notes.txt
cat -A notes.txt
od -c notes.txt
```

Windows CRLF line endings contain a carriage return (`\r`) followed by a line feed (`\n`). Unix-style line endings normally use only a line feed (`\n`).

---

## 10. Installing missing utilities

Refresh package metadata before installing software:

```bash
sudo apt update
```

Install one or more utilities by their Debian package names. Examples:

```bash
sudo apt install moreutils
sudo apt install dos2unix
sudo apt install xxd
```

You may already have some of these packages installed. To check a package:

```bash
dpkg-query -W moreutils
```

To check a command after installation:

```bash
command -v sponge
```

Only install packages from repositories you trust. You do not need to install every utility in this guide; choose the ones that fit your workflow.

---

## 11. Common pitfalls and safe habits

- **Back up important files** before applying patches or making changes.
- **Understand overwrite versus append.** `>` replaces a file; `>>` appends to it.
- **Avoid reading and overwriting the same file in one redirection.** Use a temporary file or `sponge` where appropriate.
- **Quote filenames containing spaces.** For example: `cat "meeting notes.txt"`.
- **Remember that `uniq` checks adjacent lines only.** Sort first if you want to identify duplicates anywhere in a file.
- **Be careful with CSV.** `cut` and `column` do not fully parse CSV quoting rules.
- **Check the locale when sorting.** Results can differ between locales.
- **Keep encodings in mind.** UTF-8 characters may occupy multiple bytes, so byte counts and character counts can differ.
- **Check line endings when files behave unexpectedly.** Files edited on Windows may use CRLF endings.
- **Test on sample data first.** Small test files are a good way to understand a command before using it on important data.
- **Read the manual when needed.** `man command-name` opens the manual page if it is installed.

---

## 12. Quick command index

| Command | Debian package | Main use |
|---|---|---|
| `base64` | `coreutils` | Encode/decode Base64 |
| `cat` | `coreutils` | Display or concatenate files |
| `column` | `bsdextrautils` | Format text in columns |
| `comm` | `coreutils` | Compare sorted files |
| `cp` | `coreutils` | Copy files |
| `csplit` | `coreutils` | Split at patterns or line positions |
| `cut` | `coreutils` | Select fields or character positions |
| `diff` | `diffutils` | Compare text files |
| `diff3` | `diffutils` | Compare three file versions |
| `dos2unix` | `dos2unix` | Convert CRLF to LF |
| `expand` | `coreutils` | Convert tabs to spaces |
| `file` | `file` | Identify file type |
| `fold` | `coreutils` | Wrap long lines |
| `fmt` | `coreutils` | Reflow paragraphs |
| `head` | `coreutils` | Display the start of a file |
| `hexdump` | `bsdextrautils` | Show hexadecimal contents |
| `iconv` | `libc-bin` | Convert character encodings |
| `install` | `coreutils` | Copy files and set permissions |
| `join` | `coreutils` | Join sorted files by a field |
| `less` | `less` | Page through text |
| `mv` | `coreutils` | Move or rename files |
| `nl` | `coreutils` | Number lines |
| `od` | `coreutils` | Display character/byte representations |
| `paste` | `coreutils` | Combine corresponding lines |
| `patch` | `patch` | Apply a patch |
| `pr` | `coreutils` | Format for paginated printing |
| `rev` | `util-linux` | Reverse each line's characters |
| `shuf` | `coreutils` | Shuffle lines |
| `sort` | `coreutils` | Sort lines |
| `split` | `coreutils` | Split files into pieces |
| `sponge` | `moreutils` | Safely collect input before writing |
| `tac` | `coreutils` | Reverse line order |
| `tail` | `coreutils` | Display the end of a file |
| `tee` | `coreutils` | Write input to a file and the terminal |
| `touch` | `coreutils` | Create files/update timestamps |
| `tr` | `coreutils` | Translate or delete characters |
| `unexpand` | `coreutils` | Convert spaces to tabs |
| `unix2dos` | `dos2unix` | Convert LF to CRLF |
| `uniq` | `coreutils` | Handle adjacent duplicate lines |
| `wc` | `coreutils` | Count lines, words, bytes, or characters |
| `xxd` | `xxd` | Hexadecimal dump |

For any command, verify availability with `command -v command-name` and check its package ownership with `dpkg-query -S "$(command -v command-name)"`.
