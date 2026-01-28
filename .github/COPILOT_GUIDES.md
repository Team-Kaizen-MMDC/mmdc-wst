# Copilot / Maintainer Quick Guides

This file contains short, maintainer-focused reference snippets and pointers copied from the canonical `docs/` folder so Copilot and maintainers have quick access.

## Node.js REST API (quick pointer)

- Canonical: `docs/NODEJS_REST_API_CRUD_GUIDE.md`
- Quick notes:
  - Use `src/utils/password.js` (bcryptjs) for password hashing and comparison.
  - Registration: hash password then save user record.
  - Login: query user with `.select('+password')` then compare the provided password with stored hash.

Example (controller snippets):

```js
// Registration: hash & save
const { hashPassword } = require("../src/utils/password");
const passwordHash = await hashPassword(plainPassword);

// Login: compare
const { comparePassword } = require("../src/utils/password");
const ok = await comparePassword(plainPassword, user.password);
```

## MongoDB Atlas (quick pointer)

- Canonical: `docs/MONGODB_ATLAS_INTEGRATION.md`
- Quick notes:
  - Use the SRV-style connection string in `MONGODB_URI`.
  - Enable IP access lists for CI/CD and developer machines.
  - Add text indexes for job search and `2dsphere` for location queries where needed.

## Backend folder structure (quick)

Quick backend layout — canonical guide: `docs/NODEJS_REST_API_CRUD_GUIDE.md`.

```text
backend/
├── src/
│   ├── config/        # database, constants, environment
│   ├── controllers/   # request handlers (thin controllers)
│   ├── models/        # Mongoose schemas
│   ├── routes/        # Express route definitions
│   ├── middleware/    # auth, error handling, validation
│   ├── utils/         # helpers (logger, password helper)
│   ├── validators/    # request validators
│   └── app.js         # express app setup
├── tests/             # unit/integration/e2e
├── .env.example
├── package.json
└── server.js          # entry point
```

Notes:

Notes:

- Keep controllers small and push business logic into services/helpers where useful.
- Centralize error handling, validation, and logging.
- Use the `docs/` folder for full examples and longer reference sections.

## Where to put large guides

For large, frequently updated documents prefer the `docs/` folder (examples: `docs/NODEJS_REST_API_CRUD_GUIDE.md`, `docs/MONGODB_ATLAS_INTEGRATION.md`).

If maintainers want the full Node.js guide added into `.github/copilot-instructions.md`, I can attempt that change as well — note that automated edits to that file failed in my last attempt; if you'd like that, I can retry with smaller chunks or insert a single pointer line instead.

---

Document Version: 1.0
Last updated: January 26, 2026
