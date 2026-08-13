# QLEAR Product Requirements

## Problem

Large goals create cognitive overload because ordinary task tools expose too much work and make completion feel like a checkbox state change. QLEAR turns one large goal into the next three executable quests and makes each completion visibly reduce the goal.

## Target

Individuals with a meaningful goal: students, professionals, creators, job seekers, developers, and anyone who benefits from focusing on one finishable action at a time.

## Core value

- Reduce a large goal to exactly three active quests.
- Recommend one momentum-building action without taking control away from the user.
- Make CLEAR the emotional and visual high point of the product.
- Keep all primary behavior useful without an API key or account.

## Core loop

`Goal -> AI Planning -> Boss -> 3 Quests -> Smash -> Clear -> Damage -> Progress -> Replan -> Goal Clear`

The Boss is an HP gauge, never a character. Difficulty primarily controls damage. Completion creates a Digital Crumple sequence, then damage, XP, combo, optional title unlock, and a single-line tactical response.

## MVP scope

- Landing page and terminal-style goal setup.
- Deterministic mock plan generation with editable Boss HP and exactly three quests.
- Command Center, Quest Board, Smash Mode, Review, and Settings.
- Alternative selection, simpler-route replacement with undo, and replanning.
- XP, level, session combo, condition-based cosmetic titles, and Digital Crumple.
- IndexedDB persistence, reload recovery, validated export/import, and reset.
- Optional server-only OpenAI planner with mock fallback.

## Non-goals

Authentication, collaboration, teams, workspaces, comments, external calendars, timers, streaks, penalties, currencies, inventory, character art, mobile-specific product work, and cloud sync.

## User journey

1. The visitor understands that one goal becomes three actionable quests.
2. They enter a goal, optional target date, daily time, and energy.
3. Planning produces a Boss and exactly three editable quests.
4. Confirmation stores the plan and opens the Command Center.
5. Smash selects one momentum-friendly quest while alternatives remain available.
6. CLEAR performs Digital Crumple, applies damage, awards XP/combo/title, and presents the next action.
7. Review reports the day from persisted completion events.
8. Replan restores three active quests when work changes.

## Success conditions

- A first-time user reaches a confirmed plan in under two minutes.
- Every generated or replanned route contains exactly three active quests.
- A completion persists even if its animation fails.
- Boss HP never exceeds max HP or drops below zero.
- Primary flows work with `AI_PROVIDER=mock` and survive reload.
- Required desktop viewports have no horizontal overflow or clipped primary controls.

