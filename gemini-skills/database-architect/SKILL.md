---
name: database-architect
description: Skill for designing and maintaining Mongoose schemas, managing MongoDB Atlas, and handling database seeding, backup, and restore for the Japan SSW Platform.
---

# 🗄️ Database Architect — Japan SSW Platform

## Overview
This skill guides the design, optimization, and maintenance of the MongoDB database for the Japan SSW Platform (`mmdc-wst`). It ensures data integrity through Mongoose schemas and provides workflows for seeding and backups.

## Tech Stack
- **MongoDB Atlas**: Cloud-hosted cluster.
- **Mongoose (v9)**: ODM for schema definition and validation.
- **mongodb-memory-server (v8)**: In-memory DB for testing.

## Schema Conventions
- **Timestamps**: Always define `{ timestamps: true }`.
- **Security**: Use `select: false` for sensitive fields (passwords, tokens).
- **Indexing**: Add compound indexes for frequently queried field combinations.
- **Connections**: Use `MONGODB_URI` from `.env`; never hardcode strings.

## Current Models
- `User`: Auth users (local + Google).
- `UserProfile`: Extended profile data.
- `Job` / `AdminJob`: Job listings and postings.
- `Application`: Job applications.
- `Company`: Company profiles.
- `Content`: CMS-style page content.

## Seed Workflows
- `npm run seed`: Basic data.
- `npm run seed:full`: Comprehensive seed (clears first).
- `npm run seed:clear`: Clear all data.
- `npm run seed:featured`: Seed featured companies and SSW jobs.

## Backup & Restore
Manual backups are required for the Atlas free tier using custom scripts:
- **Backup**: `cd backend && npm run backup`. Creates JSON files in `backups/<ISO-timestamp>/`.
- **Restore**: `cd backend && npm run restore -- --from ../backups/<timestamp>`.
- **Policy**: Backup BEFORE any seed operation or merging major changes.

## Atlas Best Practices
- Use Atlas Search indexes for full-text search.
- Maintain an IP Access List for security.
- Use least-privilege roles for database users.
