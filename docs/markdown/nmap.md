---
layout: sheet
title: "Nmap Cheat Sheet for Debian 13"
category: "Networking"
summary: "Discover hosts, scan ports, identify services, and save results with Nmap."
date: 2026-10-24 19:57:46
permalink: /html/nmap.html
---
# Nmap Cheat Sheet for Debian 13

A practical reference for using Nmap to discover hosts, scan ports, identify services, and save results on Debian 13.

> **Authorization:** Only scan systems and networks you own or have explicit permission to test. Scans can trigger alerts or disrupt fragile devices. Start with a small, known target and use conservative options when unsure.

## Table of contents

- [1. Install Nmap](#1-install-nmap)
- [2. Basic syntax and targets](#2-basic-syntax-and-targets)
- [3. Find hosts on a network](#3-find-hosts-on-a-network)
- [4. Basic port scans](#4-basic-port-scans)
- [5. Choose ports](#5-choose-ports)
- [6. Detect services and versions](#6-detect-services-and-versions)
- [7. Operating-system detection](#7-operating-system-detection)
- [8. Timing and scan behavior](#8-timing-and-scan-behavior)
- [9. Nmap Scripting Engine (NSE)](#9-nmap-scripting-engine-nse)
- [10. Save and read scan results](#10-save-and-read-scan-results)
- [11. Useful options](#11-useful-options)
- [12. Practical homelab examples](#12-practical-homelab-examples)
- [13. Troubleshooting](#13-troubleshooting)
- [14. Quick reference](#14-quick-reference)
- [15. Further reading](#15-further-reading)

---

## 1. Install Nmap

Update APT and install Nmap from Debian's repositories:

```bash
sudo apt update
sudo apt install nmap
```

Check the installed version and display basic help:

```bash
nmap --version
nmap --help
man nmap
```

To search the manual for a topic, open `man nmap` and type `/` followed by a search term, then press Enter. Press `n` for the next match and `q` to quit.

## 2. Basic syntax and targets

General syntax:

```bash
nmap [options] <target>
```

Examples of target formats:

```bash
nmap 192.168.1.1                 # One IPv4 address
nmap router.local                # Hostname
nmap 192.168.1.10 192.168.1.20   # Multiple targets
nmap 192.168.1.0/24              # Every address in a subnet
nmap 192.168.1.1-50              # Address range
nmap -iL targets.txt             # Read targets from a file
```

Create a target list with one host or IP address per line:

```text
192.168.1.1
192.168.1.20
server.example.test
```

Then scan it:

```bash
nmap -iL targets.txt
```

Nmap accepts IPv4 and IPv6 targets. For IPv6, use `-6`, for example:

```bash
nmap -6 2001:db8::10
```

The IPv6 address above is an example address, not a real public target.

### Find your local network

Use these commands to inspect your interfaces and routes:

```bash
ip -brief address
ip route
```

Look for your LAN interface and connected subnet. Do not assume every network uses `192.168.1.0/24`; use the subnet shown by your system.

## 3. Find hosts on a network

### Discover active hosts without port scanning

```bash
nmap -sn 192.168.1.0/24
```

`-sn` performs host discovery and skips the normal port scan. On a local Ethernet network, Nmap may use ARP discovery, which can find hosts that do not respond to ping.

### Try ping-based discovery

```bash
nmap -sn -PE 192.168.1.0/24
```

`-PE` requests ICMP echo discovery. Firewalls may block it, so no response does not prove that a host is offline.

### Scan a host even if discovery probes fail

```bash
nmap -Pn 192.168.1.25
```

`-Pn` tells Nmap to skip host discovery and treat the target as up. This can be useful when a host filters discovery probes, but it may make a scan of a large range much slower.

### Reverse DNS lookups

```bash
nmap -R 192.168.1.0/24
nmap -n 192.168.1.0/24
```

- `-R` always performs DNS resolution.
- `-n` skips DNS resolution, which can speed up scans when hostnames are not needed.

## 4. Basic port scans

### Default scan

```bash
nmap 192.168.1.25
```

By default, Nmap scans the 1,000 most common TCP ports. When run with sufficient privileges, it normally uses a TCP SYN scan; without them, it generally uses a TCP connect scan.

### TCP SYN scan

```bash
sudo nmap -sS 192.168.1.25
```

`-sS` sends SYN probes and is often called a half-open scan. It generally requires root or equivalent network privileges.

### TCP connect scan

```bash
nmap -sT 192.168.1.25
```

`-sT` uses the operating system's `connect()` call. It works without raw-packet privileges but completes TCP connections to open ports.

### UDP scan

```bash
sudo nmap -sU 192.168.1.25
```

UDP scans can be slow and results may be ambiguous because many UDP services do not respond to empty probes. Consider selecting a limited set of ports first:

```bash
sudo nmap -sU -p 53,67,123,161 192.168.1.25
```

### Scan TCP and UDP

```bash
sudo nmap -sS -sU -p T:22,80,443,U:53,123 192.168.1.25
```

The `T:` and `U:` prefixes specify TCP and UDP ports respectively.

## 5. Choose ports

```bash
nmap -p 22 192.168.1.25            # One port
nmap -p 22,80,443 192.168.1.25     # Selected ports
nmap -p 1-1024 192.168.1.25        # Port range
nmap -p- 192.168.1.25               # All TCP ports, 1–65535
nmap --top-ports 100 192.168.1.25   # 100 most common ports
nmap -F 192.168.1.25                # Fast scan of fewer common ports
```

A full TCP port scan can take longer than a default scan. Add service detection when you need to identify what's listening:

```bash
nmap -sV -p 1-1024 192.168.1.25
```

### Scan only open ports in the displayed output

```bash
nmap --open 192.168.1.25
```

`--open` filters the displayed results to ports that are open or possibly open. It does not make the underlying scan skip closed ports.

## 6. Detect services and versions

```bash
nmap -sV 192.168.1.25
```

`-sV` probes detected open ports to identify the service and, where possible, its version.

Adjust version-detection intensity from 0 to 9:

```bash
nmap -sV --version-light 192.168.1.25
nmap -sV --version-intensity 5 192.168.1.25
nmap -sV --version-all 192.168.1.25
```

Higher intensity can make more probes and take longer. Start with the default or `--version-light` for a routine inventory.

### Common service ports

| Port | Common service | Notes |
|---:|---|---|
| 22/tcp | SSH | Secure remote shell |
| 25/tcp | SMTP | Mail transfer |
| 53/tcp,udp | DNS | Domain name service |
| 80/tcp | HTTP | Unencrypted web |
| 123/udp | NTP | Time synchronization |
| 443/tcp | HTTPS | Web over TLS |
| 445/tcp | SMB | Windows file sharing |
| 631/tcp | IPP | Network printing |
| 3306/tcp | MySQL/MariaDB | Database |
| 5432/tcp | PostgreSQL | Database |
| 8080/tcp | Alternate HTTP | Often a web app or proxy |

A port number is only a clue. Services can run on nonstandard ports, and a detected service name is not proof of the software's identity or security state.

## 7. Operating-system detection

```bash
sudo nmap -O 192.168.1.25
```

`-O` attempts to infer the operating system from network responses. It works best when Nmap can observe at least one open and one closed TCP port, and results may be uncertain if the target is filtered or behind a middlebox.

Ask Nmap to show more OS-detection details:

```bash
sudo nmap -O --osscan-guess 192.168.1.25
```

`--osscan-guess` makes Nmap present less certain matches more aggressively. Treat these as estimates, not confirmed facts.

### Combined detection

```bash
sudo nmap -sV -O 192.168.1.25
```

The `-A` option enables OS detection, version detection, default NSE scripts, and traceroute:

```bash
sudo nmap -A 192.168.1.25
```

`-A` is more intrusive than a basic scan. Use it only when that broader probing is appropriate and authorized.

## 8. Timing and scan behavior

Nmap provides timing templates from `-T0` through `-T5`:

```bash
nmap -T3 192.168.1.25
nmap -T4 192.168.1.25
```

- `-T3`: default, balanced timing.
- `-T4`: often reasonable on a reliable LAN.
- `-T0` to `-T2`: slower templates that may be useful on fragile or constrained links, though they are not a substitute for permission or careful testing.
- `-T5`: very aggressive and more likely to reduce accuracy or overload a target; generally avoid it for routine work.

Set a maximum time for the overall scan:

```bash
nmap --host-timeout 5m 192.168.1.25
```

Limit retries:

```bash
nmap --max-retries 2 192.168.1.25
```

These settings can cause Nmap to miss results when the network is slow or packet loss is high. Use them only when you understand the trade-off.

## 9. Nmap Scripting Engine (NSE)

NSE scripts extend Nmap with tasks such as gathering additional service information. Review a script's documentation and expected impact before running it.

### Run the default script set

```bash
nmap -sC 192.168.1.25
```

`-sC` is shorthand for `--script=default`. Default scripts can still send additional probes, so use them only against authorized targets.

### Run a named script

```bash
nmap --script=http-title -p 80,443 192.168.1.25
```

### Use a script category cautiously

```bash
nmap --script=safe 192.168.1.25
```

The `safe` category is intended for scripts not expected to crash services or consume excessive resources, but no category is a guarantee of zero impact. Check the individual scripts when scanning important systems.

### Vulnerability checks

```bash
nmap --script=vuln 192.168.1.25
```

Use vulnerability-related scripts only with explicit authorization and after reviewing what they test. Results may include false positives or false negatives; validate findings independently.

### Get information about a script

```bash
nmap --script-help http-title
nmap --script-help 'safe'
```

For installed script files and documentation, consult `man nmap` and the official Nmap documentation.

## 10. Save and read scan results

### Normal human-readable output

```bash
nmap -oN scan-results.txt 192.168.1.25
```

### XML output

```bash
nmap -oX scan-results.xml 192.168.1.25
```

XML is useful for tools that process scan results.

### Write all main output formats

```bash
nmap -oA homelab-scan 192.168.1.25
```

This creates files with the base name `homelab-scan` in normal (`.nmap`), XML (`.xml`), and grepable (`.gnmap`) formats. Grepable output is retained for compatibility but is deprecated; prefer XML for structured processing.

### Increase detail and show reasons

```bash
nmap -v --reason 192.168.1.25
nmap -vv 192.168.1.25
```

- `-v` / `-vv`: more verbose output.
- `--reason`: show why Nmap assigned a port or host state.

### Scan a list and save results

```bash
nmap -iL targets.txt -oA inventory-$(date +%F)
```

This creates date-stamped output files in the current directory. Make sure the directory is writable.

## 11. Useful options

| Option | Purpose |
|---|---|
| `-6` | Scan IPv6 targets |
| `-n` | Skip DNS lookups |
| `-R` | Always resolve DNS |
| `-sn` | Host discovery only, no port scan |
| `-Pn` | Skip host discovery |
| `-sS` | TCP SYN scan; typically needs privileges |
| `-sT` | TCP connect scan |
| `-sU` | UDP scan |
| `-p PORTS` | Select ports or ranges |
| `-p-` | All TCP ports |
| `-sV` | Service/version detection |
| `-O` | OS detection |
| `-sC` | Default NSE scripts |
| `-A` | OS detection, version detection, default scripts, traceroute |
| `-T3` / `-T4` | Timing template |
| `--open` | Show open or possibly open ports |
| `--reason` | Explain detected states |
| `-oN FILE` | Normal output file |
| `-oX FILE` | XML output file |
| `-oA BASE` | Save normal, XML, and grepable output |
| `-iL FILE` | Read targets from a file |
| `--exclude HOSTS` | Exclude targets from a scan |

Example excluding a printer or other fragile device from an authorized subnet scan:

```bash
nmap -sn 192.168.1.0/24 --exclude 192.168.1.45
```

## 12. Practical homelab examples

Replace the example addresses and subnet with values from your own network.

### A. Find active devices on your LAN

```bash
nmap -sn 192.168.1.0/24
```

### B. Check whether SSH and web ports are reachable on your own server

```bash
nmap -p 22,80,443 192.168.1.25
```

### C. Identify services on a Debian server

```bash
sudo nmap -sV -p 22,80,443 192.168.1.25
```

### D. Inventory all TCP ports on a lab VM

```bash
nmap -p- -T3 --open 192.168.1.25
```

If you find an open port you want to identify, scan that port with `-sV`.

### E. Check common UDP services on your own lab host

```bash
sudo nmap -sU -p 53,123,161 192.168.1.25
```

### F. Save an inventory for later comparison

```bash
nmap -sV -oA server-inventory 192.168.1.25
```

### G. Check a host that does not answer discovery probes

```bash
nmap -Pn -p 22,80,443 192.168.1.25
```

### H. Inspect your own router's exposed ports

```bash
nmap -sV -T3 192.168.1.1
```

Only use the address if it is your router and your network's rules permit scanning it.

## 13. Troubleshooting

### “You requested a scan type which requires root privileges”

Run the command with `sudo` if you are authorized to perform that scan:

```bash
sudo nmap -sS 192.168.1.25
```

Or use a TCP connect scan without elevated privileges:

```bash
nmap -sT 192.168.1.25
```

### Nmap says the host is down

The target may be offline, unreachable, or filtering discovery probes. Verify the address and network route first. If appropriate, try skipping host discovery:

```bash
nmap -Pn 192.168.1.25
```

This does not make an unreachable host reachable; it only changes Nmap's assumption about whether the host is up.

### Ports show as `filtered`

Nmap did not determine whether the port is open or closed because packets were blocked, dropped, or otherwise inconclusive. Check routing and firewall rules on systems you administer.

### UDP results show `open|filtered`

Nmap did not receive a response that distinguishes an open UDP service from filtering. This is common with UDP. Try a service-specific probe, inspect the host configuration, or check the service locally.

### Scan is slow

Try narrowing the port range or use a small common-port set:

```bash
nmap --top-ports 100 192.168.1.25
```

UDP scans, filtered ports, DNS lookups, and packet loss can all increase scan time. Avoid aggressive timing on fragile devices.

### Permission or output-file errors

Check the current directory and available space:

```bash
pwd
ls -ld .
df -h .
```

Choose a writable output location if needed, such as a directory under your home folder.

## 14. Quick reference

| Goal | Command |
|---|---|
| Basic scan | `nmap 192.168.1.25` |
| Discover LAN hosts | `nmap -sn 192.168.1.0/24` |
| Skip discovery probes | `nmap -Pn 192.168.1.25` |
| Scan selected ports | `nmap -p 22,80,443 192.168.1.25` |
| Scan all TCP ports | `nmap -p- 192.168.1.25` |
| TCP connect scan | `nmap -sT 192.168.1.25` |
| TCP SYN scan | `sudo nmap -sS 192.168.1.25` |
| UDP scan | `sudo nmap -sU -p 53,123 192.168.1.25` |
| Detect versions | `nmap -sV 192.168.1.25` |
| Guess operating system | `sudo nmap -O 192.168.1.25` |
| Run default scripts | `nmap -sC 192.168.1.25` |
| Show open ports | `nmap --open 192.168.1.25` |
| Explain port states | `nmap --reason 192.168.1.25` |
| Save all main formats | `nmap -oA scan 192.168.1.25` |
| Scan targets from file | `nmap -iL targets.txt` |

## 15. Further reading

- [Official Nmap Reference Guide](https://nmap.org/book/man.html)
- [Nmap Reference Guide: Port Scanning Techniques](https://nmap.org/book/man-port-scanning-techniques.html)
- [Nmap Reference Guide: Host Discovery](https://nmap.org/book/man-host-discovery.html)
- [Nmap Scripting Engine documentation](https://nmap.org/book/nse.html)
- [Debian package information for Nmap](https://packages.debian.org/nmap)

---

**Suggested workflow for a homelab:** discover active hosts with `-sn`, scan a known host's common ports, identify services with `-sV`, and save an inventory with `-oA`. Expand the scan only when you have a clear reason and permission.
