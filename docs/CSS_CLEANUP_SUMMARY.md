# CSS Cleanup Summary

This document summarizes the six-phase cleanup and consolidation performed on `assets/css/main.css` during the chore branch `chore/tidyup_maincss`.

## Goals

- Remove duplicated CSS rules and consolidate repeated patterns.
- Create a clearly organized stylesheet with design tokens, components, utilities, and responsive rules.
- Preserve existing functionality and visual design while improving maintainability.

## Overview of Phases

1. **Design tokens**: Consolidated multiple `:root` blocks into a single design tokens section (colors, typography, spacing, UI tokens).
2. **Typography**: Unified base typography and heading scales; removed duplicate typographic rules.
3. **Buttons**: Consolidated button styles into a single `.btn` system with clear variants (`.btn-primary`, `.btn-secondary`, `.btn-dark`).
4. **Layout components**: Merged header, footer, card, and grid rules into single organized sections.
5. **Utilities**: Consolidated spacing utilities (`.mt-*`), text helpers, layout helpers, and sizing utilities into a unified utilities section.
6. **Final organization**: Removed remaining duplicates (e.g., multiple `.hero` and `.alerts-band` blocks), cleaned comments, and reorganized the file into a logical flow.

## Results

- Final file: `assets/css/main.css` — **1183 lines**, consolidated and documented.
- No visual regressions introduced; keyboard and focus behaviors preserved.
- Improved maintainability and a clear place for future additions (tokens, components, utilities).

## How to use this summary

- See `assets/css/main.css` top-of-file documentation for the recommended file structure and header contract.
- Use this summary when planning further CSS changes or when splitting styles into modular files for Phase 2.

## Branch & commit info

- Branch: `chore/tidyup_maincss`
- Commits specific to the cleanup exist on the branch with messages such as:
  - "Phase 1: Consolidate design tokens"
  - "Phase 2: Consolidate typography"
  - "Phase 3: Consolidate buttons"
  - "Phase 4: Consolidate layout components"
  - "Phase 5: Consolidate utilities"
  - "Phase 6: Final organization and cleanup"

## Next steps

- Option A: Keep a single `main.css` for Phase 1 and reference design tokens while adding Phase 2 JS features.
- Option B: For Phase 2+, split large `main.css` into small, focused files (e.g., `tokens.css`, `layout.css`, `components.css`, `utilities.css`) and import from a build process.
