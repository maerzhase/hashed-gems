# @m3000/hashed-gems

Deterministic gemstone avatars. Infinitely shimmering.

## Packages

- [`packages/hashed-gems`](./packages/hashed-gems/) — The published package
- [`apps/demo`](./apps/demo/) — Interactive demo

## Getting Started

```bash
pnpm install
pnpm build
pnpm dev
```

For the demo image cache, configure Cloudflare R2 in `apps/demo/.env.local`:

```bash
R2_ACCOUNT_ID=...
R2_BUCKET=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_PUBLIC_BASE_URL=https://hashed-gems.m3000.io
# Optional override:
# R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
```

## Useful Commands

```bash
pnpm dev          # run the demo app
pnpm build        # build all workspaces
pnpm check        # lint, format, and typecheck
pnpm fix          # apply lint + format fixes
pnpm changeset    # create a release note + version bump entry
pnpm release      # build and publish releaseable packages
```

## Releasing `@m3000/hashed-gems`

This repo uses Changesets to version and publish from `main`.

1. After changing the package in a way that should ship to npm, run `pnpm changeset`.
2. Pick the release type: `patch`, `minor`, or `major`
3. Commit the generated `.changeset/*.md` file with your code changes.
4. When that branch lands on `main`, the Changesets GitHub Action opens or updates a release PR.
5. Merging the release PR publishes the package to npm.

## License

MIT
