# Contributing

A11yFix AI is a personal project, currently paused. Fixes and rule improvements are welcome; open an issue first for
anything larger than a bug fix.

## Setup

Requires Node 24 (`.nvmrc`) and npm.

```bash
npm ci
npm run dev        # Vite dev server; keeps dist/ updated
```

Load `dist/` in Chrome: `chrome://extensions` → **Developer mode** → **Load unpacked**. The AI features need your own
OpenAI API key, entered in the extension's Settings. No secret is read from the environment.

## Checks

CI runs all of these on every push and pull request; run them before pushing.

| Command                 | What it checks                                                      |
| ----------------------- | ------------------------------------------------------------------- |
| `npm run typecheck`     | TypeScript                                                          |
| `npm test`              | Unit tests (Vitest + happy-dom)                                     |
| `npm run test:coverage` | The coverage gate on `src/content/audit/rules/`                     |
| `npm run docs`          | Regenerates the coverage docs; CI fails if a committed file changes |
| `npm run lint`          | ESLint                                                              |
| `npm run format:check`  | Prettier (`npm run format` fixes)                                   |
| `npm run build`         | Type-check and bundle into `dist/`                                  |
| `npm run test:e2e`      | Playwright against the built extension (needs a display or `xvfb`)  |

CI also enforces a 400 KB gzip budget on the content script.

## Where things go

- A new accessibility check: [docs/adding-a-rule.md](docs/adding-a-rule.md).
- How findings are labelled: [docs/user-guide.md](docs/user-guide.md).
- What may leave the browser: [docs/privacy.md](docs/privacy.md). A change that sends new data anywhere must update
  that page in the same commit.
- Architecture and conventions: [AGENTS.md](AGENTS.md) and the README.

## Pull requests

- One change per pull request, with the test that proves it.
- Keep user-facing strings in both languages (`src/lib/i18n/messages.ts`).
- Do not add a network call, a permission or a runtime dependency without discussing it in an issue first.

## Releasing

`npm version patch` (or `minor`), then `git push --follow-tags`. The tag triggers `.github/workflows/release.yml`,
which builds the extension and attaches the zip for the Chrome Web Store to a GitHub release. The manifest version
comes from `package.json`.
