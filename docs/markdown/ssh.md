---
layout: sheet
title: "SSH and SCP Cheat Sheet for Debian 13"
category: "Networking"
summary: "Secure remote login, key management, and file transfers with SSH and SCP."
date: 2026-10-24 15:09:14
permalink: /html/ssh.html
---
# SSH and SCP Cheat Sheet for Debian 13

> **Purpose:** A practical guide to secure remote login and file transfers with SSH and SCP.
>
> **Package:** `openssh-client` provides `ssh`, `scp`, `sftp`, and `ssh-keygen`. A remote Debian machine generally needs `openssh-server` to accept SSH connections.
>
> **Safety note:** Verify remote host identities and protect private SSH keys. Never share a private key or casually ignore host-key warnings.

## Table of contents

1. [Check availability and install OpenSSH](#1-check-availability-and-install-openssh)
2. [SSH basics](#2-ssh-basics)
3. [Connect to a remote system](#3-connect-to-a-remote-system)
4. [Common SSH options](#4-common-ssh-options)
5. [SSH keys](#5-ssh-keys)
6. [Use an SSH configuration file](#6-use-an-ssh-configuration-file)
7. [Copy files with SCP](#7-copy-files-with-scp)
8. [Copy directories and preserve attributes](#8-copy-directories-and-preserve-attributes)
9. [Troubleshooting](#9-troubleshooting)
10. [Security and safe habits](#10-security-and-safe-habits)
11. [Quick command index](#11-quick-command-index)

---

## 1. Check availability and install OpenSSH

Check whether the client commands are available:

```bash
command -v ssh
command -v scp
command -v ssh-keygen
```

Check which installed Debian package owns a command:

```bash
dpkg-query -S "$(command -v ssh)"
```

Install the client if needed:

```bash
sudo apt update
sudo apt install openssh-client
```

### Allow a Debian machine to accept SSH connections

On the remote computer, install and start the SSH server:

```bash
sudo apt update
sudo apt install openssh-server
sudo systemctl enable --now ssh
```

Check its status:

```bash
systemctl status ssh
```

The server and client are separate packages. You need `openssh-server` only on machines that should accept incoming SSH connections.

## 2. SSH basics

SSH (Secure Shell) provides an encrypted connection to another computer. It is commonly used to log in remotely, administer servers, and securely transfer files.

General syntax:

```text
ssh [OPTIONS] USER@HOST
```

For example:

```bash
ssh student@192.0.2.25
```

Replace `student` and the documentation-only IP address with the actual account and host you are authorized to access. `192.0.2.0/24` is reserved for examples and is not intended for real hosts.

## 3. Connect to a remote system

Connect using a hostname:

```bash
ssh alice@server.example.com
```

Connect using an IP address:

```bash
ssh alice@192.0.2.10
```

Connect to a non-default port:

```bash
ssh -p 2222 alice@server.example.com
```

SSH uses TCP port 22 by default.

Run a single command remotely:

```bash
ssh alice@server.example.com 'hostname'
```

For example, check disk usage:

```bash
ssh alice@server.example.com 'df -h'
```

Exit an interactive session with:

```bash
exit
```

You can also press `Ctrl+D` in a normal interactive shell.

## 4. Common SSH options

| Option | Meaning | Example |
|---|---|---|
| `-p PORT` | Connect to a specified port | `ssh -p 2222 user@host` |
| `-i FILE` | Use a specified private key | `ssh -i ~/.ssh/id_ed25519 user@host` |
| `-v` | Show connection diagnostics | `ssh -v user@host` |
| `-vv` | Show more diagnostics | `ssh -vv user@host` |
| `-J HOST` | Connect through a jump host | `ssh -J gateway user@target` |
| `-L` | Forward a local port through SSH | See below |
| `-o NAME=VALUE` | Set a configuration option | `ssh -o ConnectTimeout=10 user@host` |

Set a connection timeout:

```bash
ssh -o ConnectTimeout=10 alice@server.example.com
```

Forward a local port:

```bash
ssh -L 8080:localhost:80 alice@server.example.com
```

While the SSH session is open, visiting `http://localhost:8080` on your local computer forwards the connection to port 80 on the remote computer, as seen from that remote host. The service must be listening and the SSH server must permit forwarding.

Connect through a jump host:

```bash
ssh -J alice@gateway.example.com bob@internal.example.com
```

Replace both example hostnames with systems you are authorized to access.

## 5. SSH keys

SSH keys can provide authentication without entering the remote account password each time. A key pair has a **private key** (keep it secret) and a **public key** (which can be installed on the remote account).

Generate an Ed25519 key pair:

```bash
ssh-keygen -t ed25519
```

Follow the prompts. A passphrase is recommended to protect the private key.

The default files are usually:

- `~/.ssh/id_ed25519` — private key; do not share it.
- `~/.ssh/id_ed25519.pub` — public key; can be installed on systems where you want to log in.

Install your public key on a remote account:

```bash
ssh-copy-id alice@server.example.com
```

You may be prompted for the remote account password during setup. `ssh-copy-id` is normally included with Debian's `openssh-client` package.

Log in using a particular key:

```bash
ssh -i ~/.ssh/id_ed25519 alice@server.example.com
```

List public keys:

```bash
ls -l ~/.ssh/*.pub
```

Set common permissions:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
```

Only change permissions on your own key files. Never make a private key readable by other users.

## 6. Use an SSH configuration file

SSH settings can be saved in `~/.ssh/config` so you do not have to type the same options repeatedly.

Create or edit the file:

```bash
vim ~/.ssh/config
```

Example configuration:

```sshconfig
Host homelab
    HostName 192.0.2.10
    User alice
    Port 22
    IdentityFile ~/.ssh/id_ed25519
```

Connect using the alias:

```bash
ssh homelab
```

Use real host details in your own configuration. A common permission setting for this file is:

```bash
chmod 600 ~/.ssh/config
```

## 7. Copy files with SCP

`scp` copies files between computers over SSH.

General syntax:

```text
scp [OPTIONS] SOURCE DESTINATION
```

Copy a local file to a remote computer:

```bash
scp report.txt alice@server.example.com:/home/alice/
```

Copy a remote file to the current local directory:

```bash
scp alice@server.example.com:/home/alice/report.txt .
```

The dot (`.`) means the current directory.

Copy to a remote path containing spaces:

```bash
scp report.txt 'alice@server.example.com:/home/alice/My Reports/'
```

Use a non-default SSH port:

```bash
scp -P 2222 report.txt alice@server.example.com:/home/alice/
```

**Important:** `ssh` uses lowercase `-p` for the port, but `scp` uses uppercase `-P`.

Use a specific private key:

```bash
scp -i ~/.ssh/id_ed25519 report.txt alice@server.example.com:/home/alice/
```

## 8. Copy directories and preserve attributes

Copy a directory recursively:

```bash
scp -r website/ alice@server.example.com:/home/alice/
```

Preserve file times and mode bits where possible:

```bash
scp -p report.txt alice@server.example.com:/home/alice/
```

The `-p` option preserves modification times, access times, and file mode bits where possible. It does not guarantee that the remote file owner will match the local owner.

Copy a file from one remote host to another:

```bash
scp alice@host-a.example.com:/home/alice/report.txt bob@host-b.example.com:/home/bob/
```

Depending on options and configuration, data may be relayed through the local machine or transferred directly between remote hosts. Confirm connectivity and behavior before relying on this for large transfers.

### Note about modern SCP

Modern OpenSSH `scp` uses SFTP over SSH by default. Very old servers may require compatibility options. Avoid enabling legacy behavior unless you understand the security implications.

## 9. Troubleshooting

Show detailed connection diagnostics:

```bash
ssh -v alice@server.example.com
```

If `nc` is installed, check whether the SSH port is reachable:

```bash
nc -vz server.example.com 22
```

A failed connection can mean the host is offline, the port is wrong, a firewall is blocking access, or the SSH server is not listening.

Common errors:

- **Connection timed out:** Check routing, firewall rules, host address, and whether the host is reachable.
- **Connection refused:** The host may be reachable, but no service is accepting connections on that port.
- **Permission denied:** Check the username, authentication method, key installation, and file permissions.
- **Host key verification failed:** The saved host key does not match the presented key. Verify the change through a trusted channel before updating the known-hosts entry.
- **Could not resolve hostname:** Check spelling and DNS or local name resolution.

If a host was legitimately reinstalled or its host key changed, verify the new fingerprint through a trusted channel before removing the old entry:

```bash
ssh-keygen -R server.example.com
```

Do not blindly remove host-key records to bypass a warning. An unexpected host-key change can indicate a security problem.

## 10. Security and safe habits

- **Verify host fingerprints** when connecting for the first time and whenever a key changes unexpectedly.
- **Keep private keys private.** Never send `id_ed25519` to another person or upload it to a repository.
- **Use a passphrase** on private keys where practical.
- **Use least privilege.** Log in with an ordinary account and use `sudo` when required.
- **Be careful with remote paths.** Check the destination before running `scp`, especially when copying directories.
- **Do not bypass host-key checks casually.** Disabling verification weakens protection against impersonation.
- **Use only systems you are authorized to access.**

## 11. Quick command index

| Task | Command |
|---|---|
| Check SSH availability | `command -v ssh` |
| Connect to a host | `ssh user@host` |
| Connect on a custom port | `ssh -p 2222 user@host` |
| Run a remote command | `ssh user@host 'hostname'` |
| Generate a key pair | `ssh-keygen -t ed25519` |
| Install public key | `ssh-copy-id user@host` |
| Connect using a key | `ssh -i ~/.ssh/id_ed25519 user@host` |
| Debug a connection | `ssh -v user@host` |
| Copy a local file to remote | `scp file.txt user@host:/remote/path/` |
| Copy a remote file locally | `scp user@host:/remote/file.txt .` |
| Copy a directory | `scp -r directory/ user@host:/remote/path/` |
| Use a custom SCP port | `scp -P 2222 file.txt user@host:/remote/path/` |
| Find package ownership | `dpkg-query -S "$(command -v ssh)"` |
