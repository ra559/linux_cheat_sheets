---
layout: sheet
title: "curl and wget Cheat Sheet for Debian 13"
category: "Networking"
summary: "Download files, test URLs, inspect HTTP responses, and make requests from the terminal."
date: 2026-10-24 18:26:50
permalink: /html/curl_wget.html
---
# curl and wget Cheat Sheet for Debian 13

A practical reference for downloading files, testing URLs, inspecting HTTP responses, and making HTTP requests from the terminal.

## Table of Contents

- [13. Troubleshoot Redirects and Click-Tracking URLs](#13-troubleshoot-redirects-and-click-tracking-urls)
- [1. Installation](#1-installation)
- [2. curl vs. wget](#2-curl-vs-wget)
- [3. Basic curl Commands](#3-basic-curl-commands)
- [4. Downloading Files with curl](#4-downloading-files-with-curl)
- [5. HTTP Headers and Status Codes](#5-http-headers-and-status-codes)
- [6. Sending Data with curl](#6-sending-data-with-curl)
- [7. Authentication and Certificates](#7-authentication-and-certificates)
- [8. Basic wget Commands](#8-basic-wget-commands)
- [9. Resuming and Limiting Downloads](#9-resuming-and-limiting-downloads)
- [10. Useful Options at a Glance](#10-useful-options-at-a-glance)
- [11. Practical Examples](#11-practical-examples)
- [12. Help and Documentation](#12-help-and-documentation)

---

## 1. Installation

On Debian 13, install both tools with APT:

```bash
sudo apt update
sudo apt install curl wget
```

Check that they are installed:

```bash
curl --version
wget --version
```

Find which Debian package provides each command:

```bash
dpkg -S "$(command -v curl)"
dpkg -S "$(command -v wget)"
```

## 2. curl vs. wget

- **`curl`** is designed to transfer data to or from URLs. It supports many protocols and is especially useful for inspecting HTTP responses and sending API requests.
- **`wget`** is especially convenient for downloading files. It supports retries, recursive downloads, and resuming interrupted downloads.

Both tools can download files over HTTP and HTTPS.

## 3. Basic curl Commands

Display the content returned by a URL:

```bash
curl https://example.com
```

Follow redirects:

```bash
curl -L https://example.com
```

Show request and response details:

```bash
curl -v https://example.com
```

Show only the response headers:

```bash
curl -I https://example.com
```

Print the HTTP status code:

```bash
curl -sS -o /dev/null -w '%{http_code}\n' https://example.com
```

Set a connection timeout of 10 seconds:

```bash
curl --connect-timeout 10 https://example.com
```

Use `-sS` to hide the progress meter while still displaying errors:

```bash
curl -sS https://example.com
```

## 4. Downloading Files with curl

Save the response to a specific filename:

```bash
curl -o page.html https://example.com
```

Use the filename suggested by the URL:

```bash
curl -O https://example.com/file.zip
```

Follow redirects while saving a file:

```bash
curl -L -o file.zip https://example.com/download
```

Resume an interrupted download:

```bash
curl -C - -O https://example.com/file.zip
```

**Note:** `-o` specifies a local filename. `-O` uses the filename from the URL.

## 5. HTTP Headers and Status Codes

Display response headers without downloading the body to the terminal:

```bash
curl -I https://example.com
```

Send a custom request header:

```bash
curl -H 'Accept: application/json' https://example.com
```

### Mimic browser-like HTTP requests and maintain a session

Some websites reject simple `curl` requests because they expect browser-like request headers or a session established by an earlier request. You can add headers, follow redirects, store cookies, and send those cookies on later requests.

#### Send browser-like headers

```bash
curl -L \
  -A 'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0' \
  -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8' \
  -H 'Accept-Language: en-US,en;q=0.5' \
  -H 'Upgrade-Insecure-Requests: 1' \
  https://example.com
```

A more Chromium-like example:

```bash
curl -L \
  -A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' \
  -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8' \
  -H 'Accept-Language: en-US,en;q=0.9' \
  -H 'Sec-Fetch-Dest: document' \
  -H 'Sec-Fetch-Mode: navigate' \
  -H 'Sec-Fetch-Site: none' \
  -H 'Sec-Fetch-User: ?1' \
  -H 'Upgrade-Insecure-Requests: 1' \
  https://example.com
```

These headers can help with basic servers that check request headers, but they do not guarantee acceptance. Some `Sec-Fetch-*` values should reflect the actual request context; do not blindly reuse them for every request.

#### Save cookies and reuse them on a follow-up request

Make an initial request, follow redirects, and save cookies the server sets:

```bash
curl -L \
  -c cookies.txt \
  -A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36' \
  https://example.com/
```

Then make a second request using those cookies:

```bash
curl -L \
  -b cookies.txt \
  -c cookies.txt \
  -e 'https://example.com/' \
  -A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36' \
  https://example.com/account
```

- `-c cookies.txt` writes cookies received from the server to a file.
- `-b cookies.txt` sends saved cookies with the next request.
- `-e` sets the `Referer` header.
- Using both `-b` and `-c` lets curl send existing cookies and update the cookie file.

Treat cookie files as sensitive: they can contain session credentials. Do not commit them to Git or share them publicly.

#### Keep cookies for multiple requests in one shell session

Use a cookie jar for each command:

```bash
curl -sS -L -c cookies.txt -b cookies.txt https://example.com/
curl -sS -L -c cookies.txt -b cookies.txt https://example.com/next-page
```

The second request can use cookies set by the first request. Add the same required headers to both commands if the server expects them.

#### Submit a form with a session cookie

For a simple form endpoint that accepts URL-encoded data:

```bash
curl -L \
  -b cookies.txt -c cookies.txt \
  -e 'https://example.com/form' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'name=Alex&role=student' \
  https://example.com/submit
```

Real websites may require a CSRF token or hidden form value. You must obtain the correct token from the preceding page and send it with the form submission. Do not assume every site uses the same field name or token mechanism.

#### Follow redirects and inspect what happened

```bash
curl -v -L -c cookies.txt -b cookies.txt https://example.com/
```

`-L` follows redirects, while `-v` shows request and response details. Review verbose logs before sharing them because they may reveal sensitive headers or session information.

**Important:** Matching headers and retaining cookies can help with basic browser checks and multi-step HTTP sessions. It will not reproduce browser TLS fingerprints, JavaScript-generated tokens, or other browser-specific behavior. Use these techniques on sites and accounts you are authorized to access.

Display the response headers and body:

```bash
curl -i https://example.com
```

Common HTTP status codes:

| Code | Meaning |
|---|---|
| `200` | OK; request succeeded |
| `301` / `302` | Redirect |
| `400` | Bad request |
| `401` | Authentication required or failed |
| `403` | Forbidden |
| `404` | Not found |
| `500` | Server error |

A server can respond differently depending on the URL, request headers, authentication, and other conditions.

## 6. Sending Data with curl

### Send a GET request

GET is the default HTTP method:

```bash
curl https://example.com
```

### Send form data with POST

```bash
curl -X POST -d 'name=Alex&role=student' https://example.com/submit
```

`-d` sends data and normally makes curl use POST. The example endpoint is illustrative; it will only work if the server accepts that request.

### Send JSON data

```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alex","role":"student"}' \
  https://example.com/api
```

### Read JSON data from a local file

```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  --data-binary @data.json \
  https://example.com/api
```

### Choose a request method explicitly

```bash
curl -X DELETE https://example.com/api/items/123
```

Only use methods such as POST, PUT, PATCH, or DELETE when the target service supports them and you are authorized to make the change.

## 7. Authentication and Certificates

Send basic authentication credentials:

```bash
curl -u username https://example.com/private
```

curl prompts for the password when it is not included in the command. Avoid placing passwords directly in shell history.

Use a client certificate when a service requires one:

```bash
curl --cert client.crt --key client.key https://example.com
```

**Do not disable certificate verification for routine use.** The `-k` / `--insecure` option skips TLS certificate checks and can expose you to interception. Use it only for a controlled test when you understand the risk.

## 8. Basic wget Commands

Download a file using the remote filename:

```bash
wget https://example.com/file.zip
```

Choose a local filename:

```bash
wget -O downloaded-file.zip https://example.com/file.zip
```

Save the download in a specific directory:

```bash
wget -P ~/Downloads https://example.com/file.zip
```

Download quietly:

```bash
wget -q https://example.com/file.zip
```

Show response details:

```bash
wget -S https://example.com
```

Check a URL without saving the response body:

```bash
wget --spider https://example.com
```

Follow links recursively (use carefully):

```bash
wget --recursive --level=1 https://example.com/
```

Recursive downloading can retrieve many files. Only use it where permitted, and be mindful of site terms, robots rules, and server load.

## 9. Resuming and Limiting Downloads

Resume an interrupted wget download:

```bash
wget -c https://example.com/file.zip
```

Retry failed downloads up to five times:

```bash
wget --tries=5 https://example.com/file.zip
```

Set a timeout for wget network operations:

```bash
wget --timeout=15 https://example.com/file.zip
```

Limit wget's download rate to 500 KiB/s:

```bash
wget --limit-rate=500k https://example.com/file.zip
```

Limit curl's transfer rate to 500 KiB/s:

```bash
curl --limit-rate 500K -O https://example.com/file.zip
```

## 10. Useful Options at a Glance

### curl

| Option | Purpose |
|---|---|
| `-L` | Follow redirects |
| `-I` | Fetch headers only |
| `-i` | Include response headers in output |
| `-v` | Verbose connection and protocol details |
| `-o FILE` | Save output to a named file |
| `-O` | Save using the URL's filename |
| `-H 'Header: value'` | Add a request header |
| `-d DATA` | Send request data |
| `-u USER` | Use basic authentication |
| `-C -` | Resume a download |
| `-sS` | Quiet output, but show errors |
| `--connect-timeout SECONDS` | Limit connection-establishment time |
| `-w FORMAT` | Print selected transfer information |

### wget

| Option | Purpose |
|---|---|
| `-O FILE` | Save to a specified filename |
| `-P DIR` | Save to a specified directory |
| `-c` | Continue a partial download |
| `-q` | Quiet output |
| `-S` | Print server response headers |
| `--spider` | Check a URL without downloading its body to a file |
| `--tries=N` | Set the number of attempts |
| `--timeout=SECONDS` | Set network timeout |
| `--limit-rate=RATE` | Limit download speed |
| `--recursive` | Download linked content recursively |

## 11. Practical Examples

### Test whether a website responds

```bash
curl -sS -o /dev/null -w 'HTTP status: %{http_code}\n' https://example.com
```

### Download a script for inspection

```bash
curl -L -o script.sh https://example.com/script.sh
less script.sh
```

Inspect downloaded scripts before running them, especially when they come from unfamiliar sources.

### Download a file and save it to Downloads

```bash
wget -P ~/Downloads https://example.com/file.zip
```

### Check DNS, TLS, and connection details

```bash
curl -v https://example.com
```

The verbose output can help identify where a connection fails, but it may include request details. Review it before sharing logs publicly.

### Use curl to query a JSON API

```bash
curl -sS https://jsonplaceholder.typicode.com/todos/1
```

If `jq` is installed, format JSON output:

```bash
curl -sS https://jsonplaceholder.typicode.com/todos/1 | jq
```

Install `jq` on Debian if needed:

```bash
sudo apt install jq
```

## 12. Help and Documentation

Show curl help:

```bash
curl --help
curl --manual
```

Show wget help:

```bash
wget --help
man wget
```

On Debian, the manual pages are usually available through the `man` command after installing the relevant packages.

## 13. Troubleshoot Redirects and Click-Tracking URLs

Use these commands to inspect redirects in marketing email links and determine the HTTP status, redirect destination, and final URL.

### Quick check: show the HTTP status and final URL

```bash
curl -sS -L -o /dev/null \
  -w 'HTTP status: %{http_code}\nFinal URL: %{url_effective}\nRedirects followed: %{num_redirects}\n' \
  'https://example.com/tracking-link'
```

This follows redirects and prints the final HTTP status, the URL reached at the end, and the number of redirects followed.

### Show each redirect response and its Location header

```bash
curl -sS -L -D - -o /dev/null \
  -w '\nFinal HTTP status: %{http_code}\nFinal URL: %{url_effective}\nRedirects followed: %{num_redirects}\n' \
  'https://example.com/tracking-link'
```

- `-L` follows redirects.
- `-D -` prints response headers for each response to standard output.
- `-o /dev/null` discards response bodies.
- `-w` prints a summary after the transfer.
- Look for each `HTTP/...` status line and its `Location:` header. A `Location` header usually identifies the next URL in an HTTP redirect.

This is a handy one-command diagnostic. It shows the response headers for the chain and then the final URL.

### Compact redirect-chain report

If you want to print only each response's status and `Location` header, save headers to a temporary file and filter them:

```bash
headers=$(mktemp)
curl -sS -L -D "$headers" -o /dev/null \
  -w '\nFinal HTTP status: %{http_code}\nFinal URL: %{url_effective}\nRedirects followed: %{num_redirects}\n' \
  'https://example.com/tracking-link'
grep -iE '^(HTTP/|Location:)' "$headers"
rm -f "$headers"
```

This prints the final summary and then the redirect status/`Location` lines. To display the chain in order with each response's status immediately followed by its `Location`, use:

```bash
curl -sS -L -D - -o /dev/null \
  'https://example.com/tracking-link' 2>/dev/null |
  awk 'BEGIN { IGNORECASE=1 }
       /^HTTP\// { print; next }
       /^Location:/ { print; next }'
```

### Understand common redirect status codes

| Status | Meaning | Typical use |
|---|---|---|
| `301` | Moved Permanently | A URL has a permanent new location |
| `302` | Found | Common temporary redirect |
| `303` | See Other | Redirects to another resource, often after a form submission |
| `307` | Temporary Redirect | Temporary redirect that preserves the request method |
| `308` | Permanent Redirect | Permanent redirect that preserves the request method |
| `200` | OK | The requested resource was returned successfully; this may be the final landing page |
| `4xx` | Client error | The request was rejected or the resource was unavailable |
| `5xx` | Server error | The server or an upstream service encountered an error |

### Troubleshoot a redirect without following it

To inspect only the first response, including its status and `Location` header:

```bash
curl -sS -D - -o /dev/null \
  -w '\nHTTP status: %{http_code}\n' \
  'https://example.com/tracking-link'
```

This does **not** use `-L`, so curl does not follow the redirect. It is useful when you need to inspect the first tracking server's response.

### Important notes for email click tracking

- Test the exact tracking URL copied from the email, including its query parameters.
- Tracking links may expire, require cookies, or behave differently depending on the `User-Agent`, IP address, or security-scanning systems.
- A redirect may be generated by an HTTP `Location` header, while some pages redirect using JavaScript or HTML meta refresh. `curl -L` follows HTTP redirects, but does not execute JavaScript or meta refresh.
- Avoid sharing complete tracking URLs publicly: query parameters can contain recipient identifiers or other sensitive tracking data.

---

