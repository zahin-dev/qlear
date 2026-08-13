# QLEAR Design System

## Direction

`PIXEL × MODERN PRODUCTIVITY × NIGHT CITY`. The rainy city is expressed through layout, grid, signals, borders, light, noise, and restrained motion—never literal scenery or characters.

## Palette

- Deep background `#080c0e`, base `#0d1214`
- Surfaces `#13191c`, raised `#192124`, muted `#20282a`
- Borders `#303a38`, bright `#596052`
- Text `#e7e2d6`, muted `#93988e`
- Amber/action `#d69a3a`, amber dim `#826733`
- Olive `#5d5b3b`, rust `#713b27`, danger `#a54d32`, signal `#4ca9a3`

Rarity uses neutral/olive for Common, signal for Rare, rust/amber for Epic, and bright amber for Legendary. Rarity is visual only.

## Typography

DotGothic16 provides readable Japanese bitmap character; Silkscreen is limited to compact Latin system labels and numeric readouts. Body sizes stay at or above 14px. Labels use tracking and uppercase sparingly.

## Spacing and layout

The base unit is 4px. Main gaps use 12, 16, 24, and 32px. Desktop navigation is 220px; content maxes near 1500px. Dense panels retain generous internal grouping.

## Borders, cards, and shadows

Borders are 1–2px with square or 2–4px corners. Raised panels use offset hard shadows, inset lines, and corner cuts. No glass blur, pill-card overload, or generic large radii.

## Buttons and inputs

Controls have a minimum 44px target, visible focus outline, hard press offset, semantic disabled state, and concise verbs. The primary button is amber with dark text. Inputs use deep fills and bright focus borders.

## Progress bars

Boss HP is the dominant visual: segmented grid fill, numeric current/max, percentage, and damage pulse. Values remain text-readable and do not rely on color alone.

## Motion

Rain and scanline motion are subtle and pause for hidden documents. Digital Crumple uses card highlight, grid fragmentation, compression, projectile, Boss impact, HP decrement, damage, then rewards. `prefers-reduced-motion` and the app setting reduce it to a fast semantic state change.

## Rain and pixel rules

Rain uses low-opacity repeating lines behind an opaque readability layer. Pixels align to whole values, transforms avoid blurry resting states, shadows are hard-edged, and system decorations never compete with content.

## Accessibility

Semantic landmarks, skip link, keyboard-operable navigation/actions, persistent focus visibility, text equivalents for progress/rewards, sufficient contrast, minimum target sizes, live regions for completion, and motion controls are required.

