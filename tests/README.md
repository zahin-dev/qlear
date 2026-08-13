# Tests

- `unit/`: pure functions, deterministic AI and scheduling logic, validation, gamification, and isolated components. Use `*.test.ts` or `*.test.tsx`.
- `integration/`: repository, IndexedDB, and multi-module behavior. Use `*.test.ts` or `*.test.tsx`.
- `e2e/`: Playwright user flows and browser-level regression checks. Use `*.spec.ts`.

`setup.ts` is the shared Vitest environment setup referenced by `vitest.config.ts`. Playwright reports, screenshots, and temporary test output are generated artifacts and do not belong in this folder.
