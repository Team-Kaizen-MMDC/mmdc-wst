Utilities Audit — assets/css/main.css

Summary

- Purpose: identify small, reusable utility classes in `assets/css/main.css` and recommend preservation patterns for Phase 1 BEM migration.
- Approach: keep small non-semantic helpers (spacing, text alignment, width tokens) as utilities. Avoid converting them to BEM.

Found utility classes (representative list)

- Spacing utilities: `.mt-xxs`, `.mt-xs`, `.mt-sm`, `.mt-md`, `.mt-lg`, `.mt-xl`
- Section and layout helpers: `.section-padding`, `.grid-2`, `.features-grid`, `.company-grid`, `.hero-inner`
- Text and presentation: `.text-center`, `.text-gradient`, `.muted`, `.fw-600` (weight utility)
- Width/max-width tokens: `.w-760`, `.max-w-880`, `.max-w-900`, `.max-w-980`
- Image utilities: `.img-320`, `.img-full`, `.object-cover`
- Small layout helpers: `.flex-center`, `.gap-05`, `.m-0`

Recommendations

1. Preserve utilities during Phase 1

   - Keep these small helper classes unchanged to minimize markup churn and visual regressions.
   - Document in `docs/CSS_MAIN_GUIDE.md` (or this file) what each utility does and how to use it.

2. Consolidation candidates for Phase 2

   - Consider consolidating redundant width tokens (e.g., `.w-760`, `.max-w-880`) into a small set (e.g., `.max-w-sm`, `.max-w-md`, `.max-w-lg`) if a design system is introduced.
   - Consider replacing `.text-gradient` with a design token utility that can be parameterized with CSS variables.

3. Linting and ordering

   - Keep utilities grouped in `assets/css/main.css` under a clear header ("Utility Classes") — they already are.
   - Add a short comment block at the top of the utilities section describing the allowed patterns (spacing, text, sizing) so future contributors don't convert them to BEM by mistake.

4. Migration rule
   - Rule: Do NOT convert utility classes to BEM. Utilities are intentionally global primitives and should remain usable across components.

Next steps suggested

- Add a short `/* Utilities: allowed primitives */` comment block in `assets/css/main.css` above existing utilities (I can do this now if you want).
- Run a quick grep across HTML files to find usages of utilities and ensure they align with their intended purpose.
