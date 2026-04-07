# Contributing to hashed-gems

Thanks for your interest in contributing. This repository contains the
published `@m3000/hashed-gems` package and the demo app used to develop and
showcase it.

## Code of Conduct

This project follows the [Code of Conduct](./CODE_OF_CONDUCT.md). By
participating, you agree to uphold it.

## Repository Layout

This is a pnpm workspace managed with Turborepo:

```text
hashed-gems/
├── packages/
│   └── hashed-gems/   # Published React package
└── apps/
    └── demo/          # Next.js demo app
```

## Prerequisites

- Node.js 20 or newer
- pnpm 10.33.0

## Getting Started

1. Clone the repository.
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Build all workspaces:

   ```bash
   pnpm build
   ```

4. Start development:

   ```bash
   pnpm dev
   ```

If you want the demo app to use the image cache, create
`apps/demo/.env.local` and configure Cloudflare R2:

```bash
R2_ACCOUNT_ID=...
R2_BUCKET=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_PUBLIC_BASE_URL=https://hashed-gems.m3000.io
# Optional override:
# R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
```

The demo can still be worked on without this cache setup if your change does
not depend on cached image generation.

## Useful Commands

Run these from the repository root:

```bash
pnpm dev          # run workspace dev tasks
pnpm build        # build all workspaces
pnpm check        # syncpack lint + lint + format + typecheck
pnpm fix          # syncpack fixes + lint/format fixes
pnpm lint         # run Biome linting across workspaces
pnpm format       # run formatting checks across workspaces
pnpm typecheck    # run TypeScript checks across workspaces
pnpm changeset    # create a changeset for releasable package changes
```

You can also work inside an individual workspace when needed:

```bash
pnpm --filter @m3000/hashed-gems storybook
pnpm --filter @m3000/hashed-gems build
pnpm --filter @m3000/hashed-gems-demo dev
```

## Development Notes

- Formatting and linting use Biome.
- Dependency consistency is checked with syncpack.
- The published package lives in `packages/hashed-gems`.
- The demo app depends on the workspace package via `workspace:*`.

Please keep changes focused and update docs when behavior or public APIs change.

## Changesets and Releases

This repo uses Changesets to version and publish `@m3000/hashed-gems`.

Run `pnpm changeset` when your branch changes the published package in a way
that should ship to npm. Commit the generated `.changeset/*.md` file alongside
your code changes.

When changes land on `main`, the release workflow will open or update a release
pull request. Merging that release PR publishes the package to npm.

## Pull Requests

Before opening a PR:

1. Run `pnpm check`.
2. Add a changeset if the published package should be released.
3. Update relevant docs if usage, behavior, or API surface changed.

In your PR description, include the user-facing impact of the change and note
any follow-up work or release considerations.
