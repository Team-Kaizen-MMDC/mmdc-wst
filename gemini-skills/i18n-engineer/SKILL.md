---
name: i18n-engineer
description: Skill for managing internationalization (i18n) and localization (l10n) for the Japan SSW Platform. Use for adding/updating translation strings in locales/, managing i18n JS logic, and ensuring locale-specific UI rendering.
---

# 🌐 i18n Engineer — Japan SSW Platform

## Overview
This skill guides the internationalization and localization efforts for the Japan SSW Platform (`mmdc-wst`). It ensures that the application is accessible and correctly translated for all supported languages, following project-specific standards.

## Stack & Conventions
- **Translation Files**: `locales/<lang>/translation.json` (flat key-value JSON).
- **i18n Loader**: Custom vanilla JS in the `i18n/` directory.
- **Reference**: All user-facing strings MUST be referenced by key; NEVER hardcode display text in HTML.
- **Automation**: `translate.yml` GitHub Actions workflow handles automated updates.

## Supported Locales
- `en`: English.
- `ja`: Japanese.

## Workflow: Adding a New String
1. Add the new key and English value to `locales/en/translation.json`.
2. Add the same key and Japanese value to `locales/ja/translation.json`.
3. Reference the key in the HTML or JS using the project's i18n utility.
4. Run `npm run test:i18n` to verify rendering across all locales.

## Important Rules
- Add keys to **ALL** locale files simultaneously to avoid missing translations.
- Verify that `i18n.spec.ts` (Playwright) passes after any i18n changes.
- Check supported locales in the `i18n/` config before attempting to add a new language.
