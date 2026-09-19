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

## Checks

```sh
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

## Known issues

- Local demo progress is browser-local and is not shared between devices or browsers.
- Clerk and a migrated Postgres database are still required for authenticated, multi-user flows.
- Dictionary audio availability and redistribution rights are not guaranteed.
- Streak days use UTC boundaries in this MVP.
- Stripe/shop code remains for compatibility but is hidden from primary navigation.
