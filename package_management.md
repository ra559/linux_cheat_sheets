# Debian Package Management Cheat Sheet

**Platform:** Debian GNU/Linux  
**Default environment:** Debian 13 (Trixie)

This cheat sheet covers the installation, updating, removal, and maintenance of software on Debian using APT, Flatpak, Snap, and source builds. It also includes the basic toolchains required to compile Rust, C, and C++ applications.

## Table of Contents

- [1. Understanding Software Installation on Debian](#1-understanding-software-installation-on-debian)
- [2. APT Package Management](#2-apt-package-management)
- [3. Flatpak](#3-flatpak)
- [4. Snap](#4-snap)
- [5. Building Software from Source](#5-building-software-from-source)
- [6. Rust Applications](#6-rust-applications)
- [7. C Applications](#7-c-applications)
- [8. C++ Applications](#8-c-applications)
- [9. Troubleshooting](#9-troubleshooting)
- [10. Quick Reference](#10-quick-reference)

## 1. Understanding Software Installation on Debian

Debian supports several ways to install software. Each method has different strengths, requirements, and maintenance procedures.

| Method | Description | Typical use |
|---|---|---|
| APT | Installs packages from configured Debian and third-party repositories. | System software, libraries, command-line utilities, and desktop applications. |
| Flatpak | Distributes applications in portable bundles, commonly using a sandbox. | Desktop applications distributed independently of the base operating system. |
| Snap | Distributes applications in self-contained Snap packages managed by the Snap daemon. | Applications distributed through the Snap ecosystem. |
| Build from source | Compiles or builds software from its source code. | Development, customization, newer versions, and software unavailable as a package. |
| Cargo | Rust's package manager and build tool. | Building and installing Rust applications. |
| GCC and Clang | Compiler toolchains for C and C++. | Building native applications and libraries. |

### Choosing an installation method

- Prefer **APT** for software available in Debian's repositories.
- Use **Flatpak** for desktop applications when its packaging and update model are appropriate.
- Use **Snap** when an application is distributed through Snap or requires that ecosystem.
- Build from source when you need control over the build, a version unavailable through existing packages, or a development workflow.

Avoid installing the same application through multiple package managers unless there is a specific reason. Multiple installations can create confusion about executable paths, configuration files, and update mechanisms.

## 2. APT Package Management

APT (Advanced Package Tool) is Debian's primary high-level package management system.

### Update package indexes

```bash
sudo apt update
```

Refreshes local package indexes. It does not upgrade installed software.

### Upgrade installed packages

```bash
sudo apt upgrade
```

Upgrades installed packages without removing installed packages to resolve dependency changes.

```bash
sudo apt full-upgrade
```

Performs a broader upgrade and may remove packages when required to resolve dependencies.

### Install packages

```bash
sudo apt install PACKAGE
```

Install multiple packages:

```bash
sudo apt install PACKAGE1 PACKAGE2
```

Install a local Debian package:

```bash
sudo apt install ./package.deb
```

Reinstall a package:

```bash
sudo apt install --reinstall PACKAGE
```

### Remove packages

Remove an application while generally retaining system-wide package configuration:

```bash
sudo apt remove PACKAGE
```

Remove a package and its package-managed system configuration files:

```bash
sudo apt purge PACKAGE
```

Remove automatically installed dependencies that are no longer needed:

```bash
sudo apt autoremove
```

### Search for software

```bash
apt search KEYWORD
```

Display package information:

```bash
apt show PACKAGE
```

Check installed and available versions:

```bash
apt-cache policy PACKAGE
```

List installed packages:

```bash
apt list --installed
```

List packages with available upgrades:

```bash
apt list --upgradable
```

### Simulate an operation

```bash
apt -s install PACKAGE
```

Simulates an installation without making the package changes.

### Repair dependency problems

```bash
sudo apt --fix-broken install
```

Configure unpacked packages that have not finished configuring:

```bash
sudo dpkg --configure -a
```

Check package dependency consistency:

```bash
sudo apt check
```

### Clean cached packages

```bash
sudo apt clean
```

Removes downloaded package archives from APT's cache.

```bash
sudo apt autoclean
```

Removes cached package archives that are no longer downloadable from configured repositories.

### Repository configuration

Common configuration locations:

| Path | Purpose |
|---|---|
| `/etc/apt/sources.list` | Traditional repository configuration. |
| `/etc/apt/sources.list.d/` | Additional repository configuration files. |
| `/etc/apt/sources.list.d/*.sources` | Common location for deb822-format sources. |
| `/etc/apt/preferences.d/` | Package version pinning preferences. |
| `/var/lib/apt/lists/` | Downloaded repository index data. |
| `/var/cache/apt/archives/` | Cached package archives. |

Inspect repository files:

```bash
ls -l /etc/apt/sources.list.d/
```

After changing repository configuration:

```bash
sudo apt update
```

**Important:** Do not mix Debian releases casually. Third-party repositories must be trusted and configured correctly.

## 3. Flatpak

Flatpak is an application distribution system commonly used for desktop software. Applications can run in a sandbox with access controlled by permissions. Many Flatpak applications use the Flathub repository.

### Install Flatpak

```bash
sudo apt update
sudo apt install flatpak
```

For GNOME Software integration:

```bash
sudo apt install gnome-software-plugin-flatpak
```

The GNOME Software plugin is optional and is intended for systems using GNOME Software.

### Add Flathub

Add the Flathub remote for the current user:

```bash
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
```

This configures Flathub as a per-user remote. For a system-wide remote, use `sudo flatpak remote-add` with the same options.

### Search for applications

```bash
flatpak search APPLICATION
```

### Install an application

```bash
flatpak install flathub APPLICATION_ID
```

Example:

```bash
flatpak install flathub org.videolan.VLC
```

### Run an application

```bash
flatpak run APPLICATION_ID
```

Example:

```bash
flatpak run org.videolan.VLC
```

### List installed applications

```bash
flatpak list
```

List configured remotes:

```bash
flatpak remotes
```

### Update applications

```bash
flatpak update
```

Updates installed applications and their relevant runtimes.

### Remove applications

```bash
flatpak uninstall APPLICATION_ID
```

Remove unused runtimes and dependencies:

```bash
flatpak uninstall --unused
```

### Inspect application information

```bash
flatpak info APPLICATION_ID
```

### Inspect permissions

```bash
flatpak info --show-permissions APPLICATION_ID
```

**Note:** Flatpak application IDs are not necessarily the same as Debian package names. Use the exact application ID provided by the remote.

## 4. Snap

Snap is a software packaging and distribution system that uses the Snap daemon, `snapd`, to install and manage Snap packages.

Snap is not installed by default on a standard Debian installation.

### Install Snap support

```bash
sudo apt update
sudo apt install snapd
```

Enable and start the daemon if necessary:

```bash
sudo systemctl enable --now snapd.socket
```

Some installations may require a logout or reboot before all Snap integration works correctly.

### Search for applications

```bash
snap find APPLICATION
```

### Install an application

```bash
sudo snap install APPLICATION
```

Install a classic-confinement application when required by its publisher:

```bash
sudo snap install --classic APPLICATION
```

Classic confinement grants broader system access than strict confinement. Use it only when the application requires it and the publisher is trusted.

### List installed Snaps

```bash
snap list
```

### Display package information

```bash
snap info APPLICATION
```

### Update Snaps

```bash
sudo snap refresh
```

Refresh a specific application:

```bash
sudo snap refresh APPLICATION
```

### Remove a Snap

```bash
sudo snap remove APPLICATION
```

Remove a Snap and discard its saved data where supported:

```bash
sudo snap remove --purge APPLICATION
```

### Check Snap services

```bash
systemctl status snapd.socket
```

**Note:** Snap applications are managed independently of APT packages, although `snapd` itself is installed and maintained through APT on Debian.

## 5. Building Software from Source

Building from source means obtaining a project's source code and running its build system to produce an executable, library, or package.

The exact process depends on the project's programming language and build system. Always read the project's README and installation instructions first.

### Install common build tools

```bash
sudo apt update
sudo apt install build-essential git cmake pkg-config
```

This installs common tools for native compilation, including GCC, G++, GNU Make, and development utilities.

Additional dependencies may be required by individual projects.

### Obtain source code

Clone a Git repository:

```bash
git clone REPOSITORY_URL
```

Enter the project directory:

```bash
cd PROJECT_DIRECTORY
```

For a release archive, download it from the project's official release page and extract it using the appropriate tool.

### Inspect project instructions

```bash
ls -la
```

Look for files such as:

- `README.md`
- `INSTALL`
- `Makefile`
- `CMakeLists.txt`
- `configure`
- `Cargo.toml`

These files often identify the build system, dependencies, configuration options, and installation procedure.

### Common build workflows

For projects that provide a Makefile:

```bash
make
```

For projects using CMake:

```bash
cmake -S . -B build
cmake --build build
```

For projects using a configure script:

```bash
./configure
make
```

These are examples, not interchangeable universal commands. Use only the workflow supported by the project.

### Installing a built application

Some projects provide an installation target:

```bash
sudo make install
```

Others provide a package, an executable that can be run directly, or their own installation command.

**Caution:** Avoid `sudo make install` unless the project explicitly documents it. Installing manually can place files outside APT's control, making upgrades and removal more difficult.

Prefer a Debian package when the project provides one. For a custom build, consider installing into a dedicated directory or using a packaging tool so the installed files can be tracked and removed safely.

## 6. Rust Applications

Rust projects commonly use Cargo, the official Rust package manager and build tool.

### Install Rust through Debian packages

```bash
sudo apt update
sudo apt install rustc cargo
```

This uses the versions provided by the configured Debian repositories.

Check installed versions:

```bash
rustc --version
cargo --version
```

### Install Rust using rustup

`rustup` manages Rust toolchains and allows users to select different compiler versions. It is often useful when a project requires a newer Rust version than Debian provides.

Follow the installation instructions at the official Rust website:

https://www.rust-lang.org/tools/install

Avoid mixing a `rustup` toolchain and Debian's Rust packages without understanding which executable takes precedence in `PATH`.

### Build a Rust project

Clone the source:

```bash
git clone REPOSITORY_URL
cd PROJECT_DIRECTORY
```

Build the project:

```bash
cargo build
```

Build an optimized release executable:

```bash
cargo build --release
```

Run the project:

```bash
cargo run
```

Run it with release optimizations:

```bash
cargo run --release
```

### Install a Rust application from source

For a Rust project that supports Cargo installation:

```bash
cargo install APPLICATION
```

This generally builds the application and places its executable in Cargo's binary directory, commonly `~/.cargo/bin/`.

For a local project:

```bash
cargo install --path .
```

### Update and remove Cargo-installed applications

Update an installed Cargo application:

```bash
cargo install APPLICATION
```

Cargo can reinstall an application when a newer compatible version is available.

Remove an installed Cargo application:

```bash
cargo uninstall APPLICATION
```

**Note:** Cargo-installed applications are not managed by APT. Their dependencies and update procedures are separate from Debian package management.

## 7. C Applications

C is a compiled programming language. C source files are typically compiled with GCC or Clang.

### Install a C compiler

```bash
sudo apt update
sudo apt install build-essential
```

Check the compiler version:

```bash
gcc --version
```

### Create a C program

Create a file named `hello.c`:

```c
#include <stdio.h>

int main(void)
{
    printf("Hello, Debian!\n");
    return 0;
}
```

### Compile the program

```bash
gcc hello.c -o hello
```

Run it:

```bash
./hello
```

### Compile with warnings

```bash
gcc -Wall -Wextra -Wpedantic hello.c -o hello
```

These options enable useful compiler diagnostics.

### Compile with optimization

```bash
gcc -O2 hello.c -o hello
```

Optimization options can improve performance but may make debugging more difficult.

### Install development libraries

C applications may require development headers and libraries. On Debian, development packages commonly use the `-dev` suffix.

For example, to install OpenSSL development files:

```bash
sudo apt install libssl-dev
```

The actual dependencies depend on the application.

### Inspect linked shared libraries

```bash
ldd ./hello
```

Use `ldd` only on trusted executables. It displays the shared libraries an executable depends on.

## 8. C++ Applications

C++ is a compiled programming language. Debian provides GCC's C++ compiler and Clang as common options.

### Install a C++ compiler

```bash
sudo apt update
sudo apt install g++
```

Alternatively, install the standard native build tools:

```bash
sudo apt install build-essential
```

Check the compiler version:

```bash
g++ --version
```

### Create a C++ program

Create a file named `hello.cpp`:

```cpp
#include <iostream>

int main()
{
    std::cout << "Hello, Debian!" << '\n';
    return 0;
}
```

### Compile the program

```bash
g++ hello.cpp -o hello
```

Run it:

```bash
./hello
```

### Specify the C++ language standard

For C++17:

```bash
g++ -std=c++17 hello.cpp -o hello
```

For C++20:

```bash
g++ -std=c++20 hello.cpp -o hello
```

The selected standard must be supported by the installed compiler.

### Enable compiler warnings

```bash
g++ -Wall -Wextra -Wpedantic hello.cpp -o hello
```

### Build a CMake project

Install CMake:

```bash
sudo apt install cmake
```

Configure and build a project containing `CMakeLists.txt`:

```bash
cmake -S . -B build
cmake --build build
```

This workflow is common for C++ projects and also works for many C projects using CMake.

## 9. Troubleshooting

### APT cannot find a package

Refresh the package indexes:

```bash
sudo apt update
```

Search for the package:

```bash
apt search KEYWORD
```

Check the configured repositories and package availability:

```bash
apt-cache policy PACKAGE
```

### Flatpak cannot find an application

Check configured remotes:

```bash
flatpak remotes
```

Search Flathub:

```bash
flatpak search APPLICATION
```

Confirm that you are using the correct application ID.

### Snap commands fail

Check whether the Snap daemon is running:

```bash
systemctl status snapd.socket
```

Confirm that Snap is installed:

```bash
snap version
```

### A source build fails

Read the error output and the project's build instructions. Common causes include missing development headers, incompatible compiler versions, missing build tools, and unavailable dependencies.

Check whether a required tool exists:

```bash
command -v gcc
command -v g++
command -v cmake
command -v make
command -v cargo
```

### An executable cannot be found

Check its location:

```bash
command -v APPLICATION
```

Inspect the executable search path:

```bash
printf '%s\n' "$PATH"
```

Rust applications installed with Cargo commonly reside in `~/.cargo/bin/`. That directory must be included in `PATH` for the commands to be found.

## 10. Quick Reference

| Goal | Command |
|---|---|
| Refresh APT indexes | `sudo apt update` |
| Upgrade Debian packages | `sudo apt upgrade` |
| Install an APT package | `sudo apt install PACKAGE` |
| Remove an APT package | `sudo apt remove PACKAGE` |
| Search APT packages | `apt search KEYWORD` |
| Install Flatpak | `sudo apt install flatpak` |
| Install a Flatpak application | `flatpak install flathub APPLICATION_ID` |
| Update Flatpak applications | `flatpak update` |
| Install Snap support | `sudo apt install snapd` |
| Install a Snap application | `sudo snap install APPLICATION` |
| Update Snaps | `sudo snap refresh` |
| Install native build tools | `sudo apt install build-essential` |
| Install CMake | `sudo apt install cmake` |
| Install Debian's Rust toolchain | `sudo apt install rustc cargo` |
| Compile a C program | `gcc hello.c -o hello` |
| Compile a C++ program | `g++ hello.cpp -o hello` |
| Build a Rust project | `cargo build` |
| Build a Rust release executable | `cargo build --release` |
| Build a CMake project | `cmake -S . -B build && cmake --build build` |

### Final Notes

- APT, Flatpak, Snap, Cargo, and manual source installations maintain software independently.
- Prefer Debian packages for core system components and libraries unless a specific requirement calls for another method.
- Read each project's official build and installation instructions before compiling software.
- Keep track of manually installed applications so they can be updated and removed safely.
- Use trusted repositories and source code. Building from source does not automatically make software safer.