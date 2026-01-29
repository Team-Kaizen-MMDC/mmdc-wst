# Copilot / Maintainer notes — README video embed guideline

This short guide documents the recommended, repeatable approach for embedding playable demonstration videos in the repository `README.md` files so that GitHub will show an inline player.

Why we do this

- GitHub's README rendering does not guarantee inline <video> tags for repo files. The most reliable way to get an inline-playing video in the README is to use GitHub's user-attachments host (the URL generated when you upload a file in an Issue or PR comment) and paste that bare URL on its own line in the README. GitHub will then render an inline player for that URL.

Recommended workflow

1. Encode your clip to MP4 using H.264 (libx264) and AAC audio. Example ffmpeg command:

   ```powershell
   ffmpeg -y -i input.mov -c:v libx264 -preset slow -crf 20 -c:a aac -b:a 128k -movflags +faststart output.mp4
   ```

2. Create a short thumbnail (one frame) for a visual fallback and player poster:

   ```powershell
   ffmpeg -y -i output.mp4 -ss 00:00:01 -vframes 1 -vf "scale=1280:-2" demo-videos/thumbnail.png
   ```

3. Upload the MP4 to GitHub via a Issue or PR comment (drag & drop the file into the comment area). GitHub will host it at a `github.com/user-attachments/assets/...` URL and show an upload preview.

4. Copy the generated `user-attachments` URL and paste it into the README on its own line (bare URL). Example:

   ```markdown
   https://github.com/user-attachments/assets/74fa75dc-35d6-42e8-b6b4-87cb92cc3991
   ```

   Note: a bare URL is required — wrapping it in link markup will prevent GitHub from rendering the preview player.

5. Keep a local repo fallback (recommended):
   - Add a small player page under `demo-videos/player-<name>.html` that uses an HTML <video> with poster pointing to the thumbnail.
   - Keep the MP4 in `demo-videos/` if repository size permits, or host via Releases / external storage for larger files.

Alternatives

- Animated GIF / animated WebP: these display inline via Markdown image syntax and are fully portable in READMEs, but file sizes can be much larger. Use `ffmpeg` + `gifsicle` or `imagemagick` and aggressive palette optimization for smaller sizes.
- GitHub Pages: if you serve the site via gh-pages, you can embed `<video>` tags on that page reliably.

Linter note

- The MD034 "no-bare-urls" or MD033 warnings may trigger in Markdown linters. This is expected — leave the bare URL to enable GitHub's inline player.

Maintenance

- If a video is larger than ~20–30 MB, consider hosting externally (Cloudinary, S3, or GitHub Releases) and linking from the README instead of committing the binary into the repository.

Questions or updates

- If you'd like, I can add an automated helper script that converts a clip to MP4 and uploads it to GitHub Releases using the GitHub CLI, producing a stable hosting URL without using issue attachments.

Documentation requirements

- **Swagger & Postman :** Maintain up-to-date Swagger JSDoc comments for all API route files so the OpenAPI spec reflects current endpoints. Keep a Postman collection in `backend/postman/` named `Japan_SSW_API_day1_day4.postman_collection.json` that includes example requests for the Authentication and Applications flows (register, login, get profile, apply to job, get my applications, update application status). Update both the collection and route JSDoc whenever endpoints or request/response shapes change.

- **Exporting Swagger for sharing:** Use the provided `backend/scripts/export-swagger.js` helper and `npm run export:swagger` (runs from `backend/`) to write a current `backend/api-docs.json` file for sharing with frontend or QA. Commit `api-docs.json` only when you intentionally snapshot the public API (avoid committing frequently-changing interim drafts).

If you'd like, I can also add a CI job that regenerates `backend/api-docs.json` on every push to `main` and saves an artifact for QA.
