---
layout: sheet
title: "Windows Administration Cheat Sheet"
category: "Windows"
summary: "Local users, processes, services, disks, networking, and updates with built-in Windows tools."
date: 2026-10-24 20:39:58
permalink: /html/windows.html
---
# Windows Administration Cheat Sheet

A practical reference for traditional Windows administration using built-in tools, Command Prompt, and PowerShell. Examples cover local users and groups, processes, services, disks, network drives, networking, updates, and `winget`.

> **Edition scope: Windows Pro and Windows Enterprise IoT. Windows Home is excluded.** This guide is written for Windows Pro and Windows Enterprise IoT systems. Some tools, consoles, cmdlets, and management features vary by Windows edition, release, installation type, and organizational policy. Do not assume a command is available merely because it appears here.

> **Run elevated commands carefully.** Some commands require PowerShell or Command Prompt to be opened with **Run as administrator**. Local-account commands generally apply to standalone PCs; domain and Microsoft Entra ID environments may use different account-management policies.

## Table of contents

- [1. Open administrative tools](#1-open-administrative-tools)
- [2. Open PowerShell and Command Prompt](#2-open-powershell-and-command-prompt)
- [3. Local user management](#3-local-user-management)
- [4. Local group management](#4-local-group-management)
- [5. Passwords and account status](#5-passwords-and-account-status)
- [6. Process management](#6-process-management)
- [7. Windows services](#7-windows-services)
- [8. Network drives and shares](#8-network-drives-and-shares)
- [9. Disks, volumes, and mounting](#9-disks-volumes-and-mounting)
- [10. Network troubleshooting](#10-network-troubleshooting)
- [11. Windows Firewall management](#11-windows-firewall-management)
- [12. Windows virus and threat protection](#12-windows-virus-and-threat-protection)
- [13. Windows Update management](#13-windows-update-management)
- [14. Turn Windows optional features on and off](#14-turn-windows-optional-features-on-and-off)
- [16. Manage File Explorer settings with PowerShell](#16-manage-file-explorer-settings-with-powershell)
- [17. System information and hardware](#17-system-information-and-hardware)
- [17. Applications and packages with winget](#17-applications-and-packages-with-winget)
- [18. Windows updates and reboot status](#18-windows-updates-and-reboot-status)
- [19. Files, permissions, and folders](#19-files-permissions-and-folders)
- [20. Event logs and troubleshooting](#20-event-logs-and-troubleshooting)
- [21. Remote administration and connectivity](#21-remote-administration-and-connectivity)
- [22. Useful keyboard shortcuts](#22-useful-keyboard-shortcuts)
- [23. Quick reference](#23-quick-reference)

---

## 1. Open administrative tools

Use `Win + R` to open the Run dialog, then enter one of these commands.

| Command | Opens |
|---|---|
| `lusrmgr.msc` | Local Users and Groups |
| `compmgmt.msc` | Computer Management |
| `services.msc` | Services console |
| `taskmgr` | Task Manager |
| `devmgmt.msc` | Device Manager |
| `diskmgmt.msc` | Disk Management |
| `eventvwr.msc` | Event Viewer |
| `taskschd.msc` | Task Scheduler |
| `secpol.msc` | Local Security Policy, where available |
| `gpedit.msc` | Local Group Policy Editor, where available |
| `perfmon` | Performance Monitor |
| `resmon` | Resource Monitor |
| `msinfo32` | System Information |
| `dxdiag` | DirectX Diagnostic Tool |
| `appwiz.cpl` | Programs and Features |
| `ncpa.cpl` | Network Connections |
| `sysdm.cpl` | System Properties |
| `control` | Control Panel |
| `winver` | Windows version dialog |
| `optionalfeatures` | Windows Features dialog |
| `wf.msc` | Windows Defender Firewall with Advanced Security |
| `printmanagement.msc` | Print Management, where available |

**Edition note:** This guide targets Windows Pro and Windows Enterprise IoT. Tool availability can still vary by release, installation type, and policy. If a console is missing, use the relevant PowerShell or `net.exe` alternative where supported.

Open a tool elevated when required: search for PowerShell or Terminal in Start, right-click it, then choose **Run as administrator**.

---

## 2. Open PowerShell and Command Prompt

### Open PowerShell

```powershell
powershell
```

On newer Windows versions, Windows Terminal may be the host application. PowerShell 7, if installed, is usually launched with:

```powershell
pwsh
```

### Open Command Prompt

```powershell
cmd
```

### Check the current user and elevation

```powershell
whoami
whoami /groups
whoami /priv
```

To check whether the current PowerShell session is elevated:

```powershell
$isAdmin = ([Security.Principal.WindowsPrincipal] `
  [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

$isAdmin
```

`True` indicates an elevated administrator session.

### Get help

```powershell
Get-Help Get-Process
Get-Help Get-Process -Examples
Get-Command *user*
Get-Command -Module Microsoft.PowerShell.LocalAccounts
```

If local help is not installed, run `Update-Help` in an elevated session where appropriate, or use Microsoft's online documentation.

---

## 3. Local user management

The PowerShell `Microsoft.PowerShell.LocalAccounts` module is available on supported Windows client and server editions, but not in 32-bit PowerShell running on 64-bit Windows. Domain accounts should be managed using the appropriate domain tools.

### List local users

```powershell
Get-LocalUser
Get-LocalUser | Format-Table Name, Enabled, LastLogon, PasswordRequired
```

Command Prompt alternative:

```cmd
net user
```

### Show a user's details

```powershell
Get-LocalUser -Name "alice"
net user alice
```

### Create a local user

Prompt securely for the password:

```powershell
$password = Read-Host "Enter password for alice" -AsSecureString
New-LocalUser -Name "alice" -Password $password -FullName "Alice Example" -Description "Local account"
```

Create a local account without setting a password is generally not recommended. Follow your organization's password and account policies.

Command Prompt alternative:

```cmd
net user alice * /add
```

The `*` prompts for the password instead of putting it directly in the command.

### Change a local user's password

```powershell
$password = Read-Host "Enter new password" -AsSecureString
Set-LocalUser -Name "alice" -Password $password
```

Or use the interactive Command Prompt command:

```cmd
net user alice *
```

### Enable or disable an account

```powershell
Enable-LocalUser -Name "alice"
Disable-LocalUser -Name "alice"
```

Command Prompt alternatives:

```cmd
net user alice /active:yes
net user alice /active:no
```

Disabling an account prevents ordinary sign-in but does not remove its files or profile.

### Rename a local user

```powershell
Rename-LocalUser -Name "alice" -NewName "alice2"
```

Renaming the account does not automatically rename the user's profile folder under `C:\Users`.

### Remove a local user

```powershell
Remove-LocalUser -Name "alice"
```

Command Prompt alternative:

```cmd
net user alice /delete
```

Removing an account can affect access and account-specific data. Back up needed files first. Do not assume that deleting the account also deletes its profile folder.

---

## 4. Local group management

### List local groups and members

```powershell
Get-LocalGroup
Get-LocalGroupMember -Group "Administrators"
Get-LocalGroupMember -Group "Users"
```

Command Prompt alternative:

```cmd
net localgroup
net localgroup Administrators
```

The built-in group names may be localized on non-English Windows installations.

### Add a user to a local group

```powershell
Add-LocalGroupMember -Group "Administrators" -Member "alice"
```

For a standard user group:

```powershell
Add-LocalGroupMember -Group "Users" -Member "alice"
```

Command Prompt alternative:

```cmd
net localgroup Administrators alice /add
```

**Security note:** Membership in `Administrators` grants extensive control over the PC. Give users standard accounts unless administrator rights are genuinely needed.

### Remove a user from a local group

```powershell
Remove-LocalGroupMember -Group "Administrators" -Member "alice"
```

Command Prompt alternative:

```cmd
net localgroup Administrators alice /delete
```

### Create and remove a local group

```powershell
New-LocalGroup -Name "LabUsers" -Description "Accounts for the lab"
Add-LocalGroupMember -Group "LabUsers" -Member "alice"
Remove-LocalGroup -Name "LabUsers"
```

Before removing a group, check its membership and any permissions or policies that depend on it.

---

## 5. Passwords and account status

### Check password and account policy

```cmd
net accounts
```

### Set password policy for local accounts

The `net accounts` command can configure settings such as minimum password length and password age, subject to Windows policy and edition:

```cmd
net accounts /minpwlen:12
net accounts /maxpwage:90
```

Only set an expiration policy if it matches your security requirements. Organization-managed policies may override local settings.

### Check whether a user is an administrator

```powershell
Get-LocalGroupMember -Group "Administrators"
```

Or:

```cmd
net localgroup Administrators
```

### Lockout and security policy

Use `secpol.msc` where available to inspect Account Policies and Local Policies. On managed/domain devices, policies may be controlled centrally.

Avoid storing passwords directly in scripts or command history. Use secure prompts, a credential manager, or an approved secrets-management method.

---

## 6. Process management

### List running processes

```powershell
Get-Process
Get-Process | Sort-Object CPU -Descending | Select-Object -First 15
Get-Process | Sort-Object WorkingSet64 -Descending |
  Select-Object -First 15 Name, Id, CPU, WorkingSet64
```

`CPU` is accumulated processor time, not a live percentage. `WorkingSet64` is memory currently resident in physical RAM.

Command Prompt alternative:

```cmd
tasklist
tasklist /FI "IMAGENAME eq notepad.exe"
tasklist /FI "PID eq 1234"
```

### Find a process

```powershell
Get-Process -Name notepad
Get-Process -Id 1234
```

### Stop a process

```powershell
Stop-Process -Name notepad
Stop-Process -Id 1234
```

Force termination only when necessary:

```powershell
Stop-Process -Id 1234 -Force
```

Command Prompt alternative:

```cmd
taskkill /PID 1234
taskkill /IM notepad.exe
taskkill /PID 1234 /F
```

Unsaved work may be lost. Verify the process name or PID before terminating it.

### Start a process

```powershell
Start-Process notepad
Start-Process "notepad.exe" -ArgumentList "C:\Temp\notes.txt"
Start-Process powershell -Verb RunAs
```

`-Verb RunAs` requests elevation and may display a User Account Control prompt.

### Inspect process details

```powershell
Get-Process -Name notepad | Format-List *
Get-CimInstance Win32_Process |
  Select-Object ProcessId, ParentProcessId, Name, ExecutablePath
```

Some process details, including executable paths and command lines, may require elevation.

### Open Task Manager

```cmd
taskmgr
```

Useful Task Manager tabs include Processes, Performance, Users, Details, and Services.

---

## 7. Windows services

Services are background components managed by the Service Control Manager.

### List and inspect services

```powershell
Get-Service
Get-Service -Name Spooler
Get-Service | Where-Object Status -eq "Running"
```

Command Prompt alternative:

```cmd
sc query
sc query Spooler
```

### Start, stop, and restart a service

```powershell
Start-Service -Name Spooler
Stop-Service -Name Spooler
Restart-Service -Name Spooler
```

A service may depend on other services or reject control due to permissions or policy.

### Change a service's startup type

```powershell
Set-Service -Name Spooler -StartupType Manual
Set-Service -Name Spooler -StartupType Automatic
```

PowerShell commonly accepts `Automatic`, `Manual`, and `Disabled`. Some services use trigger-start behavior or have special configuration.

### Command Prompt service control

```cmd
sc start Spooler
sc stop Spooler
sc qc Spooler
```

`sc.exe` is the executable; in PowerShell, use `sc.exe` explicitly because `sc` can resolve to a different command or alias.

Do not disable services just because their names are unfamiliar. Doing so can break hardware, updates, sign-in, networking, or security features.

---

## 8. Network drives and shares

### Map a network drive with PowerShell

```powershell
New-PSDrive -Name "Z" -PSProvider FileSystem -Root "\\fileserver\shared" -Persist
```

- `Z`: drive letter.
- `\\fileserver\shared`: UNC path to the shared folder.
- `-Persist`: creates a mapped drive visible outside the current PowerShell session.

For credentials, prefer an approved credential prompt or Windows Credential Manager rather than putting a password directly into the command.

### List mapped drives

```powershell
Get-PSDrive -PSProvider FileSystem
Get-SmbMapping
```

Command Prompt alternative:

```cmd
net use
```

### Map a drive with `net use`

```cmd
net use Z: \\fileserver\shared /persistent:yes
```

Prompt for credentials if needed:

```cmd
net use Z: \\fileserver\shared /user:DOMAIN\username *
```

For a local account on the file server, the username may need to be specified as `SERVERNAME\username`. Do not append a real password to the command; `*` prompts for it.

### Disconnect a mapped drive

```powershell
Remove-PSDrive -Name Z
```

Or:

```cmd
net use Z: /delete
```

Disconnect all network mappings only if you intend to remove every one:

```cmd
net use * /delete
```

### Access a share without mapping a drive

```powershell
Get-ChildItem "\\fileserver\shared"
Test-Path "\\fileserver\shared"
```

### List SMB connections and shares

```powershell
Get-SmbConnection
Get-SmbMapping
```

On a computer hosting shares, inspect them with:

```powershell
Get-SmbShare
```

Listing or administering shares on a remote server may require appropriate permissions and remote-management configuration.

### Troubleshoot a mapped drive

```powershell
Test-NetConnection fileserver -Port 445
Resolve-DnsName fileserver
```

Check the UNC path, server name resolution, SMB connectivity, permissions, firewall rules, and saved credentials. Mapped drives are often scoped to a user's logon session; an elevated process may not see mappings created in a non-elevated session.

---

## 9. Disks, volumes, and mounting

### Open Disk Management

```cmd
diskmgmt.msc
```

### List disks and volumes

```powershell
Get-Disk
Get-Partition
Get-Volume
```

### Inspect a specific disk

```powershell
Get-Disk -Number 0 | Format-List *
Get-Partition -DiskNumber 0
```

### Assign a drive letter to an existing partition

First inspect the disk and partition carefully:

```powershell
Get-Partition -DiskNumber 1
```

Then, if the target partition has no drive letter and you have verified the correct partition:

```powershell
Set-Partition -DiskNumber 1 -PartitionNumber 2 -NewDriveLetter R
```

Use the actual disk and partition numbers from your system. Do not guess them.

### Remove a drive letter

```powershell
Remove-PartitionAccessPath -DiskNumber 1 -PartitionNumber 2 -AccessPath "R:\"
```

Removing a drive letter does not normally erase the volume, but it makes it inaccessible through that path.

### Mount a volume into an empty folder

Windows can mount a supported volume into an empty NTFS folder. Use Disk Management or the DiskPart `assign`/`mount` workflows after verifying the target volume and folder. Do not mount a volume over a folder containing files you need.

### DiskPart

Run from an elevated Command Prompt or Terminal:

```cmd
diskpart
list disk
list volume
exit
```

**Caution:** DiskPart includes destructive commands such as `clean`, `delete`, and `format`. Do not run these unless you intentionally want to alter or erase the selected disk or volume. Always verify the disk number and back up important data.

---

## 10. Network troubleshooting

### Show IP configuration

```cmd
ipconfig
ipconfig /all
```

PowerShell alternatives:

```powershell
Get-NetIPConfiguration
Get-NetIPAddress
Get-NetRoute
Get-DnsClientServerAddress
```

### Renew DHCP configuration

```cmd
ipconfig /release
ipconfig /renew
```

These commands can temporarily disconnect the network adapter. For Wi-Fi or remote systems, ensure you have a recovery path.

### Clear the DNS resolver cache

```cmd
ipconfig /flushdns
```

Inspect DNS cache:

```cmd
ipconfig /displaydns
```

### Test connectivity and name resolution

```powershell
Test-Connection 1.1.1.1 -Count 4
Test-NetConnection example.com -Port 443
Resolve-DnsName example.com
```

Command Prompt alternatives:

```cmd
ping 1.1.1.1
tracert example.com
nslookup example.com
```

Some hosts block ping, so a failed ping does not necessarily mean the host is down.

### Show listening ports and connections

```powershell
Get-NetTCPConnection
Get-NetTCPConnection -State Listen
```

Command Prompt:

```cmd
netstat -ano
netstat -ano | findstr :443
```

Use the PID from `netstat -ano` to find the owning process:

```powershell
Get-Process -Id 1234
```

### Show network adapters

```powershell
Get-NetAdapter
Get-NetAdapter | Format-Table Name, Status, LinkSpeed, MacAddress
```

---

## 11. Windows Firewall management

Windows Defender Firewall helps control inbound and outbound network traffic. Use the built-in PowerShell `NetSecurity` cmdlets or the Windows Firewall with Advanced Security console.

### Open the firewall console

```cmd
wf.msc
```

### Check firewall profiles and status

```powershell
Get-NetFirewallProfile |
  Format-Table Name, Enabled, DefaultInboundAction, DefaultOutboundAction
```

Check the profiles individually:

```powershell
Get-NetFirewallProfile -Name Domain, Private, Public
```

Windows has Domain, Private, and Public profiles. The active profile depends on the network connection's classification.

### Enable or disable the firewall

Enable all profiles:

```powershell
Set-NetFirewallProfile -Profile Domain,Private,Public -Enabled True
```

Disable all profiles only for a controlled diagnostic test and only when authorized:

```powershell
Set-NetFirewallProfile -Profile Domain,Private,Public -Enabled False
```

**Security warning:** Do not leave the firewall disabled. Prefer a narrow, temporary rule to diagnose a specific problem, and restore the intended configuration immediately.

### List firewall rules

```powershell
Get-NetFirewallRule
Get-NetFirewallRule -Enabled True
Get-NetFirewallRule -Direction Inbound -Enabled True
```

Inspect a rule's associated ports and addresses:

```powershell
Get-NetFirewallRule -DisplayName "File and Printer Sharing*" |
  Get-NetFirewallPortFilter

Get-NetFirewallRule -DisplayName "File and Printer Sharing*" |
  Get-NetFirewallAddressFilter
```

The display name can vary by Windows language and rule set.

### Create a narrow inbound port rule

Example: allow inbound TCP port 8443 on the Private profile only:

```powershell
New-NetFirewallRule `
  -DisplayName "Lab HTTPS test on TCP 8443" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 8443 `
  -Action Allow `
  -Profile Private
```

Only create rules for services that are actually listening and need to be reachable. Restrict the profile, port, and remote addresses as much as the use case permits.

### Remove a rule

```powershell
Remove-NetFirewallRule -DisplayName "Lab HTTPS test on TCP 8443"
```

Verify the exact rule before removing it. Avoid deleting broad groups of built-in rules unless you understand the effect.

### Test connectivity to a port

```powershell
Test-NetConnection server01 -Port 8443
```

A failed connection may indicate a firewall rule, routing issue, DNS problem, or a service that is not listening. A successful test confirms TCP connectivity, not that the application is healthy or secure.

---

## 12. Windows virus and threat protection

Microsoft Defender Antivirus provides built-in malware and threat protection on supported Windows systems. Some settings may be managed by an organization, third-party antivirus, or security policy.

### Open Windows Security

```powershell
Start-Process "windowsdefender:"
```

Or open Windows Security from the Start menu and select **Virus & threat protection**.

### Check Defender status

In an elevated PowerShell session:

```powershell
Get-MpComputerStatus |
  Select-Object AMServiceEnabled, AntivirusEnabled, AntispywareEnabled,
    RealTimeProtectionEnabled, BehaviorMonitorEnabled,
    IoavProtectionEnabled, NISEnabled, AntivirusSignatureLastUpdated
```

Check the preference settings:

```powershell
Get-MpPreference |
  Select-Object DisableRealtimeMonitoring, DisableBehaviorMonitoring,
    DisableIOAVProtection, MAPSReporting, PUAProtection
```

The cmdlets are provided by the Defender module where available. On devices managed by another antivirus product or organization, some values may differ or access may be restricted.

### Update Defender security intelligence

```powershell
Update-MpSignature
```

This requests an update of Defender security intelligence. It does not replace the full Windows Update process.

### Run a quick or full scan

```powershell
Start-MpScan -ScanType QuickScan
Start-MpScan -ScanType FullScan
```

A full scan can take considerable time. Save work and allow the scan to finish.

### Scan a specific file or folder

```powershell
Start-MpScan -ScanType CustomScan -ScanPath "C:\Lab\Downloads"
```

Use a path you intend to scan. Verify the path before running commands in scripts.

### Check recent Defender detections

```powershell
Get-MpThreat
Get-MpThreatDetection
```

Review detections in Windows Security as well. Investigate the file path, detection name, timestamp, and action taken before deciding how to respond.

### Enable real-time protection

If Defender is active and the setting is not controlled by policy, an administrator may be able to enable real-time monitoring with:

```powershell
Set-MpPreference -DisableRealtimeMonitoring $false
```

Verify the result with `Get-MpComputerStatus`. Tamper Protection, organizational policy, or another security product may prevent changes.

**Security warning:** Do not casually disable antivirus, real-time protection, cloud-delivered protection, or Tamper Protection to get around a blocked file. Use approved exclusions only when justified, narrowly scoped, documented, and authorized. Broad exclusions can create serious security gaps.

---

## 13. Windows Update management

Windows updates deliver security fixes, reliability improvements, and feature updates. The Windows Update settings page is the straightforward built-in method for most client systems. Enterprise devices may use Group Policy, Windows Update for Business, WSUS, or another management platform.

### Open Windows Update

```powershell
Start-Process "ms-settings:windowsupdate"
```

Open update history:

```powershell
Start-Process "ms-settings:windowsupdate-history"
```

### Check installed hotfixes

```powershell
Get-HotFix | Sort-Object InstalledOn -Descending
```

`Get-HotFix` is useful for a quick view but does not show every update type. Use Windows Update history or your organization's management console for a more complete picture.

### Scan and install updates

The Windows Update PowerShell interface is not identical across all Windows versions. On managed devices, use Windows Update settings or the organization's approved update workflow rather than installing an arbitrary module.

On supported systems where the `UsoClient` utility is present, it may be possible to request a scan:

```cmd
UsoClient StartScan
```

This utility is not a stable, fully documented administrative interface, and it may provide no visible output. Do not rely on it as the only update-management method.

### Use `winget` for application updates, not Windows OS updates

```powershell
winget upgrade
winget upgrade --all
```

These commands manage supported applications through Windows Package Manager. They do **not** replace Windows Update for operating-system security patches.

### Restart after updates

```powershell
Restart-Computer
```

Command Prompt alternative:

```cmd
shutdown /r /t 0
```

Save work and notify users before restarting shared or production systems. Check update status and reboot requirements through Windows Update settings or your organization's management tools.

---

## 14. Turn Windows optional features on and off

Yes, Windows optional features can be managed through PowerShell on supported Windows Pro and Enterprise IoT installations. The exact cmdlets and feature names depend on the Windows release and feature. Use `Get-WindowsOptionalFeature` and `Enable-WindowsOptionalFeature` / `Disable-WindowsOptionalFeature` for Windows optional components.

### List available Windows optional features

Run PowerShell as administrator:

```powershell
Get-WindowsOptionalFeature -Online |
  Sort-Object FeatureName |
  Format-Table FeatureName, State
```

Find features by name:

```powershell
Get-WindowsOptionalFeature -Online |
  Where-Object FeatureName -Match 'Hyper-V|Telnet|SMB|IIS'
```

`-Online` means the currently running Windows installation, not a remote or offline image.

### Check one feature's state

```powershell
Get-WindowsOptionalFeature -Online -FeatureName "TelnetClient"
```

Use the exact `FeatureName` reported by `Get-WindowsOptionalFeature`. A display name shown in Windows Settings may not be the same as the feature identifier.

### Enable a feature

Example: enable the Telnet Client optional feature:

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName "TelnetClient"
```

For features that require a restart, Windows may report that one is needed. You can request a restart automatically with `-Restart`, but only use that option when an immediate reboot is acceptable:

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName "TelnetClient" -Restart
```

### Disable a feature

```powershell
Disable-WindowsOptionalFeature -Online -FeatureName "TelnetClient"
```

To allow an automatic restart if required:

```powershell
Disable-WindowsOptionalFeature -Online -FeatureName "TelnetClient" -Restart
```

**Caution:** Disabling a feature can affect applications or services that depend on it. Review the feature state and dependency information before changing production or remote systems.

### List and manage Windows capabilities

Some optional components are managed as Windows capabilities rather than features. List installed capabilities:

```powershell
Get-WindowsCapability -Online |
  Where-Object State -eq "Installed" |
  Sort-Object Name |
  Format-Table Name, State
```

Find a capability:

```powershell
Get-WindowsCapability -Online |
  Where-Object Name -Match 'OpenSSH|RSAT'
```

Add a capability using its exact name:

```powershell
Add-WindowsCapability -Online -Name "OpenSSH.Client~~~~0.0.1.0"
```

Remove a capability:

```powershell
Remove-WindowsCapability -Online -Name "OpenSSH.Client~~~~0.0.1.0"
```

Availability depends on the Windows image, edition, installed components, and update source. Use the exact capability name returned by `Get-WindowsCapability`.

### DISM alternative from PowerShell or Command Prompt

DISM can also enumerate and manage optional features:

```powershell
DISM /Online /Get-Features /Format:Table
DISM /Online /Get-FeatureInfo /FeatureName:TelnetClient
DISM /Online /Enable-Feature /FeatureName:TelnetClient
DISM /Online /Disable-Feature /FeatureName:TelnetClient
```

Run these commands in an elevated terminal. DISM feature names must match the names reported by the system.

### Open the graphical Windows Features dialog

```powershell
Start-Process "optionalfeatures"
```

This opens the familiar **Turn Windows features on or off** dialog. It can be useful for visually inspecting components before changing them.

### Important distinction

- **Windows optional features**: commonly managed by `Get-WindowsOptionalFeature`, `Enable-WindowsOptionalFeature`, and `Disable-WindowsOptionalFeature`.
- **Windows capabilities**: commonly managed by `Get-WindowsCapability`, `Add-WindowsCapability`, and `Remove-WindowsCapability`.
- **Windows roles and role services on Windows Server**: typically managed with the ServerManager module, such as `Get-WindowsFeature`, `Install-WindowsFeature`, and `Uninstall-WindowsFeature`. These are not interchangeable with the client optional-feature cmdlets and are not available in the same way on every Windows client installation.

---

## 16. Manage File Explorer settings with PowerShell

Many File Explorer preferences are stored in the current user's registry. These commands normally do **not** require an elevated PowerShell session because they modify `HKCU` (the current user's settings).

> **Caution:** Registry settings can vary by Windows version. Change one setting at a time and test it. Restarting Explorer closes open File Explorer windows and briefly restarts the taskbar.

### Show or hide file extensions

Show extensions such as `.txt`, `.ps1`, and `.exe`:

```powershell
$path = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"
Set-ItemProperty -Path $path -Name HideFileExt -Type DWord -Value 0
```

Hide extensions again:

```powershell
Set-ItemProperty -Path $path -Name HideFileExt -Type DWord -Value 1
```

### Show or hide hidden files

Show hidden files and folders:

```powershell
$path = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"
Set-ItemProperty -Path $path -Name Hidden -Type DWord -Value 1
```

Hide hidden files and folders:

```powershell
Set-ItemProperty -Path $path -Name Hidden -Type DWord -Value 2
```

### Show or hide protected operating system files

Show protected operating system files:

```powershell
$path = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"
Set-ItemProperty -Path $path -Name ShowSuperHidden -Type DWord -Value 1
```

Hide them again:

```powershell
Set-ItemProperty -Path $path -Name ShowSuperHidden -Type DWord -Value 0
```

**Caution:** These files are hidden to reduce accidental changes. Do not delete or modify them just because they are visible.

### Enable or disable item checkboxes

Enable checkboxes for selecting files:

```powershell
$path = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"
Set-ItemProperty -Path $path -Name AutoCheckSelect -Type DWord -Value 1
```

Disable checkboxes:

```powershell
Set-ItemProperty -Path $path -Name AutoCheckSelect -Type DWord -Value 0
```

### Open File Explorer to This PC or Home

Open File Explorer to **This PC**:

```powershell
$path = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"
Set-ItemProperty -Path $path -Name LaunchTo -Type DWord -Value 1
```

Open File Explorer to **Home** (the default on many Windows 11 installations):

```powershell
Set-ItemProperty -Path $path -Name LaunchTo -Type DWord -Value 2
```

The displayed start location can vary by Windows release and configuration.

### Show drive letters before drive names

```powershell
$path = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer"
New-Item -Path $path -Force | Out-Null
Set-ItemProperty -Path $path -Name ShowDriveLettersFirst -Type DWord -Value 4
```

Set the value to `0` to return to the default drive-letter display behavior:

```powershell
Set-ItemProperty -Path $path -Name ShowDriveLettersFirst -Type DWord -Value 0
```

### Show thumbnails or icons

Show file thumbnails where supported:

```powershell
$path = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"
Set-ItemProperty -Path $path -Name IconsOnly -Type DWord -Value 0
```

Show icons instead of thumbnails:

```powershell
Set-ItemProperty -Path $path -Name IconsOnly -Type DWord -Value 1
```

Thumbnail availability also depends on file type, folder view settings, performance options, and installed codecs.

### Expand the navigation pane to the current folder

```powershell
$path = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"
Set-ItemProperty -Path $path -Name NavPaneExpandToCurrentFolder -Type DWord -Value 1
```

Disable this behavior:

```powershell
Set-ItemProperty -Path $path -Name NavPaneExpandToCurrentFolder -Type DWord -Value 0
```

### Display the full path in the Explorer title bar

```powershell
$path = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\CabinetState"
New-Item -Path $path -Force | Out-Null
Set-ItemProperty -Path $path -Name FullPath -Type DWord -Value 1
```

Disable the full path in the title bar:

```powershell
Set-ItemProperty -Path $path -Name FullPath -Type DWord -Value 0
```

This setting may have limited or different effects on some newer Windows 11 interfaces.

### Read the current values

```powershell
$advanced = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"

Get-ItemProperty -Path $advanced |
    Select-Object HideFileExt, Hidden, ShowSuperHidden, AutoCheckSelect,
        LaunchTo, IconsOnly, NavPaneExpandToCurrentFolder
```

A value may be absent if Windows has not created it or if that setting is not used by the current build.

### Refresh File Explorer

Some settings take effect immediately; others may need Explorer to refresh. Save file operations first.

```powershell
Stop-Process -Name explorer -Force
Start-Process explorer.exe
```

This closes Explorer windows and briefly restarts the taskbar. Avoid doing this in a shared or remote session unless you understand the impact.

### Open the graphical File Explorer Options dialog

```powershell
Start-Process "control.exe" -ArgumentList "folders"
```

This opens the classic File Explorer Options dialog where supported. Some settings and labels differ between Windows 10 and Windows 11.

---

## 17. System information and hardware

### Windows version and system information

```powershell
Get-ComputerInfo
Get-CimInstance Win32_OperatingSystem
Get-CimInstance Win32_ComputerSystem
```

Quick Command Prompt tools:

```cmd
winver
systeminfo
hostname
whoami
```

### CPU, memory, and disk overview

```powershell
Get-CimInstance Win32_Processor |
  Select-Object Name, NumberOfCores, NumberOfLogicalProcessors

Get-CimInstance Win32_OperatingSystem |
  Select-Object TotalVisibleMemorySize, FreePhysicalMemory

Get-Volume
```

The memory values reported by `Win32_OperatingSystem` are in kilobytes.

### Device Manager

```cmd
devmgmt.msc
```

### Hardware inventory through PowerShell

```powershell
Get-CimInstance Win32_BIOS
Get-CimInstance Win32_PhysicalMemory |
  Select-Object Manufacturer, Capacity, Speed
Get-CimInstance Win32_LogicalDisk |
  Select-Object DeviceID, VolumeName, Size, FreeSpace
```

Some hardware details may be unavailable or vendor-specific.

---

## 17. Applications and packages with winget

`winget` is Microsoft's Windows Package Manager command-line client. It is normally delivered through **App Installer** on supported Windows client systems.

### Check whether winget is available

```powershell
winget --version
Get-Command winget -ErrorAction SilentlyContinue
```

If the command is not found, check Windows version, App Installer, and the current user's application aliases.

### Enable or install winget

There is not one universal command that enables `winget` on every Windows installation. On supported Windows 10/11 systems, try these steps:

1. Open Microsoft Store.
2. Search for **App Installer** published by Microsoft.
3. Install or update it.
4. Close and reopen Terminal or PowerShell, then run:

```powershell
winget --version
```

You can open the Store's App Installer listing using:

```powershell
Start-Process "ms-windows-store://pdp/?ProductId=9NBLGGH4NNS1"
```

If Microsoft Store is blocked or unavailable, use your organization's approved deployment method or Microsoft's official App Installer distribution/documentation. Avoid downloading installers from untrusted third-party sites.

On some Windows installations, registering App Installer for the current user may help if its package is already installed:

```powershell
Get-AppxPackage Microsoft.DesktopAppInstaller
```

If it returns a package, try:

```powershell
Get-AppxPackage Microsoft.DesktopAppInstaller |
  ForEach-Object {
    Add-AppxPackage -DisableDevelopmentMode -Register "$($_.InstallLocation)\AppxManifest.xml"
  }
```

This is not a substitute for installing App Installer if it is absent, and it may be restricted by organizational policy.

### Search for a package

```powershell
winget search vscode
winget search 7zip
```

### Show package details

```powershell
winget show Microsoft.VisualStudioCode
```

Package identifiers can change or have multiple matches. Search first and confirm the ID and publisher before installing.

### Install an application

```powershell
winget install --id Microsoft.VisualStudioCode -e
winget install --id 7zip.7zip -e
```

`-e` asks `winget` to match the package identifier exactly.

### Upgrade applications

```powershell
winget upgrade
winget upgrade --all
winget upgrade --id Microsoft.VisualStudioCode -e
```

Review the proposed changes before running broad upgrades on production or managed systems.

### Uninstall an application

```powershell
winget list
winget uninstall --id Microsoft.VisualStudioCode -e
```

Some applications are not managed by `winget`, and some installers may require separate uninstall handling.

### Export and import a package list

```powershell
winget export -o packages.json
winget import -i packages.json
```

Review exported/imported manifests before using them on another computer. Package availability, source, and installer behavior can differ.

### Manage sources

```powershell
winget source list
winget source update
```

Sources can be managed by policy. Do not reset or add sources casually on managed computers.

---

## 18. Windows updates and reboot status

### Open Windows Update settings

```powershell
Start-Process "ms-settings:windowsupdate"
```

Open update history:

```powershell
Start-Process "ms-settings:windowsupdate-history"
```

### Check recent update hotfixes

```powershell
Get-HotFix | Sort-Object InstalledOn -Descending
```

`Get-HotFix` is useful but is not a complete inventory of every update type.

### Restart or shut down

```powershell
Restart-Computer
Stop-Computer
```

Command Prompt equivalents:

```cmd
shutdown /r /t 0
shutdown /s /t 0
```

Schedule a restart after 60 seconds:

```cmd
shutdown /r /t 60
```

Cancel a pending shutdown:

```cmd
shutdown /a
```

Save work and notify users before restarting shared or production systems.

---

## 19. Files, permissions, and folders

### List files

```powershell
Get-ChildItem
Get-ChildItem C:\Windows
Get-ChildItem -Force
Get-ChildItem -Recurse -Filter "*.log"
```

Command Prompt alternatives:

```cmd
dir
dir /a
```

### Create, copy, move, and remove

```powershell
New-Item -ItemType Directory -Path C:\Temp\Lab
Copy-Item C:\Temp\source.txt C:\Temp\backup.txt
Move-Item C:\Temp\backup.txt C:\Temp\Lab\
Remove-Item C:\Temp\Lab\backup.txt
```

Recursive deletion is powerful; verify the path before using `Remove-Item -Recurse`.

### Inspect file permissions

```powershell
Get-Acl C:\Temp
```

Command Prompt:

```cmd
icacls C:\Temp
```

### Grant and remove permissions

`icacls` can change NTFS permissions. Example for granting Modify permission to a local user on a specific folder:

```cmd
icacls C:\Lab /grant "COMPUTERNAME\alice:(M)"
```

Replace `COMPUTERNAME` and `alice` with the actual computer and user. Review inheritance and existing ACLs before changing permissions.

### Copy a directory tree

```cmd
robocopy C:\Source D:\Backup /E
```

`/E` copies subdirectories, including empty ones. Be careful with mirror options such as `/MIR`: they can delete destination files that are not present in the source.

---

## 20. Event logs and troubleshooting

### Open Event Viewer

```cmd
eventvwr.msc
```

### Read recent System events

```powershell
Get-WinEvent -LogName System -MaxEvents 50 |
  Select-Object TimeCreated, Id, LevelDisplayName, ProviderName, Message
```

Read recent Application events:

```powershell
Get-WinEvent -LogName Application -MaxEvents 50 |
  Select-Object TimeCreated, Id, LevelDisplayName, ProviderName, Message
```

### Filter for errors

```powershell
Get-WinEvent -FilterHashtable @{
  LogName = 'System'
  Level = 2
  StartTime = (Get-Date).AddDays(-1)
} | Select-Object TimeCreated, Id, ProviderName, Message
```

Event log access may be restricted. An empty result does not always mean there are no problems; confirm the log name, time range, and permissions.

### System file checks

From an elevated Command Prompt or PowerShell:

```cmd
sfc /scannow
DISM /Online /Cleanup-Image /RestoreHealth
```

These tools check and repair Windows system files/component store where possible. They may take time and require access to Windows Update or a repair source.

---

## 21. Remote administration and connectivity

### Check whether a remote port is reachable

```powershell
Test-NetConnection server01 -Port 445
Test-NetConnection server01 -Port 3389
```

Port `445` is commonly used for SMB file sharing; `3389` is the default RDP port. A successful port test only confirms TCP connectivity to that port, not that authentication will succeed.

### Remote PowerShell

PowerShell remoting typically requires WinRM configuration, firewall rules, authentication, and policy setup. On a trusted, appropriately managed machine, an administrator may enable remoting with:

```powershell
Enable-PSRemoting -Force
```

Do not enable remote management on untrusted networks without understanding the security implications. Follow organizational guidance for domain, workgroup, and firewall configuration.

### Connect to a remote PowerShell session

```powershell
Enter-PSSession -ComputerName server01
```

This works only when the target and client are configured for compatible remoting and authentication. For workgroup scenarios, additional configuration may be required; do not broadly weaken authentication or TrustedHosts settings.

Exit the session:

```powershell
Exit-PSSession
```

### Remote Desktop

Open Remote Desktop Connection:

```cmd
mstsc
```

Remote Desktop hosting availability depends on Windows edition and policy. Do not expose RDP directly to the public internet; use an approved VPN or secure remote-access solution.

---

## 22. Useful keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Win + R` | Open Run |
| `Win + X` | Open Quick Link menu |
| `Win + E` | Open File Explorer |
| `Win + I` | Open Settings |
| `Ctrl + Shift + Esc` | Open Task Manager |
| `Win + Pause` | Open system information on versions that support it |
| `Win + L` | Lock the PC |
| `Alt + F4` | Close the active app; from desktop, opens shutdown dialog |
| `Win + X`, then `A` | Often opens Terminal/PowerShell as administrator, depending on menu and configuration |

---

## 23. Quick reference

| Task | Command |
|---|---|
| Local Users and Groups GUI | `lusrmgr.msc` |
| Computer Management GUI | `compmgmt.msc` |
| List local users | `Get-LocalUser` |
| Create local user | `New-LocalUser` |
| Enable/disable user | `Enable-LocalUser` / `Disable-LocalUser` |
| List local groups | `Get-LocalGroup` |
| List administrators | `Get-LocalGroupMember -Group "Administrators"` |
| List processes | `Get-Process` |
| Stop process | `Stop-Process -Id 1234` |
| List services | `Get-Service` |
| Restart service | `Restart-Service -Name Spooler` |
| Map network drive | `New-PSDrive -Name Z -PSProvider FileSystem -Root "\\server\share" -Persist` |
| List mapped drives | `Get-SmbMapping` |
| Show IP configuration | `ipconfig /all` |
| Renew DHCP | `ipconfig /renew` |
| Flush DNS cache | `ipconfig /flushdns` |
| Show disks/volumes | `Get-Disk` / `Get-Volume` |
| Open Disk Management | `diskmgmt.msc` |
| Check winget | `winget --version` |
| Search winget packages | `winget search vscode` |
| Upgrade packages | `winget upgrade --all` |
| Open Event Viewer | `eventvwr.msc` |
| Restart computer | `Restart-Computer` |

**Good administrative habits**

1. Inspect before changing: query the account, process, service, drive, or disk first.
2. Use least privilege. Avoid making everyday accounts local administrators.
3. Do not place passwords in command lines or scripts.
4. Check command output and exit status; do not assume a command succeeded.
5. Be especially careful with account deletion, disk commands, recursive file deletion, permissions, and broad package upgrades.
6. For managed PCs, follow the organization's policies rather than trying to bypass restrictions.
