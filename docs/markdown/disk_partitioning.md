---
layout: sheet
title: "Linux Disk, Partition, Filesystem, and Mounting Cheat Sheet"
category: "System"
summary: "Identify drives, create partitions and filesystems, and manage mounts on Debian."
date: 2026-10-24 20:04:23
permalink: /html/disk_partitioning.html
---
# Linux Disk, Partition, Filesystem, and Mounting Cheat Sheet

A practical command reference for managing disks on Debian 13 and similar Linux systems. It covers identifying drives, creating partitions, making filesystems, mounting and unmounting storage, configuring permanent mounts, and troubleshooting.

> **Warning: destructive operations.** Partitioning, formatting, and some repair commands can destroy data. Identify the correct device carefully before running commands. Examples such as `/dev/sdb` and `/dev/sdb1` are placeholders; your actual device names may differ. Back up important data first.

## Table of contents

- [1. The storage layers](#1-the-storage-layers)
- [2. Identify disks and filesystems](#2-identify-disks-and-filesystems)
- [3. Understand device names](#3-understand-device-names)
- [4. Partitioning tools](#4-partitioning-tools)
- [5. Create and manage partitions with fdisk](#5-create-and-manage-partitions-with-fdisk)
- [6. Create and manage partitions with parted](#6-create-and-manage-partitions-with-parted)
- [7. Create filesystems](#7-create-filesystems)
- [8. Check and repair filesystems](#8-check-and-repair-filesystems)
- [9. Mount and unmount drives temporarily](#9-mount-and-unmount-drives-temporarily)
- [10. Mount by UUID, label, or device path](#10-mount-by-uuid-label-or-device-path)
- [11. Configure permanent mounts with /etc/fstab](#11-configure-permanent-mounts-with-etcfstab)
- [12. Permanent mounting methods and when to use them](#12-permanent-mounting-methods-and-when-to-use-them)
- [13. Ownership and permissions on mounted filesystems](#13-ownership-and-permissions-on-mounted-filesystems)
- [14. Swap space](#14-swap-space)
- [15. LVM, RAID, and encrypted storage overview](#15-lvm-raid-and-encrypted-storage-overview)
- [16. Troubleshooting](#16-troubleshooting)
- [17. Safe workflow examples](#17-safe-workflow-examples)
- [18. Quick reference](#18-quick-reference)
- [19. Disk imaging and copying with dd](#19-disk-imaging-and-copying-with-dd)
- [20. Digital forensics and recovery tools](#20-digital-forensics-and-recovery-tools)
- [21. Evidence-handling workflow](#21-evidence-handling-workflow)

---

## 1. The storage layers

A typical Linux data drive uses several layers:

1. **Physical device**: the SSD, HDD, USB drive, or virtual disk, such as `/dev/sdb`.
2. **Partition table**: describes the partitions on a drive. Common formats are GPT and MBR/DOS.
3. **Partition**: a section of a drive, such as `/dev/sdb1`.
4. **Filesystem**: organizes files and directories within a partition, such as ext4, XFS, or FAT32.
5. **Mount point**: a directory where the filesystem becomes accessible, such as `/mnt/data`.

For example, a drive might be `/dev/sdb`, its first partition `/dev/sdb1`, formatted as ext4, and mounted at `/mnt/data`.

**Important:** A partition is not the same as a filesystem, and a filesystem is not the same as a mount point. Creating a partition does not automatically create a filesystem or mount it.

## 2. Identify disks and filesystems

Start by inspecting the system before changing anything.

### Show block devices in a tree

```bash
lsblk
lsblk -f
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS
```

- `lsblk` lists disks, partitions, and other block devices.
- `-f` adds filesystem type, label, UUID, and mount information.
- `-o` selects the columns to display.
- `MOUNTPOINTS` can show more than one mount point when applicable.

### Show filesystem space usage

```bash
df -h
df -hT
df -h /mnt/data
```

`df` reports space usage for mounted filesystems. `-h` uses human-readable units, and `-T` shows filesystem types. It does not list every unmounted partition.

### Show filesystem signatures and UUIDs

```bash
sudo blkid
sudo blkid /dev/sdb1
```

`blkid` reports recognized filesystem metadata, including UUIDs and labels.

### Show partition tables

```bash
sudo fdisk -l
sudo parted -l
```

These commands list partition layouts. They are useful for inspection without entering an interactive partition editor.

### Show kernel messages about storage

```bash
dmesg --level=err,warn
journalctl -k --since "today"
```

Use these to look for device, controller, filesystem, or I/O errors.

## 3. Understand device names

Common examples:

| Device | Meaning |
|---|---|
| `/dev/sda` | Often the first SATA/SCSI-style disk |
| `/dev/sda1` | First partition on `/dev/sda` |
| `/dev/nvme0n1` | An NVMe disk |
| `/dev/nvme0n1p1` | First partition on that NVMe disk |
| `/dev/mmcblk0` | An eMMC or SD-style device |
| `/dev/mmcblk0p1` | First partition on that device |
| `/dev/sr0` | Often an optical drive |
| `/dev/mapper/...` | A device exposed by device-mapper, often LVM or encryption |

Device names can change depending on hardware and boot order. For permanent configuration, prefer a filesystem UUID or label rather than assuming a drive will always be `/dev/sdb`.

## 4. Partitioning tools

Common tools include:

- `fdisk`: interactive partition editor, commonly used for MBR and GPT partition tables.
- `parted`: supports GPT and MBR and can work with disks larger than 2 TiB.
- `gdisk`: interactive GPT-focused partition editor.
- `cfdisk`: menu-based partition editor, useful for beginners.
- `lsblk`, `blkid`, `fdisk -l`, `parted -l`: inspect devices and layouts.

Install tools if needed:

```bash
sudo apt update
sudo apt install fdisk parted gdisk
```

Many minimal Debian installations already include `fdisk` and related utilities.

**Before partitioning:** confirm the target with `lsblk -f` and `sudo fdisk -l`. The examples below assume a new, empty disk at `/dev/sdb`. Do not copy them blindly onto a disk containing data.

## 5. Create and manage partitions with fdisk

Launch `fdisk` for a disk:

```bash
sudo fdisk /dev/sdb
```

Inside the interactive prompt, common commands are:

| Key | Action |
|---|---|
| `m` | Show help |
| `p` | Print the current partition table |
| `g` | Create a new GPT partition table |
| `o` | Create a new DOS/MBR partition table |
| `n` | Create a new partition |
| `d` | Delete a partition |
| `t` | Change a partition type |
| `w` | Write changes to disk and exit |
| `q` | Quit without saving pending changes |

A typical workflow for a **new, empty disk** is:

1. Run `sudo fdisk /dev/sdb`.
2. Type `g` to create a GPT partition table.
3. Type `n` to create a partition. Accept defaults to use the available space if that is what you want.
4. Type `p` to review the proposed layout.
5. Type `w` to write changes and exit.

Creating a new partition table overwrites the old partition-table information and can make existing data inaccessible. Do not use `g` or `o` on a disk with data you need to preserve.

After writing changes, inspect the result:

```bash
lsblk /dev/sdb
sudo fdisk -l /dev/sdb
```

If the kernel has not picked up the new partition table, you may need to ask it to reread the table or disconnect and reconnect a removable drive. Do not force a reread while partitions on that disk are in active use.

## 6. Create and manage partitions with parted

Print the partition table:

```bash
sudo parted /dev/sdb print
```

For a **new, empty disk**, an example GPT setup using most of the disk is:

```bash
sudo parted /dev/sdb
```

At the `parted` prompt:

```text
mklabel gpt
mkpart primary ext4 1MiB 100%
print
quit
```

`mklabel gpt` creates a new partition table and destroys the old partition-table layout. `mkpart` creates a partition entry but does **not** format it as ext4, despite the `ext4` hint in the command.

Check the resulting partition name:

```bash
lsblk
```

Depending on the device, the new partition might be `/dev/sdb1` or `/dev/nvme0n1p1`.

Other useful commands include:

```bash
sudo parted /dev/sdb print free
sudo parted /dev/sdb unit GiB print
```

These display the partition table, unallocated space, or sizes in GiB. Use the interactive help command `help` within `parted` for its supported commands.

## 7. Create filesystems

**Formatting creates a filesystem and normally destroys the existing filesystem's data.** Double-check the partition name.

### ext4 (common Linux choice)

```bash
sudo mkfs.ext4 /dev/sdb1
```

### XFS

```bash
sudo mkfs.xfs /dev/sdb1
```

XFS is common for large data volumes and server workloads. Do not run `mkfs.xfs` on a partition containing data you need.

### FAT32 / vfat

```bash
sudo mkfs.fat -F 32 /dev/sdb1
```

FAT32 is widely compatible with devices but has limitations, including a maximum individual file size of 4 GiB.

### exFAT

```bash
sudo mkfs.exfat /dev/sdb1
```

Install the formatter if necessary:

```bash
sudo apt install exfatprogs
```

exFAT is useful for removable drives shared between Linux, Windows, and macOS.

### NTFS

```bash
sudo mkfs.ntfs -f /dev/sdb1
```

Install NTFS tools if necessary:

```bash
sudo apt install ntfs-3g
```

Use `mkfs.ntfs` only when creating a new NTFS filesystem. For a Windows data drive, ensure Windows has shut down cleanly and that BitLocker or other encryption requirements are understood before accessing it.

### Check the result

```bash
lsblk -f
sudo blkid /dev/sdb1
```

## 8. Check and repair filesystems

Filesystem-check tools depend on the filesystem type. **Unmount the filesystem before running a repair or check that requires exclusive access.** Never run a repair command on a mounted filesystem unless the tool's documentation explicitly supports that operation.

### ext2/ext3/ext4

```bash
sudo umount /dev/sdb1
sudo e2fsck -f /dev/sdb1
```

`e2fsck` checks ext-family filesystems. Review proposed repairs carefully; if the data is valuable, make a backup or image first.

### XFS

```bash
sudo umount /dev/sdb1
sudo xfs_repair -n /dev/sdb1
```

`-n` performs a no-modify check. If repair is needed, consult `man xfs_repair` before proceeding. Do not run `xfs_repair` on a mounted filesystem.

### FAT filesystems

```bash
sudo umount /dev/sdb1
sudo fsck.fat -n /dev/sdb1
```

The `-n` option checks without making changes. Tool options vary by filesystem; read the relevant manual page before repair.

## 9. Mount and unmount drives temporarily

A mount point is an existing directory where a filesystem is made accessible.

### Create a mount point

```bash
sudo mkdir -p /mnt/data
```

### Mount a partition

```bash
sudo mount /dev/sdb1 /mnt/data
```

For a known filesystem type, you can specify it:

```bash
sudo mount -t ext4 /dev/sdb1 /mnt/data
```

Normally, `mount` detects the filesystem type automatically.

### Confirm the mount

```bash
findmnt /mnt/data
lsblk -f
df -hT /mnt/data
```

### Browse and copy files

```bash
ls -la /mnt/data
sudo cp example.txt /mnt/data/
```

A filesystem mounted at `/mnt/data` hides any previous contents of that directory until it is unmounted. Use a dedicated, empty mount-point directory.

### Unmount it

```bash
sudo umount /mnt/data
```

You can also unmount by device:

```bash
sudo umount /dev/sdb1
```

The command is `umount`, not `unmount`.

If the filesystem is busy, find processes using it:

```bash
sudo fuser -vm /mnt/data
sudo lsof +f -- /mnt/data
```

Close shells whose current directory is inside the mount, stop applications using files there, and retry. Avoid lazy or forced unmounts as a routine fix; they can conceal the fact that a process still depends on the filesystem.

## 10. Mount by UUID, label, or device path

Linux can identify a filesystem in several ways.

### Device path

```bash
sudo mount /dev/sdb1 /mnt/data
```

Simple, but names like `/dev/sdb1` may change after hardware or boot-order changes.

### UUID

Get the UUID:

```bash
sudo blkid /dev/sdb1
```

Then mount using it:

```bash
sudo mount UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx /mnt/data
```

Replace the example UUID with the actual one. UUIDs are usually the best default for permanent local-disk mounts.

### Filesystem label

Set a label when creating an ext4 filesystem:

```bash
sudo mkfs.ext4 -L DATA /dev/sdb1
```

Or change an existing ext2/3/4 label (without reformatting):

```bash
sudo e2label /dev/sdb1 DATA
```

Mount by label:

```bash
sudo mount LABEL=DATA /mnt/data
```

Labels are human-readable, but labels must be unique if multiple connected filesystems use the same label.

## 11. Configure permanent mounts with /etc/fstab

`/etc/fstab` is the standard configuration file for filesystems that should be mounted automatically, usually at boot. It can also define swap space.

### Step 1: identify the filesystem

```bash
lsblk -f
sudo blkid
```

Record the partition's UUID and filesystem type. Make sure it is the intended data partition, not your root or EFI system partition.

### Step 2: create a mount point

For example:

```bash
sudo mkdir -p /mnt/data
```

Other common choices include `/srv/data` for server data or a directory under `/media` for removable media. Choose a path that fits your use.

### Step 3: back up fstab

```bash
sudo cp -a /etc/fstab /etc/fstab.backup
sudo vim /etc/fstab
```

Use `vim` or your preferred editor with root privileges. Do not delete existing system entries.

### Step 4: add an entry

A typical ext4 data-disk entry looks like this:

```fstab
UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  /mnt/data  ext4  defaults  0  2
```

Replace the UUID with the real value.

The six fields are:

1. **Device**: UUID, label, or device path.
2. **Mount point**: directory where the filesystem will appear.
3. **Filesystem type**: for example, `ext4`, `xfs`, `exfat`, or `ntfs`.
4. **Options**: comma-separated mount options.
5. **Dump field**: normally `0`.
6. **Pass field**: filesystem-check order at boot. `0` disables the traditional fsck pass; `1` is normally reserved for the root filesystem; `2` is commonly used for other Linux filesystems that support boot-time checks.

### Step 5: test before rebooting

First ask systemd to reload its view of unit files:

```bash
sudo systemctl daemon-reload
```

Then test the fstab entries:

```bash
sudo findmnt --verify --verbose
sudo mount -a
```

- `findmnt --verify` checks fstab entries for common problems.
- `mount -a` attempts to mount filesystems configured for automatic mounting, excluding entries marked `noauto`.

Check the result:

```bash
findmnt /mnt/data
df -hT /mnt/data
```

If `mount -a` reports an error, correct `/etc/fstab` before rebooting. A bad fstab entry can cause boot delays or recovery-mode problems. Keep the backup and know how to access a recovery shell.

### Common fstab options

| Option | Meaning |
|---|---|
| `defaults` | Standard default options, generally including read-write access and automatic mounting |
| `ro` | Mount read-only |
| `rw` | Request read-write access |
| `noauto` | Do not mount automatically via `mount -a` or normal automatic fstab mounting |
| `nofail` | Do not make boot depend on successful mounting of this filesystem |
| `noatime` | Avoid updating file access times on reads |
| `user` | Allow an ordinary user to mount the filesystem; normally only the mounting user can unmount it |
| `users` | Allow any user to mount and unmount it |
| `uid=1000,gid=1000` | Common ownership mapping options for filesystems that do not store Unix ownership, such as many FAT mounts |
| `umask=022` | Common permission mask option for FAT-like filesystems; exact support depends on the filesystem driver |

Options are filesystem- and use-case-dependent. Do not paste every option into every entry.

## 12. Permanent mounting methods and when to use them

“Permanent mounting” usually means the system mounts a filesystem automatically, often at boot. There are several ways to configure this, depending on the type of storage.

### Method A: `/etc/fstab` for a fixed internal drive

**Best for:** internal SATA/NVMe disks, stable data volumes, and filesystems that should be available during normal boot.

Example:

```fstab
UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  /srv/data  ext4  defaults  0  2
```

Prepare the mount point and test it:

```bash
sudo mkdir -p /srv/data
sudo vim /etc/fstab
sudo findmnt --verify --verbose
sudo mount -a
findmnt /srv/data
```

Use the actual UUID from `blkid`. A UUID is more reliable than `/dev/sdb1` when drive enumeration changes.

### Method B: `/etc/fstab` with `nofail` for optional drives

**Best for:** a secondary disk that may sometimes be disconnected, or storage that should not prevent the machine from booting if unavailable.

Example:

```fstab
UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  /mnt/archive  ext4  defaults,nofail  0  2
```

`nofail` helps avoid making the boot depend on this mount succeeding. It does not make an absent drive available, and dependent services may still need their own configuration.

For removable USB drives, consider whether automatic boot-time mounting is actually desirable. Desktop environments may be better for drives that come and go.

### Method C: systemd automount

**Best for:** a local or network filesystem that should be mounted on first access rather than mounted immediately during boot.

A systemd automount is usually configured through matching `.mount` and `.automount` units. Unit names must correspond to the escaped mount path.

For mount point `/mnt/archive`, generate the correct unit names with:

```bash
systemd-escape --path --suffix=mount /mnt/archive
systemd-escape --path --suffix=automount /mnt/archive
```

Create `/etc/systemd/system/mnt-archive.mount`:

```ini
[Unit]
Description=Archive filesystem

[Mount]
What=UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Where=/mnt/archive
Type=ext4
Options=defaults
```

Create `/etc/systemd/system/mnt-archive.automount`:

```ini
[Unit]
Description=Automount archive filesystem

[Automount]
Where=/mnt/archive

[Install]
WantedBy=multi-user.target
```

Create the directory, reload systemd, and enable the automount:

```bash
sudo mkdir -p /mnt/archive
sudo systemctl daemon-reload
sudo systemctl enable --now mnt-archive.automount
```

Check its state:

```bash
systemctl status mnt-archive.automount
systemctl status mnt-archive.mount
findmnt /mnt/archive
```

The filesystem mount is normally activated when something accesses `/mnt/archive`. Use this pattern when delayed mounting is useful. For simple internal disks, `/etc/fstab` is usually easier. Do not configure the same filesystem/mount point in conflicting ways through both fstab and separate systemd units.

### Method D: Desktop automount for removable media

**Best for:** USB sticks, external disks, and SD cards used interactively on a desktop.

GNOME and other desktop environments can mount removable media when inserted and often place it under `/media/$USER/`. This is managed by the desktop's storage services, not usually by a permanent `/etc/fstab` entry.

Check the mount after inserting a drive:

```bash
lsblk -f
findmnt
```

If you want a removable disk at a predictable path even without a desktop session, an fstab entry may be appropriate. Use its UUID and consider `nofail` and `noauto` based on your needs.

### Method E: Network storage with `/etc/fstab`

**Best for:** a persistent SMB/CIFS or NFS share. Network mounts require extra care because the network or server may not be available during early boot.

For an SMB/CIFS share, install the helper:

```bash
sudo apt install cifs-utils
```

Create a mount point:

```bash
sudo mkdir -p /mnt/sharedrive
```

Create a root-readable credentials file rather than putting a password directly in `/etc/fstab`:

```bash
sudo install -m 600 /dev/null /etc/samba/credentials-sharedrive
sudo vim /etc/samba/credentials-sharedrive
```

Example contents:

```text
username=YOUR_USERNAME
password=YOUR_PASSWORD
```

Protect the file because it contains a password. For environments requiring a domain, add a `domain=...` line if appropriate. Avoid sharing the credentials file.

An illustrative fstab entry:

```fstab
//SERVER/SHARE  /mnt/sharedrive  cifs  credentials=/etc/samba/credentials-sharedrive,_netdev,nofail,x-systemd.automount,uid=1000,gid=1000  0  0
```

Replace `SERVER`, `SHARE`, username, password, and user/group IDs with real values. Confirm the local account IDs with:

```bash
id YOUR_LOCAL_USERNAME
```

Notes:
- `_netdev` tells the system the mount needs network connectivity.
- `nofail` helps prevent an unavailable share from blocking boot.
- `x-systemd.automount` can delay the actual network mount until access.
- `uid` and `gid` influence ownership presentation for many CIFS mounts; they do not replace server-side permissions.
- Some servers require additional security or protocol options. Use options supported by your NAS/server and the installed CIFS client.

For NFS, install the client tools if needed:

```bash
sudo apt install nfs-common
```

An illustrative NFS fstab entry is:

```fstab
SERVER:/export/data  /mnt/nfsdata  nfs  _netdev,nofail,x-systemd.automount  0  0
```

Replace the server and export path. Network filesystems have server-side export and permission requirements as well as client mount options.

### Which method should I choose?

| Storage situation | Recommended starting point |
|---|---|
| Fixed internal Linux data disk | `/etc/fstab` with `UUID=` |
| Optional secondary disk | `/etc/fstab` with `UUID=` and often `nofail` |
| Disk should mount on first access | systemd automount |
| USB drive used interactively in a desktop | Desktop automount |
| SMB/CIFS network share | `cifs-utils` plus fstab, credentials file, and network-aware options |
| NFS share | `nfs-common` plus fstab and network-aware options |

## 13. Ownership and permissions on mounted filesystems

Mounting a filesystem does not automatically give every user permission to write to it. Access depends on filesystem permissions, mount options, and sometimes server-side rules.

### ext4 and other Unix-style filesystems

These filesystems store ownership and permissions on disk. Set ownership on the mounted directory when appropriate:

```bash
sudo chown YOUR_USERNAME:YOUR_USERNAME /mnt/data
sudo chmod 755 /mnt/data
```

Be careful: changing ownership on the mount point while the drive is **not** mounted affects the underlying directory on the root filesystem, not the contents of the drive. Mount the filesystem first, verify with `findmnt`, then change the intended directory.

For an entire data volume, a one-time ownership change may be appropriate, but recursively changing permissions on a large filesystem can take time and may break applications. Avoid `chmod -R 777`.

### FAT and exFAT

These filesystems do not store Linux ownership and permission bits in the same way ext4 does. Mount options can present files as owned by a chosen user:

```bash
sudo mount -t exfat -o uid=1000,gid=1000,umask=022 /dev/sdb1 /mnt/data
```

Get the correct IDs with `id YOUR_USERNAME`. For a permanent mount, put suitable options in the fstab options field.

### NTFS

NTFS ownership and permission behavior depends on the driver and mount options. If access needs to be assigned to a particular local user, consult the installed NTFS driver's documentation and test the exact options before relying on them.

## 14. Swap space

Swap provides disk-backed memory support. It is separate from a regular data filesystem.

### Show active swap

```bash
swapon --show
free -h
```

### Enable an existing swap partition

```bash
sudo swapon /dev/sdb2
```

To make it persistent, add an entry to `/etc/fstab` using the actual swap UUID:

```fstab
UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  none  swap  sw  0  0
```

Only do this if `/dev/sdb2` is already correctly initialized as swap. Creating swap with `mkswap` is destructive to existing content on the selected partition.

## 15. LVM, RAID, and encrypted storage overview

Some systems add layers between a physical disk and the filesystem. Identify these before making changes.

### LVM (Logical Volume Manager)

Useful commands:

```bash
sudo pvs
sudo vgs
sudo lvs
```

LVM groups physical storage into volume groups and allocates logical volumes. Filesystems are commonly created on logical volumes such as `/dev/vgname/lvname`. Do not format a physical volume or logical volume until you know which layer it represents.

### Software RAID

Useful inspection commands:

```bash
cat /proc/mdstat
sudo mdadm --detail --scan
```

RAID devices can be assembled from multiple disks. Do not repartition or format a member disk without understanding the array configuration.

### LUKS encryption

Useful inspection commands:

```bash
lsblk -f
sudo cryptsetup status NAME
```

The `cryptsetup status` example requires replacing `NAME` with the active mapped device name. Encrypted storage may expose a decrypted device under `/dev/mapper/`, and the filesystem is created and mounted on the appropriate decrypted layer, not on the raw encrypted container.

These are inspection starting points, not complete setup or recovery procedures. Read the relevant documentation before modifying LVM, RAID, or encrypted devices.

## 16. Troubleshooting

### “mount point does not exist”

Create the directory:

```bash
sudo mkdir -p /mnt/data
```

### “wrong fs type”, “bad superblock”, or unknown filesystem

Inspect the device and filesystem metadata:

```bash
lsblk -f
sudo blkid /dev/sdb1
```

Confirm that you selected the partition, not the whole disk or the wrong layer. Install the correct filesystem tools if needed. Do not immediately format the device; that can destroy recoverable data.

### “special device does not exist”

The device name may be wrong or may have changed:

```bash
lsblk
ls -l /dev/disk/by-uuid/
```

Use the actual device or UUID shown by the system.

### “target is busy” when unmounting

```bash
sudo fuser -vm /mnt/data
```

Exit shells or stop applications using the mount and try again.

### A permanent mount fails at boot

Check the fstab syntax and test it:

```bash
sudo findmnt --verify --verbose
sudo mount -a
systemctl --failed
journalctl -b -p warning
```

Verify the UUID, mount point, filesystem type, and options. If a removable drive or network share may be absent at boot, consider whether `nofail`, `_netdev`, or a systemd automount is appropriate.

### Disk or filesystem I/O errors

Check recent kernel messages:

```bash
journalctl -k --since "1 hour ago"
dmesg --level=err,warn
```

Repeated I/O errors may indicate a failing drive, cable, controller, or storage backend. Prioritize a backup or disk image before running repairs that write to the device.

## 17. Safe workflow examples

### Example A: Mount an existing Linux data partition temporarily

Assume the existing filesystem is `/dev/sdb1` and is ext4:

```bash
lsblk -f
sudo mkdir -p /mnt/data
sudo mount /dev/sdb1 /mnt/data
findmnt /mnt/data
df -hT /mnt/data
```

When finished:

```bash
sudo umount /mnt/data
```

### Example B: Prepare a new empty disk for data

**This example erases the existing partition layout and filesystem data on the selected disk. Verify the disk first.**

```bash
lsblk -o NAME,SIZE,MODEL,FSTYPE,MOUNTPOINTS
sudo fdisk -l
sudo fdisk /dev/sdb
```

Inside `fdisk`, create a GPT table (`g`), create a partition (`n`), review it (`p`), and write changes (`w`). Then verify the new partition name:

```bash
lsblk -f
```

If the new partition is `/dev/sdb1`, format it as ext4:

```bash
sudo mkfs.ext4 -L DATA /dev/sdb1
```

Mount it temporarily:

```bash
sudo mkdir -p /mnt/data
sudo mount LABEL=DATA /mnt/data
findmnt /mnt/data
```

For permanent mounting, obtain its UUID with `sudo blkid /dev/sdb1`, then add a UUID-based entry to `/etc/fstab` as described above. Test with `sudo findmnt --verify --verbose` and `sudo mount -a` before rebooting.

### Example C: Make a data disk available to a service

For a service that stores files under `/srv/data`:

1. Create and mount the filesystem at `/srv/data`.
2. Confirm the mount with `findmnt /srv/data`.
3. Set ownership to the service account or group that needs access.
4. Configure the mount in `/etc/fstab` by UUID.
5. Test the entry before rebooting.
6. If the service starts at boot, ensure its systemd service starts after the mount or has an appropriate mount dependency. Avoid letting the service write into an unmounted directory by accident.

## 18. Quick reference

| Task | Command |
|---|---|
| List disks and partitions | `lsblk -f` |
| Show mounted filesystem space | `df -hT` |
| Show UUIDs and filesystem types | `sudo blkid` |
| List partition tables | `sudo fdisk -l` |
| Edit partition table | `sudo fdisk /dev/sdb` |
| Inspect with parted | `sudo parted /dev/sdb print` |
| Create ext4 filesystem | `sudo mkfs.ext4 /dev/sdb1` |
| Mount temporarily | `sudo mount /dev/sdb1 /mnt/data` |
| Show mount details | `findmnt /mnt/data` |
| Unmount | `sudo umount /mnt/data` |
| Check fstab | `sudo findmnt --verify --verbose` |
| Mount fstab entries | `sudo mount -a` |
| See active swap | `swapon --show` |
| Find processes using mount | `sudo fuser -vm /mnt/data` |
| Inspect kernel warnings | `journalctl -k -p warning` |
| Copy raw data to an image | `sudo dd if=/dev/sdb of=disk.img bs=4M status=progress` |
| Recover a failing disk | `sudo ddrescue -n /dev/sdb disk.img disk.map` |
| List partitions in an image | `mmls disk.img` |
| Check drive SMART data | `sudo smartctl -a /dev/sda` |
| Hash an image | `sha256sum disk.img` |

## Further reading

- [Debian Administrator's Handbook](https://debian-handbook.info/)
- [Linux `mount` manual](https://manpages.debian.org/mount)
- [Linux `fstab` manual](https://manpages.debian.org/fstab)
- [Linux `lsblk` manual](https://manpages.debian.org/lsblk)
- [GNU Parted documentation](https://www.gnu.org/software/parted/manual/)
- [NVM Express (NVMe) overview](https://nvmexpress.org/)

---

**Recommended habit:** inspect with `lsblk -f` before every storage change. For a fixed internal disk, use a UUID-based `/etc/fstab` entry, then verify it and test with `mount -a` before rebooting.


## 19. Disk imaging and copying with `dd`

`dd` copies data from an input (`if=`) to an output (`of=`). It works at the byte level, so it can copy files, partitions, entire disks, and disk images. It does not understand filesystems and can overwrite a destination without asking.

> **Extreme caution:** a mistaken `of=` path can destroy the data on the wrong disk. Always identify source and destination with `lsblk -o NAME,SIZE,MODEL,SERIAL,FSTYPE,MOUNTPOINTS` before using `dd`. Unmount source partitions before imaging when possible, and never write an image to the source device.

### Basic syntax

```bash
dd if=SOURCE of=DESTINATION bs=BLOCK_SIZE status=progress
```

- `if=`: input file or device.
- `of=`: output file or device.
- `bs=`: block size used for reading and writing.
- `status=progress`: display ongoing transfer progress on supported GNU `dd`.
- `conv=noerror,sync`: in some recovery workflows, continue past read errors and pad unreadable blocks; this is not a substitute for a forensic imaging tool that logs bad sectors and acquisition details.

### Create an image file from a partition

Example: image `/dev/sdb1` into a file on a different mounted drive with sufficient free space:

```bash
sudo dd if=/dev/sdb1 of=/mnt/backup/sdb1.img bs=4M status=progress
sync
```

This reads the partition and writes a raw image file. Make sure `/mnt/backup` is on a different storage device with enough free space.

### Image an entire disk

```bash
sudo dd if=/dev/sdb of=/mnt/backup/sdb-disk.img bs=4M status=progress
sync
```

This copies the whole device, including its partition table and unused space. The image size will generally be as large as the source disk's addressable capacity.

### Restore an image to a disk

**This overwrites the destination disk. Verify the destination device carefully before running it.**

```bash
lsblk -o NAME,SIZE,MODEL,SERIAL,MOUNTPOINTS
sudo dd if=/mnt/backup/sdb-disk.img of=/dev/sdc bs=4M status=progress
sync
```

Here `/dev/sdc` is only an example destination. Never use it unless you have positively identified it as the intended target. Unmount any mounted partitions on the destination first. The destination must be at least as large as the image's original device, unless you have a deliberately prepared smaller-image workflow.

### Copy an ISO to a USB drive

This is a common way to write a Linux installer image to a USB stick. It erases the USB stick's existing contents.

```bash
lsblk -o NAME,SIZE,MODEL,TRAN,MOUNTPOINTS
sudo umount /dev/sdX* 2>/dev/null
sudo dd if=debian.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

Replace `debian.iso` with the actual ISO path and `/dev/sdX` with the **whole USB device**, not a partition such as `/dev/sdX1`. Check the target carefully. A graphical image writer is often safer for beginners.

### Verify an image with a hash

```bash
sha256sum /mnt/backup/sdb-disk.img
sha256sum debian.iso
```

For a downloaded ISO, compare the hash against a trusted value published by the distributor. A hash only proves equality with the value you compare against; it does not prove authenticity if the reference value itself is untrusted.

### `dd` limitations and safer alternatives

- `dd` copies raw bytes and does not create a forensic report or automatically preserve a detailed bad-sector map.
- If a disk is failing, repeated reads can stress it. Consider using GNU `ddrescue` rather than plain `dd`.
- A live filesystem may change while it is being copied. For consistent system images, use an offline source, a suitable snapshot, or a forensic acquisition workflow.
- Do not mount or modify the original evidence drive if preserving evidence is important.

## 20. Digital forensics and recovery tools

Digital forensics is the process of collecting and examining digital evidence in a controlled, repeatable way. For important investigations, follow your organization's procedures and applicable law. The tools below serve different purposes; no single tool replaces a sound evidence-handling process.

### Install commonly used tools

Some tools are in Debian repositories; others may require separate packages or trusted vendor instructions. Check package availability on your Debian release before installing:

```bash
apt search gddrescue
apt search testdisk
apt search sleuthkit
apt search ewf
apt search smartmontools
```

Common package names include:

```bash
sudo apt update
sudo apt install gddrescue testdisk sleuthkit smartmontools
```

Optional tools such as `ewf-tools` may be available depending on the configured repositories. Do not add an unfamiliar repository solely to install a forensic tool without evaluating its trustworthiness.

### GNU ddrescue: recover data from a failing disk

GNU `ddrescue` is designed to copy data from devices with read errors and maintain a mapfile so interrupted recovery can resume.

```bash
sudo ddrescue -n /dev/sdb /mnt/backup/sdb.img /mnt/backup/sdb.map
```

- `/dev/sdb`: example source device.
- `sdb.img`: image written to a healthy destination drive.
- `sdb.map`: mapfile recording which areas have been copied.

The example uses `-n` to perform an initial pass without scraping. For a failing disk, work from an image where possible and consult `man ddrescue` before deciding whether additional retries are appropriate. Keep the mapfile on healthy storage and never place the image or mapfile on the failing source.

### TestDisk: partition and filesystem recovery

TestDisk can help find lost partitions and recover some filesystem structures.

```bash
sudo testdisk
```

It is interactive. If the goal is to preserve evidence, use a write-blocked source or work on a verified copy/image and avoid writing recovered partition structures back to the original drive.

### PhotoRec: recover files by file signatures

PhotoRec, distributed with TestDisk, can recover files based on their contents rather than relying solely on filesystem directory metadata.

```bash
sudo photorec
```

Save recovered files to a different physical drive. Recovered files may lose their original names and directory structure. Never save recovered data onto the source drive, because doing so may overwrite data that has not yet been recovered.

### The Sleuth Kit: inspect filesystem artifacts

The Sleuth Kit provides command-line tools for examining disk images and filesystems. Useful commands include:

```bash
mmls disk.img
fsstat disk.img
fls -r disk.img
```

- `mmls` lists partition-layout information in supported images.
- `fsstat` displays filesystem details.
- `fls -r` recursively lists file and directory entries, including entries that may be deleted if supported by the filesystem and image.

These tools are generally used on image files or suitable device inputs. Exact options vary; consult the relevant manual pages. Avoid changing the evidence source during examination.

### SMART health data: smartmontools

SMART information can help assess a drive's reported health, though it cannot guarantee that a disk will not fail.

```bash
sudo smartctl --scan
sudo smartctl -a /dev/sda
```

For NVMe devices, the appropriate device path and output may differ. Some USB adapters do not pass SMART data through. If a drive is failing and contains important data, prioritize copying or imaging the data rather than running unnecessary tests.

### Identify file types and calculate hashes

```bash
file suspicious-file
sha256sum disk.img
sha256sum recovered-file
```

`file` identifies likely file formats from their contents. SHA-256 hashes can help document whether an image or file changed between stages, provided the hashes are recorded and handled correctly.

### Mount an image read-only

For a filesystem image that contains a filesystem directly, a read-only loop mount may be possible:

```bash
sudo mkdir -p /mnt/evidence
sudo mount -o loop,ro,nosuid,nodev,noexec disk-partition.img /mnt/evidence
```

This example applies only when the image itself contains a filesystem. A full-disk image includes a partition table, so identify the partition offset or use a forensic tool designed to access partitions within the image. Do not guess offsets. Some filesystems may replay a journal or otherwise write metadata unless suitable read-only procedures are used; for evidence-sensitive work, use a forensic workflow and write-blocking where appropriate.

Unmount when finished:

```bash
sudo umount /mnt/evidence
```

### Forensic image formats

A raw image (`.img` or `.dd`) is a byte-for-byte copy and is broadly supported. The Expert Witness Format (EWF), commonly using `.E01` files, supports metadata and acquisition-related information such as segmented images and integrity checks, depending on the tools used. Tool support and commands vary, so consult the installed `ewf-tools` documentation or the acquisition tool's manual.

## 21. Evidence-handling workflow

For an incident response, recovery job, or formal investigation, a disciplined workflow is more important than any single command.

1. **Record the source.** Note the device model, serial number, capacity, date/time, who handled it, and why it is being acquired.
2. **Avoid writes to the source.** Use a hardware write blocker when evidence preservation requires it. A software read-only mount alone is not the same as a hardware write blocker.
3. **Prepare a separate destination.** Store images, mapfiles, recovered files, and notes on healthy storage with enough capacity.
4. **Acquire an image.** Use a suitable tool. For failing media, GNU `ddrescue` is often preferable to plain `dd`.
5. **Record hashes.** Calculate and record cryptographic hashes for the resulting image and preserve the records with the case notes.
6. **Analyze a copy.** Use tools such as The Sleuth Kit, TestDisk, or PhotoRec on copies where possible.
7. **Document commands and results.** Keep timestamps, tool versions, options, logs, and any errors encountered.
8. **Preserve originals and outputs.** Restrict access, retain originals safely, and follow applicable policy and legal requirements.

Example: hash an acquired image and save the output to a log file:

```bash
sha256sum /mnt/backup/sdb.img | tee /mnt/backup/sdb.img.sha256
```

To check the image later against the saved hash file, run:

```bash
cd /mnt/backup
sha256sum -c sdb.img.sha256
```

A matching hash indicates the file matches the recorded digest. It does not independently prove that the acquisition captured every readable sector or that the source was authentic.

### Quick safety reminders for forensic work

- Do not experiment on the only copy of important data.
- Do not save recovered files to the source disk.
- Avoid running filesystem repair tools on the original evidence.
- Keep images and logs access-controlled; disk images may contain passwords, private files, and personal data.
- If legal admissibility or incident-response integrity matters, follow established procedures and consult a qualified examiner.

