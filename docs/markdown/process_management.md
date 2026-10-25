---
layout: sheet
title: "Linux Process Management Cheat Sheet"
category: "System"
summary: "Inspect, control, prioritize, and troubleshoot processes on Debian."
date: 2026-10-24 20:06:39
permalink: /html/process_management.html
---
# Linux Process Management Cheat Sheet

A practical command reference for inspecting, controlling, prioritizing, and troubleshooting processes on Debian 13 and similar Linux distributions.

> **Caution:** Terminating or changing the priority of the wrong process can interrupt applications or system services. Identify the process carefully, try normal termination first, and use `sudo` only when necessary.

## Table of contents

- [1. What is a process?](#1-what-is-a-process)
- [2. View running processes](#2-view-running-processes)
- [3. Find a process](#3-find-a-process)
- [4. Understand process IDs and relationships](#4-understand-process-ids-and-relationships)
- [5. Monitor processes interactively](#5-monitor-processes-interactively)
- [6. Start programs and manage the shell](#6-start-programs-and-manage-the-shell)
- [7. Stop and signal processes](#7-stop-and-signal-processes)
- [8. Manage jobs in the current shell](#8-manage-jobs-in-the-current-shell)
- [9. Process priority with nice and renice](#9-process-priority-with-nice-and-renice)
- [10. CPU and memory usage](#10-cpu-and-memory-usage)
- [11. Services and systemd processes](#11-services-and-systemd-processes)
- [12. Inspect open files and network sockets](#12-inspect-open-files-and-network-sockets)
- [13. Process limits and resource control](#13-process-limits-and-resource-control)
- [14. Troubleshooting common process problems](#14-troubleshooting-common-process-problems)
- [15. Useful process signals](#15-useful-process-signals)
- [16. Practical examples](#16-practical-examples)
- [17. Quick reference](#17-quick-reference)

---

## 1. What is a process?

A **process** is a running instance of a program. Each process has a process ID (PID), and may have a parent process ID (PPID). A process can create child processes, open files, use memory, consume CPU time, and communicate with other processes.

Related terms:

- **Program:** a file containing instructions, such as `/usr/bin/python3`.
- **Process:** a running instance of a program.
- **Thread:** a unit of execution within a process. Threads share much of the process's memory and resources.
- **PID:** a unique process identifier while that process exists.
- **PPID:** the PID of a process's parent.
- **Daemon/service:** a background process, often managed by systemd.
- **Job:** a process or pipeline managed by the current shell's job-control features.

## 2. View running processes

### Show processes in a full-format listing

```bash
ps
ps -ef
ps aux
```

- `ps` by itself usually shows processes associated with the current terminal.
- `ps -ef` shows a full-format listing of processes.
- `ps aux` is a common BSD-style format showing processes from all users, including CPU and memory percentages.

These are alternative formats; the options are not meant to be combined arbitrarily.

### Select useful columns

```bash
ps -eo pid,ppid,user,stat,%cpu,%mem,etime,cmd
```

This displays PID, parent PID, user, process state, CPU percentage, memory percentage, elapsed time, and command.

Show a specific process:

```bash
ps -p 1234 -o pid,ppid,user,stat,%cpu,%mem,etime,cmd
```

Replace `1234` with the PID you want to inspect.

### Show a process tree

```bash
pstree
pstree -p
pstree -ap
```

- `-p` displays PIDs.
- `-a` includes command-line arguments.

Install `pstree` if it is not available:

```bash
sudo apt update
sudo apt install psmisc
```

### Sort processes by CPU or memory

```bash
ps -eo pid,comm,%cpu,%mem --sort=-%cpu | head
ps -eo pid,comm,%cpu,%mem --sort=-%mem | head
```

The leading minus sign sorts from highest to lowest. These commands show a snapshot, not a continuously updating view.

## 3. Find a process

### Search process listings with pgrep

```bash
pgrep firefox
pgrep -a firefox
pgrep -af 'python.*server.py'
```

- `pgrep` searches process names.
- `-a` shows the command line.
- `-f` matches against the full command line.

Be precise with patterns: broad matches can include unrelated processes.

### Search by command name

```bash
ps aux | grep '[n]ginx'
```

The bracket pattern helps avoid matching the `grep` command itself. For most simple searches, `pgrep` is cleaner.

### Find the executable path

```bash
readlink -f /proc/1234/exe
```

Replace `1234` with the PID. Access may be restricted for processes owned by another user.

### Show a process's command line

```bash
tr '\0' ' ' < /proc/1234/cmdline
echo
```

Linux exposes process details through `/proc`. The command line can contain sensitive values, so avoid sharing its output if it includes tokens or passwords.

## 4. Understand process IDs and relationships

### Show PID and parent PID

```bash
ps -eo pid,ppid,comm
```

The PPID helps you see which process started another process.

### Inspect a process's status

```bash
grep -E '^(Name|State|Pid|PPid|Threads|VmRSS|VmSize):' /proc/1234/status
```

- `VmRSS` is resident memory currently held in RAM.
- `VmSize` is the process's virtual address-space size; it is not the same as physical RAM usage.
- `Threads` reports the number of threads.

### Process states

Common state letters in `ps` include:

| State | Meaning |
|---|---|
| `R` | Running or runnable |
| `S` | Interruptible sleep, waiting for an event |
| `D` | Uninterruptible sleep, often waiting on I/O |
| `T` | Stopped or job-control stopped |
| `Z` | Zombie: exited, but not yet reaped by its parent |
| `I` | Idle kernel thread on systems that display this state |

A process in `D` state may not respond to ordinary signals until the kernel operation it is waiting on finishes. A zombie has already exited and does not consume CPU like a running process; its parent normally needs to collect its exit status.

## 5. Monitor processes interactively

### top

```bash
top
```

Useful keys while `top` is open:

| Key | Action |
|---|---|
| `q` | Quit |
| `P` | Sort by CPU usage |
| `M` | Sort by memory usage |
| `k` | Send a signal to a process |
| `1` | Toggle per-CPU core display |
| `h` | Help |

Pressing `k` can terminate a process, so confirm the PID and signal before proceeding.

### htop

`htop` provides a more interactive process viewer.

```bash
sudo apt install htop
htop
```

Use the interface to sort, search, inspect, and signal processes. It can run without root, but some details about other users' processes may be unavailable.

### Watch a command repeatedly

```bash
watch -n 2 'ps -eo pid,comm,%cpu,%mem --sort=-%cpu | head'
```

`watch` reruns the command every two seconds. Press `Ctrl+C` to stop `watch`; it does not terminate the listed processes.

## 6. Start programs and manage the shell

### Run a program normally

```bash
sleep 300
```

The shell waits until the foreground command exits or is stopped.

### Run a program in the background

```bash
sleep 300 &
```

The `&` runs the job in the background of the current shell. It is still associated with that shell and may not survive logout.

### Redirect output

```bash
long-command > output.log 2>&1 &
```

- `>` redirects standard output to a file, replacing its previous contents.
- `2>&1` sends standard error to the same destination as standard output.
- `&` starts the command in the background.

Append instead of replacing:

```bash
long-command >> output.log 2>&1 &
```

### Keep a command running after logout with nohup

```bash
nohup long-command > output.log 2>&1 &
```

`nohup` makes the command ignore the hangup signal in the usual case. It does not provide service supervision, automatic restart, or full process management. For long-running services, use systemd or a suitable process manager.

### Detach from a terminal session

For interactive long-running terminal work, tools such as `tmux` or `screen` let you detach and reconnect later:

```bash
sudo apt install tmux
tmux
```

Detach with `Ctrl+B`, then `D`. Reattach with:

```bash
tmux attach
```

## 7. Stop and signal processes

Linux signals ask a process to take an action. Prefer a graceful signal before forcing termination.

### Send SIGTERM by PID

```bash
kill 1234
kill -TERM 1234
```

`kill` sends `SIGTERM` by default. It asks the process to exit and gives it an opportunity to clean up.

### Send SIGINT

```bash
kill -INT 1234
```

This is similar to the interrupt commonly sent by pressing `Ctrl+C` in a terminal, though application behavior can differ.

### Force termination with SIGKILL

```bash
kill -KILL 1234
```

Use this only if a process will not exit after reasonable attempts. `SIGKILL` cannot be caught or handled, so the program cannot perform its own cleanup. It also cannot immediately remove a process stuck in uninterruptible kernel sleep.

### Send a signal by process name

```bash
pkill -TERM process_name
```

Use a precise process name or pattern. Preview matching PIDs first:

```bash
pgrep -a process_name
```

### Stop all matching processes

```bash
killall process_name
```

`killall` can affect every matching process name visible to the command, depending on options and permissions. Verify the target first; do not use it casually with common names.

### List available signals

```bash
kill -l
```

### Check whether a PID still exists

```bash
kill -0 1234
```

Signal `0` does not send a terminating signal. It checks whether the process exists and whether you have permission to signal it. A successful result does not guarantee that the process is healthy.

## 8. Manage jobs in the current shell

Shell job control is different from system-wide process management.

### List jobs started by the current shell

```bash
jobs
jobs -l
```

### Suspend a foreground job

Press:

```text
Ctrl+Z
```

This stops the foreground job; it does not terminate it.

### Resume a stopped job in the background

```bash
bg
bg %1
```

### Bring a job to the foreground

```bash
fg
fg %1
```

`%1` is job number 1 from the current shell's `jobs` listing, not PID 1.

### Terminate a shell job

```bash
kill %1
```

If needed, use `jobs -l` to identify its PID and then signal it. Jobs started in another shell are not normally listed by the current shell's `jobs` command.

## 9. Process priority with nice and renice

Linux scheduling priority can influence how CPU time is shared among runnable processes.

### Start a command with a changed nice value

```bash
nice -n 10 command
```

Nice values usually range from `-20` (higher scheduling priority) to `19` (lower scheduling priority). A higher nice value makes a process “nicer” to other processes by reducing its scheduling priority.

### Change an existing process's nice value

```bash
renice 10 -p 1234
```

Increasing the nice value generally lowers priority. Lowering a nice value to raise priority typically requires root privileges or appropriate capabilities.

### Check a process's nice value

```bash
ps -o pid,ni,pri,comm -p 1234
```

Nice values affect CPU scheduling, not the process's memory limit or disk priority. They also do not guarantee a fixed amount of CPU time.

## 10. CPU and memory usage

### Memory overview

```bash
free -h
```

This shows system memory and swap usage. The `available` column is often more useful than `free` alone when judging how much memory can be used without swapping.

### Per-process CPU and memory snapshot

```bash
ps -eo pid,comm,%cpu,%mem,rss,vsz --sort=-%mem | head
```

- `%CPU`: CPU use as reported by `ps`; interpretation can depend on elapsed time and tool conventions.
- `%MEM`: approximate share of physical RAM.
- `RSS`: resident memory in KiB.
- `VSZ`: virtual address-space size in KiB.

### See CPU and memory pressure

```bash
uptime
vmstat 2
```

`uptime` shows load averages. `vmstat 2` updates every two seconds; the first report often summarizes averages since boot, so use later lines to assess current behavior.

Load average is not a CPU percentage. It reflects tasks running or waiting in uninterruptible sleep, so high load can indicate CPU pressure, storage delays, or both.

### Check for out-of-memory events

```bash
journalctl -k | grep -i -E 'out of memory|oom-killer|killed process'
```

The system may have limited or rotated logs. An OOM event can cause the kernel to terminate a process when memory pressure becomes severe.

## 11. Services and systemd processes

A system service is usually managed by systemd rather than by manually killing its PID.

### Show service status

```bash
systemctl status ssh
```

Replace `ssh` with the relevant service unit name.

### Start, stop, restart, or reload a service

```bash
sudo systemctl start SERVICE
sudo systemctl stop SERVICE
sudo systemctl restart SERVICE
sudo systemctl reload SERVICE
```

Replace `SERVICE` with the actual unit name. `reload` asks a service to reread its configuration if it supports that operation; it is not available for every service.

### Enable or disable service startup at boot

```bash
sudo systemctl enable SERVICE
sudo systemctl disable SERVICE
```

Enabling a service generally configures it to start automatically; it does not necessarily start it immediately. Use `enable --now` to enable and start it together.

### Find a service's main PID

```bash
systemctl show -p MainPID SERVICE
```

### Read service logs

```bash
journalctl -u SERVICE
journalctl -u SERVICE -b
journalctl -u SERVICE -f
```

- `-b`: logs from the current boot.
- `-f`: follow new log entries.

For a systemd-managed service, use `systemctl stop` or restart the service rather than killing its process directly. Otherwise, systemd may restart it or the service may be left in an unexpected state.

## 12. Inspect open files and network sockets

### See files opened by a process

```bash
sudo lsof -p 1234
```

`lsof` lists open files, which on Linux include regular files, directories, devices, pipes, and sockets.

Install it if needed:

```bash
sudo apt install lsof
```

### Find which process uses a file or directory

```bash
sudo lsof /path/to/file
sudo fuser -v /path/to/file
```

For a mount point that will not unmount:

```bash
sudo fuser -vm /mnt/data
```

### Find processes listening on network ports

```bash
sudo ss -ltnp
sudo ss -lunp
```

- `-l`: listening sockets.
- `-t`: TCP.
- `-u`: UDP.
- `-n`: numeric addresses and ports.
- `-p`: show process information when permissions allow.

Example: inspect what is listening on TCP port 8080:

```bash
sudo ss -ltnp 'sport = :8080'
```

A process listening on a port is not automatically exposed to the internet; routing, firewall rules, and network configuration also matter.

## 13. Process limits and resource control

### Show the current shell's resource limits

```bash
ulimit -a
```

This reports limits such as open files and maximum user processes for the shell and its children.

Set a limit for commands launched from the current shell, where supported:

```bash
ulimit -n 4096
```

This example changes the shell's soft limit for open file descriptors. It does not retroactively change every running process or configure the limit system-wide.

### Show a process's limits

```bash
cat /proc/1234/limits
```

### Count a process's open file descriptors

```bash
ls /proc/1234/fd | wc -l
```

Access may be restricted for processes owned by other users.

### systemd resource controls

Systemd units can be configured with controls such as `CPUQuota=`, `MemoryMax=`, and `TasksMax=`. These are typically set in a service unit or drop-in override and should be chosen based on the service's requirements. Check the systemd documentation before applying limits to critical services.

## 14. Troubleshooting common process problems

### A program is using too much CPU

1. Identify the process:

   ```bash
   ps -eo pid,ppid,comm,%cpu,%mem,etime --sort=-%cpu | head
   ```

2. Inspect it:

   ```bash
   ps -p 1234 -o pid,ppid,user,stat,%cpu,%mem,etime,cmd
   ```

3. Check its logs if it is a service.
4. Stop it gracefully or adjust its priority only if you understand its role.

### A program is using too much memory

```bash
ps -eo pid,comm,%mem,rss,vsz --sort=-%mem | head
free -h
```

Check whether memory use is growing over time. High memory use is not automatically a leak; applications may cache data intentionally.

### A process will not terminate

Try a graceful termination first:

```bash
kill -TERM 1234
```

Check again:

```bash
ps -p 1234 -o pid,stat,cmd
```

Only if appropriate, escalate:

```bash
kill -KILL 1234
```

If the process is in `D` state, investigate the underlying I/O or device issue. `SIGKILL` cannot immediately interrupt an uninterruptible kernel wait.

### A process is a zombie

```bash
ps -eo pid,ppid,stat,cmd | awk '$3 ~ /Z/'
```

A zombie has already exited. You generally cannot fix it by killing the zombie itself. Its parent needs to collect its exit status. Investigate the parent PID and the program responsible; restarting a parent service may be appropriate only after understanding the impact.

### A port is already in use

```bash
sudo ss -ltnp 'sport = :8080'
```

Identify the process and service before stopping anything. If the process belongs to a systemd service, manage the service with systemd.

### A command runs in the background but disappears after logout

For a simple one-off command, `nohup` may help. For interactive sessions, use `tmux` or `screen`. For a persistent application, create or use a proper systemd service rather than relying on a shell session.

## 15. Useful process signals

| Signal | Common name | Typical meaning |
|---|---|---|
| `1` | `SIGHUP` | Hangup; applications may reload configuration or exit |
| `2` | `SIGINT` | Interrupt, commonly from `Ctrl+C` |
| `9` | `SIGKILL` | Force termination; cannot be caught or handled |
| `15` | `SIGTERM` | Request graceful termination; default for `kill` |
| `18` | `SIGCONT` | Continue a stopped process |
| `19` | `SIGSTOP` | Stop a process; cannot be caught or handled |
| `20` | `SIGTSTP` | Terminal stop, commonly from `Ctrl+Z` |

Signal numbers and some details can vary across Unix-like systems. Prefer names such as `TERM` and `KILL` for readability:

```bash
kill -TERM 1234
kill -KILL 1234
```

## 16. Practical examples

### Example A: find the most CPU-intensive processes

```bash
ps -eo pid,user,comm,%cpu,%mem,etime --sort=-%cpu | head -n 11
```

### Example B: locate and inspect a Python server

```bash
pgrep -af 'python.*server.py'
ps -p 1234 -o pid,ppid,user,stat,%cpu,%mem,cmd
```

Replace `1234` with the PID found in the first command.

### Example C: stop a process gracefully

```bash
pgrep -a PROGRAM_NAME
kill -TERM 1234
sleep 2
ps -p 1234
```

Replace `PROGRAM_NAME` and `1234` with the intended target. If it is a service, prefer `systemctl stop SERVICE`.

### Example D: run a long command with a log file

```bash
nohup ./long-task.sh > long-task.log 2>&1 &
echo $!
```

`$!` prints the PID of the most recently backgrounded command in the current shell. This is useful for tracking the process you just started.

### Example E: lower a CPU-intensive job's priority

```bash
nice -n 10 ./cpu-heavy-task
```

For an existing process:

```bash
renice 10 -p 1234
```

### Example F: find the process using a port

```bash
sudo ss -ltnp 'sport = :3000'
```

This is useful when a development server reports that the port is already in use.

### Example G: inspect a systemd service's logs and process

```bash
systemctl status nginx
systemctl show -p MainPID nginx
journalctl -u nginx -b --no-pager
```

Replace `nginx` with the service you are investigating.

## 17. Quick reference

| Task | Command |
|---|---|
| List all processes | `ps -ef` |
| Show detailed process list | `ps aux` |
| Sort by CPU | `ps -eo pid,comm,%cpu --sort=-%cpu \| head` |
| Sort by memory | `ps -eo pid,comm,%mem --sort=-%mem \| head` |
| Find by name | `pgrep -a NAME` |
| Search full command lines | `pgrep -af PATTERN` |
| Show process tree | `pstree -p` |
| Monitor interactively | `top` or `htop` |
| Terminate gracefully | `kill -TERM PID` |
| Force termination | `kill -KILL PID` |
| List current shell jobs | `jobs -l` |
| Resume a job in background | `bg %1` |
| Bring a job to foreground | `fg %1` |
| Start with lower CPU priority | `nice -n 10 COMMAND` |
| Change nice value | `renice 10 -p PID` |
| Check memory | `free -h` |
| Inspect open files | `sudo lsof -p PID` |
| Find listening TCP ports | `sudo ss -ltnp` |
| Inspect a service | `systemctl status SERVICE` |
| Read service logs | `journalctl -u SERVICE -b` |
| Show resource limits | `ulimit -a` |

---

**Recommended habit:** inspect before acting. Use `ps`, `pgrep`, `top`, or `htop` to identify the process, understand whether it is an ordinary program or a system service, and try graceful shutdown before resorting to `SIGKILL`.
