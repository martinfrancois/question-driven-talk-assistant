# AGENTS

## Repository Overview

- React + TypeScript web application built with Vite.
- Styling with Tailwind CSS and shadcn/ui.
- State management via Zustand.
- Bun (1.2.14+) is the package manager and script runner.

## Directory Structure

- `src/` – application source code.
  - `components/` – React components.
  - `components/ui/` – reusable UI components.
  - `App.tsx` – main application component.
  - `**/*.spec.ts` and `**/*.spec.tsx` – unit and component tests.
- `e2e/` – Playwright end-to-end tests.
- `public/` – static assets served at runtime.
- Config files: `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `tailwind.config.*`, `tsconfig*.json`.

## Tooling and Code Style

- Linting with ESLint configured for TypeScript and React.
- Prettier (with tailwindcss plugin) formats code; a pre-commit hook auto-formats staged files.
- Unit tests use Vitest and run in a Playwright-provided Chromium browser.
- End-to-end tests use Playwright.
- When running tests, include the `--browser.headless` flag to ensure headless execution.
- Playwright browsers **must** be installed before running any tests (including unit tests):
  ```bash
  bun x playwright install --with-deps
  ```

## Development Workflow

1. Install dependencies: `bun install`.
2. Lint: `bun run lint`.
3. Type check: `bun x tsc -p tsconfig.json --noEmit`.
4. Build: `bun run build`.
5. Install Playwright browsers (required even for unit tests): `bun x playwright install --with-deps`.
6. Run unit tests: `bun run test:unit -- --browser.headless`.
7. For end-to-end tests:
   - Start preview server: `bun run preview -- --port 5173`.
   - In another terminal, run: `bun run test:e2e`.
8. Update unit test snapshots when necessary: `bun run test:unit:update`.
9. Write commit messages in the imperative mood with concise summaries.

## Documentation-only Changes

For commits that modify only documentation files:

1. Install dependencies: `bun install`.
2. Lint: `bun run lint`.

Other checks (type checking, tests, build) are unnecessary.

## Continuous Integration

GitHub Actions execute the same workflow: lint → type check → build → install Playwright browsers → unit tests → start preview server → end-to-end tests. Matching these steps locally increases the likelihood of passing CI.
