# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a personal home automation monorepo run on a home network with Raspberry Pi devices. It has no shared build tooling — each subdirectory is an independent deployable unit with its own dependencies, and they only ever talk to each other over plain HTTP on the LAN.

- **`weather-hub/`** — Node/Express API + Postgres, the central hub all other services talk to.
- **`weather-dashboard/`** — React (Vite + TypeScript) frontend for viewing weather data.
- **`sensor/`** — Python script that runs on a Raspberry Pi with a BME280 sensor, polling temperature/humidity/pressure and posting readings to `weather-hub`.
- **`compose.yaml`** (repo root) — runs Postgres, `weather-hub`, and `weather-dashboard` together.

## Commands

### weather-hub (`weather-hub/`)
```
npm install
node app.js          # starts the API on $PORT (default 3001); no dev/watch script configured
```
No test suite or linter is configured (`npm test` is a placeholder). Requires a `.env` with `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` (and optionally `PORT`) — copy `weather-hub/.env.example` to `weather-hub/.env` and fill in real values; `.env` itself is gitignored.

Database schema is a hand-ordered SQL migration set in `weather-hub/sql/`, numbered `000_*.sql` upward — apply them in order. There is no migration framework; new schema changes should be added as the next numbered `.sql` file. Two ways to apply them:
- **Local/dev**, via `docker compose` — see below, migrations 001-007 run automatically on first boot of the `db` container (mounted into `/docker-entrypoint-initdb.d/`).
- **A remote/existing Postgres** (e.g. a deploy host) — `weather-hub/sql/initdb.sh` applies them via `psql`. It's parameterized via env vars: `DB_HOST` and `DB_PASSWORD` are required, `DB_USER` (default `postgres`), `DB_NAME` (default `weatherhub`), `DB_PORT` (default `5432`) are optional. E.g. `DB_HOST=192.168.1.x DB_PASSWORD=... sh weather-hub/sql/initdb.sh`.

`weather-hub` also has a `Dockerfile` — see the "Full stack via Docker" section below, which is the primary way to run it containerized.

### weather-dashboard (`weather-dashboard/`)
```
npm install
npm run dev            # dev server on :5173 (Vite default)
npm run build           # tsc -b && vite build
npm run test            # Vitest, single run (use `npm run test:watch` for watch mode)
```
Requires a `.env` with `VITE_API_SERVER`, `VITE_API_PORT` (weather-hub location) — copy `weather-dashboard/.env.example` to `weather-dashboard/.env` and fill in real values; `.env` itself is gitignored.

### sensor (Raspberry Pi only)
Not meant to run in a normal dev environment — it depends on Pi-specific hardware libraries (`smbus2`, `bme280`) and is deployed via `git clone` + `startup.sh` run from a `@reboot` crontab entry (see `sensor/setup.md` / `sensor/setup.sh`). Treat changes to this as cross-referenced with the physical hardware setup rather than something to run locally.

Hub address is configurable via `SENSOR_SERVER_IP`/`SENSOR_SERVER_PORT` (defaults: `home-hub`/`3001`) — copy `sensor/.env.example` to `sensor/.env` and edit if needed. Since it's launched from cron (`@reboot`), which doesn't source shell profiles, `startup.sh` sources `sensor/.env` itself before running `main.py` rather than relying on exported env vars.

### Full stack via Docker (repo root)
```
cp .env.example .env   # first time only; edit values as needed
docker compose up -d --build
```
Brings up three services together:
- `db` — Postgres, schema auto-applied from `weather-hub/sql/001`-`007` on first boot, data persisted in a named volume.
- `weather-hub` — built from `weather-hub/Dockerfile`, talks to `db` over the compose network.
- `weather-dashboard` — built from `weather-dashboard/Dockerfile` (Vite build → nginx).

Host ports and Postgres credentials come from `.env` at the repo root (see `.env.example`) rather than being hardcoded in the compose file. Container-internal ports/hostnames (`PORT: 3000`, `DATABASE_HOST: db`, `DATABASE_PORT: 5432`, the container side of every `ports:` mapping) are hardcoded directly in `compose.yaml` rather than templated — they're compose-network-internal and never need to vary per deployment, only the host-side ports and credentials do.

**Important Vite gotcha:** `weather-dashboard`'s `VITE_*` vars are baked into the static JS bundle at *build time* (`import.meta.env.VITE_*` references are statically replaced during the Vite build), not read at container runtime — they're passed as Docker build `args` in `compose.yaml`, not `environment:`. They also must be a hostname/port the **browser** can reach (LAN hostname, e.g. `home-hub`), not the compose service name `weather-hub`, since the browser is never inside the compose network. Whenever `WEATHER_DASHBOARD_API_SERVER` or `WEATHER_HUB_PORT` change, `weather-dashboard` must be rebuilt (`docker compose up -d --build weather-dashboard`) — restarting alone won't pick up the change.

## Architecture

**Data flow:** `sensor` (Pi) → HTTP POST → `weather-hub` (Express API) → Postgres → `weather-dashboard` (React) reads back over HTTP.

**Device lifecycle (`weather-hub`):** Devices move through a status state machine stored in `device.status`: `REGISTERED → CALIBRATING → READY → ACTIVE → OFFLINE/DISABLED/RETIRED`, defined in `weather-hub/routes/deviceRoutes.js`. The sensor script drives this itself: on boot it POSTs to `/devices/register`, calls `/devices/status/calibrating/:uid`, takes 5 calibration readings, then POSTs `/devices/status/ready/:uid`. A cron job in `weather-hub/cronService.js` runs every minute and (`deviceStatusService.js`) promotes `READY` devices to `ACTIVE`, and demotes `ACTIVE` devices to `OFFLINE` if `last_active_at` is more than a minute old. Only devices with status `ACTIVE` are accepted by `/measurement/record` — everything else is silently rejected with `{"error": "Device is not active"}`.

**Readings model:** temperature/humidity/pressure are three separate tables (`weather-hub/sql/002-004`), each FK'd to `device` by `device_uid` (a UUID the Pi derives deterministically from its own CPU serial via `sensor/main.py`'s `generateDeviceUid`, so the same physical device always reregisters with the same UID). `readingsRoutes.js` exposes both raw and interval-bucketed (`/interval`) endpoints per measurement type — the bucket width (minute/hour/day/month) is chosen automatically in `caluculateGraphUnits` based on the requested `from`/`to` span, and the interval queries generate a `date_trunc`'d series so gaps show up as zero/`NULL` rather than being skipped.

**Frontend routing (`weather-dashboard/src/App.tsx`):** `/` summary, `/all-device-data`, `/device/:deviceUid` detail, `/locations` (location CRUD, used to group devices). API calls live in `src/api/*.ts`, all built from the `VITE_API_SERVER`/`VITE_API_PORT` env vars via `src/config.ts` — there's no shared HTTP client, each file constructs its own `fetch` calls against `weather-hub`.

**Env-driven service discovery:** there's no service registry — every cross-service address (hub location, Postgres host) is wired through `.env` files per subdirectory, and the sensor script hardcodes the hub hostname (`serverIp = "home-hub"`) as a fallback default.
