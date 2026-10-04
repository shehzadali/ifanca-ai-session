---
description: Build, smoke test, commit, and deploy The Halal Way to Vercel production
argument-hint: "[description of the change]"
---

# Ship The Halal Way

Ship the app in `app/` to Vercel production. Change description from the user: `$ARGUMENTS`

Run each step in order. If any step fails, stop, show the failing output, and do not run later steps. Do not skip the tests. Do not deploy a build that failed a test.

## 1. Production build

```bash
cd app && npm run build
```

The build also checks `public/data/quiz.json` against the FAQ text. A failure here means a quiz quote no longer matches IFANCA's FAQ.

## 2. Smoke test at 390px

Start the preview server in the background, run the smoke test, then stop the server.

```bash
cd app && (npx vite preview --port 4173 --strictPort > /dev/null 2>&1 &) && sleep 2
cd app && node tests/smoke.mjs http://localhost:4173
pkill -f "vite preview --port 4173"
```

All checks must pass: home, product-check, ingredient-check (with photo OCR), learn-halal, cook, read, PWA files, and offline loading. If port 4173 is taken, stop the old preview server first.

## 3. Commit

Stage the changes and commit. Use the description for the message.

```bash
git add -A
git commit -m "ship: <description>"
```

- If `$ARGUMENTS` is empty, write a short description from the diff.
- End the message with the co-author line from the session's attribution instructions.
- If there is nothing to commit, say so and continue.
- Check `git status` first. Do not commit `.env` files, `app/.vercel/`, `app/dist/`, or `app/public/tesseract/` (all are gitignored).

## 4. Deploy to production

```bash
cd app && vercel deploy --prod --yes > .vercel/last-deploy.json
node -e "const d=require('./app/.vercel/last-deploy.json').deployment; console.log(d.readyState, d.productionUrl)"
```

- `readyState` must be `READY`.
- Use `productionUrl` (expected `https://the-halal-way.vercel.app`). Never use the per-deployment `url`. It changes on every deploy.

## 5. QR code

Compare `productionUrl` with `slides/qr-url.txt`.

- If they differ, regenerate and commit:

  ```bash
  cd app && node scripts/qr.mjs <productionUrl>
  git add slides && git commit -m "ship: QR code for <productionUrl>"
  ```

- If they match, leave the QR files alone.

## 6. Smoke test the live site

```bash
cd app && node tests/smoke.mjs <productionUrl>
```

If this fails, report it clearly. The deploy has already happened. Suggest a fix, or a rollback with `vercel rollback` if the live app is broken.

## 7. Report

Reply with: the commit hash, the production URL, whether the QR code changed, and the live smoke test result. Also add a short dated entry to `notes/build-log.md` under "Deploys" and commit it.
