# Cross-Cutting Conventions — All Agents
> Japan SSW Platform (`mmdc-wst`)

These conventions apply to **every** agent role in this project. Read this before
starting any task.

## Runtime & Tooling
| Convention | Detail |
|---|---|
| Node version | 18 LTS |
| Package manager | npm — use `npm ci` in CI, `npm install` locally |
| Module system | CommonJS (`"type": "commonjs"`) in both root and `backend/` |
| Environment config | All config via `.env` / environment variables — never hardcode values |

## Port Conventions
| Service | Port |
|---|---|
| Backend API (Express) | 3000 |
| Static frontend server | 8000 (Python HTTP) |

## Git Workflow
| Convention | Detail |
|---|---|
| Branching | Feature branches → PR → `main` (protected) |
| Commit messages | Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:` |
| PR requirements | Tests pass + no secrets + Swagger annotations for any new API routes |

## Error Handling
- All async Express route handlers must be wrapped in `asyncHandler` (`backend/src/middleware/asyncHandler.js`)
- Global error handler (`backend/src/middleware/errorHandler.js`) is the single exit point for errors
- Never expose stack traces or internal error details to API responses in production

## Secrets Policy
- `.env` files are **never committed** — use `backend/.env` as the template
- GitHub Actions secrets for CI/CD credentials
- AWS Secrets Manager for production runtime secrets
- OIDC federation for AWS — no long-lived `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`

## Code Style
- No TypeScript on the frontend — vanilla ES6+
- Backend: CommonJS modules (`require` / `module.exports`)
- Comment only non-obvious logic — avoid noise comments
- Swagger JSDoc annotations required on all new API routes before merging
