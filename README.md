# Tłı̨chǫ Language Learning MVP

A weekend-MVP adaptation of the existing Duolingo-style app. It keeps the course → unit → lesson → challenge flow, Clerk auth, XP, hearts, leaderboard, quests, and admin tools, and adds real Tłı̨chǫ content plus invisible FSRS practice.

## Run locally without accounts or a database

The local demo needs only Node 20+ and pnpm. Do not create an `.env` file.

```powershell
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), then choose **Start local demo**. The demo loads all 100 checked-in Tłı̨chǫ records and saves lesson, heart, XP, and FSRS review progress in that browser's local storage. Use **Reset local progress** on the Profile tab to start over.

If another program is using port 3000, Next.js prints a different URL such as `http://localhost:3001`; open the exact URL shown in the terminal. The terminal running `pnpm dev` must remain open.

## Words and saved lessons

The **Words** tab provides a searchable library of the existing 100 records, including examples, categories, source links, and pronunciation. It is also available at `/words` on the website and from the authenticated navigation. This is a learning collection, not a complete dictionary; existing content/audio permission requirements still apply.

The Learn screen starts with **Continue learning**, which opens the saved or next lesson (or Practice when hearts need recovery). The current unit is expanded by default; unit headers toggle the other lesson paths. Words use compact rows with separate pronunciation controls; expand a row for examples and source details. Search and category filters remain visible while scrolling.

Demo lessons save their current question and checked answer, so refresh and heart recovery can resume without awarding the same answer twice. A lesson whose word order has changed starts fresh rather than resuming against different content. Browser storage failures display a persistent warning with **Retry saving**; progress is still not synced between devices.

Listening activities offer **Use text instead**, and switch to a text alternative when playback fails or stalls. Failed recordings can be retried. Answer choices are shuffled independently of exercise type and retain their order during an attempt.

## Run the persisted multi-user app

Clerk and PostgreSQL/Neon are optional for the local demo but required for authenticated, server-persisted flows.

1. Copy `.env.example` to `.env` and replace the Clerk and `DATABASE_URL` placeholders with real values. Set `NEXT_PUBLIC_DEMO_MODE=false`.
2. Apply the schema with `pnpm db:push` (fast local setup) or the checked-in Drizzle migrations.
3. Import the content with `pnpm db:seed:tlicho`.
4. Start with `pnpm dev`, sign in, and choose the Tłı̨chǫ course.

The Stripe values are only needed by the retained legacy webhook/shop code; paid UI is not part of the MVP navigation.

The first content seed creates one Tłı̨chǫ course with six topic-based units and multiple-choice lessons from all 100 source records. Rerunning the command updates vocabulary records without deleting learner progress. Choose the Tłı̨chǫ course after signing in.

## Add or update vocabulary

Edit `data/tlicho-vocabulary.json`, keeping stable unique `id` values, then run `pnpm db:seed:tlicho`. Tłı̨chǫ and descriptive text is normalized to Unicode NFC during import. Existing source fields—definition, part of speech, examples, topic, audio URLs, and source URL—are preserved in `vocabulary_items`.

The initial course structure is generated only when the Tłı̨chǫ course does not yet exist, so the safe workflow for adding content to an already-used database is to import the vocabulary and attach it to lessons through the retained `/admin` tools. For a disposable development database, reseed from a fresh schema to regenerate the whole course.

## Audio

Pronunciation is always tap-to-play and missing/broken files degrade to an unavailable state. Put authorized files in `public/audio/tlicho/` and set an item's `audio_url` to `/audio/tlicho/filename.mp3`. The imported development dataset currently points to remote dictionary recordings; see `AUDIO_LICENSE_STATUS.md` before sharing publicly.

## Practice

Completing a Learn challenge makes that vocabulary item eligible for Practice. The self-contained scheduler lives in `lib/fsrs`; its short portability guide is in `lib/fsrs/README.md`. Practice uses multiple choice only and automatically maps incorrect answers to Again and correct answers to Good—there are no learner-facing grading buttons or typed answers. Set `PRACTICE_SESSION_SIZE` to 1–30 (default 10).

## Android APK

The Android project wraps the offline local demo with Capacitor. It requires Android SDK 36 and Java 21. Build a debug APK with:

```powershell
pnpm android:apk
```

The command rebuilds the static mobile bundle, synchronizes it into `android/`, compiles the native project, and writes `dist/Tlicho-Learning-debug.apk`. This debug build can be installed privately for testing; a Play Store release still requires a private signing key and release configuration.

## Checks

```sh
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Browser regression tests cover lesson resume, heart recovery, audio failure, save warnings, and word search:

```powershell
pnpm exec playwright install chromium
pnpm test:browser
```

Set `PLAYWRIGHT_CHANNEL=chrome` to use an installed Chrome instead. Tests start a local demo server on port 3107 and use isolated browser storage; no production account or database is required.

For deployment, set `NEXT_PUBLIC_APP_URL=https://learntlicho.ca`. Production metadata defaults to this URL when the setting is missing, malformed, or points at localhost; development retains a localhost default.

## Known issues

- Local demo progress is browser-local and is not shared between devices or browsers.
- Clerk and a migrated Postgres database are still required for authenticated, multi-user flows.
- Dictionary audio availability and redistribution rights are not guaranteed.
- Streak days use UTC boundaries in this MVP.
- Stripe/shop code remains for compatibility but is hidden from primary navigation.

## About & support

The public `/about` page is linked from Profile in the demo and signed-in app, and is included in the Android web bundle. It invites feedback and educational/community partnerships; it does not collect payments. Email enquiries default to `support@peakhop.app`. Set `NEXT_PUBLIC_SUPPORT_EMAIL` to override the public project email. When explicitly blank, the page uses prefilled public GitHub issues and explains their visibility. Rebuild deployed web/mobile bundles after changing this setting.

## Cloudflare deployment

The production site uses the `tlicho-learning-mvp` Worker on `learntlicho.ca`. Its OpenNext adapter, bindings, and custom domain are defined in `open-next.config.ts` and `wrangler.jsonc`.

```sh
pnpm build:cloudflare
pnpm exec opennextjs-cloudflare deploy
```

Or run `pnpm deploy` to build and deploy together after `pnpm exec wrangler login`. For Cloudflare Workers Builds, use `pnpm build:cloudflare` as the build command and `pnpm exec opennextjs-cloudflare deploy` as the deploy command. Set public environment variables before building; this deployment retains the free, browser-local demo when Clerk is not configured. Generated `.open-next` and `.wrangler` files are ignored.
