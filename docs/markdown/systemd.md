---
layout: sheet
title: "systemd Cheat Sheet for Debian 13"
category: "System"
summary: "Manage services, units, logs, timers, and startup behavior with systemd."
date: 2026-10-24 20:09:46
permalink: /html/systemd.html
---
# systemd Cheat Sheet for Debian 13

A practical guide to managing services, units, logs, timers, dependencies, and startup behavior with systemd on Debian 13 and similar Linux systems.

> **Caution:** Changing or disabling system units can affect boot, networking, login, and other essential services. Inspect a unit before changing it, keep a working administrative session open, and verify changes before rebooting.

## Table of contents

- [1. What is systemd?](#1-what-is-systemd)
- [2. Check systemd and system status](#2-check-systemd-and-system-status)
- [3. Understand units](#3-understand-units)
- [4. Manage services with systemctl](#4-manage-services-with-systemctl)
- [5. Enable services at boot](#5-enable-services-at-boot)
- [6. Inspect unit files and properties](#6-inspect-unit-files-and-properties)
- [7. Read logs with journalctl](#7-read-logs-with-journalctl)
- [8. Create a custom service](#8-create-a-custom-service)
- [9. Service dependencies and ordering](#9-service-dependencies-and-ordering)
- [10. systemd timers](#10-systemd-timers)
- [11. Mount and automount units](#11-mount-and-automount-units)
- [12. Targets and boot behavior](#12-targets-and-boot-behavior)
- [13. Resource controls and restart policies](#13-resource-controls-and-restart-policies)
- [14. Environment variables and drop-in overrides](#14-environment-variables-and-drop-in-overrides)
- [15. Troubleshooting systemd](#15-troubleshooting-systemd)
- [16. Safe administration habits](#16-safe-administration-habits)
- [17. Quick reference](#17-quick-reference)

---

## 1. What is systemd?

`systemd` is the system and service manager used by Debian 13 by default. It starts and supervises services, manages dependencies, records logs through the journal, and supports timers, mounts, sockets, and other system resources.

Common related commands:

- `systemctl`: inspect and control units.
- `journalctl`: read logs from the systemd journal.
- `systemd-analyze`: inspect boot performance and unit timing.
- `systemd-escape`: convert paths or strings into valid systemd unit names.
- `loginctl`: inspect login sessions and seats.
- `timedatectl`: inspect or configure time settings.
- `hostnamectl`: inspect or configure hostname settings.

Check whether PID 1 is systemd:

```bash
ps -p 1 -o pid,comm,args
systemctl --version
```

## 2. Check systemd and system status

### General system status

```bash
systemctl status
systemctl is-system-running
```

`is-system-running` may report `running`, `degraded`, `starting`, or another state. `degraded` usually means at least one unit has failed; it does not necessarily mean the whole machine is unusable.

### List failed units

```bash
systemctl --failed
```

Inspect each failed unit with `systemctl status UNIT` and read its logs before deciding what to do.

### List currently active units

```bash
systemctl list-units
systemctl list-units --type=service
systemctl list-units --state=failed
```

By default, `list-units` focuses on units systemd has loaded. It is not a complete list of every installed unit file.

### List installed unit files

```bash
systemctl list-unit-files
systemctl list-unit-files --type=service
```

This shows unit files known to systemd and their enablement states. A unit being `enabled` does not mean it is currently running.

## 3. Understand units

A **unit** is a resource or action managed by systemd. Common unit types include:

| Type | Purpose | Example |
|---|---|---|
| `.service` | A service or program | `ssh.service` |
| `.timer` | Schedule a unit to run | `logrotate.timer` |
| `.mount` | Mount a filesystem | `mnt-data.mount` |
| `.automount` | Mount on first access | `mnt-data.automount` |
| `.socket` | Socket activation | `cups.socket` |
| `.target` | Group units into a system state | `multi-user.target` |
| `.path` | Activate a unit when a path changes | `some-path.path` |
| `.slice` | Group processes for resource management | `system.slice` |

Units often have dependencies and ordering relationships. For example, a service may require networking or a mounted filesystem.

### Unit states are different concepts

- **Active/running:** the service is currently running.
- **Inactive/dead:** the unit is not currently active.
- **Failed:** systemd considers the unit to have failed.
- **Enabled:** configured to start through its install relationships, often at boot.
- **Disabled:** not enabled through those relationships.
- **Static:** cannot normally be enabled directly because it has no install section; another unit may start it.
- **Masked:** starts are blocked by linking the unit to `/dev/null`.

A service can be enabled but inactive, or disabled but running. Always check both runtime status and enablement.

## 4. Manage services with systemctl

Use the unit name, such as `ssh.service`. For many commands, the `.service` suffix can be omitted.

### Check service status

```bash
systemctl status ssh
systemctl is-active ssh
systemctl is-failed ssh
```

`status` provides a summary and recent logs. `is-active` and `is-failed` are useful in scripts because they return an exit status.

### Start, stop, restart, and reload

```bash
sudo systemctl start SERVICE
sudo systemctl stop SERVICE
sudo systemctl restart SERVICE
sudo systemctl reload SERVICE
```

Replace `SERVICE` with the actual unit name.

- `start`: start the unit now.
- `stop`: stop the unit now.
- `restart`: stop and start the unit again.
- `reload`: ask the service to reload its configuration without a full restart, if supported.

Not all services support reload. If reload is unsupported, systemd reports an error. Read the service documentation before choosing between reload and restart.

### Reload systemd's unit-file configuration

```bash
sudo systemctl daemon-reload
```

This makes systemd reread unit definitions after unit files or drop-in overrides change. It does **not** reload the application's own configuration and does not automatically restart the service.

### Reset a failed state

```bash
sudo systemctl reset-failed SERVICE
```

This clears the recorded failed state and may reset start-rate limiting counters. It does not fix the underlying problem. Review logs first.

## 5. Enable services at boot

### Enable a service

```bash
sudo systemctl enable SERVICE
```

This configures the unit to be started through its install relationships. It does not necessarily start the service immediately.

### Enable and start now

```bash
sudo systemctl enable --now SERVICE
```

This enables the service and starts it immediately.

### Disable a service

```bash
sudo systemctl disable SERVICE
```

This removes enablement links. It does not necessarily stop a service that is currently running.

### Stop and disable

```bash
sudo systemctl disable --now SERVICE
```

This disables the service and stops it now.

### Mask and unmask

```bash
sudo systemctl mask SERVICE
sudo systemctl unmask SERVICE
```

Masking is stronger than disabling: it prevents the unit from being started through normal systemd activation while masked. Use it carefully, as other services may depend on the unit. Do not mask essential system services without understanding the consequences.

### Check enablement state

```bash
systemctl is-enabled SERVICE
systemctl list-unit-files --type=service
```

Possible results include `enabled`, `disabled`, `static`, `masked`, or `indirect`.

## 6. Inspect unit files and properties

### Show the unit's definition

```bash
systemctl cat SERVICE
```

This prints the main unit file and any drop-in configuration files.

### Show the loaded unit file path

```bash
systemctl show -p FragmentPath SERVICE
```

### Inspect selected properties

```bash
systemctl show SERVICE
systemctl show -p ActiveState,SubState,UnitFileState,MainPID SERVICE
systemctl show -p Wants,Requires,After,Before SERVICE
```

- `Requires=` and `Wants=` describe dependency relationships.
- `After=` and `Before=` describe ordering.
- Dependency and ordering are not the same: `After=` alone does not necessarily cause another unit to start.

### List dependencies

```bash
systemctl list-dependencies SERVICE
systemctl list-dependencies --reverse SERVICE
```

The reverse view helps show which units depend on the selected unit.

### Check when a unit started

```bash
systemctl show -p ActiveEnterTimestamp SERVICE
```

## 7. Read logs with journalctl

`journalctl` queries logs collected by the systemd journal.

### View recent system logs

```bash
journalctl
journalctl -b
journalctl -b -p warning
```

- `-b`: current boot.
- `-p warning`: warning priority and more severe messages.
- `-b -1`: previous boot, if its logs were retained.

### Read logs for a service

```bash
journalctl -u ssh
journalctl -u ssh -b
journalctl -u ssh --since "1 hour ago"
```

### Follow logs live

```bash
journalctl -u SERVICE -f
```

Press `Ctrl+C` to stop following logs. This stops the log viewer, not the service.

### Limit output

```bash
journalctl -u SERVICE -n 50
journalctl -u SERVICE --no-pager
journalctl -u SERVICE -o short-iso
```

- `-n 50`: show the last 50 entries.
- `--no-pager`: print directly without opening a pager.
- `-o short-iso`: use a timestamp format suitable for logs.

### Logs for the current boot and previous boots

```bash
journalctl --list-boots
journalctl -b -1
```

Previous-boot logs may not be available if persistent journal storage is not configured or logs have been cleaned up.

### Kernel logs

```bash
journalctl -k
journalctl -k -p warning
```

These are useful for investigating hardware, storage, network driver, and kernel issues.

### Disk usage and cleanup

```bash
journalctl --disk-usage
```

To vacuum old journal data, for example retaining at most 500 MB:

```bash
sudo journalctl --vacuum-size=500M
```

Vacuuming permanently removes archived journal data. Do not clean logs before collecting the information needed for troubleshooting or an investigation.

## 8. Create a custom service

A systemd service is a good way to run a script or application reliably without depending on an interactive terminal.

This example runs a local script located at `/usr/local/bin/example-task.sh` as a dedicated, unprivileged account named `exampleuser`. Create the account and script according to your requirements before enabling the service.

### Example service file

Create the unit:

```bash
sudo vim /etc/systemd/system/example-task.service
```

Example contents:

```ini
[Unit]
Description=Example background task
After=network.target

[Service]
Type=simple
User=exampleuser
Group=exampleuser
ExecStart=/usr/local/bin/example-task.sh
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

Important fields:

- `Description=`: human-readable description.
- `After=`: ordering relationship; it does not by itself pull in the named unit.
- `Type=simple`: systemd considers the service started when the process is launched.
- `User=` and `Group=`: run the process without root privileges when possible.
- `ExecStart=`: absolute path to the executable or script.
- `Restart=on-failure`: restart after certain failures, but not every clean exit.
- `RestartSec=`: delay before restart attempts.
- `WantedBy=multi-user.target`: allows the service to be enabled for a typical multi-user boot.

The script must be executable and accessible to the service account:

```bash
sudo chmod 755 /usr/local/bin/example-task.sh
```

Use an absolute path in `ExecStart`. systemd does not run commands through a shell by default, so shell syntax such as `>`, pipes, and `&&` will not work there unless you explicitly invoke a shell. Prefer logging to the journal or using an application-specific log configuration.

### Load, start, and enable the service

```bash
sudo systemctl daemon-reload
sudo systemctl start example-task.service
systemctl status example-task.service
journalctl -u example-task.service -n 50
```

If it behaves correctly, enable it at boot:

```bash
sudo systemctl enable example-task.service
```

Or enable and start it together:

```bash
sudo systemctl enable --now example-task.service
```

### Test changes

After editing the unit file:

```bash
sudo systemctl daemon-reload
sudo systemctl restart example-task.service
systemctl status example-task.service
journalctl -u example-task.service -b --no-pager
```

If the service fails, inspect the error before repeatedly restarting it.

### Choosing a service type

- `simple`: common for a foreground process.
- `exec`: similar to `simple`, but systemd waits until the program has been executed successfully before considering startup successful; supported by modern systemd.
- `oneshot`: for a task that runs and exits, such as a maintenance script.
- `notify`: for programs that explicitly notify systemd when they are ready.
- `forking`: for traditional programs that fork into the background; usually better to configure the program to stay in the foreground if possible.

Avoid `Type=forking` unless the application is designed for that behavior and its process tracking is configured appropriately.

## 9. Service dependencies and ordering

Systemd uses separate concepts for dependencies and ordering.

- `Wants=other.service`: weak dependency; attempts to start the other unit.
- `Requires=other.service`: stronger dependency; generally pulls in the other unit and can affect the dependent unit if the required unit fails or stops.
- `After=other.service`: order this unit after the other unit if both are being started.
- `Before=other.service`: order this unit before the other unit if both are being started.
- `PartOf=other.service`: propagates certain stop/restart operations from another unit.
- `BindsTo=other.service`: stronger lifecycle relationship, useful only for specific dependency designs.

Example:

```ini
[Unit]
Description=Application requiring a mounted data directory
Requires=mnt-data.mount
After=mnt-data.mount
```

This states that the application requires the mount unit and should start after it. The mount unit name must match the actual mount point. For `/mnt/data`, the conventional unit name is `mnt-data.mount`.

`network.target` does not necessarily mean the network is fully configured and online. Services that truly require configured network connectivity may need `network-online.target` and the appropriate wait-online service for the active network manager. Use this only when required; it can delay boot.

## 10. systemd timers

Timers schedule units, often service units. They can replace many cron jobs and integrate with systemd logging and dependencies.

A timer normally uses two files with matching base names:

- `example-task.service`: the command to run.
- `example-task.timer`: when to run it.

### Example: run a script daily

Create the service:

```bash
sudo vim /etc/systemd/system/daily-example.service
```

Example contents:

```ini
[Unit]
Description=Run daily example task

[Service]
Type=oneshot
ExecStart=/usr/local/bin/daily-example.sh
```

Create the timer:

```bash
sudo vim /etc/systemd/system/daily-example.timer
```

Example contents:

```ini
[Unit]
Description=Run example task daily

[Timer]
OnCalendar=*-*-* 03:00:00
Persistent=true
Unit=daily-example.service

[Install]
WantedBy=timers.target
```

This schedules the task daily at 03:00 local time. `Persistent=true` lets systemd make up a missed calendar run when the timer becomes active again, if the timer was inactive when the scheduled time passed. It does not make a task run every time the system boots.

Ensure the script exists and is executable:

```bash
sudo chmod 755 /usr/local/bin/daily-example.sh
```

Load and enable the timer:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now daily-example.timer
```

### Inspect timers

```bash
systemctl list-timers
systemctl list-timers --all
systemctl status daily-example.timer
```

### Validate calendar expressions

```bash
systemd-analyze calendar '*-*-* 03:00:00'
systemd-analyze calendar 'Mon..Fri 09:00'
```

Use quotes around expressions so the shell does not expand wildcard characters.

### Run the service manually

```bash
sudo systemctl start daily-example.service
journalctl -u daily-example.service -n 50
```

Starting the service manually tests the task; it does not change the timer schedule.

### Important timer safety note

Always confirm the timer's schedule and target service before enabling it. A faulty recurring service can repeatedly modify files, consume resources, or reboot a machine. Test the service manually and inspect logs before enabling recurring execution.

## 11. Mount and automount units

systemd can manage filesystems using `.mount` and `.automount` units. The unit name is derived from the mount path.

For `/mnt/data`, generate the correct names with:

```bash
systemd-escape --path --suffix=mount /mnt/data
systemd-escape --path --suffix=automount /mnt/data
```

A `.mount` unit might look like this:

```ini
[Unit]
Description=Data filesystem

[Mount]
What=UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Where=/mnt/data
Type=ext4
Options=defaults
```

A matching `.automount` unit might look like this:

```ini
[Unit]
Description=Automount data filesystem

[Automount]
Where=/mnt/data

[Install]
WantedBy=multi-user.target
```

Create `/mnt/data`, save the units under the exact names printed by `systemd-escape`, then run:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now mnt-data.automount
```

Replace the example UUID with the real one and ensure the unit names correspond to the path. A simple local disk is often easier to manage through `/etc/fstab`; avoid defining conflicting configurations for the same mount in both fstab and standalone units.

## 12. Targets and boot behavior

A target groups units into a system state. Common targets include:

- `multi-user.target`: typical multi-user system without a graphical desktop requirement.
- `graphical.target`: system state that includes a graphical login environment, if installed.
- `rescue.target`: rescue mode with a limited environment.
- `emergency.target`: minimal emergency shell.
- `network-online.target`: indicates that the configured network-online mechanism considers the network online; it may require a wait-online service.

### Show the default target

```bash
systemctl get-default
```

### Set the default target

```bash
sudo systemctl set-default multi-user.target
```

This changes the default target for future boots. It does not necessarily switch the current session immediately.

### Switch target now

```bash
sudo systemctl isolate multi-user.target
```

**Caution:** `isolate` can stop units not required by the selected target, potentially ending graphical sessions or other services. Do not run it remotely or on a production system unless you understand the consequences.

### Analyze boot time

```bash
systemd-analyze
systemd-analyze blame
systemd-analyze critical-chain
```

- `systemd-analyze` shows total boot timing information.
- `blame` lists units by time spent in their startup phase, but a slow unit is not necessarily the root cause of a slow boot.
- `critical-chain` helps inspect dependencies on the boot critical path.

## 13. Resource controls and restart policies

Service unit files can specify how a service is restarted and how much system resource it may use.

### Restart behavior

Example:

```ini
[Service]
Restart=on-failure
RestartSec=5s
```

Common `Restart=` values include `no`, `on-success`, `on-failure`, `on-abnormal`, and `always`. Systemd also applies rate limits to repeated start attempts by default. Avoid restart loops; investigate why the program exits.

### Resource controls

Examples of service settings include:

```ini
[Service]
CPUQuota=50%
MemoryMax=500M
TasksMax=100
```

These are illustrative limits, not universal recommendations. They can cause an application to slow down, fail allocations, or be terminated when it reaches a limit. Test limits on noncritical services first.

### View a service's cgroup

```bash
systemctl status SERVICE
systemd-cgls
systemd-cgtop
```

`systemd-cgls` displays control groups, and `systemd-cgtop` provides a live resource view when available.

## 14. Environment variables and drop-in overrides

### Add a drop-in override

Avoid editing package-provided unit files under `/lib/systemd/system` or `/usr/lib/systemd/system` directly. Package updates may overwrite those changes.

Create a drop-in:

```bash
sudo systemctl edit SERVICE
```

This opens an override editor. For example:

```ini
[Service]
Restart=on-failure
RestartSec=5s
```

Save and exit, then apply the change:

```bash
sudo systemctl daemon-reload
sudo systemctl restart SERVICE
```

Inspect the result:

```bash
systemctl cat SERVICE
systemctl show -p Restart,RestartUSec SERVICE
```

To remove a drop-in, use `sudo systemctl edit SERVICE` to clear the override or remove the appropriate file under `/etc/systemd/system/SERVICE.d/`, then reload systemd and verify. Be careful not to delete overrides you did not create.

### Set environment variables

A drop-in can add an environment variable:

```ini
[Service]
Environment="APP_MODE=production"
```

For multiple variables, you can use an environment file:

```ini
[Service]
EnvironmentFile=/etc/default/example-app
```

Example environment file:

```text
APP_MODE=production
LOG_LEVEL=info
```

The syntax and quoting rules are not identical to a shell script. Do not put shell commands in an environment file. Protect files containing secrets with appropriate ownership and permissions; consider systemd credentials or a dedicated secrets mechanism instead of plain environment variables for sensitive values.

## 15. Troubleshooting systemd

### A service fails to start

```bash
systemctl status SERVICE
journalctl -u SERVICE -b --no-pager
systemctl cat SERVICE
```

Look for an invalid path, permission problem, missing dependency, configuration error, or application failure.

### Unit file changed but systemd does not see it

```bash
sudo systemctl daemon-reload
systemctl cat SERVICE
```

`daemon-reload` rereads unit definitions. You may also need to restart the service to make it use its updated settings.

### A unit is stuck in a failed state

```bash
systemctl status SERVICE
journalctl -u SERVICE -b -n 100
sudo systemctl reset-failed SERVICE
```

Reset the failed state only after checking the cause. Resetting the state does not fix the application.

### A service keeps restarting

```bash
systemctl status SERVICE
journalctl -u SERVICE -f
systemctl show -p Restart,RestartUSec,NRestarts SERVICE
```

Check the application error and restart policy. Do not simply increase restart frequency without understanding the failure.

### A timer is not firing

```bash
systemctl list-timers --all
systemctl status example-task.timer
systemctl status example-task.service
journalctl -u example-task.timer -b
journalctl -u example-task.service -b
systemd-analyze calendar '*-*-* 03:00:00'
```

Verify that the timer is enabled and active, its target service name matches, the calendar expression is correct, and the service works when started manually.

### A service cannot access a file

Check the service's `User=`, `Group=`, working directory, file permissions, and any sandboxing options. Test file access as the service account where appropriate. A command that works in your interactive shell may fail under systemd because the service has a different user, environment, working directory, or `PATH`.

### Find boot errors

```bash
systemctl --failed
journalctl -b -p err
systemd-analyze critical-chain
```

Do not assume every warning is a critical failure. Prioritize units related to the problem you are observing.

## 16. Safe administration habits

- Inspect with `systemctl status`, `systemctl cat`, and `journalctl` before changing a unit.
- Prefer `systemctl stop SERVICE` over killing a service's PID directly.
- Use `systemctl edit SERVICE` for local overrides instead of modifying vendor unit files.
- Run `daemon-reload` after creating or editing unit files.
- Test custom services manually before enabling them at boot.
- Test timers and review their target service before enabling recurring execution.
- Be cautious with `mask`, `isolate`, and changes to the default target.
- Keep a recovery route when changing networking, login, mounts, or boot-related units.
- Never put passwords or API keys into a unit file or command line unless you understand the exposure risks.
- When troubleshooting, keep relevant logs before cleaning the journal.

## 17. Quick reference

| Task | Command |
|---|---|
| Check system state | `systemctl is-system-running` |
| List failed units | `systemctl --failed` |
| List services | `systemctl list-units --type=service` |
| Show installed unit files | `systemctl list-unit-files` |
| Check a service | `systemctl status SERVICE` |
| Start a service | `sudo systemctl start SERVICE` |
| Stop a service | `sudo systemctl stop SERVICE` |
| Restart a service | `sudo systemctl restart SERVICE` |
| Reload service config | `sudo systemctl reload SERVICE` |
| Enable at boot | `sudo systemctl enable SERVICE` |
| Enable and start | `sudo systemctl enable --now SERVICE` |
| Disable and stop | `sudo systemctl disable --now SERVICE` |
| Reload unit definitions | `sudo systemctl daemon-reload` |
| Show unit contents | `systemctl cat SERVICE` |
| Show dependencies | `systemctl list-dependencies SERVICE` |
| Read service logs | `journalctl -u SERVICE -b` |
| Follow service logs | `journalctl -u SERVICE -f` |
| Show previous boots | `journalctl --list-boots` |
| List timers | `systemctl list-timers --all` |
| Validate calendar schedule | `systemd-analyze calendar 'Mon..Fri 09:00'` |
| Analyze boot | `systemd-analyze critical-chain` |
| Reset failed state | `sudo systemctl reset-failed SERVICE` |
| Escape a mount path | `systemd-escape --path --suffix=mount /mnt/data` |

---

**Recommended workflow:** inspect the unit, read its logs, make one change at a time, run `daemon-reload` when unit files change, then verify status and logs. This is safer than repeatedly restarting or disabling services without understanding the cause.
