# Unlimited Blade Works

Immersive 3D archive for legendary blades from history, myth, and imagination.

## Visual direction

![Unlimited Blade Works visual concept](docs/assets/demo.png)

The target experience combines a cinematic field of blades with a restrained museum/archive interface. The reference image is a concept direction rather than a final UI specification.

## Product direction

- Cinematic sword-field landing experience inspired by the *idea* of an infinite blade world, while maintaining an original visual identity.
- Real-time 3D exploration and artifact inspection in the browser.
- Cloudflare Workers as the application/API runtime.
- Cloudflare D1 for structured archive data and R2 for GLB/KTX2/HDR/audio assets.
- GitHub-driven deployment to Cloudflare.

## Planned stack

- React + TypeScript + Vite
- Three.js + React Three Fiber + Drei
- Theatre.js for cinematic sequences
- Hono on Cloudflare Workers
- Cloudflare D1 + R2

## Development

Requirements: Node 24 (see `.nvmrc`) and pnpm 10 (`corepack enable`).

```bash
pnpm install     # install dependencies
pnpm dev         # local dev (Vite + Worker runtime via @cloudflare/vite-plugin)
pnpm build       # production build to dist/
pnpm preview     # serve the production build locally
```

Quality gates (all must pass before merge):

```bash
pnpm typecheck     # tsc --noEmit
pnpm lint          # eslint
pnpm format:check  # prettier
pnpm test          # vitest: Worker API contract + frontend validators
pnpm check:budgets # bundle budget gate (run after build)
pnpm e2e           # Playwright smoke (builds and serves preview automatically)
```

### Environments

| Environment | Config source | Notes |
| --- | --- | --- |
| local | `.dev.vars` (copy from `.dev.vars.example`) | Overrides `vars` in wrangler.jsonc |
| preview | `wrangler.jsonc` → `env.preview` | `pnpm deploy:preview`; Workers Builds targets this on non-main branches |
| production | `wrangler.jsonc` top level | `pnpm deploy`; maps to `unlimitedblade.work` |

Secrets never enter git. Worker observability (logs/metrics) is enabled in `wrangler.jsonc`.

Note: `vite preview` binds to `127.0.0.1` in Playwright config because Vite 8 defaults to an IPv6-only listener; wrangler CLI calls to the Cloudflare API can fail on networks that reset Node TLS traffic — prefer Workers Builds (Git integration) for deployment when local deploys are blocked.

## Project layout

```text
src/worker/    Hono API (routes, fixture data)
src/web/       React app (app routes, components, lib)
tests/         vitest (unit/API) and Playwright (e2e)
scripts/       budget gate
docs/          design docs and quality baseline
```

## Documents

- [`docs/PRODUCT_TECHNICAL_DESIGN.md`](docs/PRODUCT_TECHNICAL_DESIGN.md) — product and technical design.
- [`docs/DEVELOPMENT_PLAN.md`](docs/DEVELOPMENT_PLAN.md) — V0.1 schedule, task dependencies, quality gates and release checklist.
- [`docs/REFERENCES.md`](docs/REFERENCES.md) — websites, open-source projects, platform references, asset pipeline and visual direction.

## Copyright note

Fate/Unlimited Blade Works is treated only as high-level mood inspiration. This project should not copy copyrighted scene composition, artwork, logos, models, typography or other production assets; the final visual identity and assets must be original or appropriately licensed.
