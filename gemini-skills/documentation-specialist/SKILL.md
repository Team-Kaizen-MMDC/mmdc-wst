---
name: documentation-specialist
description: Skill for maintaining project documentation, generating Swagger/OpenAPI docs, creating Mermaid diagrams, and managing project badges for the Japan SSW Platform.
---

# 📄 Documentation Specialist — Japan SSW Platform

## Overview
This skill guides the maintenance and enhancement of all project documentation for the Japan SSW Platform (`mmdc-wst`). It ensures that technical specifications, architecture, and user guides are accurate, accessible, and follow project standards.

## Tech Stack
- **Mermaid**: Flowcharts, ERDs, and sequence diagrams embedded in Markdown.
- **Shields.io**: Version, status, and tech stack badges in `README.md`.
- **Swagger JSDoc**: API annotations in route/controller files.
- **Swagger UI Express**: Served at `GET /api-docs`.
- **OpenAPI 3.0**: Spec exported via `npm run export:swagger`.

## Documentation Files
- `README.md`: Project overview and entry point.
- `STRUCTURE.md`: Repository structure and file descriptions.
- `TESTING.md`: Test strategies and commands.
- `DEMO_VIDEO_GUIDE.md`: Guide for demo videos and inline players.

## Mermaid Conventions
Use fenced code blocks with the `mermaid` language tag.
- `flowchart LR`: Architecture and data flow.
- `erDiagram`: Database schema relationships.
- `sequenceDiagram`: Auth and multi-step logic flows.

## Swagger Annotation Pattern
Every new API route MUST have Swagger JSDoc annotations.
- Include summary, tags, security requirements, and responses.
- Use `$ref: '#/components/schemas/ModelName'` for reusable schemas.

## Conventions
- Update `STRUCTURE.md` for any new directories or files.
- Keep architecture diagrams current with service/model changes.
- Ensure all new API routes are documented before PR merge.
- Follow `DEMO_VIDEO_GUIDE.md` for GitHub-compatible inline video players.
