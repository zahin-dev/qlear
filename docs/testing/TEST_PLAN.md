# QLEAR Test Plan

## Unit and component tests (Vitest)

- Damage mapping and Boss HP clamping.
- XP combo bonus cap and level curve boundaries.
- Session combo behavior and condition-based title unlocks.
- Deterministic scheduling from target date, time, estimate, and priority.
- Deterministic mock classification and exactly-three output.
- Zod validation for Goal, Quest, Boss, AI output, import, and settings.
- Repository transaction behavior using fake IndexedDB.
- Critical components expose accessible labels and states.

## End-to-end tests (Playwright)

- Landing and CTA navigation.
- Setup, analysis sequence, goal creation, exactly three quests, editing, and confirmation.
- Dashboard Boss HP and next-three presentation.
- Quest Board movement/edit controls and subquests.
- Smash recommendation, alternative selection, board selection, simpler route, and undo.
- CLEAR, Digital Crumple completion surface, damage, XP, combo, title, and next quest.
- Replan, review metrics/history/archive, reload persistence.
- Settings Boss edit, export, valid/invalid import, animation controls, and reset.
- No console errors or uncaught page exceptions.

## Critical E2E sequence

`Landing -> Setup -> Plan -> Boss + 3 Quests -> Confirm -> Dashboard -> Smash -> CLEAR -> Damage/XP/Combo -> Next -> Review -> Reload -> Persisted state`

## Visual QA

Capture and inspect 1280×800, 1440×900, 1600×900, and 1920×1080. Check clipping, overflow, panel alignment, typography, density, rain readability, crisp borders, dialogs, board, Smash, and Boss bar. Test a reduced-motion context and keyboard focus.

## Quality gate

`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, and `pnpm build` must pass. Playwright records console errors and uncaught exceptions as failures.
