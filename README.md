# Cheat Sheets

A static site. Eighteen cheat sheets are written as Markdown in `docs/markdown/`
and rendered by Jekyll to `/html/<name>.html`; the homepage lists every sheet
and highlights the four most recently added.

There is no application server and no Node.js anywhere in the toolchain.
`jekyll build` produces `_site/`, a plain directory of HTML, CSS, JS and one JSON
file, which any static web server can serve. The deployments below use nginx on
Debian and nginx inside a container for Docker.

## Contents

- [Project layout](#project-layout)
- [Build locally](#build-locally)
- [Deploy to a Debian 13 physical machine](#deploy-to-a-debian-13-physical-machine)
- [Deploy to a Debian 13 Proxmox container](#deploy-to-a-debian-13-proxmox-container)
- [Deploy with Docker](#deploy-with-docker)
- [Updating a deployment](#updating-a-deployment)
- [Troubleshooting](#troubleshooting)

## Project layout

| Path | Purpose |
| --- | --- |
| `docs/markdown/*.md` | Source of every cheat sheet (front matter + Markdown) |
| `_layouts/sheet.html` | Page template for a cheat sheet |
| `_layouts/home.html` | Homepage shell with the generated sidebar |
| `index.html` | Homepage content: hero and latest-four cards |
| `_plugins/sheet_toc.rb` | Heading-id and table-of-contents filters |
| `_config.yml` | Jekyll configuration and build exclusions |
| `cheatsheets.json` | Generated index consumed by `js/home.js` |
| `css/`, `js/`, `assets/` | Stylesheets, client scripts, images |
| `_site/` | Build output (generated, not committed) |

## Build locally

```bash
jekyll build      # writes _site/
jekyll serve      # http://127.0.0.1:4000, rebuilds on change
```

There is no `Gemfile`, so call `jekyll` directly. Running `bundle exec jekyll`
will fail with "Could not locate Gemfile" — drop the `bundle exec` prefix.

## Deploy to a Debian 13 physical machine

Starting point: a fresh Debian 13 installation, a root or `sudo` account, and
network access. Every step below runs on that machine.

### 1. Update the system and install the base tools

```bash
sudo apt update
sudo apt full-upgrade -y
sudo apt install -y ruby ruby-dev build-essential git nginx
```

Debian 13 ships Ruby 3.3, which Jekyll 4.4.1 supports. No other Ruby packages are needed.

### 2. Install Jekyll

```bash
sudo gem install jekyll -v 4.4.1 --no-document
```

Pin the version — it is the one this site was built and verified with. Confirm
the executable is on the path used by systemd:

```bash
command -v jekyll        # expected: /usr/local/bin/jekyll
jekyll --version         # expected: jekyll 4.4.1
```

If `command -v jekyll` prints something else, use that absolute path in the unit
file in step 6.

### 3. Create a service account and install the site

```bash
sudo useradd --system --create-home --home-dir /var/lib/cheatsheets \
     --shell /usr/sbin/nologin cheatsheets
sudo install -d -o cheatsheets -g cheatsheets /srv/cheatsheets
sudo -u cheatsheets git clone <REPO_URL> /srv/cheatsheets
```

No Git remote yet? Copy the working tree instead:

```bash
rsync -a --exclude _site --exclude .git ./ user@server:/tmp/cheatsheets/
sudo install -d -o cheatsheets -g cheatsheets /srv/cheatsheets
sudo rsync -a --chown=cheatsheets:cheatsheets --exclude _site \
     /tmp/cheatsheets/ /srv/cheatsheets/
```

### 4. Build once by hand

```bash
sudo -u cheatsheets /usr/local/bin/jekyll build \
     --source /srv/cheatsheets --destination /srv/cheatsheets/_site
```

You should get `done in … seconds` and a `_site/` directory containing
`index.html`, `cheatsheets.json` and `html/` with 18 pages.

### 5. Configure nginx

Create `/etc/nginx/sites-available/cheatsheets`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name _;

    root /srv/cheatsheets/_site;
    index index.html;
    charset utf-8;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

Enable it and remove the default site:

```bash
sudo ln -s /etc/nginx/sites-available/cheatsheets /etc/nginx/sites-enabled/cheatsheets
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
```

Do not `reload` yet — the unit below orders nginx after the first build.

### 6. Create the systemd service

This is the unit that rebuilds the site at every boot, so the served files always
match the sources in `/srv/cheatsheets`. nginx only ever serves static output.

Create `/etc/systemd/system/cheatsheets-build.service`:

```ini
[Unit]
Description=Build the cheat-sheet site into /srv/cheatsheets/_site

[Service]
Type=oneshot
RemainAfterExit=yes
User=cheatsheets
Group=cheatsheets
WorkingDirectory=/srv/cheatsheets
Environment=JEKYLL_ENV=production
ExecStart=/usr/local/bin/jekyll build --trace
TimeoutStartSec=300
PrivateTmp=yes
NoNewPrivileges=yes

[Install]
WantedBy=multi-user.target
```

Now make nginx wait for that build at boot, so it never serves an empty
directory. Create the drop-in `/etc/systemd/system/nginx.service.d/cheatsheets.conf`:

```ini
[Unit]
After=cheatsheets-build.service
Wants=cheatsheets-build.service
```

Load and enable everything:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now cheatsheets-build.service
sudo systemctl enable --now nginx
sudo systemctl restart nginx
```

`enable` is what makes both units start on reboot; `--now` starts them once
immediately. The final `restart` is needed because installing nginx already
started it with the default site — without it, the new configuration is never
loaded.

### 7. Verify

```bash
systemctl status cheatsheets-build.service --no-pager
journalctl -u cheatsheets-build.service -n 20 --no-pager
curl -s http://localhost/ | grep -c 'class="sheet-link"'    # expected: 18
```

Open `http://<server-address>/` in a browser: the sidebar should list all 18
sheets and the homepage should show four cards.

### 8. Prove the autostart works

```bash
sudo reboot
```

After it comes back, without logging in:

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://<server-address>/
```

`200` means the container/machine booted, systemd ran the build, and nginx is
serving it. `systemctl is-enabled cheatsheets-build nginx` should report both as
`enabled`.

### 9. Firewall

Debian 13 ships no firewall enabled by default. If you added one:

```bash
sudo ufw allow 'Nginx Full'
```

## Deploy to a Debian 13 Proxmox container

### 1. Create the container

Run this on the Proxmox host, as root. Storage names (`local-lvm`, `vmbr0`)
differ between installations — adjust them.

```bash
pveam update
pveam available --section system | grep debian-13
```

Take the exact template name from that output, then:

```bash
pct create 200 local:vztmpl/debian-13-standard_13.3-1_amd64.tar.zst \
  --hostname cheatsheets \
  --cores 1 \
  --memory 1024 \
  --swap 512 \
  --rootfs local-lvm:4 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --unprivileged 1 \
  --onboot 1
pct start 200
pct exec 200 -- bash
```

`--onboot 1` is what makes the container itself start when the Proxmox host
boots. 1024 MB of RAM is comfortable for the Ruby build; 512 MB works with swap.

Through the GUI: **Create CT** → template *Debian 13* → unprivileged → tick
**Start at boot** → 1 core, 1 GB RAM, 4 GB disk, DHCP on `vmbr0`.

### 2. Configure the container

You are already root inside the container, so run the physical-machine steps
**1 through 8** above, with two changes:

- Drop every `sudo` prefix.
- In step 3, clone from inside the container using a repository URL it can
  reach.

Nothing else differs: same nginx config, same systemd unit, same
`systemctl enable` calls. systemd runs normally inside an LXC container.

### 3. Reach it

```bash
pct exec 200 -- hostname -I     # the container's address
```

Browse to `http://<container-ip>/`. To publish it on the host's address instead,
add a port forward or a reverse proxy on the Proxmox host; that is outside this
project.

If the Proxmox firewall is enabled for the container, allow TCP/80.

## Deploy with Docker

The image is built in two stages: Ruby builds the site, then the output is
copied into an nginx image. Ruby never ships in the final image.

### 1. Install Docker

```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable --now docker
```

Optional, to run `docker` without `sudo` (log out and back in afterwards):

```bash
sudo usermod -aG docker "$USER"
```

### 2. Build the image

The commands below assume the repository is at `/srv/cheatsheets`; adjust if it
lives elsewhere. `Dockerfile` and `.dockerignore` are already in the repo.

```bash
sudo docker build -t cheatsheets:1 .
```

### 3. Run it

```bash
sudo docker run -d \
  --name cheatsheets \
  --restart unless-stopped \
  -p 8080:80 \
  cheatsheets:1
```

Browse to `http://<host-address>:8080/`.

### 4. Autostart on reboot

Inside Docker you do not need a custom unit. Two things already handle it:

- `systemctl enable --now docker` makes the Docker daemon start at boot.
- `--restart unless-stopped` makes Docker bring the container back whenever the
  daemon starts.

That is the container equivalent of `systemctl enable`. Verify after a reboot:

```bash
sudo reboot
# later
sudo docker ps --filter name=cheatsheets
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8080/
```

### 5. Optional: manage it with Compose

Create `compose.yaml` next to the `Dockerfile`:

```yaml
services:
  cheatsheets:
    build: .
    image: cheatsheets:1
    ports:
      - "8080:80"
    restart: unless-stopped
```

```bash
sudo docker compose up -d --build
sudo docker compose logs -f
```

Check which form your installation provides, and substitute throughout if it is
the older standalone binary:

```bash
docker compose version || docker-compose version
```

If you would rather have systemd own the lifecycle than rely on the restart
policy, use `/etc/systemd/system/cheatsheets.service` instead:

```ini
[Unit]
Description=Cheat-sheet site (Docker Compose)
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/srv/cheatsheets
ExecStart=/usr/bin/docker compose up -d --remove-orphans
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now cheatsheets.service
```

Pick one mechanism, not both: with the unit in place, drop
`restart: unless-stopped` so the two do not fight.

## Updating a deployment

**Debian or Proxmox (systemd).** Pull the changes and rebuild; nginx picks up the
new files immediately because it serves from disk.

```bash
cd /srv/cheatsheets
sudo -u cheatsheets git pull
sudo systemctl restart cheatsheets-build.service
```

If you would rather have edits appear without a restart, change the unit to
`Type=simple` and `ExecStart=/usr/local/bin/jekyll build --watch`. The build then
runs continuously and regenerates on every save.

**Docker.** The image contains the built files, so a restart is not enough — the
image has to be rebuilt.

```bash
sudo docker compose up -d --build     # compose
# or
sudo docker build -t cheatsheets:1 . && sudo docker rm -f cheatsheets && \
  sudo docker run -d --name cheatsheets --restart unless-stopped -p 8080:80 cheatsheets:1
```

## Troubleshooting

**`jekyll: command not found`.** The gem binstub is not on `PATH`. Check with
`gem environment | grep -A2 'EXECUTABLE DIRECTORY'`, then either add that
directory to `PATH` or use the absolute path in the unit's `ExecStart`.

**`Could not locate Gemfile`.** You ran `bundle exec jekyll …`. There is no
Gemfile; run `jekyll …` directly.

**Build fails while installing gems** (`sass-embedded`, native extensions). On
unusual architectures the prebuilt binary may be missing. `build-essential` and
`ruby-dev` fix the common cases; on anything other than amd64/arm64, use the
Docker image, which builds on the image's own Ruby.

**nginx returns 403.** Permissions. The web server user needs to traverse the
path and read the files:

```bash
sudo -u www-data head -n 5 /srv/cheatsheets/_site/index.html
```

A failure here means the build ran as the wrong user or the directory was created
without world-read permissions.

**nginx returns 404.** Confirm `root` matches the build destination and that
`/srv/cheatsheets/_site/index.html` exists; then `sudo nginx -t` and
`sudo systemctl reload nginx`.

**The unit fails at boot.** `journalctl -u cheatsheets-build.service -n 50
--no-pager` shows the Jekyll error. A build that succeeds when run by hand but
fails under systemd usually means a different `PATH` or a `HOME` the service user
cannot write to.

**Site is stale after `git pull`.** The site is built, not served from Markdown.
Restart `cheatsheets-build.service` (Debian/Proxmox) or rebuild the image
(Docker).

**Port 80 already in use.** `sudo ss -ltnp | grep ':80'`. On a Proxmox host that
is often the host's own nginx or the PVE proxy; bind the site inside the
container instead, or change `listen`.
