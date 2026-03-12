# e2e-playwright-mcp
Test Automation Framework that uses Playwright MCP Framework using Typescript, LLM and Cursor AI IDE

## Seed fixtures (DB/API/Auth)

`e2e/fixtures.ts` adds reusable Playwright fixtures for:
- authenticated API requests (`auth`, `api`)
- DB setup endpoints (`db.health`, `db.reset`, `db.seed`)

Set these environment variables before running `e2e/seed.spec.ts`:

- `API_BASE_URL` (or rely on `use.baseURL` in `playwright.config.ts`)
- either `AUTH_TOKEN` **or** both `AUTH_USERNAME` and `AUTH_PASSWORD`

Optional endpoint path overrides (defaults shown):
- `AUTH_LOGIN_PATH` (`/auth/login`)
- `DB_HEALTH_PATH` (`/test/db/health`)
- `DB_RESET_PATH` (`/test/db/reset`)
- `DB_SEED_PATH` (`/test/db/seed`)

If required env vars are missing, the seed test is skipped with a clear reason.
