---
layout: sheet
title: "Docker Cheat Sheet for Debian 13"
category: "Containers"
summary: "Install Docker Engine and manage images, containers, volumes, networks, and logs."
date: 2026-10-24 19:48:24
permalink: /html/docker.html
---
# Docker Cheat Sheet for Debian 13

A practical command reference for Docker Engine on Debian 13 (Trixie), including installation, images, containers, volumes, networks, logs, troubleshooting, and cleanup.

## Table of Contents

- [1. Docker Overview](#1-docker-overview)
- [2. Install Docker Engine](#2-install-docker-engine)
- [3. Verify and Configure Docker](#3-verify-and-configure-docker)
- [4. Images](#4-images)
- [5. Containers](#5-containers)
- [6. Ports and Networking Basics](#6-ports-and-networking-basics)
- [7. Volumes and Persistent Data](#7-volumes-and-persistent-data)
- [8. Networks](#8-networks)
- [9. Logs and Inspection](#9-logs-and-inspection)
- [10. Execute Commands and Copy Files](#10-execute-commands-and-copy-files)
- [11. Build Images with a Dockerfile](#11-build-images-with-a-dockerfile)
- [12. Docker Compose](#12-docker-compose)
- [13. Resource Usage and Limits](#13-resource-usage-and-limits)
- [14. Troubleshooting](#14-troubleshooting)
- [15. Cleanup and Disk Space](#15-cleanup-and-disk-space)
- [16. Security Notes](#16-security-notes)
- [17. Quick Reference](#17-quick-reference)
- [18. Help and Documentation](#18-help-and-documentation)

---

## 1. Docker Overview

Docker runs applications in containers. Containers share the host's Linux kernel while providing isolation for processes, filesystems, and networking.

- **Image:** A template used to create containers.
- **Container:** A running or stopped instance of an image.
- **Volume:** Persistent storage managed by Docker.
- **Network:** A virtual network that connects containers.
- **Dockerfile:** Instructions for building an image.
- **Docker Compose:** A tool for defining and managing multi-container applications.

Typical command structure:

```bash
docker OBJECT COMMAND [OPTIONS]
```

Examples: `docker image ls`, `docker container ls`, `docker volume ls`.

## 2. Install Docker Engine

This section uses Docker's official APT repository for Debian. Debian's `docker.io` package is a separate installation option; avoid mixing package sources without a plan.

### Remove potentially conflicting packages

```bash
sudo apt remove docker.io docker-doc docker-compose podman-docker containerd runc
```

Review APT's proposed changes before confirming. This does not normally remove Docker data stored in `/var/lib/docker`, but do not rely on that directory as a backup.

### Install prerequisites and add Docker's signing key

```bash
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg \
  -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

Add the official repository using the Debian codename and architecture detected on your system:

```bash
sudo tee /etc/apt/sources.list.d/docker.sources > /dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/debian
Suites: $(. /etc/os-release && echo "$VERSION_CODENAME")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
```

Install Docker Engine, the CLI, containerd, Buildx, and Compose:

```bash
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Enable and start Docker:

```bash
sudo systemctl enable --now docker
sudo systemctl status docker
```

## 3. Verify and Configure Docker

Check versions and installation:

```bash
docker --version
docker compose version
sudo docker run --rm hello-world
```

Show Docker's server configuration:

```bash
sudo docker info
```

Check service status:

```bash
systemctl is-active docker
systemctl is-enabled docker
```

### Optional: run Docker without `sudo`

The `docker` group grants root-level privileges on the host. Only add trusted users:

```bash
sudo usermod -aG docker "$USER"
```

Log out and back in for the group change to take effect, then check:

```bash
id
docker ps
```

If you do not want to grant this level of access, keep using `sudo docker ...`.

## 4. Images

List local images:

```bash
docker image ls
```

Download an image:

```bash
docker pull debian:13
docker pull nginx:stable
```

Search Docker Hub:

```bash
docker search nginx
```

Inspect image metadata and layers:

```bash
docker image inspect debian:13
docker image history debian:13
```

Tag an image:

```bash
docker image tag local-app:latest username/local-app:1.0
```

Remove an image:

```bash
docker image rm debian:13
```

Remove dangling images:

```bash
docker image prune
```

Remove images not referenced by any existing container:

```bash
docker image prune -a
```

Review prune prompts carefully before confirming.

## 5. Containers

### Run containers

Start an interactive Debian shell and remove the container when it exits:

```bash
docker run --rm -it debian:13 bash
```

Run Nginx in the background:

```bash
docker run -d --name web nginx:stable
```

Run with an environment variable:

```bash
docker run -d --name app -e APP_ENV=production nginx:stable
```

List running containers:

```bash
docker ps
```

List all containers, including stopped ones:

```bash
docker ps -a
```

List only container IDs:

```bash
docker ps -aq
```

### Start, stop, restart, and remove

```bash
docker start web
docker stop web
docker restart web
docker rm web
```

Force-remove a running container:

```bash
docker rm -f web
```

Removing a container deletes its writable layer. Named volumes generally remain unless you explicitly remove them.

### Restart policies

```bash
docker run -d --name web --restart unless-stopped nginx:stable
docker update --restart unless-stopped web
```

Common policies:

- `no`: never automatically restart (default).
- `on-failure`: restart after a non-zero exit status.
- `always`: restart according to Docker's restart behavior.
- `unless-stopped`: restart unless explicitly stopped.

Inspect container configuration:

```bash
docker inspect web
```

## 6. Ports and Networking Basics

Publish host port `8080` to container port `80`:

```bash
docker run -d --name web -p 8080:80 nginx:stable
```

Visit `http://localhost:8080` on the Docker host.

Bind only to the host's loopback interface:

```bash
docker run -d --name local-web -p 127.0.0.1:8080:80 nginx:stable
```

Show port mappings:

```bash
docker port web
```

Check listening host ports:

```bash
sudo ss -ltnp
```

## 7. Volumes and Persistent Data

Use volumes for data that must survive container replacement.

List and create volumes:

```bash
docker volume ls
docker volume create app-data
docker volume inspect app-data
```

Mount a named volume:

```bash
docker run -d --name web -p 8080:80 \
  -v web-data:/usr/share/nginx/html nginx:stable
```

Open a temporary shell with a volume mounted:

```bash
docker run --rm -it -v app-data:/data debian:13 bash
```

Remove a volume:

```bash
docker volume rm app-data
```

Remove unused volumes:

```bash
docker volume prune
```

**Warning:** volume removal can permanently delete stored data. Check the volume's contents and backups first.

### Bind mounts: share a host directory

Mount the current directory into a container:

```bash
docker run --rm -it \
  --mount type=bind,source="$PWD",target=/workspace \
  debian:13 bash
```

Read-only bind mount:

```bash
docker run --rm -it \
  --mount type=bind,source="$PWD",target=/workspace,readonly \
  debian:13 bash
```

Bind mounts expose host files directly to the container. Verify the source path and permissions before running the command.

## 8. Networks

List and inspect networks:

```bash
docker network ls
docker network inspect bridge
```

Create a user-defined bridge network:

```bash
docker network create app-net
```

Run containers on it:

```bash
docker run -d --name web --network app-net nginx:stable
docker run --rm -it --network app-net debian:13 bash
```

Containers on a user-defined bridge network can generally resolve each other by container name. The second container can test `curl http://web` if curl is installed and Nginx is listening.

Connect or disconnect an existing container:

```bash
docker network connect app-net web
docker network disconnect app-net web
```

Remove a network or prune unused networks:

```bash
docker network rm app-net
docker network prune
```

## 9. Logs and Inspection

Display logs:

```bash
docker logs web
```

Follow logs live:

```bash
docker logs -f web
```

Show the last 100 lines with timestamps:

```bash
docker logs --tail 100 --timestamps web
```

Inspect a container:

```bash
docker inspect web
```

Print its current state and exit code:

```bash
docker inspect -f '{{.State.Status}}' web
docker inspect -f '{{.State.ExitCode}}' web
```

Show processes running inside a container:

```bash
docker top web
```

View resource usage:

```bash
docker stats
docker stats --no-stream
```

## 10. Execute Commands and Copy Files

Open a shell in a running container:

```bash
docker exec -it web sh
```

If Bash is installed:

```bash
docker exec -it web bash
```

Run a one-off command:

```bash
docker exec web nginx -t
```

Copy a host file into a container:

```bash
docker cp ./index.html web:/usr/share/nginx/html/index.html
```

Copy a file from a container to the host:

```bash
docker cp web:/etc/nginx/nginx.conf ./nginx.conf
```

`docker cp` works with running or stopped containers. Files in a container's writable layer can be lost when that container is removed; use a volume or bind mount for persistent data.

## 11. Build Images with a Dockerfile

Create a file named `Dockerfile`:

```dockerfile
FROM debian:13

RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Build an image from the current directory:

```bash
docker build -t my-nginx:1.0 .
```

The final `.` is the build context. Run the image:

```bash
docker run -d --name my-nginx -p 8080:80 my-nginx:1.0
```

Example `.dockerignore` file:

```text
.git
.env
*.log
tmp/
node_modules/
```

Adjust the entries to your project. Exclude secrets and unnecessary files from the build context, but do not exclude files required for the build.

## 12. Docker Compose

The official repository's `docker-compose-plugin` package provides the `docker compose` command.

Example `compose.yaml`:

```yaml
services:
  web:
    image: nginx:stable
    ports:
      - "8080:80"
    restart: unless-stopped
```

Start the project in the background:

```bash
docker compose up -d
```

List project containers:

```bash
docker compose ps
```

Follow logs:

```bash
docker compose logs -f
```

Stop and remove project containers and networks:

```bash
docker compose down
```

Pull newer images and recreate services:

```bash
docker compose pull
docker compose up -d
```

**Caution:** `docker compose down -v` also removes project-declared named volumes and attached anonymous volumes. Use it only if you intend to delete that stored data.

## 13. Resource Usage and Limits

Show live CPU, memory, network, and block I/O statistics:

```bash
docker stats
```

Set a 512 MiB memory limit:

```bash
docker run -d --name limited-web --memory 512m nginx:stable
```

Limit CPU use to approximately one CPU's worth of processing time:

```bash
docker run -d --name cpu-limited --cpus 1.0 nginx:stable
```

Set both limits:

```bash
docker run -d --name limited-app \
  --memory 512m --cpus 1.0 nginx:stable
```

Limits depend on kernel and cgroup support. Check the container's settings and behavior after applying them.

## 14. Troubleshooting

### Docker daemon is not running

```bash
sudo systemctl status docker
sudo systemctl start docker
sudo journalctl -u docker --since "30 minutes ago"
```

### Permission denied

Try `sudo`:

```bash
sudo docker ps
```

If using the `docker` group, verify group membership and start a new login session after adding yourself. Remember that group access is effectively root-level access.

### Container exits immediately

```bash
docker ps -a
docker logs CONTAINER
docker inspect -f '{{.State.ExitCode}}' CONTAINER
```

A container stops when its main process exits. It does not behave like a full virtual machine that stays running independently.

### Port is already in use

```bash
sudo ss -ltnp
```

Choose another host port, for example `-p 8081:80`.

### Containers cannot resolve each other by name

```bash
docker network ls
docker network inspect app-net
docker inspect web
```

Put related containers on the same user-defined bridge network or Compose network. The default bridge does not provide the same automatic name-based discovery behavior.

### Image pull fails

```bash
docker info
docker pull nginx:stable
```

Check network connectivity, DNS, registry status, image name and tag, and authentication. Use `docker login` for private registries and follow your credential policy.

### Inspect daemon logs

```bash
sudo journalctl -u docker -b
sudo journalctl -u docker -f
```

### Check disk usage

```bash
docker system df
docker system df -v
```

## 15. Cleanup and Disk Space

Remove a stopped container:

```bash
docker container rm web
```

Remove an image:

```bash
docker image rm nginx:stable
```

Remove unused containers, dangling images, or unused networks:

```bash
docker container prune
docker image prune
docker network prune
```

Remove unused volumes:

```bash
docker volume prune
```

Remove several categories of unused Docker objects:

```bash
docker system prune
```

Also remove images not referenced by any container:

```bash
docker system prune -a
```

Check disk usage before cleanup:

```bash
docker system df
```

**Be careful with prune commands.** They can delete objects you intended to keep. `docker system prune -a --volumes` is especially destructive because it can remove unused images and volumes. Confirm important data is backed up before removing volumes.

## 16. Security Notes

- Treat access to the Docker daemon and membership in the `docker` group as highly privileged.
- Prefer trusted, maintained images. Pin versions where reproducibility matters; use image digests for strict pinning when appropriate.
- Do not put passwords, API keys, or tokens in Dockerfiles or image layers.
- Avoid publishing administrative services to every network interface unless necessary. Use `127.0.0.1` binding for host-only access when appropriate.
- Use read-only mounts when containers only need to read data.
- Be cautious with `--privileged`, host networking, mounting `/var/run/docker.sock`, and bind-mounting sensitive host directories.
- Keep Docker Engine and images updated, and remove unused resources.

## 17. Quick Reference

| Task | Command |
|---|---|
| Show running containers | `docker ps` |
| Show all containers | `docker ps -a` |
| Pull an image | `docker pull IMAGE` |
| Run a container | `docker run IMAGE` |
| Run in background | `docker run -d IMAGE` |
| Stop a container | `docker stop CONTAINER` |
| Start a container | `docker start CONTAINER` |
| Restart a container | `docker restart CONTAINER` |
| Remove a container | `docker rm CONTAINER` |
| List images | `docker image ls` |
| Remove an image | `docker image rm IMAGE` |
| Show logs | `docker logs CONTAINER` |
| Follow logs | `docker logs -f CONTAINER` |
| Open a shell | `docker exec -it CONTAINER sh` |
| Inspect a container | `docker inspect CONTAINER` |
| Show resource usage | `docker stats` |
| List volumes | `docker volume ls` |
| List networks | `docker network ls` |
| Show disk usage | `docker system df` |
| Start Compose project | `docker compose up -d` |
| Stop Compose project | `docker compose down` |

Replace placeholders such as `IMAGE` and `CONTAINER` with actual image names, container names, or IDs.

## 18. Help and Documentation

```bash
docker --help
docker run --help
docker compose --help
docker version
docker info
```

Official documentation:

- Docker Engine on Debian: https://docs.docker.com/engine/install/debian/
- Docker CLI reference: https://docs.docker.com/reference/cli/docker/
- Docker Compose: https://docs.docker.com/compose/
- Dockerfile reference: https://docs.docker.com/reference/dockerfile/
