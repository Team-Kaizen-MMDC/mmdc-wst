# 🗄️ Database Developer / Architect — Skill Profile
> Japan SSW Platform (`mmdc-wst`)

## Responsibilities
- Design and maintain Mongoose schemas in `backend/src/models/`
- Manage MongoDB Atlas cluster configuration and indexes
- Write and maintain seed scripts for local and CI development
- Optimize queries; add indexes for all frequently queried fields

## Required Tech Stack
| Technology | Version | Notes |
|---|---|---|
| MongoDB Atlas | Cloud | Cluster: `japansswcluster0.lvia1ct.mongodb.net`, DB: `japansswdb` |
| Mongoose | v9 | ODM, `USE_MONGOOSE=true` |
| mongodb-memory-server | v8 | In-memory DB for Jest tests |

## Schemas (Current Models)
| Model | File | Purpose |
|---|---|---|
| `User` | `User.js` | Auth users (local + Google OAuth) |
| `UserProfile` | `UserProfile.js` | Extended user profile data |
| `Job` | `Job.js` | Job listings |
| `AdminJob` | `adminJob.js` | Admin-managed job postings |
| `Application` | `Application.js` | Job applications |
| `Company` | `Company.js` | Company profiles |
| `Content` | `Content.js` | CMS-style page content |

## Schema Conventions
- Always define `timestamps: true` on schemas
- Use `select: false` on sensitive fields (passwords, tokens)
- Add compound indexes for fields used together in queries
- Connection string via `MONGODB_URI` env var only — never hardcode
- Collections: `CONTENT_COLLECTION=contents`, `ABOUT_COLLECTION=about`

## Seed Scripts
```bash
npm run seed              # Basic seed data
npm run seed:full         # Comprehensive seed (clears first)
npm run seed:full:verbose # Comprehensive seed with verbose output
npm run seed:clear        # Clear all seed data
npm run seed:clean        # Clean seed (safe script)
npm run fix-seed          # Fix inconsistent seed data
```

## Backup & Restore (Free-tier Atlas)

MongoDB Atlas free tier (`M0`) does **not** include automated backups. Use the
custom scripts in `backend/scripts/` for all manual backups.

### Backup script — `backend/scripts/backup-db.js`
Pure Node.js (no `mongodump` required). Exports every collection to timestamped
JSON files inside `backups/<ISO-timestamp>/` at the repo root.

```bash
# Full backup (all collections)
cd backend && npm run backup

# Selective backup
node backend/scripts/backup-db.js --collections users,companies,jobs

# Custom output directory
node backend/scripts/backup-db.js --out /path/to/my-backups
```

Output layout:
```
backups/
└── 2026-03-24T14-46-12/
    ├── manifest.json        ← metadata: date, DB name, doc counts
    ├── users.json
    ├── companies.json
    ├── jobs.json
    └── ...                  ← one .json per collection
```

### Restore script — `backend/scripts/restore-db.js`
```bash
# Restore all collections (additive — won't overwrite existing docs)
cd backend && npm run restore -- --from ../backups/2026-03-24T14-46-12

# Full replace (drop each collection first)
npm run restore -- --from ../backups/2026-03-24T14-46-12 --drop

# Restore specific collections only
npm run restore -- --from ../backups/2026-03-24T14-46-12 --collections users,companies
```

### Backup policy (recommended)
| Event | Action |
|---|---|
| Before any seed operation | `npm run backup` |
| Before a co-developer merge | `npm run backup` |
| Weekly (manual) | `npm run backup`, store outside repo |
| After full reseed | `npm run backup` to capture fresh state |

> **`backups/` is gitignored.** Store backup archives in a shared drive or S3 bucket
> for team access. Never commit backup JSON files — they may contain PII.

### Key fields (manifest.json)
| Field | Description |
|---|---|
| `createdAt` | ISO 8601 backup timestamp |
| `database` | Atlas database name |
| `collections.<name>.count` | Document count per collection |
| `collections.<name>.file` | Relative JSON filename |

## Atlas Best Practices
- Enable Atlas Search indexes for full-text search fields (job title, description)
- Use Atlas IP Access List — whitelist CI/CD runner IPs and dev machines only
- Enable Atlas Auditing for production clusters
- Use read/write users with least-privilege roles (not Atlas admin)
- Connection pooling is handled by Mongoose defaults — do not override unless profiling shows issues

## Related Skills
- [Backend Developer](../backend-developer/SKILL.MD) — controllers & routes
- [Test Engineer](../test-engineer/SKILL.MD) — mongodb-memory-server usage
- [AWS / Cloud Engineer](../aws-cloud-engineer/SKILL.MD) — Atlas network access via AWS
