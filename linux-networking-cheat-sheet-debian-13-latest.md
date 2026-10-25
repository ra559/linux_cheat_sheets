# Linux Networking Cheat Sheet for Debian 13

A practical command reference for checking network configuration, diagnosing connectivity, managing DNS, inspecting routes and ports, and performing common networking tasks on Debian 13.

> **Caution:** Network configuration changes can disconnect SSH sessions or interrupt services. Before changing an interface, route, firewall, or remote host configuration, make sure you have a recovery path. Examples use documentation/private IP addresses; replace them with values from your own network.

## Table of contents

- [1. Install common networking tools](#1-install-common-networking-tools)
- [2. Inspect network interfaces](#2-inspect-network-interfaces)
- [3. IP addresses and subnets](#3-ip-addresses-and-subnets)
- [4. Routes and the default gateway](#4-routes-and-the-default-gateway)
- [5. Test connectivity](#5-test-connectivity)
- [6. DNS troubleshooting](#6-dns-troubleshooting)
- [7. Inspect ports and sockets](#7-inspect-ports-and-sockets)
- [8. Network connections with curl and wget](#8-network-connections-with-curl-and-wget)
- [9. Download and transfer files](#9-download-and-transfer-files)
- [10. SSH and secure file transfer](#10-ssh-and-secure-file-transfer)
- [11. Network configuration on Debian](#11-network-configuration-on-debian)
- [12. DHCP and static IP addresses](#12-dhcp-and-static-ip-addresses)
- [13. NetworkManager and nmcli](#13-networkmanager-and-nmcli)
- [14. DNS and DHCP configuration](#14-dns-and-dhcp-configuration)
- [15. Firewall basics with nftables and ufw](#15-firewall-basics-with-nftables-and-ufw)
- [16. Packet capture and traffic inspection](#16-packet-capture-and-traffic-inspection)
- [17. Hostname, MAC address, and neighbor table](#17-hostname-mac-address-and-neighbor-table)
- [18. Wireless networking (Wi-Fi)](#18-wireless-networking-wi-fi)
- [19. Common troubleshooting workflows](#19-common-troubleshooting-workflows)
- [20. Quick reference](#20-quick-reference)

---

## 1. Install common networking tools

Many commands are included in a standard Debian installation. Install tools as needed:

```bash
sudo apt update
sudo apt install iproute2 iputils-ping dnsutils traceroute curl wget \
  netcat-openbsd tcpdump ethtool mtr-tiny lsof
```

Useful tools:

| Tool | Purpose |
|---|---|
| `ip` | Inspect and configure interfaces, addresses, routes, and neighbors |
| `ping` | Test reachability using ICMP echo |
| `ss` | Inspect sockets and listening ports |
| `dig`, `nslookup` | Query DNS |
| `curl`, `wget` | Make HTTP requests and download files |
| `traceroute`, `mtr` | Investigate network paths |
| `nc` | Test TCP/UDP connectivity and simple socket interactions |
| `tcpdump` | Capture and inspect packets |
| `ethtool` | Inspect Ethernet link properties |
| `nmcli` | Manage NetworkManager connections, if NetworkManager is installed |
| `resolvectl` | Inspect systemd-resolved DNS configuration, if systemd-resolved is active |

## 2. Inspect network interfaces

### List interfaces and their addresses

```bash
ip address
ip addr show
ip -brief address
```

- `ip address` shows interfaces, IP addresses, and interface state.
- `ip -brief address` gives a compact overview.
- `UP` means the interface is administratively enabled; `LOWER_UP` commonly indicates a live link at the lower network layer.

### Show link state

```bash
ip link
ip -brief link
```

### Show one interface

```bash
ip address show dev enp3s0
ip link show dev enp3s0
```

Replace `enp3s0` with the actual interface name, such as `eth0`, `ens18`, or `wlan0`.

### Enable or disable an interface temporarily

```bash
sudo ip link set dev enp3s0 up
sudo ip link set dev enp3s0 down
```

Bringing an interface down can disconnect your current session. These `ip` changes are generally runtime changes and may not persist after reboot.

### Show link speed and duplex

```bash
sudo ethtool enp3s0
```

This can show negotiated speed, duplex, and link status for supported Ethernet interfaces. Some virtual interfaces and Wi-Fi devices do not report all fields.

## 3. IP addresses and subnets

### Show the host's IPv4 addresses

```bash
ip -4 address
```

### Show IPv6 addresses

```bash
ip -6 address
```

### Add an address temporarily

```bash
sudo ip address add 192.168.1.50/24 dev enp3s0
```

This adds an address to the interface at runtime. Choose an unused address and correct prefix for your network. This command does not configure a default gateway and usually does not persist across reboot.

Remove it:

```bash
sudo ip address del 192.168.1.50/24 dev enp3s0
```

### Understand CIDR notation

`192.168.1.50/24` means the host address `192.168.1.50` with a 24-bit network prefix. In a typical `/24` IPv4 subnet, the network is `192.168.1.0/24` and the usual usable host range is `192.168.1.1` through `192.168.1.254`. Actual address planning depends on the network design.

Useful private IPv4 ranges include:

- `10.0.0.0/8`
- `172.16.0.0/12`
- `192.168.0.0/16`

These are private ranges for internal networks, not public internet addresses.

## 4. Routes and the default gateway

### Show the routing table

```bash
ip route
ip -6 route
```

The default route usually points to the router or next hop used for destinations without a more specific route.

### Ask Linux how it will route to a destination

```bash
ip route get 1.1.1.1
ip route get 192.168.1.20
```

This is often more useful than trying to infer the chosen interface and source address from the full table.

### Add a temporary default route

```bash
sudo ip route add default via 192.168.1.1 dev enp3s0
```

Only do this if the gateway and interface are correct and a default route does not already exist. A wrong route can disconnect the host.

Remove a route:

```bash
sudo ip route del default via 192.168.1.1 dev enp3s0
```

Routes added with `ip` are usually runtime-only. Use the network manager or persistent configuration method used by the system to make them survive reboot.

## 5. Test connectivity

### Ping a host

```bash
ping 192.168.1.1
ping -c 4 1.1.1.1
```

`-c 4` sends four echo requests and then exits. Ping can test basic IP reachability, but firewalls may block ICMP, so failure does not prove that a host is offline.

### Test local networking first

```bash
ping -c 4 127.0.0.1
ping -c 4 "$(ip -4 route show default | awk 'NR==1 {print $3}')"
```

The second command attempts to ping the default gateway, if one is configured. If the command produces no target, inspect `ip route`.

### Trace the route to a destination

```bash
traceroute 1.1.1.1
```

Some routers do not answer traceroute probes, so `* * *` does not always indicate a broken route.

### MTR: repeated route diagnostics

```bash
mtr 1.1.1.1
```

MTR combines repeated probing with a route display. Stop it with `q` or `Ctrl+C`, depending on the interface. Some probe modes need elevated privileges.

### Test a TCP port

```bash
nc -vz example.com 443
nc -vz 192.168.1.25 22
```

`-z` checks whether a connection can be established without sending application data, and `-v` gives more detail. A successful connection proves the TCP handshake succeeded, not that the application is healthy or correctly configured.

### Test a UDP port

```bash
nc -vzu 192.168.1.25 53
```

UDP has no TCP-style handshake. A result from a UDP probe can be inconclusive; use a protocol-specific test when possible.

## 6. DNS troubleshooting

DNS translates names such as `debian.org` into IP addresses and other records.

### Look up a name

```bash
getent hosts debian.org
nslookup debian.org
dig debian.org
```

- `getent hosts` uses the system's configured name-service path.
- `nslookup` and `dig` query DNS more directly.

### Query specific record types

```bash
dig debian.org A
dig debian.org AAAA
dig debian.org MX
dig debian.org NS
dig debian.org TXT
```

### Query a specific DNS server

```bash
dig @1.1.1.1 debian.org
dig @8.8.8.8 debian.org
```

Use only DNS servers you are permitted to query. Public resolvers are examples; an organization may require its own DNS server.

### Check DNS configuration

```bash
cat /etc/resolv.conf
```

On systems using systemd-resolved:

```bash
resolvectl status
resolvectl query debian.org
```

`/etc/resolv.conf` may be generated or managed by NetworkManager, systemd-resolved, or another network service. Do not overwrite it without understanding which service manages it.

### Distinguish DNS failure from general connectivity failure

```bash
ping -c 3 1.1.1.1
getent hosts debian.org
curl -I https://debian.org
```

If the IP address is reachable but name lookups fail, DNS is a likely area to investigate. However, ICMP and HTTPS can be filtered independently, so compare multiple tests.

## 7. Inspect ports and sockets

### Show listening TCP sockets

```bash
sudo ss -ltnp
```

### Show listening UDP sockets

```bash
sudo ss -lunp
```

### Show all TCP connections

```bash
ss -tan
```

### Show all UDP sockets

```bash
ss -uan
```

### Find a process listening on a port

```bash
sudo ss -ltnp 'sport = :22'
sudo ss -ltnp 'sport = :8080'
```

Common flags:

- `-l`: listening sockets.
- `-t`: TCP.
- `-u`: UDP.
- `-n`: numeric addresses and ports.
- `-p`: process information, when permissions allow.
- `-a`: all sockets of the selected type.

### Check which process uses a file or socket

```bash
sudo lsof -i
sudo lsof -iTCP:8080 -sTCP:LISTEN
```

Install `lsof` if needed. A listening port is only one part of exposure; firewall rules, bind address, routing, and NAT also affect reachability.

## 8. Network connections with curl and wget

### Check whether a web server responds

```bash
curl -I https://example.com
curl -v https://example.com
```

- `-I` requests response headers using an HTTP HEAD request when supported.
- `-v` shows connection and protocol details useful for debugging.

### Show HTTP status and final URL

```bash
curl -sS -L -o /dev/null \
  -w 'HTTP status: %{http_code}\nFinal URL: %{url_effective}\n' \
  https://example.com
```

### Resolve a name to a specific address for testing

```bash
curl --resolve example.com:443:192.0.2.10 https://example.com/
```

`192.0.2.10` is a documentation-only example address; replace it with the intended test server address. `--resolve` overrides DNS for the specified host and port for this curl invocation while preserving the hostname for HTTP and TLS.

### Download a file

```bash
curl -fL -o file.tar.gz https://example.com/file.tar.gz
wget https://example.com/file.tar.gz
```

`-f` makes curl return an error for many HTTP error responses, and `-L` follows redirects. Always verify downloaded files before executing them.

## 9. Download and transfer files

### Copy a file over SSH

```bash
scp file.txt user@192.168.1.25:/home/user/
```

### Copy a directory recursively

```bash
scp -r project/ user@192.168.1.25:/home/user/
```

### Synchronize files with rsync over SSH

```bash
rsync -avh --progress project/ user@192.168.1.25:/home/user/project/
```

The trailing slash on `project/` means “copy the contents of this directory.” Without it, rsync generally creates a directory named `project` inside the destination. Be cautious with `--delete`, which can delete destination files that are absent from the source.

### Check remote SSH access

```bash
ssh user@192.168.1.25
ssh -v user@192.168.1.25
```

Use `-v` for connection troubleshooting. Do not share verbose output without checking it for usernames, hostnames, addresses, and other potentially sensitive details.

## 10. SSH and secure file transfer

### Generate an SSH key

```bash
ssh-keygen -t ed25519
```

Protect the private key. Never copy the private key to a server or share it with others.

### Copy the public key to a server

```bash
ssh-copy-id user@192.168.1.25
```

This normally adds the public key to the remote account's `authorized_keys` file.

### Test authentication

```bash
ssh -o BatchMode=yes user@192.168.1.25 true
```

This tests non-interactive SSH authentication and command execution. It may fail if the account requires interactive authentication.

### Inspect known host keys

```bash
ssh-keygen -F 192.168.1.25
```

If SSH warns that a host key changed, verify the server's identity through a trusted channel before removing or replacing the saved key. Do not blindly bypass host-key checking.

## 11. Network configuration on Debian

Debian systems may use different network managers depending on installation and environment. Identify the active configuration method before editing files.

### Check interface and route state

```bash
ip -brief address
ip route
```

### Check common network services

```bash
systemctl is-active NetworkManager
systemctl is-active systemd-networkd
systemctl is-active networking
systemctl is-active systemd-resolved
```

Not all of these services are installed or active on every system.

### Inspect NetworkManager connections

```bash
nmcli device status
nmcli connection show
```

### Inspect traditional ifupdown configuration

```bash
cat /etc/network/interfaces
ls -la /etc/network/interfaces.d/
```

### Inspect systemd-networkd configuration

```bash
networkctl status
ls -la /etc/systemd/network/
```

**Do not configure the same interface through multiple managers at the same time.** NetworkManager, ifupdown, and systemd-networkd have different configuration mechanisms. The correct approach depends on which service owns the interface.

## 12. DHCP and static IP addresses

### Renew DHCP with NetworkManager

First identify the connection and device:

```bash
nmcli device status
nmcli connection show
```

To reconnect a NetworkManager-managed connection:

```bash
sudo nmcli connection down "Wired connection 1"
sudo nmcli connection up "Wired connection 1"
```

Replace the connection name with the actual one. This can disconnect you, especially over SSH.

### DHCP using ifupdown

On systems configured with ifupdown, administrators may use:

```bash
sudo ifdown enp3s0
sudo ifup enp3s0
```

These commands depend on ifupdown being installed and the interface being configured there. Do not use them on an interface managed by a different network manager.

### Configure a static IPv4 address with NetworkManager

Example connection named `Wired connection 1`:

```bash
sudo nmcli connection modify "Wired connection 1" \
  ipv4.method manual \
  ipv4.addresses 192.168.1.50/24 \
  ipv4.gateway 192.168.1.1 \
  ipv4.dns "192.168.1.1 1.1.1.1"
```

Apply the change:

```bash
sudo nmcli connection up "Wired connection 1"
```

Replace the connection name, address, gateway, and DNS servers with values appropriate to your LAN. Ensure the address is unused and does not conflict with your DHCP pool or network policy. Applying the connection can disconnect an SSH session.

### Return to DHCP with NetworkManager

```bash
sudo nmcli connection modify "Wired connection 1" \
  ipv4.method auto \
  ipv4.addresses "" \
  ipv4.gateway "" \
  ipv4.dns ""
sudo nmcli connection up "Wired connection 1"
```

NetworkManager versions can differ in accepted clearing syntax. Review the connection with `nmcli connection show "Wired connection 1"` and its manual if a property reset is rejected.

## 13. NetworkManager and nmcli

`nmcli` is the command-line interface for NetworkManager. It is not useful on a system where NetworkManager is not installed or does not manage the interface.

### Show devices and connections

```bash
nmcli device status
nmcli connection show
nmcli connection show --active
```

### Show device details

```bash
nmcli device show enp3s0
```

### Connect or disconnect a device

```bash
sudo nmcli device connect enp3s0
sudo nmcli device disconnect enp3s0
```

This can interrupt the current connection. Prefer using the correct connection profile for managed network setups.

### Show Wi-Fi networks

```bash
nmcli device wifi list
```

### Connect to Wi-Fi

```bash
sudo nmcli device wifi connect "SSID_NAME" password "WIFI_PASSWORD"
```

This can expose the password in shell history or process information depending on the environment. For sensitive environments, use a safer credential-handling approach and protect the shell history.

### Activate a saved connection

```bash
sudo nmcli connection up "CONNECTION_NAME"
```

### Inspect NetworkManager logs

```bash
journalctl -u NetworkManager -b
```

## 14. DNS and DHCP configuration

DNS translates names such as `debian.org` into IP addresses. DHCP automatically provides network settings such as an IP address, subnet, default gateway, and often DNS servers. They are related but separate: a machine can receive its IP configuration through DHCP while using manually specified DNS servers.

**First identify which service manages the interface.** Avoid configuring the same interface through multiple network managers.

```bash
nmcli device status
systemctl is-active NetworkManager
systemctl is-active systemd-networkd
resolvectl status
```

### Configure IPv4 DHCP with NetworkManager

Find the saved connection profile and its associated interface:

```bash
nmcli connection show
nmcli device status
```

Set a connection to obtain its IPv4 address automatically:

```bash
sudo nmcli connection modify "Wired connection 1" ipv4.method auto
sudo nmcli connection up "Wired connection 1"
```

Replace `Wired connection 1` with the exact connection profile name. This changes the saved profile, so it persists across reconnects and reboots.

To renew DHCP configuration by reactivating the profile:

```bash
sudo nmcli connection down "Wired connection 1"
sudo nmcli connection up "Wired connection 1"
```

This briefly interrupts connectivity. If connected remotely over that interface, have another way to reach the machine before doing this.

### Use DHCP for the address but specify DNS servers

This is a common setup: the router or DHCP server still supplies the IP address and gateway, but NetworkManager uses your chosen DNS servers.

```bash
sudo nmcli connection modify "Wired connection 1" ipv4.method auto
sudo nmcli connection modify "Wired connection 1" ipv4.dns "1.1.1.1 9.9.9.9"
sudo nmcli connection modify "Wired connection 1" ipv4.ignore-auto-dns yes
sudo nmcli connection up "Wired connection 1"
```

Here, `1.1.1.1` and `9.9.9.9` are example DNS resolver addresses. Replace them with resolvers you trust or with your local DNS server, such as a Pi-hole.

To return to DNS servers provided automatically by DHCP:

```bash
sudo nmcli connection modify "Wired connection 1" ipv4.ignore-auto-dns no
sudo nmcli connection modify "Wired connection 1" ipv4.dns ""
sudo nmcli connection up "Wired connection 1"
```

For IPv6, corresponding settings use `ipv6.method`, `ipv6.dns`, and `ipv6.ignore-auto-dns`.

### Set DNS temporarily with systemd-resolved

On systems where `systemd-resolved` is active, `resolvectl` can set DNS for a specific interface at runtime:

```bash
resolvectl status
sudo resolvectl dns enp3s0 1.1.1.1 9.9.9.9
sudo resolvectl domain enp3s0 '~.'
```

Replace `enp3s0` with the correct interface. The `~.` routing domain tells systemd-resolved to prefer this link for general DNS queries. These runtime settings are not the same as a persistent NetworkManager profile and may be lost when the interface or resolver configuration changes. Do not use this method unless `systemd-resolved` is running and managing DNS on the system.

Revert per-link runtime DNS settings when appropriate:

```bash
sudo resolvectl revert enp3s0
```

### Configure DHCP and DNS with systemd-networkd

Use this only if `systemd-networkd` manages the interface. NetworkManager and `systemd-networkd` should not both manage the same interface.

Example file: `/etc/systemd/network/20-wired.network`

```ini
[Match]
Name=enp3s0

[Network]
DHCP=ipv4
DNS=1.1.1.1
DNS=9.9.9.9
```

Edit the file with your preferred editor, for example:

```bash
sudo vim /etc/systemd/network/20-wired.network
```

Then restart the service to apply the configuration:

```bash
sudo systemctl restart systemd-networkd
networkctl status enp3s0
```

This example requests an IPv4 address through DHCP and specifies DNS servers for the link. DNS integration depends on the resolver setup; check `resolvectl status` if `systemd-resolved` is used. Restarting network services can disconnect remote sessions.

### Inspect and troubleshoot DHCP

```bash
ip -brief address
ip route
nmcli device show
journalctl -u NetworkManager -b --no-pager
journalctl -u systemd-networkd -b --no-pager
```

Look for an IPv4 address, a default route, and the DNS configuration associated with the active connection. If no address is assigned, check the cable or Wi-Fi connection, DHCP server/router, VLAN, and logs.

If the `dhclient` utility is installed, it can request or renew a lease on some configurations, but do not run it blindly on an interface managed by NetworkManager or `systemd-networkd`. Prefer the commands provided by the active network manager.

### Inspect and troubleshoot DNS

```bash
resolvectl status
cat /etc/resolv.conf
getent hosts debian.org
```

Test a specific DNS server directly if `dig` is installed:

```bash
dig @1.1.1.1 debian.org
dig @9.9.9.9 debian.org
```

If querying a DNS server by IP works but system name lookups fail, inspect the local resolver configuration and the DNS service managing it. On many Debian setups, `/etc/resolv.conf` is managed automatically or is a symbolic link; editing it directly may be overwritten. Configure DNS through the active network manager instead.

---

## 15. Firewall basics with nftables and ufw

A firewall controls which network traffic is accepted, rejected, or dropped. Debian can use nftables directly; `ufw` is an optional simpler front end. Avoid managing the same firewall rules independently through multiple tools unless you understand how they interact.

### Inspect nftables rules

```bash
sudo nft list ruleset
```

This displays the active nftables ruleset. If the output is empty, it does not necessarily mean every kind of traffic is blocked or that no other firewall mechanism is active.

### Check ufw status

```bash
sudo ufw status verbose
```

Install if needed:

```bash
sudo apt install ufw
```

### Allow SSH before enabling a firewall remotely

```bash
sudo ufw allow OpenSSH
```

Then, only after reviewing the rules and ensuring the SSH rule matches your setup:

```bash
sudo ufw enable
```

Enabling a firewall over SSH without allowing the correct management port can lock you out. If SSH uses a custom port, allow that port before enabling the firewall.

### Allow a service port

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Remove a rule

```bash
sudo ufw status numbered
sudo ufw delete RULE_NUMBER
```

Confirm the numbered rule before deleting it, because rule numbers can change after edits.

## 16. Packet capture and traffic inspection

### Capture packets on an interface

```bash
sudo tcpdump -i enp3s0
```

Stop with `Ctrl+C`. Packet captures can contain private information, including credentials or session data in unencrypted protocols. Capture only traffic you are authorized to inspect and store the resulting files securely.

### Capture a limited number of packets

```bash
sudo tcpdump -i enp3s0 -c 100
```

### Capture traffic to or from a host

```bash
sudo tcpdump -i enp3s0 host 192.168.1.25
```

### Capture traffic for a port

```bash
sudo tcpdump -i enp3s0 port 53
sudo tcpdump -i enp3s0 tcp port 443
```

### Save a capture to a PCAP file

```bash
sudo tcpdump -i enp3s0 -w capture.pcap -c 500
```

Read it later:

```bash
tcpdump -r capture.pcap
```

Use Wireshark or `tshark` for deeper analysis. Packet capture permissions and visibility vary by interface, network topology, and privileges.

## 17. Hostname, MAC address, and neighbor table

### Show or set the hostname

```bash
hostname
hostnamectl
```

Set a persistent hostname:

```bash
sudo hostnamectl set-hostname debian-lab
```

Choose a valid hostname for your environment. Existing shells and services may need to be refreshed or restarted to reflect changes.

### Show MAC addresses

```bash
ip link
ip -brief link
```

The `link/ether` value is typically the Ethernet MAC address. Virtual machines, containers, and Wi-Fi privacy features can use randomized or virtual MAC addresses.

### Show the neighbor (ARP/NDP) table

```bash
ip neigh
ip -4 neigh
ip -6 neigh
```

The neighbor table maps local-network IP addresses to link-layer addresses where available. Entries may be incomplete, stale, or absent if a host has not recently been contacted.

### Clear a neighbor entry

```bash
sudo ip neigh del 192.168.1.25 dev enp3s0
```

Only remove an entry when you understand why it is wrong or stale. Linux will usually relearn it when traffic flows.

## 18. Wireless networking (Wi-Fi)

This section focuses specifically on Wi-Fi: identifying wireless adapters, checking radio status, discovering nearby networks, connecting, troubleshooting, and inspecting wireless link quality. Interface names vary; a Wi-Fi interface might be named `wlan0` or `wlp2s0`.

### Install wireless tools

```bash
sudo apt update
sudo apt install iw rfkill wireless-tools network-manager
```

- `iw` is the modern command-line tool for Linux wireless devices.
- `rfkill` checks and controls radio blocking.
- `nmcli` is provided by NetworkManager and is usually the easiest way to manage Wi-Fi on a desktop or laptop.
- `wireless-tools` provides older commands such as `iwconfig`; use `iw` where possible.

If you are managing a headless server, check which network manager is already in use before installing or enabling another one.

### Identify the wireless interface

```bash
iw dev
iwconfig
ip -brief link
nmcli device status
```

`iw dev` lists wireless interfaces known to the kernel. In the output, note the interface name, such as `wlp2s0`.

To inspect a particular wireless interface:

```bash
iw dev wlp2s0 info
ip address show dev wlp2s0
```

Replace `wlp2s0` with your actual interface name.

### Check whether Wi-Fi is blocked

```bash
rfkill list
nmcli radio
```

Unblock the wireless radio if it is soft-blocked:

```bash
sudo rfkill unblock wifi
nmcli radio wifi on
```

A hardware switch or firmware setting can cause a **hard block**. Software commands cannot override a hardware hard block; check the laptop's wireless switch, function key, BIOS/UEFI settings, and airplane-mode controls.

### Check the adapter and driver

```bash
lspci -nnk | grep -A3 -Ei 'network|wireless'
lsusb
sudo dmesg -T | grep -Ei 'wifi|wlan|wireless|firmware|iwlwifi|rtw|ath'
```

Use `lspci` for internal PCI/PCIe adapters and `lsusb` for USB Wi-Fi adapters. Look for the kernel driver in use and any firmware-loading errors.

On Debian, missing firmware may prevent an adapter from working. Identify the chipset first, then consult Debian's firmware package information and install the matching package. Common examples include `firmware-iwlwifi` for many Intel adapters and `firmware-realtek` for many Realtek adapters. Package availability depends on the enabled Debian repository components and the device; do not assume every adapter uses one of these packages.

### Inspect supported wireless capabilities

```bash
iw list
iw dev wlp2s0 info
```

`iw list` can report supported bands, frequencies, channel widths, interface modes, and security capabilities. It is long, so filter it when needed:

```bash
iw list | less
iw list | grep -A12 -E 'Supported interface modes|Band [0-9]'
```

### Scan for nearby Wi-Fi networks

With NetworkManager:

```bash
nmcli device wifi list
nmcli device wifi rescan
nmcli device wifi list
```

With `iw` (scanning may require elevated privileges and an active wireless interface):

```bash
sudo iw dev wlp2s0 scan
```

The `iw` scan output can be lengthy. To display likely useful fields:

```bash
sudo iw dev wlp2s0 scan | grep -E 'BSS |freq:|signal:|SSID:|RSN:|WPA:'
```

Scanning is not the same as connecting. A hidden SSID may not be displayed by name, and signal values can fluctuate.

### Connect to a Wi-Fi network with NetworkManager

List visible networks:

```bash
nmcli device wifi list
```

Connect to a network with a password:

```bash
sudo nmcli device wifi connect "My Wi-Fi" password "replace-with-password"
```

If several adapters are present, specify the interface:

```bash
sudo nmcli device wifi connect "My Wi-Fi" password "replace-with-password" ifname wlp2s0
```

NetworkManager normally saves the connection profile so it can reconnect later. Avoid placing real passwords in shell history on shared systems. For interactive use, consider creating a connection profile through a trusted desktop network app or using a safer secret-handling workflow.

For a hidden SSID:

```bash
sudo nmcli device wifi connect "My Hidden Wi-Fi" password "replace-with-password" hidden yes
```

### Disconnect, reconnect, and forget a saved network

```bash
nmcli connection show
nmcli device disconnect wlp2s0
nmcli connection up "My Wi-Fi"
```

To remove a saved connection profile, first find its exact name:

```bash
nmcli connection show
sudo nmcli connection delete "My Wi-Fi"
```

Deleting a connection profile removes its saved configuration; it does not delete the wireless network itself.

### Inspect the current Wi-Fi connection

```bash
nmcli device status
nmcli connection show --active
nmcli -f IN-USE,SSID,BSSID,CHAN,FREQ,RATE,SIGNAL,SECURITY device wifi list
iw dev wlp2s0 link
```

`iw dev wlp2s0 link` reports details of the current association, including the access point, frequency, and signal when connected.

### Check signal strength and link quality

```bash
watch -n 2 'iw dev wlp2s0 link'
nmcli -f IN-USE,SSID,FREQ,RATE,SIGNAL device wifi list
```

General guidance:

- A signal closer to `0 dBm` is stronger; for example, `-45 dBm` is stronger than `-75 dBm`.
- Signal strength alone does not determine throughput. Interference, channel congestion, access-point capacity, distance, walls, and client capabilities also matter.
- A high negotiated link rate does not guarantee the same real-world internet speed.

Stop `watch` with `Ctrl+C`.

### Inspect Wi-Fi frequency and channel

```bash
iw dev wlp2s0 link
iw list
nmcli -f SSID,CHAN,FREQ,SIGNAL device wifi list
```

The 2.4 GHz band often reaches farther but has fewer non-overlapping channels and more potential interference. The 5 GHz band often offers more capacity but may have less range through walls. The 6 GHz band is available only where supported by the adapter, access point, regulatory rules, and configuration.

Do not change a regulatory country setting arbitrarily. Use the correct country setting for the device's actual location and follow local wireless regulations.

### Troubleshoot a connection that will not work

Check each layer in order:

```bash
# 1. Is the adapter visible?
iw dev
ip -brief link

# 2. Is Wi-Fi blocked?
rfkill list

# 3. Is NetworkManager managing the adapter?
nmcli device status

# 4. Can it see access points?
nmcli device wifi list

# 5. Does the interface have an IP address?
ip address show dev wlp2s0

# 6. Is there a default route?
ip route

# 7. Can it reach the local gateway? (replace with your gateway)
ping -c 4 192.168.1.1

# 8. Can it reach an external IP and resolve DNS?
ping -c 4 1.1.1.1
getent hosts debian.org
```

If the adapter is missing, inspect `lspci`/`lsusb`, `dmesg`, the kernel driver, and firmware. If it sees networks but cannot connect, verify the password, security compatibility, access-point settings, and whether the router has a client limit or access-control rule. If it connects but has no internet, investigate IP addressing, DHCP, routing, DNS, and firewall rules using the earlier sections of this guide.

### View NetworkManager Wi-Fi logs

```bash
journalctl -u NetworkManager -b --no-pager
journalctl -u NetworkManager -b -f
```

The second command follows new log entries in real time. Press `Ctrl+C` to stop following.

### Restart Wi-Fi or NetworkManager carefully

```bash
nmcli radio wifi off
nmcli radio wifi on
```

Or restart NetworkManager:

```bash
sudo systemctl restart NetworkManager
```

Restarting NetworkManager can interrupt all connections it manages, including remote sessions. Do not do this over SSH unless you have a recovery path.

### Optional: inspect wireless statistics

```bash
iw dev wlp2s0 station dump
```

This is most useful when run on a device operating as a Wi-Fi station and supported by the driver. It can show signal, transmission/reception statistics, and other link details. Driver support and available fields vary.

---

## 19. Common troubleshooting workflows

### A. No network connectivity

Run these in order:

```bash
ip -brief address
ip route
ping -c 3 127.0.0.1
ping -c 3 192.168.1.1
ping -c 3 1.1.1.1
getent hosts debian.org
```

Replace `192.168.1.1` with your actual gateway.

Interpretation:
1. No interface address: inspect link state and the active network manager.
2. No default route: inspect DHCP or static route configuration.
3. Gateway unreachable: check local link, Wi-Fi association, VLAN, or gateway configuration.
4. Public IP unreachable but gateway works: investigate routing, firewall, or upstream connectivity.
5. IP connectivity works but name lookup fails: investigate DNS.

These are clues rather than absolute rules; firewalls and network policies can affect individual tests.

### B. DNS is broken

```bash
getent hosts debian.org
cat /etc/resolv.conf
resolvectl status
dig debian.org
```

`resolvectl` may not be available or active on every Debian installation. Inspect which service manages DNS before changing resolver configuration.

### C. A service is not reachable

On the server:

```bash
sudo ss -ltnp
sudo systemctl status SERVICE
```

From a client:

```bash
nc -vz SERVER_IP PORT
```

Check that the service is listening on the expected address, the firewall permits traffic, and any NAT or port-forwarding rules are correct.

### D. The server is listening only on localhost

A service bound to `127.0.0.1` usually accepts connections only from the same host. Inspect the bind address:

```bash
sudo ss -ltnp
```

Configure the application to listen on the intended interface only if remote access is required and the firewall/security design allows it. Do not bind a service to every interface without considering exposure.

### E. Find the route chosen for a connection

```bash
ip route get SERVER_IP
```

This helps reveal the selected interface, next hop, and source address for a destination.

### F. Inspect dropped or failed packets

Use `tcpdump` on the relevant interface, check firewall rules, and compare packet flow on the client and server where possible. A capture on one machine cannot show packets that never reach that machine.

## 20. Quick reference

| Task | Command |
|---|---|
| Show IP addresses | `ip -brief address` |
| Show interface state | `ip -brief link` |
| Show routes | `ip route` |
| Find route to a destination | `ip route get 1.1.1.1` |
| Test reachability | `ping -c 4 HOST` |
| Trace route | `traceroute HOST` |
| Test TCP port | `nc -vz HOST PORT` |
| Query DNS | `dig NAME` |
| Query system name service | `getent hosts NAME` |
| Show listening TCP ports | `sudo ss -ltnp` |
| Show listening UDP ports | `sudo ss -lunp` |
| Test HTTP headers | `curl -I URL` |
| Download a file | `curl -fL -o FILE URL` |
| Show NetworkManager devices | `nmcli device status` |
| Show active connections | `nmcli connection show --active` |
| Show firewall rules | `sudo nft list ruleset` |
| Show ufw status | `sudo ufw status verbose` |
| Capture packets | `sudo tcpdump -i INTERFACE` |
| Show neighbor table | `ip neigh` |
| Show hostname | `hostnamectl` |
| Read NetworkManager logs | `journalctl -u NetworkManager -b` |

---

**Recommended troubleshooting order:** inspect the interface and IP address, check the route, test the gateway, test an external IP, then test DNS and the application port. This narrows the problem without changing configuration unnecessarily.
