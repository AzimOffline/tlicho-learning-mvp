# Tłı̨chǫ MVP plan

## What is here

- Next.js 16 / React 19 app with Clerk auth, Neon Postgres, Drizzle, Tailwind, and a React Admin content editor.
- Existing reusable course hierarchy: course → unit → lesson → challenge → options, plus lesson completion, XP, hearts, leaderboard, and point-based quests.
- The previous project added environment validation, a baseline migration, admin protection, and characterization tests, but did not replace the original learner flows.
- The workspace root contains `tlicho_seed_100.json` and `.csv`: 100 unique Tłı̨chǫ entries with English definitions, examples, topics, source URLs, and validated remote dictionary audio URLs. There are no local Tłı̨chǫ audio files and no redistribution license is recorded.

## MVP approach

1. Rebrand the existing shell and replace mobile navigation with Learn / Practice / Progress / Profile while keeping desktop sidebar behavior.
2. Add an additive vocabulary model and repeatable seed script that imports the 100 NFC-normalized source entries, groups them into introductory units, and generates multiple-choice lessons without typed answers.
3. Add a storage-agnostic `lib/fsrs` scheduling module plus Drizzle persistence tables/adapters. Learn completion makes vocabulary eligible; Practice automatically maps incorrect → Again and correct → Good.
4. Add interactive Practice, Progress, and minimal Profile pages, preserving XP, hearts, leaderboard, quests, auth, and admin functionality. Practice restores hearts.
5. Add focused FSRS tests, migrations, concise run/import/audio/license docs, then run tests, lint, typecheck, build, and available smoke checks.
