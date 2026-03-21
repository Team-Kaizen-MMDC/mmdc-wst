# Playwright tests — Local run guide

This file explains how to run the Playwright smoke tests locally for this static site.

Prerequisites

- Node.js (v16+ recommended). You can check with `node -v` and `npm -v`.
- Git repo checked out.
- A local static server to serve the site root (we use port 8000 in the examples).

Quick start (copy-paste)

1. Install node dependencies if you haven't already:

   npm install

2. Install Playwright browsers:

   npm run playwright:install

3. Start a local static server from the repository root (in a separate terminal):

   npm run server

   # or, explicitly:

   python3 -m http.server 8000

4. Run the tests (headless):

   npm run test:playwright

5. Run the tests headed (visible browser window):

   npm run test:playwright:headed

Notes

- The Playwright config uses baseURL: http://localhost:3000. If you run your server on another port, either start it on 8000 or run tests with:

  npx playwright test --project=chromium --config=tests/playwright/playwright.config.js --grep="" --base-url=http://localhost:PORT

- If you need to debug a failing test, run the test in headed mode and add `--debug` for interactive pause/inspects.
- To run a single spec file:

  npx playwright test tests/playwright/example.spec.js --project=chromium

Troubleshooting

- If `npm run playwright:install` fails, ensure your network allows downloading browser binaries. You can also install Playwright browsers manually via the Playwright docs.
- If tests cannot reach the site, ensure the server is running and the baseURL matches (http vs https).

CI notes (later)

- For CI, install dependencies, run `npx playwright install --with-deps` to get system dependencies, start a static server (or use a small Node serve) and call `npx playwright test`.

## Auth helper

Some pages redirect unauthenticated visitors to the signin page using a client-side cookie check. To run tests that exercise authenticated-only pages (for example the add/edit profile flows), use the provided helper:

```ts
import { setTestAuth } from "./helpers/auth";

test.beforeEach(async ({ page }) => {
  await setTestAuth(page.context());
});
```

## End-to-end walkthrough

We recorded an end-to-end walkthrough of the site and tests. If you have permission to view the file, open the recording here:

[End-to-end walkthrough (Google Drive)](https://drive.google.com/file/d/14i2okO4TMqrbPdgWfu3mnwrU6haM2bBq/view?usp=sharing)

[![Walkthrough thumbnail small](../../demo-videos/E2E%20Video%20Thumbnail.png)](../../demo-videos/player-walkthrough.html)

Open the [player page](../../demo-videos/player-walkthrough.html) for an inline player.

Notes:

- If you cannot view the video, check that your Google account has been granted access to the shared file.
- For a repository-hosted fallback (recommended for long-term accessibility), consider uploading an MP4 to a GitHub Issue or Release and pasting the resulting `user-attachments` URL into this README so GitHub renders an inline player.

The helper sets an `isLoggedIn=true` cookie scoped to the `PLAYWRIGHT_BASE_URL` or `BASE_URL` environment variables by default. You can pass an explicit baseUrl to the helper if needed.
