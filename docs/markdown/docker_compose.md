---
layout: sheet
title: "Docker Compose Cheat Sheet for Debian 13"
category: "Containers"
summary: "Define, run, update, and troubleshoot multi-container applications with Compose."
date: 2026-10-24 19:48:35
permalink: /html/docker_compose.html
---
# Docker Compose Cheat Sheet for Debian 13

A practical reference for defining, running, updating, and troubleshooting multi-container applications with Docker Compose.

## Table of Contents

- [1. What Is Docker Compose?](#1-what-is-docker-compose)
- [2. Install and Verify Compose](#2-install-and-verify-compose)
- [3. Compose File Basics](#3-compose-file-basics)
- [4. Start and Stop Applications](#4-start-and-stop-applications)
- [5. Services and Container Management](#5-services-and-container-management)
- [6. Images and Builds](#6-images-and-builds)
- [7. Ports and Networking](#7-ports-and-networking)
- [8. Environment Variables and Secrets](#8-environment-variables-and-secrets)
- [9. Volumes and Persistent Data](#9-volumes-and-persistent-data)
- [10. Health Checks and Startup Order](#10-health-checks-and-startup-order)
- [11. Logs and Troubleshooting](#11-logs-and-troubleshooting)
- [12. Profiles and Multiple Compose Files](#12-profiles-and-multiple-compose-files)
- [13. Resource Limits and Restart Policies](#13-resource-limits-and-restart-policies)
- [14. Updating and Rebuilding Services](#14-updating-and-rebuilding-services)
- [15. Cleanup](#15-cleanup)
- [16. Example: Web App and Database](#16-example-web-app-and-database)
- [17. Common Commands at a Glance](#17-common-commands-at-a-glance)
- [18. Security Notes](#18-security-notes)
- [19. Help and Documentation](#19-help-and-documentation)

---

## 1. What Is Docker Compose?

Docker Compose lets you describe an application with multiple services in a YAML file, usually named `compose.yaml`.

A Compose project can define:

- **Services:** Containers that make up the application.
- **Networks:** How services communicate.
- **Volumes:** Data that should persist beyond a container's lifetime.
- **Environment variables:** Configuration passed into services.
- **Health checks:** Tests that indicate whether a service is healthy.

Run Compose commands from the directory containing `compose.yaml`, unless you specify a file with `-f`.

On Debian, the modern command is `docker compose` with a space, not the older standalone `docker-compose` command.

## 2. Install and Verify Compose

If you installed Docker Engine from Docker's official APT repository, install the Compose plugin:

```bash
sudo apt update
sudo apt install docker-compose-plugin
```

Check the installed version:

```bash
docker compose version
```

Display command help:

```bash
docker compose --help
```

If Docker requires `sudo` on your system, prefix Compose commands with `sudo` as well.

## 3. Compose File Basics

Create a file named `compose.yaml`:

```yaml
services:
  web:
    image: nginx:stable
    ports:
      - "8080:80"
    restart: unless-stopped
```

Start the service:

```bash
docker compose up -d
```

Open `http://localhost:8080` on the Docker host.

### Important YAML rules

- Use spaces for indentation, not tabs.
- Indentation defines which settings belong to a service.
- Quote port mappings such as `"8080:80"` to avoid YAML interpretation surprises.
- The top-level `services` key contains the application's services.
- Compose creates a project network by default for services to communicate.

Validate and render the effective configuration:

```bash
docker compose config
```

Check the parsed service names:

```bash
docker compose config --services
```

List the images referenced by the configuration:

```bash
docker compose config --images
```

## 4. Start and Stop Applications

Start services in the foreground:

```bash
docker compose up
```

Start in the background:

```bash
docker compose up -d
```

Stop services without removing containers:

```bash
docker compose stop
```

Start previously stopped services:

```bash
docker compose start
```

Restart services:

```bash
docker compose restart
```

Stop and remove the project's containers and networks:

```bash
docker compose down
```

Stop and remove containers, networks, and project-declared named volumes:

```bash
docker compose down -v
```

**Warning:** `down -v` can permanently delete application data stored in those volumes. Use it only when you intend to remove that data.

## 5. Services and Container Management

List services and their status:

```bash
docker compose ps
```

List all containers, including stopped ones:

```bash
docker compose ps -a
```

Run a command in a running service container:

```bash
docker compose exec web sh
```

If Bash is installed:

```bash
docker compose exec web bash
```

Run a one-off command in a new container for a service:

```bash
docker compose run --rm web nginx -t
```

The `run` command creates a one-off container. It does not publish the service's configured ports by default; use `--service-ports` if you need those ports.

Restart a single service:

```bash
docker compose restart web
```

Stop one service:

```bash
docker compose stop web
```

Start one service:

```bash
docker compose start web
```

View the containers created by the current project:

```bash
docker compose ps --all
```

## 6. Images and Builds

### Use an existing image

```yaml
services:
  web:
    image: nginx:stable
```

Pull images defined in the Compose file:

```bash
docker compose pull
```

### Build from a Dockerfile

Project structure:

```text
my-project/
├── compose.yaml
├── Dockerfile
└── app/
```

Compose file:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    image: my-app:local
```

Build the images:

```bash
docker compose build
```

Build without using the build cache:

```bash
docker compose build --no-cache
```

Build and start services:

```bash
docker compose up -d --build
```

Force a service to be recreated after configuration changes:

```bash
docker compose up -d --force-recreate web
```

## 7. Ports and Networking

Publish a container port on the host:

```yaml
services:
  web:
    image: nginx:stable
    ports:
      - "8080:80"
```

The mapping means host port `8080` forwards to container port `80`.

Bind the published port only to the host's loopback interface:

```yaml
services:
  web:
    image: nginx:stable
    ports:
      - "127.0.0.1:8080:80"
```

This is useful when a service should only be reachable locally on the Docker host.

### Service-to-service communication

Services in the same Compose project can normally reach each other by service name. For example, an application service can connect to a database at hostname `db` and the database's container port.

```yaml
services:
  app:
    image: example/app:latest
    environment:
      DB_HOST: db
      DB_PORT: "5432"

  db:
    image: postgres:17
```

Inside the Compose network, use `db:5432`, not `localhost:5432`. Inside a container, `localhost` refers to that same container.

### Define a network explicitly

```yaml
services:
  web:
    image: nginx:stable
    networks:
      - frontend

networks:
  frontend:
    driver: bridge
```

Inspect project networks:

```bash
docker network ls
docker network inspect PROJECT_default
```

Actual project and network names may vary based on the Compose project name.

## 8. Environment Variables and Secrets

### Set an environment variable in the Compose file

```yaml
services:
  app:
    image: example/app:latest
    environment:
      APP_ENV: production
      LOG_LEVEL: info
```

### Use a `.env` file for Compose variable substitution

Example `.env` file beside `compose.yaml`:

```dotenv
APP_TAG=1.2.0
WEB_PORT=8080
```

Reference those variables in the Compose file:

```yaml
services:
  web:
    image: nginx:${APP_TAG}
    ports:
      - "${WEB_PORT}:80"
```

Start the project:

```bash
docker compose up -d
```

Compose reads `.env` for interpolation. That does not automatically mean every variable in `.env` is passed into every container; declare container environment variables explicitly with `environment` or `env_file`.

### Load an environment file into a container

```yaml
services:
  app:
    image: example/app:latest
    env_file:
      - app.env
```

### Avoid committing secrets

Add local secret/configuration files to `.gitignore`:

```gitignore
.env
app.env
secrets/
```

Use the application's supported secret-management approach for credentials. Compose secrets can mount secret files into services, but the application must read those files, and the security guarantees depend on the deployment environment.

Example:

```yaml
services:
  app:
    image: example/app:latest
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

Do not commit the secret file to source control.

## 9. Volumes and Persistent Data

Named volumes persist beyond container replacement.

```yaml
services:
  db:
    image: postgres:17
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

Create/start the project:

```bash
docker compose up -d
```

List volumes:

```bash
docker volume ls
```

Inspect a volume:

```bash
docker volume inspect PROJECT_db-data
```

A volume's actual name is affected by the project name and any explicit `name` setting.

### Bind mount a host directory

```yaml
services:
  web:
    image: nginx:stable
    volumes:
      - ./html:/usr/share/nginx/html:ro
```

This maps the local `html` directory into the container as read-only. The path is relative to the Compose file's project directory.

**Important:** removing a container normally does not remove named volumes, but `docker compose down -v` does remove project-declared named volumes. Back up important data before cleanup.

## 10. Health Checks and Startup Order

A health check can report whether a service is ready. The test command must exist inside the container.

Example for an image that includes `curl`:

```yaml
services:
  web:
    image: my-web-image:latest
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
```

Do not copy this health check to an image that does not contain curl or an appropriate health endpoint.

### Wait for a healthy dependency

```yaml
services:
  app:
    image: example/app:latest
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:17
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: change-this-example-password
      POSTGRES_DB: appdb
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \"$${POSTGRES_USER}\" -d \"$${POSTGRES_DB}\""]
      interval: 5s
      timeout: 3s
      retries: 10
```

The doubled dollar sign (`$$`) prevents Compose from interpolating the variables before the command runs in the container.

`depends_on` with `service_healthy` can wait for a declared health check, but applications should still handle database restarts and transient connection failures gracefully.

## 11. Logs and Troubleshooting

Show logs from all services:

```bash
docker compose logs
```

Follow logs:

```bash
docker compose logs -f
```

Show the last 100 lines:

```bash
docker compose logs --tail 100
```

Show logs for one service:

```bash
docker compose logs -f web
```

Show service status:

```bash
docker compose ps
```

Validate Compose configuration:

```bash
docker compose config
```

Show the effective configuration with environment interpolation:

```bash
docker compose config
```

Be careful when sharing this output: interpolated values may reveal credentials or other sensitive configuration.

Inspect the underlying container:

```bash
docker inspect "$(docker compose ps -q web)"
```

View Docker daemon logs:

```bash
sudo journalctl -u docker -b
```

Common debugging sequence:

```bash
docker compose config
docker compose ps -a
docker compose logs --tail 100
docker compose images
docker system df
```

If a container exits, inspect its logs and exit status. A service's main process must stay running for its container to remain running.

## 12. Profiles and Multiple Compose Files

### Use profiles for optional services

```yaml
services:
  web:
    image: nginx:stable

  debug:
    image: alpine:3
    command: ["sleep", "infinity"]
    profiles: ["debug"]
```

Start the default services:

```bash
docker compose up -d
```

Enable the optional profile:

```bash
docker compose --profile debug up -d
```

### Use an override file

A project may have `compose.yaml` and `compose.override.yaml`. Compose automatically merges the conventional override file when present.

Specify files explicitly:

```bash
docker compose -f compose.yaml -f compose.prod.yaml config
docker compose -f compose.yaml -f compose.prod.yaml up -d
```

Later files can override or extend settings from earlier files. Validate the merged configuration with `docker compose config`.

### Choose a project name

```bash
docker compose -p demo up -d
```

A project name helps keep resources for separate copies of an application distinct.

## 13. Resource Limits and Restart Policies

Set a restart policy:

```yaml
services:
  web:
    image: nginx:stable
    restart: unless-stopped
```

Common values include `no`, `on-failure`, `always`, and `unless-stopped`.

Resource options can vary by Compose implementation and deployment mode. For local Docker Engine containers, an example is:

```yaml
services:
  app:
    image: example/app:latest
    mem_limit: 512m
    cpus: 1.0
```

Confirm support with your installed Compose version and validate the effective configuration. Limits also depend on host kernel and cgroup support.

## 14. Updating and Rebuilding Services

Pull updated images:

```bash
docker compose pull
```

Recreate services with updated images:

```bash
docker compose up -d
```

Build and start local images:

```bash
docker compose up -d --build
```

Recreate one service:

```bash
docker compose up -d --force-recreate web
```

View images associated with the project:

```bash
docker compose images
```

`docker compose restart` restarts existing containers but does not by itself apply changed image contents or all Compose configuration changes. Use `docker compose up -d` after image or configuration changes when you want Compose to reconcile the project.

## 15. Cleanup

Stop services but keep containers:

```bash
docker compose stop
```

Remove project containers and networks:

```bash
docker compose down
```

Remove project containers, networks, and declared named volumes:

```bash
docker compose down -v
```

Remove unused Docker objects across the host:

```bash
docker system prune
```

Inspect disk usage:

```bash
docker system df
```

`docker system prune` affects Docker resources beyond just the current Compose project. Inspect the prompt before confirming. Avoid deleting volumes unless their data is no longer needed or backed up.

## 16. Example: Web App and Database

This example illustrates how an application service and a PostgreSQL service can be configured together. The application image and its database environment-variable names are illustrative; substitute an application image that actually supports them.

Create `compose.yaml`:

```yaml
services:
  app:
    image: example/app:latest
    ports:
      - "127.0.0.1:8080:3000"
    environment:
      DB_HOST: db
      DB_PORT: "5432"
      DB_NAME: appdb
      DB_USER: app
      DB_PASSWORD: ${DB_PASSWORD:?Set DB_PASSWORD in your environment}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:17
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${DB_PASSWORD:?Set DB_PASSWORD in your environment}
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \"$${POSTGRES_USER}\" -d \"$${POSTGRES_DB}\""]
      interval: 5s
      timeout: 3s
      retries: 10
    restart: unless-stopped

volumes:
  db-data:
```

Set the variable in your current shell without putting it directly into the YAML file:

```bash
read -rsp 'Database password: ' DB_PASSWORD
echo
export DB_PASSWORD
docker compose up -d
unset DB_PASSWORD
```

This example keeps PostgreSQL off the host's published ports. Services communicate over the private Compose network using hostname `db`.

Commands for the example:

```bash
docker compose ps
docker compose logs -f app
docker compose logs -f db
docker compose exec db psql -U app -d appdb
docker compose down
```

The final command keeps the named database volume. Do not use `docker compose down -v` unless you intend to delete the database data.

## 17. Common Commands at a Glance

| Task | Command |
|---|---|
| Start project | `docker compose up` |
| Start in background | `docker compose up -d` |
| Start and build | `docker compose up -d --build` |
| Stop services | `docker compose stop` |
| Start stopped services | `docker compose start` |
| Restart services | `docker compose restart` |
| Remove containers and networks | `docker compose down` |
| List project containers | `docker compose ps` |
| Show service logs | `docker compose logs` |
| Follow logs | `docker compose logs -f` |
| Open service shell | `docker compose exec SERVICE sh` |
| Run one-off command | `docker compose run --rm SERVICE COMMAND` |
| Pull images | `docker compose pull` |
| Build images | `docker compose build` |
| Validate configuration | `docker compose config` |
| List services | `docker compose config --services` |
| List project images | `docker compose images` |
| Remove named volumes too | `docker compose down -v` |

## 18. Security Notes

- Do not commit `.env` files, passwords, tokens, or private keys to version control.
- Avoid exposing database ports to the host unless you need external access.
- Bind development-only services to `127.0.0.1` when possible.
- Use maintained images and pin versions when reproducibility matters.
- Avoid privileged containers and unnecessary host bind mounts.
- Review `docker compose config` output before sharing it; secrets may be interpolated into the rendered configuration.
- Remember that Docker daemon access is highly privileged on the host.
- Back up persistent volumes before upgrades or destructive cleanup.

## 19. Help and Documentation

```bash
docker compose --help
docker compose up --help
docker compose config --help
docker compose version
```

Official documentation:

- Docker Compose overview: https://docs.docker.com/compose/
- Compose file reference: https://docs.docker.com/reference/compose-file/
- Compose CLI reference: https://docs.docker.com/reference/cli/docker/compose/
