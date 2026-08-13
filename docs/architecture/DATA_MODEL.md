# QLEAR Data Model

## Aggregate

```text
Goal (one ACTIVE per user)
└── Boss (one active Boss for the active Goal)
    └── Quest (exactly three ACTIVE/IN_PROGRESS visible route slots)
        └── Subquest (zero to three, only for complex work)
```

## Entities

### Goal

`id`, `title`, optional `description`, optional `targetDate`, optional `availableMinutesPerDay`, `energy`, `status`, `createdAt`, `updatedAt`, optional `completedAt`.

### Boss

`id`, `goalId`, `title`, `scopeLevel`, `maxHp`, `currentHp`, `createdAt`, `updatedAt`, optional `completedAt`. Validation enforces `0 <= currentHp <= maxHp`.

### Quest

`id`, `bossId`, `title`, `description`, `difficulty`, `estimatedMinutes`, `priority`, `damage`, optional `scheduledFor`, optional `dueAt`, `status`, `order`, `source`, `aiReason`, timestamps, and optional `completedAt`.

### Subquest

`id`, `questId`, `title`, optional `estimatedMinutes`, `status`, and `order`.

### CompletionEvent

Immutable reward ledger containing goal/Boss/quest identifiers, optional subquest, damage, XP, combo, optional unlocked title, estimated minutes, and completion time. Review is derived from this ledger.

### DailyReview

Cached daily summary with counts, damage, XP, max combo, estimated cleared minutes, Boss progress, AI review, and next recommendation.

### ClearTitle

Condition-based cosmetic unlock with `code`, display `name`, `rarity`, `description`, and `unlockedAt`. Rarity never changes mechanics.

### AppSettings

Singleton settings record for AI mode, animation flags, XP, level, current/max session combo, current Smash session, and schema version.

## Enums

- `GoalStatus`: `ACTIVE | COMPLETED | ARCHIVED`
- `QuestStatus`: `READY | IN_PROGRESS | CLEARED`
- `Difficulty`: `EASY | NORMAL | HARD | BOSS`
- `Rarity`: `COMMON | RARE | EPIC | LEGENDARY`

## Persistence indexes

Goals index status; Bosses index goal; Quests index Boss, status, schedule, and order; Subquests index quest; Completion events index date/goal/Boss/quest; titles index code; settings use a stable singleton ID.

## Import contract

Exports are versioned JSON snapshots. Import validates the complete document with Zod, confirms referential shape, and replaces tables only after validation succeeds.

