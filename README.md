# Cinema (Nuxt 3 + TypeScript)

[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![GitHub](https://img.shields.io/badge/github-repo-green.svg?style=flat)](https://github.com/alekstar79/cinema)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square)](https://www.typescriptlang.org)
[![Coverage](https://img.shields.io/badge/coverage-97.08%25-brightgreen.svg)](https://github.com/alekstar79/video-player)
[![Nuxt 4](https://img.shields.io/badge/Nuxt-4.x-00C58E?style=flat&logo=nuxt.js&logoColor=white)](https://nuxt.com)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vite.dev)

Cinema is a Nuxt 3 web application for browsing a catalog of **movies**, **series**, and **shows**. The app consumes an upstream CMS API and exposes a small internal API (`/api/main`, `/api/content/:type/:id`) that:

- fetches showcase content and related dictionaries
- resolves OID references (e.g. `genre:123`, `person:456`) into full objects
- returns a payload that is friendly for SSR/SSG hydration

The project is designed to work in **SSR**, **SSG**, and **SPA** modes, with a special focus on **static generation for GitHub Pages**.

---

<!-- TOC -->
* [Cinema (Nuxt 3 + TypeScript)](#cinema-nuxt-3--typescript)
  * [Tech stack](#tech-stack)
  * [Features](#features)
  * [Project structure (high level)](#project-structure-high-level)
  * [Configuration notes](#configuration-notes)
    * [Base URL for GitHub Pages](#base-url-for-github-pages)
    * [Favicon](#favicon)
  * [Data model: OID references](#data-model-oid-references)
  * [Data flow (SSR/SSG-friendly)](#data-flow-ssrssg-friendly)
    * [1) Server endpoints](#1-server-endpoints)
    * [2) Pinia stores](#2-pinia-stores)
    * [3) Pages](#3-pages)
  * [Runtime modes](#runtime-modes)
    * [Development](#development)
    * [SSR build & preview](#ssr-build--preview)
    * [Static generation (SSG)](#static-generation-ssg)
  * [Static hosting constraints](#static-hosting-constraints)
  * [Testing](#testing)
  * [Development guidelines](#development-guidelines)
  * [License](#license)
<!-- TOC -->

---

## Tech stack

- **Nuxt 3** (Vue 3, Nitro, Vite)
- **TypeScript** (strict mode)
- **Pinia** (state management)
- **Vuetify 3** (UI)
- **Vitest** + **@vue/test-utils** (unit tests)

---

## Features

- **Home showcase** with content slides
- **List pages**: Movies / Series / Shows
  - client-side filtering by genre and year
  - sorting (title / year)
  - pagination
- **Content details**: poster, synopsis, genres, labels, participants
- **OID resolver** that replaces OID strings with dictionary entities
- **Responsive layout** via Vuetify grid
- **Static generation (SSG)** output suitable for GitHub Pages

---

## Project structure (high level)

- `pages/`
  - `index.vue`: home (showcase)
  - `movies.vue`, `series.vue`, `shows.vue`: list pages
  - `search.vue`: client-side search over showcase data
  - `content/[type]/[id].vue`: details page
- `server/api/`
  - `main.get.ts`: fetches and caches the home payload (showcase + dictionaries)
  - `content/[type]/[id].get.ts`: fetches content by type/id and resolves references
- `services/resolver/entityResolver.service.ts`: OID resolver implementation
- `stores/`
  - `showcaseStore.ts`: home payload + status
  - `dictionaryStore.ts`: dictionary entities cache
- `components/`: UI building blocks (cards, errors, skeletons)
- `plugins/vuetify.ts`: Vuetify setup (SSR enabled)

---

## Configuration notes

### Base URL for GitHub Pages

When generating a static site for GitHub Pages the application must run under a repository subpath:

- `https://<user>.github.io/cinema/`

This is handled by `nuxt.config.ts` via `app.baseURL`. During `nuxt generate` the base URL switches to `/cinema/`, so all assets and links are emitted with the correct prefix.

### Favicon

The favicon is explicitly configured in `nuxt.config.ts` (via `app.head.link`) to use `public/favicon.png` and to respect `baseURL` when generating static output.

---

## Data model: OID references

The upstream API uses OID strings to reference entities:

- `genre:123`, `label:456`, `country:789`, `studio:555`, `person:42`

`EntityResolver` walks the response object, collects OIDs, fetches missing dictionary entities, stores them in the dictionary cache, and then replaces OID strings with full objects.

This approach keeps pages simple: most UI components can render `Genre[]`, `Label[]`, etc. without additional requests.

---

## Data flow (SSR/SSG-friendly)

### 1) Server endpoints

- `GET /api/main`
  - fetches the upstream showcase payload
  - fetches dictionary lists (genres/labels/countries/studios)
  - resolves OID references and returns:
    - `showcase`: a resolved object tree
    - `dictionaries`: a flat OID → entity map
  - caches the result in memory to reduce upstream load

- `GET /api/content/:type/:id`
  - fetches a single content item from upstream
  - resolves OIDs using a per-request dictionary (no cross-request state)

### 2) Pinia stores

- `showcaseStore`
  - owns the resolved `showcase` payload
  - exposes getters for `slides`, `collections`, and `showcaseName`
  - provides `fetchMainPage()` action for SSR/SSG/server runtime

- `dictionaryStore`
  - owns the resolved dictionary cache (`entities`)
  - provides helpers to access entities by OID or by type prefix

### 3) Pages

Pages use `useAsyncData()` to fetch data during SSR/SSG. In SSG/static hosting, pages then hydrate Pinia stores from the `useAsyncData()` payload to avoid client-side calls to `/api/*` (which do not exist on GitHub Pages).

---

## Runtime modes

### Development

```bash
yarn dev
```

### SSR build & preview

```bash
yarn build
yarn preview
```

### Static generation (SSG)

```bash
yarn generate
yarn preview
# or: npx serve .output/public -s
```

---

## Static hosting constraints

GitHub Pages is a **static** host. It cannot run Nitro server endpoints in production. That means:

- Client-side calls like `fetch('/api/main')` will 404 on GitHub Pages.
- All content that must appear on first load should be present in the SSG payload (`_payload.json`).

This repository uses the SSR/SSG pipeline to embed initial data into the generated output and hydrates the Pinia stores from that payload on the client.

---

## Testing

Run unit tests:

```bash
yarn test
```

Run tests with coverage:

```bash
yarn test:coverage
```

Tests cover:

- `utils/` helpers (OID parsing, asset URLs)
- `services/resolver/EntityResolver`
- Pinia stores
- UI components

---

## Development guidelines

- Keep data/business logic in `stores/` and `services/`, not in components.
- Prefer SSR/SSG-friendly patterns:
  - `useAsyncData()` for initial data needs
  - avoid direct `window` / `document` access in shared code paths
- Keep `server/api/*` endpoints deterministic where possible.

---

## License

MIT © [Aleksey Tarasenko](https://github.com/alekstar79)
