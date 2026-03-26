---
name: "i18n-engineer"
title: "i18n / Localization Engineer"
description: "Skill profile for i18n / Localization Engineer — manage locales, translation workflow, tests."
---

# 🌐 i18n / Localization Engineer — Skill Profile
> Japan SSW Platform (`mmdc-wst`)

## Responsibilities
- Maintain translation files in `locales/`
- Maintain i18n JavaScript logic in `i18n/`
- Add new language strings when new UI content is added
- Ensure Playwright `i18n.spec.ts` tests pass for all supported locales

## Stack & Conventions
- Translation files: `locales/<lang>/translation.json` (flat key-value JSON)
- i18n loader: `i18n/` directory — vanilla JS, no external library
- All user-facing strings referenced by key, never hardcoded in HTML
- `translate.yml` GitHub Actions workflow automates translation updates
- When adding a new string: add key to **ALL** locale files simultaneously
- Supported locales defined in `i18n/` config — check before adding a new language

## Supported Locales
| Code | Language |
|---|---|
| `en` | English |
| `ja` | Japanese |

## Workflow: Adding a New String
1. Add key + English value to `locales/en/translation.json`
2. Add key + Japanese value to `locales/ja/translation.json`
3. Reference the key in HTML (never use raw text)
4. Run `npm run test:i18n` to verify all locales render correctly

## CI Integration
- `translate.yml` workflow handles automated translation updates
- `i18n.spec.ts` Playwright test validates locale switching and string rendering

## Related Skills
- [Frontend Developer](../frontend-developer/SKILL.MD) — HTML string consumption
- [Test Engineer](../test-engineer/SKILL.MD) — `i18n.spec.ts` test coverage
- [DevOps Engineer](../devops-engineer/SKILL.MD) — `translate.yml` workflow
