# VirtualBox Management Cheat Sheet for Debian 13

A practical command-line reference for managing Oracle VirtualBox virtual machines on Debian 13, including VM creation, snapshots, networking, storage, exports, and virtual-disk conversion.

> **Important:** VirtualBox commands can power off VMs, alter disk images, or overwrite files. Back up important VMs first. Examples use placeholders such as `MyVM`, `/path/to/disk.vdi`, and `/path/to/output.vmdk`; replace them with your actual names and paths.

## Table of contents

- [1. Install and verify VirtualBox](#1-install-and-verify-virtualbox)
- [2. Core VirtualBox commands](#2-core-virtualbox-commands)
- [3. List and inspect virtual machines](#3-list-and-inspect-virtual-machines)
- [4. Create and register virtual machines](#4-create-and-register-virtual-machines)
- [5. Start, stop, pause, and reset VMs](#5-start-stop-pause-and-reset-vms)
- [6. Configure VM settings](#6-configure-vm-settings)
- [7. Virtual networking](#7-virtual-networking)
- [8. Manage virtual disks and storage](#8-manage-virtual-disks-and-storage)
- [9. Convert virtual disk formats](#9-convert-virtual-disk-formats)
- [10. Clone and copy VMs](#10-clone-and-copy-vms)
- [11. Snapshots](#11-snapshots)
- [12. Export and import appliances](#12-export-and-import-appliances)
- [13. Shared folders and Guest Additions](#13-shared-folders-and-guest-additions)
- [14. Logs and troubleshooting](#14-logs-and-troubleshooting)
- [15. Useful command patterns](#15-useful-command-patterns)
- [16. Quick reference](#16-quick-reference)

---

## 1. Install and verify VirtualBox

On Debian, VirtualBox installation options depend on the Debian release, configured repositories, and Oracle's package availability. Check current package availability before installing.

```bash
sudo apt update
apt search virtualbox
```

If the package is available from your configured repository, install it with APT. Oracle's official Linux downloads and installation instructions are available at:

- https://www.virtualbox.org/wiki/Linux_Downloads
- https://www.virtualbox.org/manual/

Check which commands are installed:

```bash
VBoxManage --version
command -v VBoxManage
command -v VirtualBox
```

`VBoxManage` is the main command-line management tool. The graphical interface is typically launched with `VirtualBox`.

### Host compatibility notes

- The host CPU architecture must be compatible with the VirtualBox build and guest architecture.
- VirtualBox on Apple Silicon differs from VirtualBox on x86-64 hosts; not every guest OS or CPU architecture is supported in the same way.
- Kernel modules and host packages must match the running host kernel.
- Do not assume that commands or guest support are identical across VirtualBox versions.

## 2. Core VirtualBox commands

The main command is:

```bash
VBoxManage
```

Show top-level help:

```bash
VBoxManage --help
VBoxManage list --help
VBoxManage showvminfo --help
```

Common commands:

| Command | Purpose |
|---|---|
| `VBoxManage list vms` | List registered VMs |
| `VBoxManage showvminfo "MyVM"` | Show VM configuration |
| `VBoxManage startvm "MyVM"` | Start a VM |
| `VBoxManage controlvm "MyVM" acpipowerbutton` | Request guest shutdown |
| `VBoxManage snapshot "MyVM" ...` | Manage snapshots |
| `VBoxManage clonemedium` | Clone or convert virtual media |
| `VBoxManage modifymedium` | Modify virtual-medium properties |
| `VBoxManage storagectl` | Configure storage controllers |
| `VBoxManage storageattach` | Attach a virtual disk or optical medium |
| `VBoxManage export` | Export an appliance |
| `VBoxManage import` | Import an appliance |

Use quotes around VM names that contain spaces.

## 3. List and inspect virtual machines

### List registered VMs

```bash
VBoxManage list vms
VBoxManage list runningvms
```

### Show detailed VM information

```bash
VBoxManage showvminfo "MyVM"
VBoxManage showvminfo "MyVM" --machinereadable
```

The machine-readable form is useful for scripts. Output can contain paths and configuration details, so review it before sharing.

### List host information

```bash
VBoxManage list hostinfo
VBoxManage list hostcpuids
VBoxManage list ostypes
```

### List virtual media

```bash
VBoxManage list hdds
VBoxManage list dvds
VBoxManage list floppies
```

### Find the VM configuration directory

The default VM directory depends on the host user's VirtualBox preferences. Inspect the VM details and the `Default Machine Folder` in VirtualBox preferences rather than assuming a fixed path.

## 4. Create and register virtual machines

### Create an empty VM

```bash
VBoxManage createvm --name "DebianLab" --ostype Debian_64 --register
```

`--ostype` uses an identifier supported by the installed VirtualBox version. List identifiers with:

```bash
VBoxManage list ostypes
```

### Configure basic resources

```bash
VBoxManage modifyvm "DebianLab" --memory 4096 --cpus 2
```

This sets 4096 MiB of RAM and two virtual CPUs. Choose values that leave enough resources for the host OS and other VMs.

### Create a virtual disk

Create a dynamically allocated VDI disk with a maximum capacity of 40 GiB:

```bash
VBoxManage createmedium disk --filename "$HOME/VirtualBox VMs/DebianLab/DebianLab.vdi" --size 40960 --format VDI
```

The parent directory must exist. `--size` is expressed in megabytes in this command; 40960 MiB is approximately 40 GiB. A dynamically allocated disk file grows as data is written, up to its configured capacity.

### Add a SATA storage controller

```bash
VBoxManage storagectl "DebianLab" --name "SATA" --add sata --controller IntelAhci
```

### Attach the virtual disk

```bash
VBoxManage storageattach "DebianLab" --storagectl "SATA" --port 0 --device 0 --type hdd --medium "$HOME/VirtualBox VMs/DebianLab/DebianLab.vdi"
```

### Attach an installation ISO

```bash
VBoxManage storageattach "DebianLab" --storagectl "SATA" --port 1 --device 0 --type dvddrive --medium "/path/to/debian.iso"
```

If no optical drive exists at that port, create or configure a suitable controller/drive first. Controller and port settings depend on the VM's current configuration.

### Start the VM

```bash
VBoxManage startvm "DebianLab"
```

Start in headless mode (without opening the GUI):

```bash
VBoxManage startvm "DebianLab" --type headless
```

A GUI start can be requested with `--type gui`. Check `VBoxManage startvm --help` for options supported by your version.

## 5. Start, stop, pause, and reset VMs

### Start and inspect running VMs

```bash
VBoxManage startvm "MyVM"
VBoxManage list runningvms
```

### Request a graceful guest shutdown

```bash
VBoxManage controlvm "MyVM" acpipowerbutton
```

This sends a virtual ACPI power-button event. The guest OS must support and respond to it.

### Save the VM state

```bash
VBoxManage controlvm "MyVM" savestate
```

This saves the VM's current execution state to disk, similar to hibernation. It is not the same as a clean guest shutdown.

### Pause and resume

```bash
VBoxManage controlvm "MyVM" pause
VBoxManage controlvm "MyVM" resume
```

### Reset or power off

```bash
VBoxManage controlvm "MyVM" reset
VBoxManage controlvm "MyVM" poweroff
```

These are abrupt operations, comparable to pressing a physical reset button or cutting power. Unsaved guest data can be lost. Prefer an in-guest shutdown or `acpipowerbutton` whenever possible.

### Discard a saved state

```bash
VBoxManage discardstate "MyVM"
```

This discards a saved execution state; it does not delete the VM's virtual disk. The guest will next boot rather than resume from that state. Use only if you no longer need the saved state.

## 6. Configure VM settings

### RAM, CPU, and boot order

```bash
VBoxManage modifyvm "MyVM" --memory 4096 --cpus 2
VBoxManage modifyvm "MyVM" --boot1 disk --boot2 dvd --boot3 none --boot4 none
```

Supported options may differ by version. Use `VBoxManage modifyvm --help` for exact syntax.

### VM description

```bash
VBoxManage modifyvm "MyVM" --description "Debian 13 web server lab"
```

### Shared clipboard and drag-and-drop

```bash
VBoxManage modifyvm "MyVM" --clipboard bidirectional
VBoxManage modifyvm "MyVM" --draganddrop bidirectional
```

These features depend on Guest Additions and guest/host compatibility. Enable them only if you need them, especially on isolated or untrusted guests.

### Change the VM's name

Changing the display name is not the same as renaming its folder or disk files. To change the registered name, consult `VBoxManage modifyvm --name` support for your version and ensure scripts, snapshots, and paths are not relying on the old name.

### View current settings

```bash
VBoxManage showvminfo "MyVM"
```

## 7. Virtual networking

VirtualBox offers several network modes. The adapter mode is configured per VM network adapter.

### Common modes

| Mode | Typical use |
|---|---|
| NAT | Guest can usually reach external networks through the host; inbound access usually needs port forwarding |
| NAT Network | Multiple guests can share a VirtualBox-managed NAT network |
| Bridged Adapter | Guest appears on the physical LAN as a separate device |
| Host-only Adapter | Guest and host can communicate on a private host-only network |
| Internal Network | Guests on the same named internal network can communicate with each other, isolated from the host unless routing is configured |
| Not attached | Virtual adapter is present but disconnected |

### Set adapter 1 to NAT

```bash
VBoxManage modifyvm "MyVM" --nic1 nat
```

### Set adapter 1 to bridged

```bash
VBoxManage modifyvm "MyVM" --nic1 bridged --bridgeadapter1 "enp3s0"
```

Replace `enp3s0` with the actual host interface name. Find interfaces with:

```bash
ip -brief link
```

Bridged networking can expose the guest directly to the LAN. Use it only when that is intended and permitted by the network.

### Set host-only networking

```bash
VBoxManage modifyvm "MyVM" --nic1 hostonly --hostonlyadapter1 "vboxnet0"
```

The host-only interface must exist and the adapter name must match the host configuration.

### Configure NAT port forwarding

Example: forward host TCP port 2222 to guest TCP port 22:

```bash
VBoxManage modifyvm "MyVM" --natpf1 "ssh,tcp,127.0.0.1,2222,,22"
```

This example binds the host-side forwarding rule to loopback (`127.0.0.1`), so it is reachable from the host itself, not from other LAN devices. Remove the rule with:

```bash
VBoxManage modifyvm "MyVM" --natpf1 delete "ssh"
```

Port-forwarding syntax can vary slightly across versions; consult `VBoxManage modifyvm --help`.

## 8. Manage virtual disks and storage

### Supported virtual disk formats

Common formats include:

- **VDI**: VirtualBox's native disk image format.
- **VMDK**: VMware's virtual disk format, with multiple variants.
- **VHD**: Microsoft Virtual Hard Disk format.
- **VHDX**: newer Hyper-V format; direct support depends on VirtualBox version and workflow.
- **RAW**: raw disk data without a virtual-disk container's metadata.

Support for reading, writing, and converting formats is version-dependent. Check the installed VirtualBox manual before relying on a format for a migration.

### List registered hard disks

```bash
VBoxManage list hdds
```

### Inspect a disk image

```bash
VBoxManage showmediuminfo disk "/path/to/disk.vdi"
```

This shows format, capacity, UUID, and attachment information where available.

### Create a new disk

```bash
VBoxManage createmedium disk --filename "/path/to/new-disk.vdi" --size 20480 --format VDI
```

This creates a 20 GiB maximum-capacity VDI image.

### Attach an existing disk

```bash
VBoxManage storageattach "MyVM" --storagectl "SATA" --port 0 --device 0 --type hdd --medium "/path/to/disk.vdi"
```

The storage controller name and port must match the VM configuration. Do not attach the same writable virtual disk to multiple running VMs unless you have a supported shared-disk configuration and understand the filesystem implications.

### Detach a disk

```bash
VBoxManage storageattach "MyVM" --storagectl "SATA" --port 0 --device 0 --medium none
```

Detaching does not delete the disk file. Make sure the guest is shut down or the disk can be safely detached according to the guest and controller configuration.

## 9. Convert virtual disk formats

VirtualBox's `VBoxManage clonemedium` can clone a virtual disk and convert it between supported formats. The source disk should not be actively written by a running VM during conversion. Shut down the VM cleanly first and ensure you have enough free disk space.

### General syntax

```bash
VBoxManage clonemedium disk SOURCE DESTINATION --format FORMAT
```

Replace `SOURCE`, `DESTINATION`, and `FORMAT` with actual values.

### Convert VDI to VMDK

```bash
VBoxManage clonemedium disk "/path/to/source.vdi" "/path/to/output.vmdk" --format VMDK
```

Useful when moving a disk to a VMware-based environment, but confirm the destination platform supports the resulting VMDK variant.

### Convert VMDK to VDI

```bash
VBoxManage clonemedium disk "/path/to/source.vmdk" "/path/to/output.vdi" --format VDI
```

Useful for bringing a compatible VMware disk into a VirtualBox workflow.

### Convert VDI to VHD

```bash
VBoxManage clonemedium disk "/path/to/source.vdi" "/path/to/output.vhd" --format VHD
```

VHD is commonly associated with older Microsoft virtualization workflows. Confirm compatibility with the intended target platform.

### Create a raw disk image

```bash
VBoxManage clonemedium disk "/path/to/source.vdi" "/path/to/output.raw" --format RAW
```

Raw images contain disk data without the virtual-disk container format. They can be large and may not retain all format-specific metadata. Treat the output as disk data, not as a self-describing virtual disk.

### Convert a raw image to VDI

```bash
VBoxManage clonemedium disk "/path/to/source.raw" "/path/to/output.vdi" --format VDI
```

The raw input must represent a valid disk layout or partition/filesystem image appropriate to your intended use.

### Dynamic versus fixed allocation

For supported formats, VirtualBox can create disks with different allocation behavior. The exact options vary by format and VirtualBox version. Check:

```bash
VBoxManage clonemedium --help
VBoxManage createmedium disk --help
```

A dynamically allocated image grows as data is written, while a fixed-size image reserves its configured capacity more fully at creation time. Conversion can require substantial free space, sometimes close to the full virtual capacity, so check destination storage first:

```bash
df -h /path/to/destination
```

### Convert or clone a disk already registered in VirtualBox

You can use the disk's registered UUID or path as the source. Inspect it first:

```bash
VBoxManage list hdds
VBoxManage showmediuminfo disk "/path/to/source.vdi"
```

If the source has snapshots, it may be part of a differencing-disk chain. Do not copy only one snapshot/differencing file and assume it contains the complete current disk. Use VirtualBox-aware cloning and verify the resulting disk.

### Verify the converted disk

```bash
VBoxManage showmediuminfo disk "/path/to/output.vmdk"
```

Attach it to a test VM or clone of the original and verify that the guest boots and its data is intact before retiring the source disk.

### Important conversion notes

- Conversion is not the same as converting a guest OS from one hypervisor to another. Hardware drivers, boot mode, virtual controllers, network interfaces, and Guest Additions/tools may also need changes.
- A format's name does not guarantee every variant is supported.
- Converting a disk may not preserve VirtualBox snapshots as a usable snapshot chain in the destination format.
- Do not overwrite the source file with the output path.
- Keep a backup until the converted disk has been tested.

## 10. Clone and copy VMs

### Clone a VM

```bash
VBoxManage clonevm "MyVM" --name "MyVM-Clone" --register
```

This creates a new VM based on the source. The clone operation may take time and use substantial disk space.

### Full clone versus linked clone

A full clone is independent of the source disk files. A linked clone depends on parent disk images and can save space, but the parent must remain available and the dependency chain must be preserved. Exact clone options depend on the VirtualBox version; check:

```bash
VBoxManage clonevm --help
```

### Clone a virtual disk

```bash
VBoxManage clonemedium disk "/path/to/source.vdi" "/path/to/clone.vdi" --format VDI
```

This creates a separate disk image. Make sure the destination does not already contain data you need.

### Register an existing VM configuration

If you have a valid `.vbox` VM configuration file:

```bash
VBoxManage registervm "/path/to/MyVM/MyVM.vbox"
```

Registration does not automatically copy all associated disk files. Keep the VM configuration and referenced storage paths together.

## 11. Snapshots

Snapshots capture a VM's state at a point in time. They are useful before upgrades or experiments, but they are not a replacement for independent backups.

### List snapshots

```bash
VBoxManage snapshot "MyVM" list
```

### Take a snapshot

```bash
VBoxManage snapshot "MyVM" take "BeforeUpgrade" --description "Before system upgrade"
```

### Show snapshot details

```bash
VBoxManage snapshot "MyVM" showvminfo "BeforeUpgrade"
```

### Restore a snapshot

```bash
VBoxManage snapshot "MyVM" restore "BeforeUpgrade"
```

Restoring a snapshot changes the VM back to that saved state, so data created after the snapshot may no longer be present in the current state. Confirm the target snapshot carefully.

### Delete a snapshot

```bash
VBoxManage snapshot "MyVM" delete "BeforeUpgrade"
```

Deleting a snapshot may trigger disk-image consolidation and can take time. Do not manually delete snapshot/differencing files from the VM directory.

## 12. Export and import appliances

OVF/OVA appliances can package a VM for transfer between systems or compatible hypervisors.

### Export a VM

```bash
VBoxManage export "MyVM" --output "/path/to/MyVM.ova"
```

An OVA is a single-file appliance package. Export may take time and use substantial disk space.

### Export to OVF

```bash
VBoxManage export "MyVM" --output "/path/to/appliance.ovf"
```

Depending on the version and export options, an OVF export can produce a descriptor plus separate disk files.

### Import an appliance

```bash
VBoxManage import "/path/to/appliance.ova"
```

Review the import options and appliance settings before confirming. Imported hardware settings may not match your host's available resources.

### Inspect appliance import options

```bash
VBoxManage import "/path/to/appliance.ova" --dry-run
```

Use the installed version's help if `--dry-run` is not supported:

```bash
VBoxManage import --help
```

### Export versus disk conversion

- **Disk conversion** changes the virtual disk container format or produces a raw disk image.
- **Appliance export** packages VM configuration and attached storage into an exchange format.
- Neither guarantees that another hypervisor will run the guest without hardware or configuration changes.

## 13. Shared folders and Guest Additions

Shared folders let a guest access a host directory, usually when Guest Additions are installed in the guest.

### Configure a shared folder

Example for a running or stopped VM:

```bash
VBoxManage sharedfolder add "MyVM" --name "hostshare" --hostpath "$HOME/vm-share" --automount
```

Create the host directory first:

```bash
mkdir -p "$HOME/vm-share"
```

Some options and behavior depend on guest OS and VirtualBox version. Avoid sharing sensitive host directories with untrusted guests.

### Remove a shared folder

```bash
VBoxManage sharedfolder remove "MyVM" --name "hostshare"
```

### Guest Additions

Guest Additions provide features such as improved graphics, shared folders, clipboard integration, and guest/host time integration, depending on the guest OS. Install a compatible version inside the guest and follow the guest OS-specific instructions. Do not assume every feature works on every guest.

## 14. Logs and troubleshooting

### Show VM information

```bash
VBoxManage showvminfo "MyVM"
```

### Inspect VM logs

VM logs are commonly stored in the VM's `Logs` directory, often including `VBox.log`. Use the actual VM folder path reported by VirtualBox.

```bash
less "/path/to/MyVM/Logs/VBox.log"
```

Search for common errors:

```bash
grep -i -E 'error|failed|VERR_|NS_ERROR' "/path/to/MyVM/Logs/VBox.log"
```

### Check host kernel modules on Linux

```bash
lsmod | grep -E 'vboxdrv|vboxnet'
```

If VirtualBox fails to start VMs, verify that its kernel modules are built and loaded for the running kernel. The exact repair steps depend on whether VirtualBox was installed from Debian packages or Oracle's repository.

### Check free disk space

```bash
df -h
```

A VM may fail to start or run out of space if the host filesystem is full, especially when using dynamically allocated disks or snapshots.

### Check VM state

```bash
VBoxManage list runningvms
VBoxManage showvminfo "MyVM" | grep -i -E 'State|Storage|NIC'
```

If the VM is stuck, inspect the logs before attempting reset or poweroff. Abrupt actions can lose guest data.

## 15. Useful command patterns

### Find VirtualBox host network interfaces

```bash
VBoxManage list hostonlyifs
VBoxManage list bridgedifs
```

### Show configured NAT networks

```bash
VBoxManage list natnetworks
```

### Show USB host devices

```bash
VBoxManage list usbhost
```

USB passthrough requires appropriate host support and permissions. A device attached to a VM may become unavailable to the host.

### Show VM metrics

VirtualBox supports metrics collection, but exact metrics commands and available counters depend on the version. Inspect the built-in help:

```bash
VBoxManage metrics --help
```

### List supported OS types

```bash
VBoxManage list ostypes
```

### Read command-specific help

```bash
VBoxManage modifyvm --help
VBoxManage storageattach --help
VBoxManage clonemedium --help
VBoxManage snapshot --help
```

## 16. Quick reference

| Task | Command |
|---|---|
| List VMs | `VBoxManage list vms` |
| List running VMs | `VBoxManage list runningvms` |
| Inspect a VM | `VBoxManage showvminfo "MyVM"` |
| Start a VM headless | `VBoxManage startvm "MyVM" --type headless` |
| Request guest shutdown | `VBoxManage controlvm "MyVM" acpipowerbutton` |
| Save VM state | `VBoxManage controlvm "MyVM" savestate` |
| Pause / resume | `VBoxManage controlvm "MyVM" pause` / `resume` |
| List disks | `VBoxManage list hdds` |
| Inspect disk image | `VBoxManage showmediuminfo disk disk.vdi` |
| Create a VDI | `VBoxManage createmedium disk --filename disk.vdi --size 20480 --format VDI` |
| Convert VDI to VMDK | `VBoxManage clonemedium disk source.vdi output.vmdk --format VMDK` |
| Convert VDI to VHD | `VBoxManage clonemedium disk source.vdi output.vhd --format VHD` |
| Create raw image | `VBoxManage clonemedium disk source.vdi output.raw --format RAW` |
| Clone a VM | `VBoxManage clonevm "MyVM" --name "MyVM-Clone" --register` |
| List snapshots | `VBoxManage snapshot "MyVM" list` |
| Take snapshot | `VBoxManage snapshot "MyVM" take "BeforeUpgrade"` |
| Export appliance | `VBoxManage export "MyVM" --output MyVM.ova` |
| Import appliance | `VBoxManage import MyVM.ova` |
| Show VM logs | `less "/path/to/MyVM/Logs/VBox.log"` |

## Further reading

- [Official VirtualBox documentation](https://www.virtualbox.org/manual/)
- [VirtualBox User Manual: VBoxManage](https://www.virtualbox.org/manual/ch08.html)
- [VirtualBox Linux downloads](https://www.virtualbox.org/wiki/Linux_Downloads)

---

**Recommended workflow:** inspect the VM and disk first, shut down the guest cleanly before disk conversion, convert to a new output file, verify the converted medium, and test it in a separate VM before deleting or replacing the original.
