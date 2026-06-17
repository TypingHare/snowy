# Remote Controller for Outpost

The remote controller is a small HTTP service that lets me start, stop, and check the status of the Outpost Minecraft server without opening a shell on Snowy. It runs on Snowy itself and is a thin wrapper around the `start-minecraft.sh` and `stop-minecraft.sh` scripts in the parent directory: `start` and `stop` shell out to those scripts, while `status` reaches the Minecraft droplet over SSH to see whether the server's `tmux` session is alive.

Every request is authenticated with a shared secret. The service loads the secret from `credential/token` and compares it, in constant time, against the `token` header on each request.

## Setup

First, install dependencies and generate a token:

```bash
bun install
bun run generate-token   # writes a random secret to credential/token
```

Then create a `.env` file (see `.env.example`):

| Variable | Used by | Description |
| --- | --- | --- |
| `PORT` | service | TCP port the service listens on. |
| `PREFIX` | service | URL path prefix the routes are mounted under (e.g. `/minecraft`). |
| `OUTPOST_DIR` | service | Absolute path to the `outpost` directory (where the start/stop scripts live). |
| `SSH_PRIVATE_KEY_FILE` | service | SSH key used to reach the Minecraft droplet for status checks. |
| `SERVER_STATUS_FILE_PATH` | service | Optional. Path to an HTML file rewritten on every successful start/stop (see [Status file](#status-file)). When unset, the file is not written. |
| `DOMAIN` | `show-command.ts` | Host the service is reachable at, used only to print example commands. |

## Running

```bash
bun run start
```

## Endpoints

All endpoints require a valid `token` header. The path is prefixed with `PREFIX`; the examples below assume `PREFIX=/minecraft`.

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/minecraft/start?game=<name>` | Runs `start-minecraft.sh <name>` to provision the droplet and start the server. |
| `POST` | `/minecraft/stop` | Runs `stop-minecraft.sh` to stop the server, download the world, and delete the droplet. |
| `GET` | `/minecraft/status` | Reports whether the server is running. |

`start` and `stop` return the underlying script's `exitCode`, `stdout`, and `stderr` as JSON, with a `200` status on success and `500` on failure.

`status` always returns `200` with a JSON body describing the server:

```json
{ "droplet": true, "reachable": true, "running": true, "ip": "203.0.113.10" }
```

- `droplet` — whether a droplet IP is recorded (i.e. a server has been started and not yet stopped).
- `reachable` — whether the droplet answered the SSH probe (`false` usually means a stale IP after the droplet was deleted).
- `running` — whether the server's `tmux` session is alive.
- `ip` — the droplet's public IPv4, present only when a droplet is recorded.

## Status file

If `SERVER_STATUS_FILE_PATH` is set, the service rewrites that file on every successful start and stop, so a static page can show players whether the server is up and where to connect. It is plain HTML, intended to be served or embedded elsewhere:

- After a successful `start`, it contains the hosted game name and the droplet's public IPv4 address.
- After a successful `stop`, it contains a notice that the server is down.

The file is only touched when the corresponding action succeeds; a failed start or stop leaves the previous contents in place. Unlike `GET /status`, this is a cached snapshot rather than a live probe.

## `show-command.ts`

Typing out a `curl` command with the right method, URL, and token by hand is tedious, so `show-command.ts` prints a ready-to-run one for a given action:

```bash
bun show-command.ts status
```

It picks the HTTP method to match the route table (`status` is a `GET`; `start` and `stop` are `POST`s) and uses `https` for any non-`localhost` `DOMAIN`. For `start`, append the `?game=<name>` query parameter to the printed URL before running it.
